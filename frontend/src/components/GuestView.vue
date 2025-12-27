<template>
  <div class="guest-view">
    <div class="guest-header">
      <div class="room-info">
        <span class="room-label">Room:</span>
        <span class="room-code">{{ roomCode }}</span>
      </div>
      <div class="guest-info">
        <span class="guest-icon">👤</span>
        <span class="guest-name">{{ guestName }}</span>
        <span v-if="susMode" class="sus-badge" title="Sus mode actif">🛡️ Sus</span>
      </div>
    </div>

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
      />
      <div v-if="hasAnswered && !localShowResult" class="answer-sent">
        ✉️ Réponse envoyée — en attente de l'hôte...
      </div>
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
  guestName: string
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
    }, 3000)
  }

  emit('guest-answer', { player: player.username })
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

.guest-header {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.room-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.room-label {
  font-weight: 600;
  color: #666;
}

.room-code {
  font-weight: 800;
  color: var(--color-primary);
  background: rgba(102, 126, 234, 0.15);
  border-radius: var(--radius-sm);
  padding: 0.25rem 0.75rem;
}

.guest-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.8rem;
  background: var(--grad-success);
  color: #fff;
  border-radius: 20px;
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

.sus-badge {
  margin-left: 0.6rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.18);
  color: #b45309;
  font-weight: 800;
  font-size: 0.85rem;
}

.answer-sent {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.95rem;
  color: #6b7280;
  background: rgba(102, 126, 234, 0.08);
  border: 1px dashed rgba(102, 126, 234, 0.35);
  padding: 0.6rem 1rem;
  border-radius: 10px;
}
</style>
