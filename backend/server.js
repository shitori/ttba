import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'

// Configuration
dotenv.config()
const PORT = process.env.PORT || 3001
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

console.log('🔧 Configuration:')
console.log(`   PORT: ${PORT}`)
console.log(`   FRONTEND_URL: ${FRONTEND_URL}`)

// App setup
const app = express()
const httpServer = createServer(app)

// CORS configuration
const corsOptions = {
  origin: FRONTEND_URL,
  methods: ['GET', 'POST'],
  credentials: true,
}

const io = new Server(httpServer, {
  cors: corsOptions,
})

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// ======== ROUTES ========

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.get('/api/status', (req, res) => {
  res.json({
    server: 'TTBA Backend',
    socketConnections: io.engine.clientsCount,
    uptime: process.uptime(),
  })
})

// ======== SOCKET.IO EVENTS ========

const connectedPlayers = new Map()
const rooms = new Map() // { roomId: { hostId, players: [], currentQuestion: {}, state: 'waiting' } }

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`)

  // ---- Host Creates Room ----
  socket.on('host:create', (data) => {
    try {
      const { roomId, username } = data
      if (!roomId || !username) {
        socket.emit('error', { message: 'Missing roomId or username' })
        return
      }

      socket.join(roomId)

      // Créer la room avec l'hôte
      rooms.set(roomId, {
        hostId: socket.id,
        hostUsername: username,
        guests: [],
        currentQuestion: null,
        state: 'waiting', // 'waiting', 'playing', 'ended'
        createdAt: new Date()
      })

      connectedPlayers.set(socket.id, {
        id: socket.id,
        username,
        roomId,
        role: 'host',
        joinedAt: new Date()
      })

      console.log(`[Socket] 🎯 Host ${username} created room ${roomId}`)

      socket.emit('host:room_created', {
        roomId,
        message: 'Room créée avec succès'
      })
    } catch (error) {
      console.error('[Socket] Error in host:create:', error)
      socket.emit('error', { message: 'Failed to create room' })
    }
  })

  // ---- Guest Joins Room ----
  socket.on('guest:join', (data) => {
    try {
      const { roomId, username } = data
      if (!roomId || !username) {
        socket.emit('error', { message: 'Missing roomId or username' })
        return
      }

      const room = rooms.get(roomId)
      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }

      socket.join(roomId)

      const guest = {
        id: socket.id,
        username,
        joinedAt: new Date()
      }

      room.guests.push(guest)

      connectedPlayers.set(socket.id, {
        id: socket.id,
        username,
        roomId,
        role: 'guest',
        joinedAt: new Date()
      })

      console.log(`[Socket] 🎲 Guest ${username} joined room ${roomId}`)

      // Confirmer au guest
      socket.emit('guest:joined', {
        roomId,
        hostUsername: room.hostUsername,
        guestCount: room.guests.length,
        currentQuestion: room.currentQuestion,
        state: room.state
      })

      // Notifier l'hôte et les autres guests
      socket.to(roomId).emit('guest:player_joined', {
        username,
        guestCount: room.guests.length
      })
    } catch (error) {
      console.error('[Socket] Error in guest:join:', error)
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  // ---- Player Registration (legacy) ----
  socket.on('player:join', (playerData) => {
    try {
      const { username, roomId } = playerData
      if (!username || !roomId) {
        socket.emit('error', { message: 'Missing username or roomId' })
        return
      }

      socket.join(roomId)
      connectedPlayers.set(socket.id, {
        id: socket.id,
        username,
        roomId,
        role: 'host',
        joinedAt: new Date()
      })

      console.log(`[Socket] ${username} joined room ${roomId}`)

      // Notify room of new player
      io.to(roomId).emit('player:joined', {
        playerId: socket.id,
        username
      })
    } catch (error) {
      console.error('[Socket] Error in player:join:', error)
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  // ---- Game Events ----

  // L'hôte démarre la partie
  socket.on('game:start', (data) => {
    try {
      const player = connectedPlayers.get(socket.id)
      if (!player || player.role !== 'host') return

      const room = rooms.get(player.roomId)
      if (!room) return

      room.state = 'playing'
      room.currentQuestion = data

      console.log(`[Socket] 🎮 Game started in room ${player.roomId}`)

      // Notifier tous les guests
      socket.to(player.roomId).emit('game:started', {
        players: data.players,
        videoId: data.videoId,
        timestamp: data.timestamp
      })
    } catch (error) {
      console.error('[Socket] Error in game:start:', error)
    }
  })

  // L'hôte envoie une nouvelle question
  socket.on('host:new_question', (data) => {
    try {
      const player = connectedPlayers.get(socket.id)
      if (!player || player.role !== 'host') {
        console.log(`[Socket] ❌ Unauthorized host:new_question attempt`)
        return
      }

      const room = rooms.get(player.roomId)
      if (!room) {
        console.log(`[Socket] ❌ Room not found: ${player.roomId}`)
        return
      }

      room.currentQuestion = data

      console.log(`[Socket] 📝 New question in room ${player.roomId}`)
      console.log(`[Socket] ✅ Host sent data with fields:`, {
        videoId: data.videoId ? '✓' : '✗',
        videoUrl: data.videoUrl ? '✓' : '✗',
        correctPlayer: data.correctPlayer ? `✓ (${data.correctPlayer})` : '✗',
        isShared: data.isShared !== undefined ? `✓ (${data.isShared})` : '✗',
        sharedUser: data.sharedUser ? `✓ (${data.sharedUser})` : '✗',
        players: Array.isArray(data.players) ? `✓ (${data.players.length})` : '✗'
      })

      // Envoyer la question aux guests avec toutes les infos nécessaires
      const gameData = {
        videoId: data.videoId,
        videoUrl: data.videoUrl,
        players: Array.isArray(data.players) ? data.players : [],
        correctPlayer: data.correctPlayer,
        isShared: data.isShared === true || data.isShared === 1,
        sharedUser: data.sharedUser || '',
        timestamp: new Date().toISOString()
      }

      console.log(`[Socket] 📤 Sending to guests (${room.guests.length} guests):`, {
        videoId: gameData.videoId,
        correctPlayer: gameData.correctPlayer,
        isShared: gameData.isShared,
        playersCount: gameData.players.length
      })

      socket.to(player.roomId).emit('game:new_question', gameData)
    } catch (error) {
      console.error('[Socket] Error in host:new_question:', error.message)
    }
  })

  // L'hôte révèle la réponse
  socket.on('game:reveal', (data) => {
    try {
      const player = connectedPlayers.get(socket.id)
      if (!player || player.role !== 'host') {
        console.log(`[Socket] ❌ Unauthorized game:reveal attempt`)
        return
      }

      const room = rooms.get(player.roomId)
      if (!room) {
        console.log(`[Socket] ❌ Room not found for reveal: ${player.roomId}`)
        return
      }

      console.log(`[Socket] 🎯 Reveal answer in room ${player.roomId}`)
      console.log(`[Socket] ✅ Host sent reveal with fields:`, {
        correctPlayer: data.correctPlayer ? `✓ (${data.correctPlayer})` : '✗',
        videoId: data.videoId ? '✓' : '✗',
        isSus: data.isSus !== undefined ? `✓ (${data.isSus})` : '✗',
        players: Array.isArray(data.players) ? `✓ (${data.players.length})` : '✗'
      })

      // Envoyer la révélation aux guests
      const revealData = {
        correctPlayer: data.correctPlayer,
        videoId: data.videoId,
        isSus: data.isSus || false,
        players: Array.isArray(data.players) ? data.players : [],
        timestamp: data.timestamp || new Date().toISOString()
      }

      console.log(`[Socket] 📤 Sending reveal to guests (${room.guests.length} guests)`)

      socket.to(player.roomId).emit('game:reveal', revealData)
    } catch (error) {
      console.error('[Socket] Error in game:reveal:', error.message)
    }
  })

  // Un guest répond
  socket.on('guest:answer', (data) => {
    try {
      const player = connectedPlayers.get(socket.id)
      if (!player || player.role !== 'guest') return

      console.log(`[Socket] 👤 Guest ${player.username} answered: ${data.selectedPlayer}`)

      // Optionnel: notifier l'hôte de la réponse du guest
      const room = rooms.get(player.roomId)
      if (room) {
        io.to(room.hostId).emit('guest:answer_received', {
          guestUsername: player.username,
          selectedPlayer: data.selectedPlayer,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('[Socket] Error in guest:answer:', error)
    }
  })

  socket.on('game:answer', () => {
    try {
      const player = connectedPlayers.get(socket.id)
      if (!player) return

      console.log(`[Socket] ${player.username} answered`)
    } catch (error) {
      console.error('[Socket] Error in game:answer:', error)
    }
  })

  socket.on('game:score_update', () => {
    try {
      const player = connectedPlayers.get(socket.id)
      if (!player) return

      console.log(`[Socket] ${player.username} score updated`)
    } catch (error) {
      console.error('[Socket] Error in game:score_update:', error)
    }
  })

  socket.on('game:end', (data) => {
    try {
      const player = connectedPlayers.get(socket.id)
      if (!player) return

      const room = rooms.get(player.roomId)
      if (!room) return

      // Seulement l'hôte peut terminer la partie
      if (player.role === 'host') {
        room.state = 'ended'

        console.log(`[Socket] 🏁 Game ended in room ${player.roomId}`)

        // Notifier tous les guests
        io.to(player.roomId).emit('game:ended', {
          finalScore: data.finalScore,
          endTime: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('[Socket] Error in game:end:', error)
    }
  })

  // ---- Chat Events ----
  socket.on('chat:message', (data) => {
    try {
      const { message, roomId } = data
      const player = connectedPlayers.get(socket.id)
      if (!player) return

      console.log(`[Socket] ${player.username}: ${message}`)

      io.to(roomId).emit('chat:message_received', {
        username: player.username,
        message,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error('[Socket] Error in chat:message:', error)
    }
  })

  // ---- Disconnect ----
  socket.on('disconnect', () => {
    try {
      const player = connectedPlayers.get(socket.id)
      if (player) {
        console.log(`[Socket] ${player.username} (${player.role}) disconnected`)

        const room = rooms.get(player.roomId)

        // Si c'est l'hôte qui se déconnecte
        if (player.role === 'host' && room) {
          console.log(`[Socket] ⚠️ Host disconnected - ending room ${player.roomId}`)

          // Notifier tous les guests que l'hôte est parti
          io.to(player.roomId).emit('host:disconnected', {
            message: 'L\'hôte a quitté la partie',
            timestamp: new Date().toISOString()
          })

          // Supprimer la room
          rooms.delete(player.roomId)
        }

        // Si c'est un guest qui se déconnecte
        if (player.role === 'guest' && room) {
          // Retirer le guest de la liste
          room.guests = room.guests.filter(g => g.id !== socket.id)

          // Notifier l'hôte
          io.to(room.hostId).emit('guest:left', {
            username: player.username,
            guestCount: room.guests.length
          })
        }

        connectedPlayers.delete(socket.id)
      }
    } catch (error) {
      console.error('[Socket] Error in disconnect:', error)
    }
  })

  // ---- Error Handling ----
  socket.on('error', (error) => {
    console.error(`[Socket] Error from ${socket.id}:`, error)
  })
})

// ======== SERVER START ========

httpServer.listen(PORT, () => {
  console.log(`\n🎮 TTBA Backend Server Running`)
  console.log(`📡 Socket.IO listening on port ${PORT}`)
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`)
  console.log(`🔗 http://localhost:${PORT}`)
  console.log(`✅ Ready for connections\n`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  httpServer.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})

