<template>
  <div class="box has-shadow options-list">
    <div class="content has-text-centered mb-4 mb-5-tablet options-animated">
      <p class="subtitle is-5 is-size-6-mobile upload-title">⚙️ Options de jeu</p>
      <div class="columns is-mobile is-multiline is-centered">
        <div class="column is-12-mobile is-5-tablet">
          <label class="label">Options de TikToks</label>
          <div class="control">
            <div class="select is-fullwidth animated-select">
              <select v-model="localOptions.tiktokOption">
                <option>Like et partage</option>
                <option>Like</option>
                <option>Partage</option>
              </select>
            </div>
          </div>

          <label class="label mt-4">Activer le #sus mode</label>
          <div class="field">
            <button class="toggle-switch" :class="{ 'on': localOptions.susMode }" @click="onToggleSus"
                    @keydown.space.prevent="onToggleSus" @keydown.enter.prevent="onToggleSus"
                    type="button" :aria-pressed="localOptions.susMode" aria-label="Activer le mode sus">
              <span class="switch-track"></span>
              <span class="switch-thumb"></span>
            </button>
            <span class="ml-3 hint">{{ localOptions.susMode ? 'Activé' : 'Désactivé' }}</span>
          </div>

        </div>

        <div class="column is-12-mobile is-7-tablet" v-show="localOptions.tiktokOption !== 'Like'">
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
          <p class="is-size-7 mt-2 has-text-grey">La whitelist permet de prioriser/filtrer les vidéos issues de ces utilisateurs.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  options: { tiktokOption: string; susMode: boolean; whitelist: string[] }
  sharedUsersSorted: string[]
  toggleWhitelistUser: (name: string) => void
  isWhitelisted: (name: string) => boolean
  toggleSusMode: () => void
}>()

// Local proxy pour supporter v-model sur select et reflet immédiat
const localOptions = reactive({ ...props.options })

watch(() => localOptions.tiktokOption, (val) => {
  props.options.tiktokOption = val
})
watch(() => localOptions.susMode, (val) => {
  props.options.susMode = val
})

function onToggleSus() {
  props.toggleSusMode()
  localOptions.susMode = props.options.susMode
}
</script>

<style scoped>
.options-list {
  max-height: 350px;
  overflow-y: auto;
  background: var(--color-surface);
  color: var(--color-text);
}

.upload-title {
  color: var(--color-primary);
  font-weight: 700;
}

.label {
  color: var(--color-text);
  font-weight: 600;
}

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
  background-color: var(--color-input-bg);
  color: var(--color-text);
  border-color: var(--color-input-border);
}
.animated-select select:focus {
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.18);
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.toggle-switch {
  display: inline-block;
  width: 54px;
  height: 28px;
  position: relative;
  cursor: pointer;
  user-select: none;
  border: none;
  background: transparent;
}
.toggle-switch .switch-track {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--color-muted);
  opacity: 0.3;
  transition: background 0.25s ease, opacity 0.25s ease;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
.toggle-switch.on .switch-track {
  background: var(--grad-success);
  opacity: 1;
}
.toggle-switch.on .switch-thumb {
  transform: translateX(26px);
}

.hint {
  color: var(--color-muted);
  font-weight: 600;
}

.whitelist-list {
  background: var(--color-card-bg);
  padding: 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.whitelist-list .whitelist-tag {
  margin: 4px;
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
}

.inline-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.inline-checkbox .tag-label {
  margin-left: 6px;
  font-weight: 700;
  color: var(--color-text);
}

.has-text-grey {
  color: var(--color-muted) !important;
}
</style>
