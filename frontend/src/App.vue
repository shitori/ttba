<template>
  <div class="app-container">
    <section class="hero is-fullheight is-gradient">
      <div class="hero-body">
        <div class="container is-fluid">
          <h1 class="title is-2 has-text-centered mb-5 main-title" style="color: white;">🎮 TTBA Game</h1>

          <div class="initGame" v-if="!isRunningGame">
            <div class="columns">
              <!-- Left Column: Upload -->
              <div class="column is-half">
                <div class="box has-shadow upload-box">
                  <div class="content has-text-centered mb-5">
                    <p class="subtitle is-5 upload-title">📤 Charger les fichiers JSON</p>
                  </div>

                  <!-- File Upload Section -->
                  <div class="file is-boxed is-fullwidth upload-file">
                    <label class="file-label">
                      <input
                          class="file-input"
                          type="file"
                          accept=".json"
                          multiple
                          @change="handleFileUpload"
                          ref="fileInputRef"
                          :disabled="fileState.isProcessing"
                      >
                      <span class="file-cta upload-cta">
                      <span class="file-icon">
                        <i class="fas fa-upload"></i>
                      </span>
                      <span class="file-label">Choisir un fichier ou plusieurs fichiers ...</span>
                    </span>
                      <span class="file-name" v-if="fileState.fileName">
                      {{ fileState.fileName }}
                    </span>
                    </label>
                  </div>

                  <!-- Loading Progress -->
                  <div v-if="fileState.isProcessing" class="mt-5 loading-section">
                    <progress class="progress is-primary progress-bar" :value="fileState.progress" max="100"></progress>
                    <p class="has-text-centered mt-3 loading-text">⏳ Traitement du fichier... {{ fileState.progress }}%</p>
                  </div>

                  <!-- Results Section -->
                  <div v-if="submissionInfo && !fileState.isProcessing" class="mt-5">
                    <div class="box has-background-success-light success-box">
                      <p class="has-text-weight-bold mb-3" style="color: #257942;">✅ {{ submissionInfo.status }}</p>
                      <p class="has-text-grey is-size-7 mt-2">Total d'objets sauvegardés:
                        <strong>{{ submissionInfo.totalResults }}</strong></p>
                    </div>
                  </div>

                  <!-- Error Messages -->
                  <div class="notification is-danger error-notification mt-4" v-if="errorMessage">
                    <button class="delete" @click="errorMessage = ''"></button>
                    {{ errorMessage }}
                  </div>
                </div>

                <div v-if="players.length > 0" class="mt-4">
                  <button
                      class="button is-fullwidth is-success launch-btn" style="height: 200px"
                      @click="runNewGame();"
                  >
                    🚀 Lancer la partie
                  </button>
                </div>


              </div>

              <!-- Right Column: Saved Data -->
              <div class="column is-half">
                <div class="box has-shadow data-box">
                  <div class="content has-text-centered mb-5">
                    <p class="subtitle is-5 data-title">📊 Données Sauvegardées ({{ players.length }})</p>
                  </div>

                  <div v-if="players.length === 0" class="content has-text-centered empty-state">
                    <p class="has-text-grey empty-text">🎭 Aucune donnée pour le moment</p>
                    <p class="has-text-grey is-size-7">Chargez des fichiers JSON pour commencer</p>
                  </div>

                  <div v-else class="content results-list">
                    <div v-for="(item, index) in players" :key="index" class="box mb-3 user-card player-card">
                      <div class="card-header">
                        <p class="has-text-weight-bold mb-2 card-number">👤 Joueur #{{ index + 1 }}</p>
                      </div>

                      <div class="card-body">
                        <div class="mb-3 player-info">
                          <p class="user-info-text">
                            <strong>🎮 Username:</strong> <span class="username-value">{{ item.username || '(N/A)' }}</span>
                          </p>
                        </div>

                        <div class="stats-row">
                          <div class="stat-box">
                            <p class="stat-value">{{ Array.isArray(item.sharedVideos) ? item.sharedVideos.length : 0 }}</p>
                            <p class="stat-label">📨 Envoyés</p>
                          </div>
                          <div class="stat-box">
                            <p class="stat-value">{{ Array.isArray(item.likedVideos) ? item.likedVideos.length : 0 }}</p>
                            <p class="stat-label">❤️ Aimés</p>
                          </div>
                        </div>

                        <details class="mb-3 details-box">
                          <summary class="details-summary">📝 Voir détails</summary>
                          <pre class="details-content">{{ formatObject(item) }}</pre>
                        </details>

                        <button
                            class="button is-small is-danger is-outlined delete-btn"
                            @click="removePlayer(index)"
                            style="width: 100%;"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-if="players.length > 0" class="mt-4">
                    <button
                        class="button is-fullwidth is-warning clear-all-btn"
                        @click="handleClearAll"
                    >
                      🔄 Vider tout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="runGame" v-if="players.length > 0 && isRunningGame">
            <div class="box has-shadow">
              <div class="content has-text-centered mb-5">
                <div class="level">
                  <div class="level-left">
                    <div class="level-item">
                      <button
                          class="button is-danger"
                          @click="() => { isRunningGame = false; gameScore.correct = 0; gameScore.total = 0; }"
                      >
                        🎮 Fin de partie
                      </button>
                    </div>
                  </div>
                  <div class="level-item">
                    <h1 class="subtitle">🎮 Partie en cours</h1>
                  </div>
                  <div class="level-right">
                    <div class="level-item">
                      <p class="subtitle score-display">📊 {{ gameScore.correct }}/{{ gameScore.total }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Game content goes here -->
              <div class="columns">
                <div class="column is-half">
                  <div class="tiktok-wrapper">
                    <iframe
                      ref="tiktokIframe"
                      :data-src="'https://www.tiktok.com/embed/v2/' + currentVideo.id"
                      loading="lazy"
                      allow="autoplay; encrypted-media; fullscreen"
                      title="TikTok Video Embed"
                    ></iframe>

                    <div class="tiktok-fallback" v-if="embedBlocked">
                      <div class="fallback-inner">
                        <p class="mb-3">Impossible d'afficher la vidéo TikTok ici.</p>
                        <button class="button btn-fun open-btn" @click="openOnTikTok(currentVideo.id)">Ouvrir sur TikTok</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="column is-half has-text-centered">
                  <h1 class="title" v-if="!currentVideo.isShared">❤️ Qui a aimé cette vidéo ?</h1>
                  <h1 class="title" v-else>📱 Qui a envoyé cette vidéo à <span class="is-danger">{{ currentVideo.sharedUser }}</span> ?</h1>

                  <button
                      v-for="(player, index) in players"
                      :key="index"
                      class="button is-large is-fullwidth mb-3 player-btn"
                      :class="{
                        'is-success': showResultVideo && player.username === currentVideo.player,
                        'is-danger': showResultVideo && player.username !== currentVideo.player,
                      }"
                      :disabled="showResultVideo"
                      @click="selectPlayer(player)"
                    >
                      {{ player.username }}
                    </button>
                  <button
                      class="button is-large is-fullwidth mb-3 is-warning skip-btn"
                      :disabled="showResultVideo"
                      @click="checkResult()"
                  >
                    ⏭️ Passer le tiktok
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>


        <!-- Success Messages -->
        <div class="notification is-success mt-4" v-if="successMessage">
          <button class="delete" @click="successMessage = ''"></button>
          {{ successMessage }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useFileHandling } from '@/composables/useFileHandling'
