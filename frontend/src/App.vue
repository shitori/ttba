<template>
  <div class="app-container">
    <section class="hero is-fullheight is-gradient">
      <div class="hero-body">
        <div class="container is-fluid px-3">
          <h1 class="title is-2 is-size-3-mobile has-text-centered mb-4 mb-5-tablet main-title">🎮 TTBA Game</h1>

          <!-- Socket.IO Connection Status - Discret -->
          <div class="connection-badge" :class="{ 'connected': isConnected, 'disconnected': !isConnected }" :title="isConnected ? 'Connecté au backend' : (serverError || 'Connexion en cours...')">
            <span class="status-dot"></span>
          </div>

          <!-- Sélecteur de mode (none) -->
          <GameModeSelector
            v-if="gameMode === 'none'"
            @select-mode="handleGameModeSelect"
          />

          <!-- Vue invité -->
          <GuestView
            v-else-if="gameMode === 'guest'"
            ref="guestViewRef"
            :room-code="roomCode"
            :game-state="guestGameState"
            :players="guestPlayers"
            :current-video="currentVideo"
            :guest-correct-player="guestCorrectPlayer"
            :show-result="showResultVideo"
            :celebrating-player="celebratingPlayer"
            :sus-mode="options.susMode"
            @guest-answer="handleGuestAnswer"
            @leave-room="leaveRoom"
          />

          <!-- Vue hôte -->
          <div v-else-if="gameMode === 'host'">
            <!-- Info room pour l'hôte -->
            <div class="host-room-info box mb-4 bg-surface rounded has-shadow">
              <div class="room-code-display">
                <span class="label is-size-7-mobile">Code de la room:</span>
                <span class="room-code-big">{{ roomCode }}</span>
                <button
                  class="button is-small is-info"
                  :class="{ 'is-success': isCopying }"
                  @click="copyRoomCode"
                  :disabled="isCopying"
                >
                  {{ copyButtonText }}
                </button>
              </div>
              <button class="button is-small is-danger" @click="leaveRoom">
                🚪 Quitter
              </button>
            </div>

            <div class="initGame" v-if="!isRunningGame">
              <div class="columns is-mobile is-multiline">
                <!-- Left Column: Upload -->
                <div class="column is-12-mobile is-half-tablet">
                  <UploadPanel
                    :is-processing="fileState.isProcessing"
                    :progress="fileState.progress"
                    :file-name="fileState.fileName"
                    :submission-info="submissionInfo"
                    :error-message="errorMessage"
                    @upload="handleFileUpload"
                    @clear-error="clearError"
                  />

                  <OptionsPanel
                    :options="options"
                    :shared-users-sorted="sharedUsersSorted"
                    :toggle-whitelist-user="toggleWhitelistUser"
                    :is-whitelisted="isWhitelisted"
                    :toggle-sus-mode="toggleSusMode"
                  />
                </div>

                <!-- Right Column: Players -->
                <div class="column is-12-mobile is-half-tablet">
                  <PlayersList
                    :players="players"
                    @remove="handleRemovePlayer"
                    @clear="handleClearAll"
                  />
                </div>
              </div>
              <div v-if="players.length > 0" class="mt-4">
                <button
                  class="button is-fullwidth is-success is-large-mobile launch-btn"
                  @click="runNewGame"
                >
                  🚀 Lancer la partie
                </button>
              </div>
            </div>

            <div class="runGame" v-if="players.length > 0 && isRunningGame">
              <GameBoard
                :players="players"
                :current-video="currentVideo"
                :score="gameScore"
                :show-result="showResultVideo"
                :celebrating-player="celebratingPlayer"
                :sus-mode="options.susMode"
                @end="handleEndGame"
                @select="selectPlayer"
                @reveal="checkResult"
                @open="openOnTikTok"
              />
            </div>
            <div v-else-if="players.length > 0 && !isRunningGame && finalScoreSnapshot" class="box has-shadow mt-4">
              <div class="content has-text-centered">
                <h2 class="title is-4">🏁 Partie terminée</h2>
                <p class="is-size-5"><strong>Score final</strong> : {{ finalScoreSnapshot.correct }} / {{ finalScoreSnapshot.total }}</p>
                <p class="is-size-6 muted">Relancez une partie quand vous êtes prêt.</p>
                <button class="button is-success mt-3" @click="startNewSession">🔁 Nouvelle partie</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Success Messages -->
        <div class="notification is-success mt-4" v-if="successMessage" role="status">
          <button class="delete" @click="clearError"></button>
          {{ successMessage }}
        </div>
      </div>
    </section>

    <!-- Version Badge - Bottom Right -->
    <div class="version-badge" title="Version de l'application">
      v{{ version }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useFileHandling } from '@/composables/useFileHandling'
