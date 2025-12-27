<template>
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

.results-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 12px;
}

.empty-text {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.player-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%) !important;
  border: 2px solid transparent;
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
</style>
