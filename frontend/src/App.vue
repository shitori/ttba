<template>
  <div class="app-container">
    <section class="hero is-fullheight is-gradient">
      <div class="hero-body">
        <div class="container is-fluid">
          <h1 class="title is-2 has-text-centered mb-5 main-title">🎮 TTBA Game</h1>

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
                    <p class="has-text-centered mt-3 loading-text">⏳ Traitement du fichier... {{
                        fileState.progress
                      }}%</p>
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
                  <div class="notification is-danger error-notification mt-4" v-if="errorMessage" role="status">
                    <button class="delete" @click="errorMessage = ''"></button>
                    {{ errorMessage }}
                  </div>
                </div>

                <div class="box has-shadow options-list">
                  <div class="content has-text-centered mb-5 options-animated">
                    <p class="subtitle is-5 upload-title">⚙️ Options de jeu</p>
                    <div class="columns is-vcentered">
                      <div class="column">
                        <label class="label">Options de TikToks</label>
                        <div class="control">
                          <div class="select is-fullwidth animated-select">
                            <select v-model="options.tiktokOption">
                              <option>Like et partage</option>
                              <option>Like</option>
                              <option>Partage</option>
                            </select>
                          </div>
                        </div>

                        <label class="label mt-4">Activer le #sus mode</label>
                        <div class="field">
                          <button class="toggle-switch" :class="{ 'on': options.susMode }" @click="toggleSusMode"
                                  @keydown.space.prevent="toggleSusMode" @keydown.enter.prevent="toggleSusMode"
                                  type="button" :aria-pressed="options.susMode" aria-label="Activer le mode sus">
                            <span class="switch-track"></span>
                            <span class="switch-thumb"></span>
                          </button>
                          <span class="ml-3 hint">{{ options.susMode ? 'Activé' : 'Désactivé' }}</span>
                        </div>

                      </div>

                      <div class="column is-7" v-show="options.tiktokOption !== 'Like'">
                        <label class="label">Whitelist (utilisateurs détectés)</label>
                        <div class="whitelist-list control">
                          <template v-if="sharedUsersSorted.length === 0">
                            <p class="has-text-grey is-size-7">Aucun utilisateur détecté</p>
                          </template>
                          <template v-else>
                            <div class="tags has-addons is-flex-wrap-wrap">
                              <span v-for="(sharedUser, idx) in sharedUsersSorted" :key="sharedUser + '-' + idx"
                                    class="tag is-light whitelist-tag">
                                <label class="checkbox inline-checkbox">
                                  <input type="checkbox" :checked="isWhitelisted(sharedUser)"
                                         @change.prevent="toggleWhitelistUser(sharedUser)">
                                  <span class="tag-label">{{ sharedUser }}</span>
                                </label>
                              </span>
                            </div>
                          </template>
                        </div>
                        <p class="is-size-7 mt-2 has-text-grey">La whitelist permet de prioriser/filtrer les vidéos
                          issues de ces envoyeurs.</p>
                      </div>
                    </div>
                  </div>
                </div>


              </div>

              <!-- Right Column: Saved Data -->
              <div class="column is-half">
                <div class="box has-shadow data-box">
                  <div class="content has-text-centered mb-5">
                    <p class="subtitle is-5 data-title">📊 Joueurs sauvegardées ({{ players.length }})</p>
                  </div>

                  <div v-if="players.length === 0" class="content has-text-centered empty-state">
                    <p class="has-text-grey empty-text">🎭 Aucune donnée pour le moment</p>
                    <p class="has-text-grey is-size-7">Chargez des fichiers JSON pour commencer la partie</p>
                  </div>

                  <div v-else class="content results-list">
                    <div v-for="(item, index) in players" :key="item.username || index"
                         class="box mb-3 user-card player-card">
                      <div class="card-header">
                        <p class="has-text-weight-bold mb-2 card-number">👤 Joueur #{{ index + 1 }}</p>
                      </div>

                      <div class="card-body">
                        <div class="mb-3 player-info">
                          <p class="user-info-text">
                            <strong>🎮 Username:</strong> <span class="username-value">{{
                              item.username || '(N/A)'
                            }}</span>
                          </p>
                        </div>

                        <div class="stats-row">
                          <div class="stat-box">
                            <p class="stat-value">{{
                                Array.isArray(item.sharedVideos) ? item.sharedVideos.length : 0
                              }}</p>
                            <p class="stat-label">📨 Envoyés</p>
                          </div>
                          <div class="stat-box">
                            <p class="stat-value">{{
                                Array.isArray(item.likedVideos) ? item.likedVideos.length : 0
                              }}</p>
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
            <div v-if="players.length > 0" class="mt-4">
              <button
                  class="button is-fullwidth is-success launch-btn"
                  @click="runNewGame();"
              >
                🚀 Lancer la partie
              </button>
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
                          @click="endGame"
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
                <div class="column is-4">
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
                        <button class="button btn-fun open-btn" @click="openOnTikTok(currentVideo.id)">Ouvrir sur
                          TikTok
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="column is-8 has-text-centered">
                  <h1 class="title" v-if="!currentVideo.isShared">❤️ Qui a aimé cette vidéo ?</h1>
                  <h1 class="title" v-else>📱 Qui a envoyé cette vidéo à <span
                      class="is-danger">{{ currentVideo.sharedUser }}</span> ?</h1>

                  <div class="columns is-multiline">
                    <div class="column is-4" v-for="(player, index) in players"

                         :key="player.username || index">
                      <div class="card is-clickable player-btn"
                           :class="{
                          'is-success': showResultVideo && player.username === currentVideo.player,
                          'is-danger': showResultVideo && player.username !== currentVideo.player,
                          'celebrate': celebratingPlayer === player.username
                        }"

                           @click="selectPlayer(player)"
                      >
                        <div class="card-content">
                          <div class="content">
                            <p class="is-vcentered">
                              <span class="is-size-4">
                                {{ player.username }}
                              </span>
                              <br>
                              <span class="has-text-left"
                                    v-if="options.susMode"><strong>#sus:</strong> {{ player.susNumber }}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div class="columns">
                    <div class="column">
                      <button
                          class="button is-large is-fullwidth mb-3 is-warning skip-btn"
                          :disabled="showResultVideo"
                          @click="checkResult(false)"
                      >
                        ⏭️ Passer le tiktok
                      </button>
                    </div>
                    <div class="column is-half" v-if="options.susMode">
                      <button
                          class="button is-large is-fullwidth mb-3 is-danger skip-btn"
                          :disabled="showResultVideo"
                          @click="checkResult(true)"
                      >
                        🛑 #sus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>


        <!-- Success Messages -->
        <div class="notification is-success mt-4" v-if="successMessage" role="status">
          <button class="delete" @click="successMessage = ''"></button>
          {{ successMessage }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, nextTick, onUnmounted, computed} from 'vue'