import { useExtraction } from '@/composables/useExtraction'
import { useGameStore } from '@/composables/useGameStore'
import { useGameLogic } from '@/composables/useGameLogic'
import { useSocket } from '@/composables/useSocket'
import { useAppVersion } from '@/composables/useAppVersion'
import { isTikTokShare } from '@/utils/helpers'
import UploadPanel from '@/components/UploadPanel.vue'
import OptionsPanel from '@/components/OptionsPanel.vue'
import PlayersList from '@/components/PlayersList.vue'
import GameBoard from '@/components/GameBoard.vue'
import GameModeSelector from '@/components/GameModeSelector.vue'
import GuestView from '@/components/GuestView.vue'

// ======== GAME MODE STATE ========
const gameMode = ref<'none' | 'host' | 'guest'>('none') // Mode de jeu actuel
const roomCode = ref<string>('') // Code de la room
const guestGameState = ref<'waiting' | 'playing' | 'ended' | 'host-disconnected'>('waiting')
const guestViewRef = ref<InstanceType<typeof GuestView> | null>(null)
const guestPlayers = ref<any[]>([])
const copyButtonText = ref('📋 Copier')
const isCopying = ref(false)

// App version
const { version } = useAppVersion()

// Composables
const { fileState, processFiles } = useFileHandling()
const rawFileData = ref<any[] | null>(null)
const { createResultObject, extractRawObjects } = useExtraction(rawFileData)

// Game store centralisé
const store = useGameStore()
const {
  errorMessage,
  successMessage,
  submissionInfo,
  isRunningGame,
  currentVideo,
  showResultVideo,
  gameScore,
  celebratingPlayer,
  options,
  players,
  sharedUsersSorted,
  clearError,
  setError,
  setSubmissionInfo,
  startGame,
  endGame,
  setCurrentVideo,
  showResult,
  hideResult,
  incrementScore,
  incrementTotal,
  setCelebratingPlayer,
  addSusVote,
  toggleWhitelistUser,
  isWhitelisted,
  toggleSusMode,
  addPlayer,
  removePlayer,
  clearAll,
} = store

// Socket.IO connection
const socket = useSocket()
const { isConnected, serverError } = socket

// Logique de jeu
const { getRandomVideoFromPlayers } = useGameLogic(players, options as any)

