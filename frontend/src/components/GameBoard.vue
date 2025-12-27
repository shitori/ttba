<template>
  <div class="box has-shadow">
    <div class="content has-text-centered mb-5">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <button class="button is-danger" @click="$emit('end')">🎮 Fin de partie</button>
          </div>
        </div>
        <div class="level-item">
          <h1 class="subtitle">🎮 Partie en cours</h1>
        </div>
        <div class="level-right">
          <div class="level-item">
            <p class="subtitle score-display">📊 {{ score.correct }}/{{ score.total }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-4">
        <div class="tiktok-wrapper">
          <iframe
              ref="iframeRef"
              :data-src="'https://www.tiktok.com/embed/v2/' + currentVideo.id"
              loading="lazy"
              allow="autoplay; encrypted-media; fullscreen"
              title="TikTok Video Embed"
          ></iframe>

          <div class="tiktok-fallback" v-if="embedBlocked">
            <div class="fallback-inner">
              <p class="mb-3">Impossible d'afficher la vidéo TikTok ici.</p>
              <button class="button btn-fun open-btn" @click="$emit('open', currentVideo.id)">Ouvrir sur TikTok</button>
            </div>
          </div>
        </div>
      </div>

      <div class="column is-8 has-text-centered">
        <h1 class="title" v-if="!currentVideo.isShared">❤️ Qui a aimé cette vidéo ?</h1>
        <h1 class="title" v-else>📱 Qui a envoyé cette vidéo à <span class="is-danger">{{
            currentVideo.sharedUser
          }}</span> ?</h1>

        <div class="columns is-multiline">
          <div class="column is-4" v-for="(player, index) in players" :key="player.username || index">
            <div
                class="card is-clickable player-btn"
                role="button"
                tabindex="0"
                :class="{
                  'is-success': showResult && player.username === currentVideo.player,
                  'is-danger': showResult && player.username !== currentVideo.player,
                  'celebrate': celebratingPlayer === player.username,
                  'is-disabled': disabled
                }"
                @click="onSelect(player)"
                @keydown.enter.prevent="onSelect(player)"
                @keydown.space.prevent="onSelect(player)"
            >
              <div class="card-content">
                <div class="content">
                  <p class="is-vcentered">
                    <span class="is-size-4">{{ player.username }}</span>
                    <br>
                    <span class="has-text-left" v-if="susMode"><strong>#sus:</strong> {{ player.susNumber }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column">
            <button class="button is-large is-fullwidth mb-3 is-warning skip-btn" :disabled="showResult"
                    @click="$emit('reveal', false)">⏭️ Passer le tiktok
            </button>
          </div>
          <div class="column is-half" v-if="susMode && !isGuest">
            <button class="button is-large is-fullwidth mb-3 is-danger skip-btn" :disabled="showResult"
                    @click="$emit('reveal', true)">🛑 #sus
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onUnmounted, ref, nextTick, watch} from 'vue'

const props = defineProps<{
  players: Array<{ username: string; susNumber: number }>
  currentVideo: { id: string; player: string; isShared: boolean; sharedUser: string }
  score: { correct: number; total: number }
  showResult: boolean
  celebratingPlayer: string | null
  susMode: boolean
  disabled?: boolean
  isGuest?: boolean
}>()

const emit = defineEmits<{
  (e: 'end'): void;
  (e: 'select', player: { username: string }): void;
  (e: 'reveal', isSus: boolean): void;
  (e: 'open', id: string): void
}>()

function onSelect(player: { username: string }) {
  if (props.disabled || props.showResult) return
  emit('select', player)
}

const iframeRef = ref<HTMLIFrameElement | null>(null)
const embedBlocked = ref(false)
const hasLoaded = ref(false)
let iframeObserver: IntersectionObserver | null = null

async function setupEmbed() {
  hasLoaded.value = false
  embedBlocked.value = false
  await nextTick()
  const iframe = iframeRef.value
  if (!iframe) return
  const src = iframe.dataset.src
  if (!src) return

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
          setTimeout(() => {
            if (!hasLoaded.value) embedBlocked.value = true
          }, 3000)
        }
      })
    }, {root: null, threshold: 0.1})
    iframeObserver.observe(iframe)
  } else {
    iframe.src = src
    const onLoad = () => {
      hasLoaded.value = true;
      iframe.removeEventListener('load', onLoad)
    }
    iframe.addEventListener('load', onLoad)
    setTimeout(() => {
      if (!hasLoaded.value) embedBlocked.value = true
    }, 2500)
  }
}

// Réinitialiser l'embed à chaque changement de vidéo
watch(() => props.currentVideo.id, () => {
  setupEmbed()
}, {immediate: false})

setupEmbed()

onUnmounted(() => {
  if (iframeObserver) iframeObserver.disconnect()
})
</script>

<style scoped>
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

.player-btn {
  position: relative;
  overflow: hidden;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: transform 240ms cubic-bezier(.2, .9, .2, 1), box-shadow 240ms, background 240ms;
  cursor: pointer;
  border-radius: var(--radius-md);
}

.player-btn:hover {
  transform: translateY(-8px) scale(1.02) rotate(-0.6deg);
  box-shadow: var(--shadow-strong);
}

.player-btn:active {
  transform: translateY(-2px) scale(0.99);
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

.card.is-success.player-btn {
  border: 2px solid rgba(72, 187, 120, 0.95);
  box-shadow: 0 18px 40px rgba(72, 187, 120, 0.18), 0 0 40px rgba(72, 187, 120, 0.06) inset;
  transform: translateY(-8px) scale(1.035) rotate(-0.6deg);
  transition: all 0.45s cubic-bezier(.2, .9, .2, 1);
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.06), rgba(72, 187, 120, 0.02));
  overflow: visible;
}

.card.is-danger.player-btn {
  border: 2px solid rgba(245, 101, 101, 0.95);
  box-shadow: 0 18px 40px rgba(245, 101, 101, 0.14), 0 0 32px rgba(245, 101, 101, 0.04) inset;
  transform: translateY(-6px) scale(1.02) rotate(0.6deg);
  transition: all 0.45s cubic-bezier(.2, .9, .2, 1);
  background: linear-gradient(135deg, rgba(245, 101, 101, 0.04), rgba(245, 101, 101, 0.01));
  overflow: visible;
}

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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  z-index: 4;
}

.card.is-success.player-btn::after {
  content: '✓';
  background: radial-gradient(circle at 30% 20%, #6ee7b7, #2f9a60);
  animation: popBadgeSuccess 700ms cubic-bezier(.2, .9, .2, 1) forwards;
}

.card.is-danger.player-btn::after {
  content: '✖';
  background: radial-gradient(circle at 30% 20%, #ffb4b4, #e23b3b);
  animation: popBadgeDanger 700ms cubic-bezier(.2, .9, .2, 1) forwards;
}

@keyframes popBadgeSuccess {
  0% {
    transform: scale(0.2) translateY(-12px);
    opacity: 0;
  }
  60% {
    transform: scale(1.12) translateY(2px);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes popBadgeDanger {
  0% {
    transform: scale(0.2) translateY(-12px) rotate(-20deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.12) translateY(2px) rotate(6deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0) rotate(0);
    opacity: 1;
  }
}


.player-btn.is-disabled {
  opacity: 0.5;
  pointer-events: none;
  filter: grayscale(0.6) blur(0.5px);
  cursor: not-allowed;
  position: relative;
}

.player-btn.is-disabled::after {
  content: '✓ Réponse envoyée';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-md);
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  opacity: 0;
  animation: fadeInScale 0.4s ease-out forwards;
  backdrop-filter: blur(2px);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