import {useFileHandling} from '@/composables/useFileHandling'
import {useExtraction} from '@/composables/useExtraction'
import {Player, usePlayers} from '@/composables/usePlayers'
import {formatObject, getRandomInt} from '@/utils/helpers'

// Initialiser les composables
const {fileState, fileInput: fileInputRef, processFiles} = useFileHandling()
const rawFileData = ref<any[] | null>(null)
const {createResultObject, extractRawObjects} = useExtraction(rawFileData)
const {players, addPlayer, removePlayer, clearAll} = usePlayers()

// État local
const errorMessage = ref<string>('')
const successMessage = ref<string>('')
const submissionInfo = ref<Record<string, unknown> | null>(null)

const isRunningGame = ref<boolean>(false)
const currentVideo = ref<{
  id: string;
  player: string;
  isShared: boolean;
  sharedUser: string
}>({id: '6718335390845095173', player: 'michel', isShared: false, sharedUser: ''})
const showResultVideo = ref<boolean>(false)
const gameScore = ref<{ correct: number; total: number }>({correct: 0, total: 0})

// Nouveaux états pour animations et lazy-load
const celebratingPlayer = ref<string | null>(null)
const tiktokIframe = ref<HTMLIFrameElement | null>(null)
const hasLoaded = ref<boolean>(false)
const embedBlocked = ref<boolean>(false)
let iframeObserver: IntersectionObserver | null = null