// ======== SOCKET.IO SETUP ========
onMounted(() => {
  console.log('🔌 Connecting to backend Socket.IO...')

  // Connexion initiale au backend
  socket.connect()

  // Ajouter un handler global d'erreur
  window.addEventListener('error', (event) => {
    const errorStr = String(event.error || event.message || '')
    const filenameStr = String(event.filename || '')

    // Ignorer TOUTES les erreurs TikTok Embed - elles ne sont pas critiques
    if (filenameStr.includes('tiktok') ||
        filenameStr.includes('embed') ||
        errorStr.includes('tiktok') ||
        errorStr.includes('ERR_BLOCKED_BY_CLIENT') ||
        filenameStr.includes('webmssdk') ||
        filenameStr.includes('mon16-normal')) {
      console.warn('⚠️ TikTok/Tracking script error (non-critical, ignored)')
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      return false
    }
    console.error('❌ Global error caught:', event.error)
    console.error('Error stack:', event.error?.stack)
  }, true)  // useCapture = true pour capturer AVANT les autres handlers

  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason || '')

    // Ignorer les rejections TikTok et tracking
    if (reasonStr.includes('tiktok') ||
        reasonStr.includes('embed') ||
        reasonStr.includes('ERR_BLOCKED_BY_CLIENT') ||
        reasonStr.includes('webmssdk') ||
        reasonStr.includes('mon16-normal')) {
      console.warn('⚠️ TikTok/Tracking promise rejection (non-critical, ignored)')
      event.preventDefault()
      event.stopPropagation()
      return false
    }
    console.error('❌ Unhandled promise rejection:', event.reason)
  }, true)

  // Écouter les événements pour l'hôte
  socket.on('host:room_created', (data: any) => {
    console.log('🎯 Room created:', data)
    roomCode.value = data.roomId
  })

  socket.on('guest:player_joined', (data: any) => {
    console.log('👥 Guest joined:', data.username)
  })

  socket.on('guest:left', (data: any) => {
    console.log('👋 Guest left:', data.username)
  })

  // Écouter les événements pour les invités
  socket.on('guest:joined', (data: any) => {
    console.log('✅ Joined room as guest:', data)
    guestGameState.value = data.state || 'waiting'
    if (Array.isArray(data.players)) {
      guestPlayers.value = data.players
    }
  })

  socket.on('game:started', (data: any) => {
    console.log('🎮 Game started (guest):', data)
    guestGameState.value = 'playing'
    if (Array.isArray(data.players)) {
      guestPlayers.value = data.players
    }
  })

  socket.on('game:new_question', (data: any) => {
    console.log('📝 New question (guest):', data)
    if (gameMode.value === 'guest') {
      console.log('Guest building videoData with:', {
        videoId: data.videoId,
        videoUrl: data.videoUrl,
        isShared: data.isShared,
        sharedUser: data.sharedUser,
        correctPlayer: data.correctPlayer
      })
      const videoData = {
        id: data.videoId,
        player: data.correctPlayer || '',
        isShared: data.isShared === true || data.isShared === 1,
        sharedUser: data.sharedUser || '',
        url: data.videoUrl
      }
      console.log('Final videoData:', videoData)
      setCurrentVideo(videoData)
      if (Array.isArray(data.players)) {
        guestPlayers.value = data.players
      }
      guestCorrectPlayer.value = data.correctPlayer || null
      guestLastSelected.value = null
      guestViewRef.value?.resetAnswered?.()
    }
  })

  socket.on('game:reveal', (data: any) => {
    console.log('🎯 Answer revealed (guest):', data)
    if (gameMode.value === 'guest') {
      // On peut afficher le reveal global si souhaité, mais la validation du score invité est déjà faite au clic
      currentVideo.value.player = data.correctPlayer
      showResult()
      // Mettre à jour la liste des joueurs avec susNumber si fournie
      if (Array.isArray(data.players)) {
        guestPlayers.value = data.players
      }
      setTimeout(() => {
        hideResult()
      }, 3000)
    }
  })

  socket.on('game:ended', (data: any) => {
    console.log('🏁 Game ended:', data)
    if (gameMode.value === 'guest') {
      guestGameState.value = 'ended'
    }
  })

  socket.on('host:disconnected', (data: any) => {
    console.log('⚠️ Host disconnected:', data)
    if (gameMode.value === 'guest') {
      guestGameState.value = 'host-disconnected'
    }
  })

  // Legacy events
  socket.on('player:joined', (data: any) => {
    console.log('👥 Player joined:', data)
  })

  socket.on('game:answer_received', (data: any) => {
    console.log('✅ Answer received:', data)
  })

  socket.on('game:score_updated', (data: any) => {
    console.log('📊 Score updated:', data)
  })
})

onUnmounted(() => {
  console.log('🔌 App unmounting (socket remains connected)')
  // Note: Ne pas appeler socket.disconnect() ici car cela déconnecterait le socket
  // et causerait des bugs lors des rerender du composant
})

// ======== HANDLERS ========

