# TTBA Backend Server

Mini backend server for TTBA (Tell The Best Answer) game with real-time Socket.IO communication.

## 🚀 Features

- **Express.js** - Lightweight web server
- **Socket.IO** - Real-time bidirectional communication
- **CORS** - Cross-Origin Resource Sharing configured
- **Player Management** - Track connected players and their scores
- **Game Events** - Handle game flow (start, answer, score, end)
- **Chat** - Real-time messaging between players
- **Room Management** - Support for multiple game rooms

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn

## 🔧 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your settings:
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## 🎮 Running the Server

### Development mode (with auto-reload)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

Server will start on `http://localhost:3001` (or PORT from .env)

## 📡 Socket.IO Events

### Player Events

**`player:join`** - Player joins a room
```javascript
socket.emit('player:join', {
  username: 'PlayerName',
  roomId: 'room123'
})
```
Response: `player:joined` broadcasts to room

**`player:left`** - Emitted when player disconnects
```javascript
io.to(roomId).emit('player:left', {
  playerId: 'socket.id',
  username: 'PlayerName',
  totalPlayers: 5
})
```

---

### Game Events

**`game:start`** - Initiates a new game round
```javascript
socket.emit('game:start', { roomId: 'room123' })
```
Response: `game:started` broadcasts to room

**`game:answer`** - Player submits an answer
```javascript
socket.emit('game:answer', {
  answer: 'option_1',
  roomId: 'room123'
})
```
Response: `game:answer_received` broadcasts to room

**`game:score_update`** - Updates player score
```javascript
socket.emit('game:score_update', {
  scoreIncrement: 1,
  roomId: 'room123'
})
```
Response: `game:score_updated` broadcasts to room

**`game:end`** - Ends the current game round
```javascript
socket.emit('game:end', { roomId: 'room123' })
```
Response: `game:ended` broadcasts final scores to room

---

### Chat Events

**`chat:message`** - Send a message in room chat
```javascript
socket.emit('chat:message', {
  message: 'Hello everyone!',
  roomId: 'room123'
})
```
Response: `chat:message_received` broadcasts to room

---

### General Events

**`error`** - Handle socket errors
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error)
})
```

---

## 🔗 REST API Endpoints

### GET `/health`
Server health check
```bash
curl http://localhost:3001/health
```
Response:
```json
{
  "status": "OK",
  "timestamp": "2025-12-26T12:00:00.000Z"
}
```

### GET `/api/status`
Server and connection status
```bash
curl http://localhost:3001/api/status
```
Response:
```json
{
  "server": "TTBA Backend",
  "socketConnections": 5,
  "uptime": 1234.56
}
```

---

## 📊 Server Logging

All Socket.IO events are logged to console with `[Socket]` prefix:

```
[Socket] Player connected: abc123def456
[Socket] PlayerName joined room room123
[Socket] PlayerName answered: option_1
[Socket] Game started in room room123
[Socket] PlayerName score updated to 5
```

---

## 🏗️ Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (gitignored)
├── .env.example      # Environment template
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

---

## 📝 Server Architecture

### Connected Players Map
Tracks all active players with their metadata:
```javascript
{
  socketId: {
    id: 'socket.id',
    username: 'PlayerName',
    roomId: 'room123',
    joinedAt: Date,
    score: 5
  }
}
```

### Room-based Communication
- Players join rooms to isolate game sessions
- Events broadcast only to players in the same room
- Automatic cleanup on disconnect

---

## 🐛 Troubleshooting

### CORS Error
Make sure `FRONTEND_URL` in `.env` matches your frontend origin:
```env
FRONTEND_URL=http://localhost:3000
```

### Port Already in Use
Change `PORT` in `.env`:
```env
PORT=3002
```

### Connection Timeout
- Check if backend server is running (`npm run dev`)
- Verify `FRONTEND_URL` is correct
- Check browser console for errors

---

## 📦 Dependencies

- **express** (^4.18.2) - Web framework
- **socket.io** (^4.7.2) - Real-time communication
- **cors** (^2.8.5) - Cross-origin middleware
- **dotenv** (^16.3.1) - Environment variables

---

## 🚀 Next Steps

1. ✅ Backend server created
2. 📝 Configure `.env` if needed
3. ▶️ Start server: `npm run dev`
4. 🔗 Connect frontend via Socket.IO client
5. 🎮 Test game events

---

## 📄 License

ISC