// Computed: extract unique shared users once
const sharedUsersSorted = computed(() => {
  try {
    const sentAtList = players.value.flatMap((player: any) => Array.isArray(player.sharedVideos) ? player.sharedVideos.map((sv: any) => sv.sentAt) : [])
    return Array.from(new Set(sentAtList)).sort()
  } catch (e) {
    return []
  }
})

// Options UI state for the init panel
const options = ref({
  tiktokOption: 'Like et partage',
  susMode: true,
  whitelist: [] as string[],
})

function toggleWhitelistUser(name: string) {
  if (options.value.whitelist.includes(name)) {
    options.value.whitelist = options.value.whitelist.filter(n => n !== name)
  } else {
    options.value.whitelist = [...options.value.whitelist, name]
  }
}

function isWhitelisted(name: string) {
  return options.value.whitelist.includes(name)
}

function toggleSusMode() {
  options.value.susMode = !options.value.susMode
}

// Lightweight confetti implementation (no external dep)
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
  // use a non-null typed alias for closures
  const ctx = ctxRaw as CanvasRenderingContext2D
  const w = canvas.width = window.innerWidth
  const h = canvas.height = window.innerHeight
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
      vr: (Math.random() - 0.5) * 0.2
    })
  }

  function render() {
    ctx.clearRect(0, 0, w, h)
    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.12 // gravity
      p.rotate += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotate)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    })
  }

  let rafId: number

  function loop() {
    render()
    if (Date.now() < end) {
      rafId = requestAnimationFrame(loop)
    } else {
      // fade out quickly
      setTimeout(() => {
        cancelAnimationFrame(rafId)
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas)
      }, 300)
    }
  }

  loop()
}

async function loadTikTokEmbed() {
  hasLoaded.value = false
  embedBlocked.value = false
  await nextTick()
  const iframe = tiktokIframe.value
  if (!iframe) return
  const src = iframe.dataset.src
  if (!src) return

  // Si IntersectionObserver disponible, attend que l'iframe soit visible
  if ('IntersectionObserver' in window) {
    if (iframeObserver) iframeObserver.disconnect()
    iframeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          iframe.src = src
          iframeObserver && iframeObserver.disconnect()
          const onLoad = () => {
            hasLoaded.value = true
            iframe.removeEventListener('load', onLoad)
          }
          iframe.addEventListener('load', onLoad)
        }
      })
    }, {root: null, threshold: 0.1})
    iframeObserver.observe(iframe)
  } else {
    // fallback: charger directement et utiliser l'ancien timeout
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
}

onUnmounted(() => {
  if (iframeObserver) iframeObserver.disconnect()
})

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
              sharedVideos.push({
                video: message.Content,
                sentAt: keyChatName.split('Chat History with ')[1].trim().split(':')[0].trim()
              })
            })
      }

      const newPlayer = {
        username: resultObject.username || 'Inconnu',
        likedVideos: resultObject.likedVideos.map((rawVideo: { date: string; link: string }) => rawVideo.link) || [],
        sharedVideos: sharedVideos || [],
        susNumber: 0,
      }

      // Mettre à jour la whitelist automatiquement
      toggleWhitelistUser(newPlayer.username)

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

// Helper: robust extraction de l'ID TikTok à partir d'un lien
function extractTikTokId(link: unknown): string | null {
  if (typeof link !== 'string') return null
  const str = link.trim()
  if (str.length === 0) return null
  // formats attendus : /video/1234567890123456789 ou /v/1234567890123456789
  const m1 = str.match(/\/video\/(\d+)/)
  if (m1 && m1[1]) return m1[1]
  const m2 = str.match(/\/v\/(\d+)/)
  if (m2 && m2[1]) return m2[1]
  // fallback: cherche une suite de chiffres longue (>=6)
  const m3 = str.match(/(\d{6,})/)
  if (m3 && m3[1]) return m3[1]
  return null
}