// Gestion du mode de jeu
function handleGameModeSelect(mode: 'host' | 'guest', data?: { roomCode: string }) {
  gameMode.value = mode

  if (mode === 'host') {
    // Créer une room unique
    const newRoomCode = generateRoomCode()
    roomCode.value = newRoomCode
    socket.createRoom(newRoomCode, 'Host_' + Math.random().toString(36).substring(7))
  } else if (mode === 'guest' && data) {
    // Rejoindre une room existante
    roomCode.value = data.roomCode
    const guestUsername = 'Guest_' + Math.random().toString(36).substring(7)
    socket.joinRoom(data.roomCode, guestUsername)
  }
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function leaveRoom() {
  gameMode.value = 'none'
  roomCode.value = ''
  guestGameState.value = 'waiting'
  guestPlayers.value = []

  // Reconnecter avec un nouveau socket
  socket.disconnect()
  setTimeout(() => {
    socket.connect()
  }, 500)
}

function copyRoomCode() {
  navigator.clipboard.writeText(roomCode.value)
    .then(() => {
      isCopying.value = true
      copyButtonText.value = '✓ Copié !'
      setTimeout(() => {
        isCopying.value = false
        copyButtonText.value = '📋 Copier'
      }, 2000)
    })
    .catch((err) => {
      console.error('Erreur lors de la copie:', err)
      copyButtonText.value = '✗ Erreur'
      setTimeout(() => {
        copyButtonText.value = '📋 Copier'
      }, 2000)
    })
}

const guestLastSelected = ref<string | null>(null)
const guestCorrectPlayer = ref<string | null>(null)

function handleGuestAnswer(data: { player: string }) {
  // Émission au backend
  socket.sendGuestAnswer({
    selectedPlayer: data.player,
    roomId: roomCode.value,
    timestamp: new Date().toISOString()
  })
  // Mémoriser le choix
  guestLastSelected.value = data.player
}

function openOnTikTok(id: string) {
  const url = `https://www.tiktok.com/v/${id}`
  window.open(url, '_blank')
}

const handleFileUpload = async (event: Event): Promise<void> => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  clearError()

  try {
    await processFiles(files, async (file, data) => {
      rawFileData.value = data
      extractRawObjects()
      const resultObject: any = createResultObject(data[0])

      const sharedVideos: Array<{ video: string; sentAt: string }> = []
      for (const [keyChatName, messageList] of Object.entries(
        resultObject.chatHistory as Record<string, any[]>
      )) {
        if (keyChatName.includes('Group')) continue
        messageList
          .filter((message: any) => isTikTokShare(message.Content))
          .filter((message: any) => message.From === resultObject.username)
          .forEach((message: any) => {
            sharedVideos.push({
              video: message.Content,
              sentAt: keyChatName
                .split('Chat History with ')[1]
                .trim()
                .split(':')[0]
                .trim(),
            })
          })
      }

      const newPlayer = {
        username: resultObject.username || 'Inconnu',
        likedVideos:
          resultObject.likedVideos?.map(
            (rawVideo: { date: string; link: string }) => rawVideo.link
          ) || [],
        sharedVideos: sharedVideos || [],
        susNumber: 0,
      }

      toggleWhitelistUser(newPlayer.username)
      addPlayer(newPlayer)

      // Émettre l'événement d'ajout de joueur
      socket.emit('player:add', {
        username: newPlayer.username,
        likedVideosCount: newPlayer.likedVideos.length,
        sharedVideosCount: newPlayer.sharedVideos.length,
        timestamp: new Date().toISOString()
      })

      setSubmissionInfo({
        status: '✅ Données Extraites',
        timestamp: new Date().toLocaleString('fr-FR'),
        fileName: file.name,
        itemsExtracted: data.length,
        totalResults: players.value.length,
      })

      await new Promise((resolve) => setTimeout(resolve, 2000))
      setSubmissionInfo(null)
    })
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Erreur inconnue')
  }
}

const handleRemovePlayer = (index: number) => {
  const playerToRemove = players.value[index]

  // Émettre l'événement de suppression de joueur
  socket.emit('player:remove', {
    username: playerToRemove.username,
    timestamp: new Date().toISOString()
  })

  removePlayer(index)
}

const handleClearAll = (): void => {
  if (confirm('Êtes-vous sûr de vouloir vider tous les résultats?')) {
    clearAll()

    // Émettre l'événement de suppression de tous les joueurs
    socket.emit('players:clear', {
      timestamp: new Date().toISOString()
    })
  }
}

const stopAutoContinue = ref(false)
const finalScoreSnapshot = ref<{ correct: number; total: number } | null>(null)

