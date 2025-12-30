<template>
  <div class="box has-shadow data-box">
    <div class="content has-text-centered mb-4 mb-5-tablet">
      <p class="subtitle is-5 is-size-6-mobile data-title">📊 Joueurs sauvegardées ({{ players.length }})</p>
    </div>

    <div v-if="players.length === 0" class="content has-text-centered empty-state">
      <p class="has-text-grey empty-text">🎭 Aucune donnée pour le moment</p>
      <p class="has-text-grey is-size-7">Chargez des fichiers JSON pour commencer la partie</p>
    </div>

    <div v-else class="content results-list">
      <div v-for="(item, index) in players" :key="item.username || index"
           class="box mb-3 user-card player-card">
        <div class="card-header">
          <p class="has-text-weight-bold mb-2 card-number is-size-6-mobile">👤 Joueur #{{ index + 1 }}</p>
        </div>

        <div class="card-body">
          <div class="mb-3 player-info">
            <p class="user-info-text is-size-7-mobile">
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
            <summary class="details-summary is-size-7-mobile">📝 Voir détails</summary>
            <pre class="details-content">{{ formatObject(item) }}</pre>
          </details>

          <button class="button is-small is-danger is-outlined delete-btn" @click="$emit('remove', index)">
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>

    <div v-if="players.length > 0" class="mt-4">
      <button class="button is-fullwidth is-warning clear-all-btn" @click="$emit('clear')">
        🔄 Vider tout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {Player} from '@/composables/usePlayers'
import {formatObject} from '@/utils/helpers'

defineProps<{ players: Player[] }>()

defineEmits<{ (e: 'remove', index: number): void; (e: 'clear'): void }>()
</script>

<style scoped>
.data-box {
  position: relative;
  background: var(--color-surface);
  color: var(--color-text);
}

.data-title {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 1.2rem !important;
  background: var(--grad-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.results-list {
  max-height: 400px;
  overflow-y: auto;
}

@media screen and (max-width: 768px) {
  .results-list {
    max-height: 300px;
  }
}

.empty-state {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

@media screen and (max-width: 768px) {
  .empty-state {
    padding: 1.5rem;
  }
}

.empty-text {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--color-muted);
}

.has-text-grey {
  color: var(--color-muted) !important;
}

.player-card {
  background: var(--color-card-bg) !important;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.player-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: var(--grad-primary);
  transition: width 0.3s ease;
}

.player-card:hover {
  transform: translateY(-8px) translateX(4px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.3);
  border-color: var(--color-primary);
}

.player-card:hover::before {
  width: 8px;
}

.card-header {
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-border);
}

.card-number {
  color: var(--color-primary);
  font-size: 1.1rem;
}

.card-body {
  padding-top: 0.75rem;
}

.player-info {
  background: var(--color-input-bg);
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid var(--color-border);
}

.player-card:hover .player-info {
  background: rgba(102, 126, 234, 0.08);
}

.user-info-text {
  color: var(--color-text);
}

.username-value {
  color: var(--color-secondary);
  font-weight: 700;
  font-size: 1.05rem;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.stat-box {
  background: var(--color-input-bg);
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  border: 2px solid var(--color-border);
  transition: all 0.3s ease;
}

.player-card:hover .stat-box {
  border-color: var(--color-primary);
  background: rgba(102, 126, 234, 0.08);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0.25rem 0 0 0;
  font-weight: 600;
}

.details-box {
  background: var(--color-input-bg);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.details-summary {
  color: var(--color-text);
  cursor: pointer;
  font-weight: 600;
}

.details-content {
  color: var(--color-text);
  background: var(--color-bg);
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  overflow-x: auto;
}

.delete-btn {
  background: var(--color-surface) !important;
  border: 2px solid var(--color-danger) !important;
  color: var(--color-danger) !important;
  font-weight: 700;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: var(--color-danger) !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(245, 101, 101, 0.4);
}

.clear-all-btn {
  background: var(--grad-warning) !important;
  border: none;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: #1a202c !important;
}

.clear-all-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(237, 137, 54, 0.5);
}

@media (prefers-color-scheme: light) {
  .player-card {
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%) !important;
  }

  .player-info, .stat-box, .details-box {
    background: white;
  }
}
</style>