import { useExtraction } from '@/composables/useExtraction'
import { usePlayers } from '@/composables/usePlayers'
import { formatObject, getRandomInt } from '@/utils/helpers'

// Initialiser les composables
const { fileState, fileInput: fileInputRef, processFiles } = useFileHandling()
const rawFileData = ref<any[] | null>(null)
const { createResultObject, extractRawObjects } = useExtraction(rawFileData)
const { players, addPlayer, removePlayer, clearAll } = usePlayers()

// État local
const errorMessage = ref<string>('')
const successMessage = ref<string>('')
const submissionInfo = ref<Record<string, unknown> | null>(null)

const isRunningGame = ref<boolean>(false)
const currentVideo = ref<{ id: string; player: string; isShared: boolean; sharedUser: string }>({ id: '6718335390845095173', player: 'michel', isShared: false, sharedUser: '' })
const showResultVideo = ref<boolean>(false)
const gameScore = ref<{ correct: number; total: number }>({ correct: 0, total: 0 })

// TikTok embed state
const tiktokIframe = ref<HTMLIFrameElement | null>(null)
const hasLoaded = ref<boolean>(false)
const embedBlocked = ref<boolean>(false)

async function loadTikTokEmbed() {
  hasLoaded.value = false
  embedBlocked.value = false
  await nextTick()
  const iframe = tiktokIframe.value
  if (!iframe) return
  const src = iframe.dataset.src
  if (!src) return
  iframe.src = src
  const onLoad = () => {
    hasLoaded.value = true
    iframe.removeEventListener('load', onLoad)
  }
  iframe.addEventListener('load', onLoad)
  setTimeout(() => {
    if (!hasLoaded.value) embedBlocked.value = true
  }, 2500)
}