function handleEndGame() {
  // Bloquer l’auto-continue et prendre un snapshot du score avant reset
  stopAutoContinue.value = true
  finalScoreSnapshot.value = { ...gameScore.value }

  // Informer le backend
  socket.emit('game:end', {
    finalScore: gameScore.value,
    totalPlayers: players.value.length,
    timestamp: new Date().toISOString()
  })

  // Mettre fin à la partie (réinitialise l’état interne)
  endGame()
}

function startNewSession() {
  // Réautoriser l’auto-continue et relancer une partie
  stopAutoContinue.value = false
  finalScoreSnapshot.value = null
  runNewGame()
}

const runNewGame = () => {
  try {
    console.log('🎮 runNewGame started')

    // Appeler startGame() seulement si ce n'est pas déjà lancé
    if (!isRunningGame.value) {
      console.log('📺 Starting game...')
      startGame()
    }

    console.log('🔍 Getting random video candidate...')
    const candidate = getRandomVideoFromPlayers()
    if (candidate) {
      console.log('✅ Candidate found:', candidate.id)

      // Préparer les données de la question (inclure susNumber pour guests)
      const questionData = {
        videoId: candidate.id,
        videoUrl: candidate.url || `https://www.tiktok.com/v/${candidate.id}`,
        players: players.value.map(p => ({ username: p.username, susNumber: p.susNumber })),
        correctPlayer: candidate.player,
        isShared: candidate.isShared,
        sharedUser: candidate.sharedUser || '',
        timestamp: new Date().toISOString()
      }

      console.log('📤 About to emit game:start...')
      // Émettre l'événement de démarrage de partie AVANT de changer la vidéo
      socket.emit('game:start', {
        players: players.value.map(p => p.username),
        videoId: candidate.id,
        timestamp: new Date().toISOString()
      })
      console.log('✅ game:start emitted')

      console.log('📤 About to send new question...')
      // Si on est en mode hôte, envoyer la question aux invités AVANT de changer la vidéo
      if (gameMode.value === 'host') {
        socket.sendNewQuestion(questionData)
        console.log('✅ host:new_question emitted')
      }

      // Changer la vidéo EN ARRIÈRE-PLAN AVEC DOUBLE PROTECTION
      console.log('📝 Setting current video in background...')
      try {
        setCurrentVideo(candidate)
        console.log('✅ Current video set successfully')
      } catch (videoError) {
        console.error('❌ Error setting current video (non-critical):', videoError)
        // Ne pas throw - ce n'est pas critique pour la logique du jeu
      }

      console.log('✅ runNewGame completed successfully')
    } else {
      console.error('❌ No candidate video found!')
      setError(
        'Aucune vidéo valide trouvée parmi les joueurs. Chargez d\'autres fichiers ou vérifiez les données.'
      )
      isRunningGame.value = false
      setTimeout(() => clearError(), 5000)
    }
  } catch (outerError) {
    console.error('❌ CRITICAL: Outer error in runNewGame:', outerError)
    console.trace('Outer error trace:')
    // Ne JAMAIS laisser une erreur fermer le socket
  }
}

const checkResult = (isSus: boolean = false) => {
  console.log('🔍 checkResult called with isSus:', isSus)

  if (isSus) {
    console.log('🛑 Adding sus vote...')
    addSusVote()
  }

  // Vérification des données avant d'envoyer
  if (!currentVideo.value.player || !currentVideo.value.id) {
    console.error('❌ Error: Missing currentVideo data, cannot send game:reveal')
    return
  }

  console.log('📤 About to emit game:reveal...')
  // ÉMETTRE game:reveal IMMÉDIATEMENT
  socket.emit('game:reveal', {
    correctPlayer: currentVideo.value.player,
    videoId: currentVideo.value.id,
    isSus: isSus,
    players: players.value.map(p => ({ username: p.username, susNumber: p.susNumber })),
    timestamp: new Date().toISOString()
  })
  console.log('✅ game:reveal emitted')

  // Afficher le résultat (couleurs/animation sur GameBoard)
  console.log('📺 Showing result...')
  try {
    showResult()
  } catch (error) {
    console.error('❌ Error showing result:', error)
  }

  console.log('⏱️ Scheduling hideResult and next question...')
  setTimeout(() => {
    try {
      console.log('🔄 Hiding result...')
      hideResult()
    } catch (error) {
      console.error('⚠️ Error hiding result:', error)
    }

    if (!stopAutoContinue.value) {
      console.log('⏱️ Scheduling runNewGame in 500ms...')
      setTimeout(() => {
        try {
          console.log('🎮 Running new game...')
          runNewGame()
          console.log('✅ runNewGame completed')
        } catch (error) {
          console.error('❌ Error in runNewGame:', error)
        }
      }, 500)
    }
  }, 3000)
  console.log('✅ checkResult completed')
}