function getRandomLikedVideoFromPlayer(player: Player): {
  id: string;
  player: string;
  isShared: boolean;
  sharedUser: string
} | null {
  if (Array.isArray(player.likedVideos) && player.likedVideos.length > 0) {
    const link = player.likedVideos[getRandomInt(player.likedVideos.length)]
    const id = extractTikTokId(link)
    if (id) {
      return {id, player: player.username, isShared: false, sharedUser: ''}
    }
  }
  return null
}

function getRandomSharedVideoFromPlayer(player: Player): {
  id: string;
  player: string;
  isShared: boolean;
  sharedUser: string
} | null {
  if (Array.isArray(player.sharedVideos) && player.sharedVideos.length > 0) {
    const whitelistedSharedVideos = options.value.whitelist.length > 0
        ? player.sharedVideos.filter(sv => options.value.whitelist.includes(sv.sentAt))
        : player.sharedVideos
    if (whitelistedSharedVideos.length === 0) return null
    const sharedVideo = whitelistedSharedVideos[getRandomInt(whitelistedSharedVideos.length)]
    const id = extractTikTokId(sharedVideo.video)
    if (id) {
      return {id, player: player.username, isShared: true, sharedUser: sharedVideo.sentAt}
    }
  }
  return null
}

// Helper: retourne un objet {id, player, isShared, sharedUser} ou null
function getRandomVideoFromPlayers() {
  if (!Array.isArray(players.value) || players.value.length === 0) {
    return null
  }

  // Pour éviter la récursion infinie, on tente un nombre limité d'essais
  const maxAttempts = Math.max(6, players.value.length * 3)
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const indexPlayer = getRandomInt(players.value.length)
    const player = players.value[indexPlayer]
    if (!player) continue

    // Filtrer selon options
    const pickType = (() => {
      if (options.value.tiktokOption === 'Like') return 'like'
      if (options.value.tiktokOption === 'Partage') return 'share'
      return Math.random() < 0.5 ? 'like' : 'share'
    })()

    let candidate = null
    if (pickType === 'like') {
      candidate = getRandomLikedVideoFromPlayer(player)
    } else {
      candidate = getRandomSharedVideoFromPlayer(player)
    }

    if (candidate) return candidate
  }

  // Aucun résultat valide trouvé après plusieurs essais
  return null
}

const runNewGame = () => {
  isRunningGame.value = true
  showResultVideo.value = false
  const candidate = getRandomVideoFromPlayers()
  if (candidate) {
    currentVideo.value = candidate
  } else {
    // Aucun résultat valide trouvé
    errorMessage.value = 'Aucune vidéo valide trouvée parmi les joueurs. Chargez d\'autres fichiers ou vérifiez les données.'
    // stop la partie proprement
    isRunningGame.value = false
    setTimeout(() => errorMessage.value = '', 5000)
  }
}

const endGame = () => {
  isRunningGame.value = false
  gameScore.value.correct = 0
  gameScore.value.total = 0
  players.value.forEach(player => player.susNumber = 0)
  showResultVideo.value = false
  celebratingPlayer.value = null
}

const checkResult = (_isSus: boolean = false) => {
  if (_isSus) {
    const indexPlayer = players.value.findIndex(p => p.username === currentVideo.value.player)
    if (indexPlayer !== -1) {
      players.value[indexPlayer].susNumber += 1
    }
  }
  showResultVideo.value = true
  setTimeout(() => {
    showResultVideo.value = false
    setTimeout(() => {
      runNewGame()
    }, 500)
  }, 3000)
}

function selectPlayer(player: { username: string }) {
  if (showResultVideo.value) return
  gameScore.value.total++
  if (player.username === currentVideo.value.player) {
    gameScore.value.correct++
    celebratingPlayer.value = player.username
    // trigger confetti animation
    try {
      triggerConfetti()
    } catch (e) { /* noop */
    }
    // clear celebration after animation
    setTimeout(() => celebratingPlayer.value = null, 1600)
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
  max-height: 450px;
  overflow-y: auto;
}

.options-list {
  max-height: 400px;
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
    transform: translateX(-15px);
  }
  50% {
    transform: translateX(15px);
  }
  75% {
    transform: translateX(-15px);
  }
}

