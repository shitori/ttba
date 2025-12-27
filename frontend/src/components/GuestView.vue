<template>
  <div class="guest-view">
    <!-- En attente du début de la partie -->
    <div v-if="gameState === 'waiting'" class="waiting-state">
      <div class="waiting-animation">
        <div class="pulse-circle"></div>
        <div class="waiting-icon">⏳</div>
      </div>
      <h2 class="waiting-title">En attente de l'hôte...</h2>
      <p class="waiting-text">L'hôte va bientôt démarrer la partie</p>
    </div>

    <!-- Partie en cours -->
    <div v-else-if="gameState === 'playing'" class="playing-state">

      <GameBoard
        :players="players"
        :current-video="currentVideo"
        :score="localScore"
        :show-result="localShowResult"
        :celebrating-player="celebratingPlayer"
        :sus-mode="susMode"
        :is-guest="true"
        :disabled="hasAnswered && !localShowResult"
        @select="handleGuestAnswer"
        @reveal="handleGuestReveal"
      />

      <!-- Confirmation de réponse envoyée -->
      <transition name="slide-up">
        <div v-if="hasAnswered && !localShowResult" class="answer-sent">
          <span class="check-icon">✅</span>
          <span class="answer-text">Réponse envoyée!</span>
          <span class="waiting-text">En attente du résultat...</span>
        </div>
      </transition>

      <!-- Animation du résultat personnalisé -->
      <transition name="result-fade">
        <div v-if="hasAnswered && localShowResult && guestWasCorrect !== null" class="guest-result-banner" :class="{ correct: guestWasCorrect, incorrect: !guestWasCorrect }">
          <span class="result-emoji">{{ guestWasCorrect ? '🎉' : '😔' }}</span>
          <span class="result-text">{{ guestWasCorrect ? '✓ Bonne réponse!' : '✗ Mauvaise réponse' }}</span>
        </div>
      </transition>
    </div>

    <!-- Partie terminée -->
    <div v-else-if="gameState === 'ended'" class="ended-state">
      <div class="ended-icon">🏁</div>
      <h2 class="ended-title">Partie terminée</h2>
      <div class="final-score">
        <p class="score-label">Votre score</p>
        <p class="score-value">{{ localScore.correct }} / {{ localScore.total }}</p>
        <p class="score-percentage">{{ scorePercentage }}%</p>
      </div>
      <button class="button is-primary is-large" @click="$emit('leave-room')">
        🚪 Quitter
      </button>
    </div>

    <!-- Hôte déconnecté -->
    <div v-else-if="gameState === 'host-disconnected'" class="disconnected-state">
      <div class="disconnected-icon">⚠️</div>
      <h2 class="disconnected-title">Hôte déconnecté</h2>
      <p class="disconnected-text">L'hôte a quitté la partie. La session est terminée.</p>
      <button class="button is-danger is-large" @click="$emit('leave-room')">
        🚪 Quitter
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import GameBoard from './GameBoard.vue'

const props = defineProps<{
  roomCode: string
  gameState: 'waiting' | 'playing' | 'ended' | 'host-disconnected'
  players: any[]
  currentVideo: any
  guestCorrectPlayer: string | null
  showResult: boolean
  celebratingPlayer: string | null
  susMode: boolean
}>()

const emit = defineEmits<{
  (e: 'guest-answer', data: { player: string }): void
  (e: 'leave-room'): void
}>()

const localScore = ref({ correct: 0, total: 0 })
const hasAnswered = ref(false)
const localShowResult = ref(false)
const guestWasCorrect = ref<boolean | null>(null)

const scorePercentage = computed(() => {
  if (localScore.value.total === 0) return 0
  return Math.round((localScore.value.correct / localScore.value.total) * 100)
})