function openOnTikTok(id: string) {
  const url = `https://www.tiktok.com/v/${id}`
  window.open(url, '_blank')
}

// Watch pour charger l'embed quand la partie démarre ou que la vidéo change
watch(
  () => currentVideo.value.id,
  (newId) => {
    if (isRunningGame.value && newId) loadTikTokEmbed()
  }
)
watch(isRunningGame, (val) => {
  if (val) loadTikTokEmbed()
})

/**
 * Traite l'upload de fichiers
 */
const handleFileUpload = async (event: Event): Promise<void> => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  errorMessage.value = ''

  try {
    await processFiles(files, async (file, data) => {
      rawFileData.value = data

      // Extraire les données
      extractRawObjects()
      const resultObject: any = createResultObject(data[0])

      // Transformer Objet en Player
      const sharedVideos: Array<{ video: string; sentAt: string }> = []

      for (const [keyChatName, messageList] of Object.entries(resultObject.chatHistory as Record<string, any[]>)) {
        if (keyChatName.includes('Group')) {
          continue
        }
        messageList
          .filter((message: any) => message.Content.includes('https://www.tiktokv.com/share/video/'))
          .filter((message: any) => message.From === resultObject.username)
          .forEach((message: any) => {
            sharedVideos.push({ video: message.Content, sentAt: keyChatName.split('Chat History with ')[1].trim().split(':')[0].trim() })
          })
      }

      const newPlayer = {
        username: resultObject.username || 'Inconnu',
        likedVideos: resultObject.likedVideos.map((rawVideo: { date: string; link: string }) => rawVideo.link) || [],
        sharedVideos: sharedVideos || [],
      }

      // Ajouter aux résultats
      addPlayer(newPlayer)

      // Afficher le statut
      submissionInfo.value = {
        status: '✅ Données Extraites',
        timestamp: new Date().toLocaleString('fr-FR'),
        fileName: file.name,
        itemsExtracted: data.length,
        totalResults: players.value.length,
      }

      // Réinitialiser après 2 secondes
      await new Promise((resolve) => setTimeout(resolve, 2000))
      submissionInfo.value = null
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erreur inconnue'
  }
}

/**
 * Demande confirmation avant de vider
 */
const handleClearAll = (): void => {
  if (confirm('Êtes-vous sûr de vouloir vider tous les résultats?')) {
    clearAll()
  }
}

const runNewGame = () => {
  isRunningGame.value = true
  showResultVideo.value = false

  if (Math.random() < 0.5) {
    // choisir une vidéo aimée par un joueur
    const indexPlayer = getRandomInt(players.value.length)
    const player = players.value[indexPlayer]

    if (player.likedVideos.length > 0) {
      currentVideo.value = {
        id: player.likedVideos[getRandomInt(player.likedVideos.length)].split('/video/')[1],
        player: player.username,
        isShared: false,
        sharedUser: '',
      }
    }
  } else {
    // choisir une vidéo partagée par un joueur
    const indexPlayer = getRandomInt(players.value.length)
    const player = players.value[indexPlayer]

    if (player.sharedVideos.length > 0) {
      const sharedVideo = player.sharedVideos[getRandomInt(player.sharedVideos.length)]
      currentVideo.value = {
        id: sharedVideo.video.split('/video/')[1],
        player: player.username,
        isShared: true,
        sharedUser: sharedVideo.sentAt,
      }
    }
  }
}

const checkResult = () => {
  showResultVideo.value = true
  setTimeout(() => {
    showResultVideo.value = false
    setTimeout(() => {
      runNewGame()
    }, 500)
  }, 3000)
}

function selectPlayer(player: any) {
  gameScore.value.total++
  if (player.username === currentVideo.value.player) {
    gameScore.value.correct++
  }
  checkResult()
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.hero.is-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  0%, 100% {
    background: radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(102, 153, 255, 0.1) 0%, transparent 50%);
  }
  50% {
    background: radial-gradient(circle at 80% 30%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 20% 70%, rgba(102, 153, 255, 0.1) 0%, transparent 50%);
  }
}