/* Animation de célébration (emoji + glow) */
.player-btn.celebrate {
  animation: confetti 0.9s ease-out;
  position: relative;
}

.player-btn.celebrate::after {
  content: '🎉';
  position: absolute;
  right: 12px;
  top: -6px;
  font-size: 1.6rem;
  transform: translateY(0);
  animation: popUp 0.9s ease-out forwards;
  text-shadow: 0 6px 20px rgba(255, 255, 255, 0.7);
}

@keyframes popUp {
  0% {
    transform: translateY(0) scale(0.6);
    opacity: 0;
  }
  50% {
    transform: translateY(-18px) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateY(-34px) scale(0.95);
    opacity: 0;
  }
}

/* Garde le style iframe mais évite duplication */
.tiktok-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  animation: slideInLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
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

/* small accessibility helpers */
button[disabled] {
  cursor: not-allowed;
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
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
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
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
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
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  animation: slideInLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tiktok-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff6e6, #ffe8d6);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.btn-fun {
  padding: .6rem 1rem;
  border-radius: 10px;
  font-weight: 800;
  background: linear-gradient(135deg, #48bb78, #2f9a60);
  color: #fff;
  box-shadow: 0 8px 24px rgba(72, 187, 120, 0.25);
  transition: transform .25s, box-shadow .25s;
}

.btn-fun:hover:not(:disabled) {
  transform: translateY(-6px);
  box-shadow: 0 12px 36px rgba(72, 187, 120, 0.35);
}

/* ===== Options animations / styles ===== */
.options-animated {
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.options-animated:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 14px 30px rgba(102, 126, 234, 0.12);
}

.animated-select select {
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  transition: box-shadow 0.25s ease, transform 0.2s ease;
}

.animated-select select:focus {
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.18);
  transform: translateY(-2px);
}

/* Toggle switch */
.toggle-switch {
  display: inline-block;
  width: 54px;
  height: 28px;
  position: relative;
  cursor: pointer;
  user-select: none;
}

.toggle-switch .switch-track {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: #e6e6e6;
  transition: background 0.25s ease;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.06);
}