function handleGuestAnswer(player: { username: string }) {
  if (localShowResult.value || hasAnswered.value) return
  hasAnswered.value = true
  localScore.value.total++

  if (props.guestCorrectPlayer) {
    const isCorrect = player.username === props.guestCorrectPlayer
    guestWasCorrect.value = isCorrect
    if (isCorrect) {
      localScore.value.correct++
    }
    // Fixer le joueur correct localement pour l'animation
    props.currentVideo.player = props.guestCorrectPlayer
    localShowResult.value = true
    setTimeout(() => {
      localShowResult.value = false
      // Nettoyer le joueur pour la prochaine question
      props.currentVideo.player = ''
      guestWasCorrect.value = null
    }, 3000)
  }

  emit('guest-answer', { player: player.username })
}

function handleGuestReveal(isSus: boolean) {
  // Rien à faire côté guest pour le reveal - c'est juste ignoré
  // L'hôte gère le reveal et renvoie les résultats
  console.log('[Guest] #sus clicked, waiting for host reveal')
}

// Exposer une méthode pour mettre à jour le score depuis le parent
defineExpose({
  incrementScore: () => {
    localScore.value.correct++
  },
  resetScore: () => {
    localScore.value = { correct: 0, total: 0 }
  },
  resetAnswered: () => {
    hasAnswered.value = false
    localShowResult.value = false
  }
})
</script>

<style scoped>
.guest-view {
  min-height: 70vh;
}


/* États d'attente */
.waiting-state, .ended-state, .disconnected-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255,255,255,0.9);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
}

.waiting-animation {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
}

.pulse-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid #667eea;
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.waiting-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.waiting-title, .ended-title, .disconnected-title {
  font-size: 2rem;
  font-weight: 800;
  color: #667eea;
  margin-bottom: 1rem;
}

.waiting-text, .disconnected-text {
  font-size: 1.2rem;
  color: #666;
}

/* Score final */
.ended-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.final-score {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 2rem;
  border-radius: 16px;
  margin: 2rem auto;
  max-width: 400px;
}

.score-label {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.score-value {
  font-size: 3rem;
  font-weight: 900;
  color: #667eea;
  margin: 0;
}

.score-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #764ba2;
  margin-top: 0.5rem;
}

/* État déconnecté */
.disconnected-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.disconnected-title {
  color: #f56565;
}

.check-icon {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.95rem;
  color: #6b7280;
  background: rgba(102, 126, 234, 0.08);
  border: 1px dashed rgba(102, 126, 234, 0.35);
  padding: 0.6rem 1rem;
  border-radius: 10px;
}


/* Animation de confirmation */
.answer-sent {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.8rem 1.2rem;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.12) 0%, rgba(72, 187, 120, 0.06) 100%);
  border: 1px solid rgba(72, 187, 120, 0.3);
  border-radius: 10px;
  color: #2d6a4f;
  font-weight: 600;
  animation: slideUp 0.4s ease-out;
}

.check-icon {
  font-size: 1.2rem;
  animation: checkBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes checkBounce {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.answer-text {
  font-weight: 700;
}

.waiting-text {
  font-size: 0.85rem;
  opacity: 0.8;
}

/* Banner de résultat personnalisé */
.guest-result-banner {
  margin-top: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 700;
  animation: slideDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.guest-result-banner.correct {
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.15) 0%, rgba(72, 187, 120, 0.08) 100%);
  border: 2px solid rgba(72, 187, 120, 0.4);
  color: #2d6a4f;
}

.guest-result-banner.incorrect {
  background: linear-gradient(135deg, rgba(245, 101, 101, 0.12) 0%, rgba(245, 101, 101, 0.06) 100%);
  border: 2px solid rgba(245, 101, 101, 0.3);
  color: #7f1d1d;
}

.result-emoji {
  font-size: 1.5rem;
  display: inline-block;
  animation: bounce 0.6s ease-in-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transitions Vue */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.result-fade-enter-active, .result-fade-leave-active {
  transition: all 0.4s ease;
}

.result-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.result-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