// Micro-animations: bump score on increment
watch(() => gameScore.value.correct, () => {
  const el = document.querySelector('.score-display .score-correct') as HTMLElement | null
  if (!el) return
  el.classList.add('score-animated', 'bump')
  setTimeout(() => el.classList.remove('bump'), 220)
})

function selectPlayer(player: { username: string }) {
  console.log('🎯 selectPlayer called with:', player.username)
  if (showResultVideo.value) {
    console.log('⚠️ Already showing result, returning')
    return
  }

  const isCorrect = player.username === currentVideo.value.player
  console.log('✅ Is correct?', isCorrect)

  // Vérifier que les données sont valides avant d'émettre
  if (!currentVideo.value.player || !currentVideo.value.id) {
    console.error('❌ Error: Invalid currentVideo data, cannot answer')
    return
  }

  console.log('📤 About to emit game:answer FIRST...')
  try {
    // ÉMETTRE game:answer IMMÉDIATEMENT SANS AUCUN CHANGEMENT D'ÉTAT
    socket.emit('game:answer', {
      selectedPlayer: player.username,
      correctPlayer: currentVideo.value.player,
      isCorrect: isCorrect,
      videoId: currentVideo.value.id,
      scoreCorrect: gameScore.value.correct,
      scoreTotal: gameScore.value.total,
      timestamp: new Date().toISOString()
    })
    console.log('✅ game:answer emitted successfully')
  } catch (error) {
    console.error('❌ Error emitting game:answer:', error)
    return
  }

  // ATTENDRE LONGTEMPS (500ms minimum) AVANT DE FAIRE QUOI QUE CE SOIT
  // Cela laisse le temps au backend de traiter les émissions
  console.log('⏱️ Waiting 500ms before any state changes...')
  setTimeout(() => {
    // PROTÉGER COMPLÈTEMENT CE BLOC
    try {
      console.log('📊 Now safe to update state...')
      incrementTotal()

      if (isCorrect) {
        console.log('🎉 Incrementing score...')
        incrementScore()
        setCelebratingPlayer(player.username)
        try { triggerConfetti() } catch (e) {
          console.error('⚠️ Confetti error (not critical):', e)
        }
        setTimeout(() => setCelebratingPlayer(null), 1600)
      }

      console.log('🔍 Calling checkResult()...')
      checkResult()
      console.log('✅ checkResult() completed')
    } catch (error) {
      console.error('❌ Error in state updates:', error)
    }
  }, 500)  // ← AUGMENTÉ À 500ms pour laisser le temps au backend
  console.log('✅ selectPlayer completed')
}

// Lightweight confetti
function triggerConfetti(duration = 1200) {
  const colors = ['#ff6b6b', '#ffd93d', '#6bcB77', '#5cc7ff', '#c56cff']
  const end = Date.now() + duration
  const canvas = document.createElement('canvas')
  canvas.className = 'confetti-canvas'
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  document.body.appendChild(canvas)

  const ctxRaw = canvas.getContext('2d')
  if (!ctxRaw) return
  const ctx = ctxRaw as CanvasRenderingContext2D
  const w = (canvas.width = window.innerWidth)
  const h = (canvas.height = window.innerHeight)
  const particles: any[] = []
  const particleCount = Math.floor(60 + Math.random() * 40)

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * -h,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
    })
  }

  function render() {
    ctx.clearRect(0, 0, w, h)
    particles.forEach((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.12
      p.rotate += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotate)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, (p.size * 0.6))
      ctx.restore()
    })
  }

  let rafId: number
  function loop() {
    render()
    if (Date.now() < end) {
      rafId = requestAnimationFrame(loop)
    } else {
      setTimeout(() => {
        cancelAnimationFrame(rafId)
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas)
      }, 300)
    }
  }

  loop()
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.hero.is-gradient {
  background: var(--grad-primary);
  position: relative;
  overflow: hidden;
}