.box {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.5s ease;
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

.has-shadow {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.title {
  animation: titleBounce 1s ease-in-out;
  font-weight: 900;
}

@keyframes titleBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.file-cta {
  background-color: #3273dc;
  border-color: #3273dc;
  color: white;
  transition: all 0.3s ease;
}

.file-cta:hover {
  background-color: #2366d1;
  border-color: #2366d1;
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(50, 115, 220, 0.4);
}

.file-input:focus + .file-cta {
  border-color: #3273dc;
  box-shadow: 0 0 0.5em rgba(50, 115, 220, 0.25);
}

.file-input:disabled + .file-cta {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

.results-list {
  max-height: 600px;
  overflow-y: auto;
}

.user-card {
  background: linear-gradient(135deg, #f5f5f5 0%, #f9f9f9 100%);
  transition: all 0.3s ease;
  border-left: 4px solid #3273dc;
}

.user-card:hover {
  transform: translateX(5px);
  box-shadow: 0 6px 20px rgba(50, 115, 220, 0.15);
  border-left-color: #2366d1;
}

.user-info-text {
  font-size: 0.9rem;
  color: #7a7a7a;
  margin: 0;
}

.details-summary {
  cursor: pointer;
  color: #3273dc;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  font-weight: 600;
}

.details-summary:hover {
  color: #2366d1;
  text-decoration: underline;
}

.details-content {
  color: #2d2d2d;
  font-size: 0.75rem;
  line-height: 1.5;
  background: white;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 300px;
  margin-top: 0.5rem;
  border: 1px solid #e0e0e0;
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

.button.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.button.is-success {
  animation: successPulse 0.6s ease;
}

.button.is-danger {
  animation: dangerShake 0.6s ease;
}

.player-btn {
  position: relative;
  overflow: hidden;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.player-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.player-btn:active::before {
  width: 300px;
  height: 300px;
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
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.notification {
  animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.runGame {
  animation: fadeInUp 0.5s ease;
}

iframe {
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Animations amusantes pour le jeu de soirée */
.runGame .box {
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,255,0.95) 100%);
  border: 3px solid #667eea;
  border-radius: 16px;
}

.runGame .title {
  color: #667eea;
  font-size: 2rem;
  text-shadow: 2px 2px 4px rgba(102, 126, 234, 0.2);
  animation: titlePulse 1.5s ease infinite;
}

.runGame .title span{
  color: #e34141;
  font-size: 2rem;
  text-shadow: 2px 2px 4px rgba(234, 102, 102, 0.2);
  animation: titlePulse 1.5s ease infinite;
}

@keyframes titlePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.player-btn {
  background: linear-gradient(135deg, #3273dc 0%, #2366d1 100%);
  border: none;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(50, 115, 220, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.player-btn:hover:not(:disabled) {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 8px 25px rgba(50, 115, 220, 0.5);
}

.player-btn:active:not(:disabled) {
  transform: translateY(-2px) scale(1);
}

.player-btn.is-success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  box-shadow: 0 0 30px rgba(72, 187, 120, 0.6);
  animation: confetti 0.8s ease-out;
}

.player-btn.is-danger {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  animation: dangerShake 0.6s ease;
}

.player-btn.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.skip-btn {
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
  border: none;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.skip-btn:hover:not(:disabled) {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 8px 25px rgba(237, 137, 54, 0.5);
}

.skip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes confetti {
  0% {
    transform: translateY(0) scale(1);
    box-shadow: 0 0 30px rgba(72, 187, 120, 0.6);
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    box-shadow: 0 10px 40px rgba(72, 187, 120, 0.8);
  }
  100% {
    transform: translateY(0) scale(1);
    box-shadow: 0 0 30px rgba(72, 187, 120, 0.6);
  }
}

@keyframes dangerShake {
  0%, 100% {
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

/* Iframe TikTok animation */
iframe {
  animation: slideInLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: all 0.3s ease;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Couleurs amusantes au survol */
.player-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.player-btn:active::after {
  width: 300px;
  height: 300px;
}

/* Score display */
.score-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  animation: scorePulse 0.5s ease;
}

@keyframes scorePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Buttons container */
.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Réinitialiser le jeu avec transition */
.runGame {
  animation: fadeInUp 0.5s ease;
}

/* Ajouter du padding et du style au level */
.level {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

/* Amélioration des colonnes de jeu */
.columns.runGame-columns {
  gap: 2rem;
}

/* Amélioration du titre "Fin de partie" */
.button.is-danger {
  font-weight: 700;
}

/* Hover effects sur les contrôles de jeu */
.runGame .level-item:hover {
  transform: scale(1.02);
  transition: transform 0.3s ease;
}

/* Style pour le bouton "Lancer la partie" */
.initGame .button.is-success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border: none;
  font-weight: 700;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.initGame .button.is-success:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 8px 30px rgba(72, 187, 120, 0.5);
}

/* Style pour le bouton "Vider tout" */
.box .button.is-warning {
  background: linear-gradient(135deg, #ed8936 0%, #d69e2e 100%);
  border: none;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.box .button.is-warning:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(237, 137, 54, 0.5);
}

/* Améliorations des boutons de suppression */
.button.is-danger.is-outlined {
  transition: all 0.3s ease;
}

.button.is-danger.is-outlined:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(245, 101, 101, 0.3);
}

/* ======== MAIN TITLE ANIMATION ======== */
.main-title {
  animation: titlePulse 2s ease-in-out infinite;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

/* ======== UPLOAD BOX STYLING ======== */
.upload-box {
  position: relative;
  overflow: hidden;
}

.upload-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.upload-title {
  font-weight: 700;
  color: #667eea;
  font-size: 1.2rem !important;
}

.upload-file {
  transition: all 0.3s ease;
  border: 2px dashed #667eea;
}

.upload-file:hover {
  border-color: #764ba2;
  background: rgba(102, 126, 234, 0.02);
  transform: scale(1.01);
}

.upload-cta {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.upload-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
}

.loading-section {
  animation: fadeInUp 0.5s ease;
}

.progress-bar {
  height: 8px;
  border-radius: 10px;
  overflow: hidden;
  background: #e8e8e8;
}

.progress-bar::-webkit-progress-value {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.loading-text {
  font-weight: 600;
  color: #667eea;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.success-box {
  border-left: 5px solid #48bb78 !important;
  animation: slideInRight 0.5s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.error-notification {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.launch-btn {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%) !important;
  border: none;
  font-weight: 800;
  font-size: 1.3rem;
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
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

/* ======== DATA BOX STYLING ======== */
.data-box {
  position: relative;
}

.data-title {
  font-weight: 700;
  color: #667eea;
  font-size: 1.2rem !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-state {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 12px;
  animation: fadeInUp 0.5s ease;
}

.empty-text {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* ======== PLAYER CARD STYLING ======== */
.player-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%) !important;
  border: 2px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.player-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.player-card:hover {
  transform: translateY(-8px) translateX(4px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.3);
  border-color: #667eea;
}

.player-card:hover::before {
  width: 8px;
}

.card-header {
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.card-number {
  color: #667eea;
  font-size: 1.1rem;
}

.card-body {
  padding-top: 0.75rem;
}

.player-info {
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.player-card:hover .player-info {
  background: rgba(102, 126, 234, 0.05);
}

.username-value {
  color: #764ba2;
  font-weight: 700;
  font-size: 1.05rem;
}

/* ======== STATS ROW STYLING ======== */
.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.stat-box {
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  border: 2px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.player-card:hover .stat-box {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #667eea;
  margin: 0;
}

.stat-label {
  font-size: 0.75rem;
  color: #999;
  margin: 0.25rem 0 0 0;
  font-weight: 600;
}

.details-box {
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.delete-btn {
  background: white;
  border: 2px solid #f56565 !important;
  color: #f56565 !important;
  font-weight: 700;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #f56565 !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(245, 101, 101, 0.4);
}

.clear-all-btn {
  background: linear-gradient(135deg, #ed8936 0%, #d69e2e 100%) !important;
  border: none;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.clear-all-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(237, 137, 54, 0.5);
}

/* TikTok embed responsive wrapper + fallback */
.tiktok-wrapper {
  position: relative;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  padding-top: 177.78%; /* ratio approximatif 575/325 */
}
.tiktok-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}
.tiktok-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,#fff6e6,#ffe8d6);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}
.btn-fun {
  padding: .6rem 1rem;
  border-radius: 10px;
  font-weight: 800;
  background: linear-gradient(135deg,#48bb78,#2f9a60);
  color: #fff;
  box-shadow: 0 8px 24px rgba(72,187,120,0.25);
  transition: transform .25s, box-shadow .25s;
}
.btn-fun:hover:not(:disabled) { transform: translateY(-6px); box-shadow: 0 12px 36px rgba(72,187,120,0.35); }
</style>
