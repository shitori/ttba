import { ref, computed } from 'vue'
import { useSocket } from './useSocket'

/**
 * Composable dédié à la gestion de tous les événements WebSocket du jeu
 * Isolé de la logique métier pour éviter les dépendances circulaires
 */
export function useGameSocket() {
  const socket = useSocket()

  // ========== ÉVÉNEMENTS REÇUS DU SERVEUR ==========
  const hostRoomCreated = ref<any>(null)
  const guestRoomJoined = ref<any>(null)
  const gameStarted = ref<boolean>(false)
  const newQuestion = ref<any>(null)
  const guestAnswer = ref<any>(null)
  const hostDisconnected = ref<boolean>(false)
  const guestLeft = ref<any>(null)

  /**
   * Initialiser tous les listeners socket
   */
  function initializeSocketListeners() {
    console.log('🔌 Initializing socket listeners...')

    // Host crée une room
    socket.on('host:room_created', (data: any) => {
      console.log('🎯 Room created:', data)
      hostRoomCreated.value = data
    })

    // Guest rejoint une room
    socket.on('guest:room_joined', (data: any) => {
      console.log('🎲 Room joined:', data)
      guestRoomJoined.value = data
    })

    // Partie commence
    socket.on('game:started', (data: any) => {
      console.log('🎮 Game started:', data)
      gameStarted.value = true
    })

    // Nouvelle question
    socket.on('game:new_question', (data: any) => {
      console.log('📝 New question received:', data)
      newQuestion.value = data
    })

    // Le guest a répondu (pour l'hôte)
    socket.on('guest:answered', (data: any) => {
      console.log('👤 Guest answered:', data)
      guestAnswer.value = data
    })

    // L'hôte s'est déconnecté
    socket.on('host:disconnected', (data: any) => {
      console.log('⚠️ Host disconnected:', data)
      hostDisconnected.value = true
    })

    // Un guest a quitté
    socket.on('guest:left', (data: any) => {
      console.log('👋 Guest left:', data)
      guestLeft.value = data
    })

    // Le reveal a été envoyé
    socket.on('game:reveal', (data: any) => {
      console.log('🎯 Reveal received:', data)
      // Les parents vont écouter cet événement
    })

    console.log('✅ Socket listeners initialized')
  }

  /**
   * CRÉER UNE ROOM EN TANT QU'HÔTE
   */
  function hostCreateRoom(roomId: string, username: string) {
    console.log('🎯 Emitting host:create', { roomId, username })
    socket.emit('host:create', { roomId, username })
  }

  /**
   * REJOINDRE UNE ROOM EN TANT QUE GUEST
   */
  function guestJoinRoom(roomId: string, username: string) {
    console.log('🎲 Emitting guest:join', { roomId, username })
    socket.emit('guest:join', { roomId, username })
  }

  /**
   * DÉMARRER LA PARTIE
   */
  function startGame(players: string[], videoId: string) {
    console.log('🎮 Emitting game:start', { players, videoId })
    socket.emit('game:start', {
      players,
      videoId,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * ENVOYER UNE NOUVELLE QUESTION
   */
  function sendNewQuestion(questionData: any) {
    console.log('📝 Emitting host:new_question', questionData)
    socket.emit('host:new_question', questionData)
  }

  /**
   * ENVOYER UNE RÉPONSE (HÔTE)
   */
  function sendHostAnswer(answerData: any) {
    console.log('✅ Emitting game:answer', answerData)
    socket.emit('game:answer', answerData)
  }

  /**
   * ENVOYER UN REVEAL (HÔTE)
   */
  function sendReveal(revealData: any) {
    console.log('🎯 Emitting game:reveal', revealData)
    socket.emit('game:reveal', revealData)
  }

  /**
   * ENVOYER UNE RÉPONSE (GUEST)
   */
  function sendGuestAnswerEvent(answerData: any) {
    console.log('👤 Emitting guest:answer', answerData)
    socket.emit('guest:answer', answerData)
  }

  /**
   * VOTER #SUS
   */
  function voteSus(playerName: string) {
    console.log('🛑 Emitting game:sus_vote', { player: playerName })
    socket.emit('game:sus_vote', {
      player: playerName,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * TERMINER LA PARTIE
   */
  function endGame() {
    console.log('🎮 Emitting game:end')
    socket.emit('game:end', {
      timestamp: new Date().toISOString()
    })
  }

  /**
   * QUITTER LA ROOM
   */
  function leaveRoom() {
    console.log('🚪 Emitting player:leave')
    socket.emit('player:leave', {
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Réinitialiser tous les états
   */
  function resetGameState() {
    console.log('🔄 Resetting game socket state')
    hostRoomCreated.value = null
    guestRoomJoined.value = null
    gameStarted.value = false
    newQuestion.value = null
    guestAnswer.value = null
    hostDisconnected.value = false
    guestLeft.value = null
  }

  return {
    // État du socket
    isConnected: computed(() => socket.isConnected.value),
    serverError: computed(() => socket.serverError.value),

    // États des événements
    hostRoomCreated,
    guestRoomJoined,
    gameStarted,
    newQuestion,
    guestAnswer,
    hostDisconnected,
    guestLeft,

    // Méthodes de gestion
    initializeSocketListeners,
    hostCreateRoom,
    guestJoinRoom,
    startGame,
    sendNewQuestion,
    sendHostAnswer,
    sendReveal,
    sendGuestAnswerEvent,
    voteSus,
    endGame,
    leaveRoom,
    resetGameState,

    // Socket brut pour les écouteurs personnalisés
    socket,
  }
}