.hero.is-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(102, 153, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%,
  100% {
    background: radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(102, 153, 255, 0.1) 0%, transparent 50%);
  }
  50% {
    background: radial-gradient(circle at 80% 30%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 20% 70%, rgba(102, 153, 255, 0.1) 0%, transparent 50%);
  }
}


@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title {
  animation: titleBounce 1s ease-in-out;
  font-weight: 900;
}

@keyframes titleBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.button {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.button:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.button:active:not(:disabled) {
  transform: translateY(-2px);
}

.button.is-success {
  animation: successPulse 0.6s ease;
}

@keyframes successPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(72, 187, 120, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
  }
}

@keyframes dangerShake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-15px);
  }
  50% {
    transform: translateX(15px);
  }
  75% {
    transform: translateX(-15px);
  }
}

.main-title {
  animation: titlePulse 2s ease-in-out infinite;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.connection-badge {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: help;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.connection-badge:hover {
  transform: scale(1.8);
}

.connection-badge.connected {
  background: var(--color-accent);
  box-shadow: 0 0 12px rgba(72, 187, 120, 0.6), 0 2px 8px rgba(0, 0, 0, 0.2);
}

.connection-badge.connected .status-dot {
  display: none;
}

.connection-badge.disconnected {
  background: var(--color-danger);
  box-shadow: 0 0 12px rgba(245, 101, 101, 0.6), 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.connection-badge.disconnected .status-dot {
  display: none;
}

.launch-btn {
  background: var(--grad-success) !important;
  border: none;
  font-weight: 800;
  font-size: 1.3rem;
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  color: white !important;
}

.launch-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.launch-btn:hover::before {
  transform: translateX(100%);
}

.launch-btn:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(72, 187, 120, 0.6);
}

button[disabled] {
  cursor: not-allowed;
}

/* Styles pour la vue hôte */
.host-room-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--color-border);
  gap: 1rem;
  flex-wrap: wrap;
}

@media screen and (max-width: 768px) {
  .host-room-info {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
}

.room-code-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

@media screen and (max-width: 768px) {
  .room-code-display {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
}

.room-code-display .label {
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.room-code-big {
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-primary);
  letter-spacing: 4px;
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-primary);
}

@media screen and (max-width: 768px) {
  .room-code-big {
    font-size: 1.5rem;
    letter-spacing: 2px;
    padding: 0.5rem 1rem;
  }
}

@media (prefers-color-scheme: light) {
  .host-room-info {
    background: rgba(255, 255, 255, 0.98);
  }
}

/* Amélioration de l'affichage du score */
.score-display {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  padding: 0.8rem 1.5rem !important;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-primary);
  font-size: 1.3rem !important;
  font-weight: 800 !important;
  color: var(--color-primary);
  box-shadow: var(--shadow-soft);
}

.score-display .score-correct {
  color: var(--color-accent);
  font-size: 1.5rem;
  font-weight: 900;
}

.score-display.score-animated {
  animation: scoreGlow 0.4s ease-out;
}

@keyframes scoreGlow {
  0% {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
  50% {
    box-shadow: 0 8px 24px rgba(72, 187, 120, 0.4);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
}

.score-display.bump {
  animation: scoreBump 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scoreBump {
  0% { transform: scale(1); }
  50% { transform: scale(1.15) rotate(-5deg); }
  100% { transform: scale(1) rotate(0); }
}

/* Version Badge - Bottom Right */
.version-badge {
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(102, 126, 234, 0.2);
  z-index: 999;
  opacity: 0.7;
  transition: all 0.3s ease;
  cursor: default;
  user-select: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.version-badge:hover {
  opacity: 1;
  transform: translateY(-2px);
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (prefers-color-scheme: dark) {
  .version-badge {
    background: rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.3);
    color: rgba(255, 255, 255, 0.7);
  }

  .version-badge:hover {
    background: rgba(102, 126, 234, 0.25);
    border-color: rgba(102, 126, 234, 0.4);
    color: rgba(255, 255, 255, 0.9);
  }
}

@media screen and (max-width: 768px) {
  .version-badge {
    bottom: 12px;
    right: 12px;
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>

