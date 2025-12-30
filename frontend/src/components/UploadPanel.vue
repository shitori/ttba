<template>
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
            @change="$emit('upload', $event)"
            ref="fileInputRef"
            :disabled="isProcessing"
        >
        <span class="file-cta upload-cta">
          <span class="file-icon" aria-hidden="true">📤</span>
          <span class="file-label">Choisir un fichier ou plusieurs fichiers ...</span>
        </span>
        <span class="file-name" v-if="fileName">{{ fileName }}</span>
      </label>
    </div>

    <!-- Loading Progress -->
    <div v-if="isProcessing" class="mt-5 loading-section">
      <progress class="progress is-primary progress-bar" :value="progress" max="100"></progress>
      <p class="has-text-centered mt-3 loading-text">⏳ Traitement du fichier... {{ progress }}%</p>
    </div>

    <!-- Results Section -->
    <div v-if="submissionInfo && !isProcessing" class="mt-5">
      <div class="box has-background-success-light success-box">
        <p class="has-text-weight-bold mb-3 success-message">✅ {{ submissionInfo.status }}</p>
        <p class="has-text-grey is-size-7 mt-2">Total d'objets sauvegardés: <strong>{{ submissionInfo.totalResults }}</strong></p>
      </div>
    </div>

    <!-- Error Messages -->
    <div class="notification is-danger error-notification mt-4" v-if="errorMessage" role="status">
      <button class="delete" @click="$emit('clear-error')"></button>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isProcessing: boolean
  progress: number
  fileName: string | null
  submissionInfo: Record<string, unknown> | null
  errorMessage: string
}>()

defineEmits<{
  (e: 'upload', event: Event): void
  (e: 'clear-error'): void
}>()
</script>

<style scoped>
.upload-box {
  position: relative;
  overflow: hidden;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: var(--space-5);
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
  color: var(--color-primary);
  font-size: 1.2rem !important;
}

.upload-file {
  transition: all 0.3s ease;
  border: 2px dashed var(--color-primary);
  background: var(--color-card-bg);
}
.upload-file:hover {
  border-color: var(--color-secondary);
  background: rgba(102, 126, 234, 0.08);
  transform: scale(1.01);
}

.file-cta {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  transition: all 0.3s ease;
}
.file-cta:hover {
  background-color: var(--color-secondary);
  border-color: var(--color-secondary);
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.file-input:focus + .file-cta {
  border-color: var(--color-primary);
  box-shadow: 0 0 0.5em rgba(102, 126, 234, 0.25);
}

.file-input:disabled + .file-cta {
  background-color: var(--color-muted);
  border-color: var(--color-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

.loading-section {
  animation: fadeInUp 0.5s ease;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.progress-bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(102,126,234,0.15);
  overflow: hidden;
}

.loading-text {
  font-weight: 600;
  color: var(--color-primary);
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.success-box {
  background-color: rgba(72, 187, 120, 0.15) !important;
  border: 1px solid rgba(72, 187, 120, 0.3);
  border-radius: var(--radius-sm);
  color: var(--color-text);
}

.success-message {
  color: var(--color-accent);
}

.error-notification {
  border-radius: var(--radius-sm);
  animation: shake 0.3s ease-in-out;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.success-box {
  border-left: 5px solid #48bb78 !important;
  animation: slideInRight 0.5s ease;
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.error-notification {
  animation: shake 0.5s ease;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
</style>
