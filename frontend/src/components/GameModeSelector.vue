<template>
  <div class="box game-mode-selector">
    <h2 class="title is-4 has-text-centered mb-5">🎮 Mode de jeu</h2>

    <div class="modes-container">
      <!-- Mode Solo / Hôte -->
      <div class="mode-card" @click="$emit('select-mode', 'host')">
        <div class="mode-icon">🎯</div>
        <h3 class="mode-title">Créer une partie</h3>
        <p class="mode-description">
          Vous serez l'hôte et contrôlerez le déroulement du jeu.
          D'autres joueurs pourront rejoindre votre partie.
        </p>
        <div class="mode-badge">Hôte</div>
      </div>

      <!-- Mode Invité -->
      <div class="mode-card" @click="showJoinModal = true">
        <div class="mode-icon">🎲</div>
        <h3 class="mode-title">Rejoindre une partie</h3>
        <p class="mode-description">
          Rejoignez une partie existante avec un code de room.
          Jouez en synchronisation avec l'hôte.
        </p>
        <div class="mode-badge guest">Invité</div>
      </div>
    </div>

    <!-- Modal pour rejoindre une partie -->
    <div class="modal" :class="{ 'is-active': showJoinModal }">
      <div class="modal-background" @click="showJoinModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">🎲 Rejoindre une partie</p>
          <button class="delete" @click="showJoinModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Code de la room</label>
            <div class="control">
              <input
                class="input is-large"
                type="text"
                v-model="roomCode"
                placeholder="Ex: ABCD1234"
                @keyup.enter="joinRoom"
                maxlength="12"
              />
            </div>
            <p class="help">Entrez le code de la room fourni par l'hôte</p>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success is-fullwidth" @click="joinRoom" :disabled="!canJoin">
            ✅ Rejoindre
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'select-mode', mode: 'host' | 'guest', data?: { roomCode: string }): void
}>()

const showJoinModal = ref(false)
const roomCode = ref('')

const canJoin = computed(() => {
  return roomCode.value.trim().length >= 4
})

function joinRoom() {
  if (!canJoin.value) return

  emit('select-mode', 'guest', {
    roomCode: roomCode.value.trim().toUpperCase()
  })

  showJoinModal.value = false
}
</script>

<style scoped>
.game-mode-selector {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
}

@media screen and (max-width: 768px) {
  .game-mode-selector {
    padding: 1rem;
    margin: 0;
  }
}

.modes-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

@media screen and (max-width: 768px) {
  .modes-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.mode-card {
  background: var(--color-card-bg);
  border: 3px solid transparent;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

@media screen and (max-width: 768px) {
  .mode-card {
    padding: 1.5rem;
  }
}

.mode-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--grad-primary);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.mode-card:hover {
  transform: translateY(-8px);
  border-color: var(--color-primary);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.3);
}

.mode-card:hover::before {
  transform: scaleX(1);
}

.mode-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.mode-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.mode-description {
  color: var(--color-muted);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.mode-badge {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: var(--grad-primary);
  color: white;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
}

.mode-badge.guest {
  background: var(--grad-success);
}

.modal-card {
  max-width: 500px;
  margin: 0 auto;
}

@media screen and (max-width: 768px) {
  .modal-card {
    margin: 0 1rem;
    max-width: calc(100% - 2rem);
  }
}

.modal-card-head {
  background: var(--grad-primary);
  color: white;
  border-bottom: 1px solid var(--color-border);
}

.modal-card-title {
  color: white;
}

.modal-card-body {
  background: var(--color-surface);
}

.input.is-large {
  font-size: 1.5rem;
  text-align: center;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  background-color: var(--color-input-bg);
  color: var(--color-text);
  border-color: var(--color-input-border);
}

.modal-card-foot {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 1.5rem;
}

@media (prefers-color-scheme: light) {
  .mode-card {
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  }
}
</style>