.toggle-switch .switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  transition: transform 0.25s cubic-bezier(.2, .9, .2, 1), box-shadow 0.2s ease;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.toggle-switch.on .switch-track {
  background: linear-gradient(90deg, #48bb78, #2f9a60);
}

.toggle-switch.on .switch-thumb {
  transform: translateX(26px);
}

.whitelist-list .whitelist-tag {
  margin: 4px;
}

.inline-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.inline-checkbox .tag-label {
  margin-left: 6px;
  font-weight: 700;
  color: #4a4a4a
}

/* ===== In-game player success/fail animations ===== */
.card.is-success.player-btn {
  border: 2px solid rgba(72, 187, 120, 0.95);
  box-shadow: 0 18px 40px rgba(72, 187, 120, 0.18), 0 0 40px rgba(72,187,120,0.06) inset;
  transform: translateY(-8px) scale(1.035) rotate(-0.6deg);
  transition: all 0.45s cubic-bezier(.2, .9, .2, 1);
  background: linear-gradient(135deg, rgba(72,187,120,0.06), rgba(72,187,120,0.02));
  overflow: visible;
}

.card.is-success.player-btn .is-size-4, .card.is-success.player-btn .username-value {
  color: #0f6b3a !important;
  text-shadow: 0 4px 18px rgba(72, 187, 120, 0.18);
  transform: translateY(-2px);
}

.card.is-danger.player-btn {
  border: 2px solid rgba(245, 101, 101, 0.95);
  box-shadow: 0 18px 40px rgba(245, 101, 101, 0.14), 0 0 32px rgba(245,101,101,0.04) inset;
  transform: translateY(-6px) scale(1.02) rotate(0.6deg);
  transition: all 0.45s cubic-bezier(.2, .9, .2, 1);
  background: linear-gradient(135deg, rgba(245,101,101,0.04), rgba(245,101,101,0.01));
  overflow: visible;
}

.card.is-danger.player-btn .is-size-4, .card.is-danger.player-btn .username-value {
  color: #8b2323 !important;
  transform: translateY(-1px);
}

/* badge (tick / cross) animé qui apparaît en haut à droite */
.card.is-success.player-btn::after, .card.is-danger.player-btn::after {
  content: '';
  position: absolute;
  top: -12px;
  right: -12px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  transform: scale(0.2) translateY(-6px);
  opacity: 0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.18);
  z-index: 4;
}
.card.is-success.player-btn::after {
  content: '✓';
  background: radial-gradient(circle at 30% 20%, #6ee7b7, #2f9a60);
  animation: popBadgeSuccess 700ms cubic-bezier(.2,.9,.2,1) forwards;
}
.card.is-danger.player-btn::after {
  content: '✖';
  background: radial-gradient(circle at 30% 20%, #ffb4b4, #e23b3b);
  animation: popBadgeDanger 700ms cubic-bezier(.2,.9,.2,1) forwards;
}

@keyframes popBadgeSuccess {
  0% { transform: scale(0.2) translateY(-12px); opacity: 0 }
  60% { transform: scale(1.12) translateY(2px); opacity: 1 }
  100% { transform: scale(1) translateY(0); opacity: 1 }
}
@keyframes popBadgeDanger {
  0% { transform: scale(0.2) translateY(-12px) rotate(-20deg); opacity: 0 }
  60% { transform: scale(1.12) translateY(2px) rotate(6deg); opacity: 1 }
  100% { transform: scale(1) translateY(0) rotate(0); opacity: 1 }
}

/* Hover / idle animations for player buttons (when not revealed) */
.player-btn {
  transition: transform 240ms cubic-bezier(.2,.9,.2,1), box-shadow 240ms, background 240ms;
  cursor: pointer;
}
.player-btn:hover {
  transform: translateY(-8px) scale(1.02) rotate(-0.6deg);
  box-shadow: 0 18px 40px rgba(0,0,0,0.12);
}
.player-btn:active {
  transform: translateY(-2px) scale(0.99);
}

/* subtle animated border glow while waiting for reveal */
.player-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  pointer-events: none;
  transition: box-shadow 0.4s ease, opacity 0.4s ease;
  box-shadow: 0 0 0 0 rgba(0,0,0,0);
  opacity: 0;
}
.player-btn:hover::before {
  opacity: 1;
  box-shadow: 0 12px 30px rgba(102,126,234,0.12);
}

/* glow pulse pour les cards gagnantes (loop bref) */
.card.is-success.player-btn { animation: successGlow 1.6s ease-in-out 1; }
@keyframes successGlow {
  0% { box-shadow: 0 8px 20px rgba(72,187,120,0.12); }
  50% { box-shadow: 0 26px 60px rgba(72,187,120,0.22); transform: translateY(-10px) scale(1.04); }
  100% { box-shadow: 0 8px 20px rgba(72,187,120,0.12); transform: translateY(-8px) scale(1.035); }
}

/* petit shake + fade pour la mauvaise réponse */
.card.is-danger.player-btn { animation: dangerFlash 900ms ease; }
@keyframes dangerFlash {
  0% { filter: grayscale(0.4); transform: translateY(-6px) scale(1.02); }
  30% { transform: translateY(-6px) scale(1.02) rotate(-2deg); }
  60% { transform: translateY(-8px) scale(1.03) rotate(2deg); }
  100% { transform: translateY(-6px) scale(1.02); filter: none; }
}

/* rendre la carte plus colorée pendant reveal pour la lisibilité */
.card.is-success.player-btn .card-content { background: linear-gradient(90deg, rgba(72,187,120,0.02), rgba(255,255,255,0.02)); }
.card.is-danger.player-btn .card-content { background: linear-gradient(90deg, rgba(245,101,101,0.02), rgba(255,255,255,0.01)); }

/* assure que le badge de célébration existant ne rentre pas en conflit */
.player-btn.celebrate::after { right: 14px; top: -8px; transform-origin: center; }
</style>
