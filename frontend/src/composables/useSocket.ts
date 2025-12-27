import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

let socket: Socket | null = null
let isConnected = ref<boolean>(false)
let serverError = ref<string | null>(null)

/**
 * Composable pour gérer la connexion Socket.IO avec le backend
 */
export function useSocket() {
  /**
   * Initialise la connexion Socket.IO
   */
  function connect() {
    const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3001'

    try {
      socket = io(backendUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      })

      socket.on('connect', () => {
        isConnected.value = true
        serverError.value = null
        console.log('✅ Connected to backend')
        // Note: Ne pas rejoindre de room ici - laisser l'app faire ça explicitement
      })

      socket.on('disconnect', (reason) => {
        isConnected.value = false
        console.log(`❌ Disconnected from backend - Reason: ${reason}`)
        console.trace('Disconnect trace:')
      })

      socket.on('error', (error: any) => {
        serverError.value = error?.message || 'Connection error'
        console.error('⚠️ Socket error:', error)
      })

      socket.on('connect_error', (error: any) => {
        serverError.value = `Connection error: ${error.message}`
        console.error('⚠️ Connection error:', error)
      })
    } catch (error) {
      serverError.value = 'Failed to initialize socket'
      console.error('Socket initialization error:', error)
    }
  }

  /**
   * Ferme la connexion Socket.IO
   */
  function disconnect() {
    if (socket) {
      socket.disconnect()
      socket = null
      isConnected.value = false
    }
  }

  /**
   * Émet un événement game:start
   */
  function startGame(roomId: string) {
    if (socket) {
      socket.emit('game:start', { roomId })
    }
  }

  /**
   * Émet un événement game:answer
   */
  function sendAnswer(answer: string, roomId: string) {
    if (socket) {
      socket.emit('game:answer', { answer, roomId })
    }
  }

  /**
   * Émet un événement game:score_update
   */
  function updateScore(scoreIncrement: number, roomId: string) {
    if (socket) {
      socket.emit('game:score_update', { scoreIncrement, roomId })
    }
  }

  /**
   * Émet un événement game:end
   */
  function endGame(roomId: string) {
    if (socket) {
      socket.emit('game:end', { roomId })
    }
  }


  /**
   * Écoute un événement socket
   */
  function on(event: string, callback: (data: any) => void) {
    if (socket) {
      socket.on(event, callback)
    }
  }

  /**
   * Écoute un événement socket une seule fois
   */
  function once(event: string, callback: (data: any) => void) {
    if (socket) {
      socket.once(event, callback)
    }
  }

  /**
   * Arrête d'écouter un événement socket
   */
  function off(event: string, callback?: (data: any) => void) {
    if (socket) {
      socket.off(event, callback)
    }
  }

  /**
   * Émet un événement socket générique
   */
  function emit(event: string, data?: any) {
    if (socket) {
      socket.emit(event, data)
    } else {
      console.warn(`Cannot emit '${event}': socket is null`)
    }
  }

  /**
   * Créer une room en tant qu'hôte
   */
  function createRoom(roomId: string, username: string) {
    if (socket) {
      socket.emit('host:create', { roomId, username })
    }
  }

  /**
   * Rejoindre une room en tant qu'invité
   */
  function joinRoom(roomId: string, username: string) {
    if (socket) {
      socket.emit('guest:join', { roomId, username })
    }
  }

  /**
   * Envoyer une nouvelle question (hôte uniquement)
   */
  function sendNewQuestion(data: any) {
    if (socket) {
      socket.emit('host:new_question', data)
    }
  }

  /**
   * Envoyer une réponse (invité uniquement)
   */
  function sendGuestAnswer(data: any) {
    if (socket) {
      socket.emit('guest:answer', data)
    }
  }

  return {
    // State
    isConnected,
    serverError,

    // Methods
    connect,
    disconnect,
    startGame,
    sendAnswer,
    updateScore,
    endGame,
    on,
    once,
    off,
    emit,
    createRoom,
    joinRoom,
    sendNewQuestion,
    sendGuestAnswer,
  }
}

