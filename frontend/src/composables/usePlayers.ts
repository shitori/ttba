// composables/useResults.ts
import { ref, computed } from 'vue'

export interface Player {
  username: string
  likedVideos: string[]
  sharedVideos: Array<{ video:string, sentAt: string }>
  susNumber: number
}

const STORAGE_KEY = 'ttbaPlayer'

export const usePlayers = () => {
  const players = ref<Player[]>([])

  // Charger les résultats sauvegardés
  const loadPlayer = (): void => {
    try {
      // Disabled: localStorage causes quota exceeded errors
      // const saved = localStorage.getItem(STORAGE_KEY)
      // if (saved) {
      //   players.value = JSON.parse(saved)
      // }
      console.log('✅ Player storage initialized (in-memory only)')
    } catch (error) {
      console.error('Erreur chargement résultats:', error)
    }
  }

  // Sauvegarder les résultats
  const savePlayer = (): void => {
    try {
      // Disabled: localStorage causes quota exceeded errors
      // localStorage.setItem(STORAGE_KEY, JSON.stringify(players.value))
      console.log('📝 Player saved to memory (localStorage disabled to avoid quota issues)')
    } catch (error) {
      console.error('⚠️ Error saving player:', error)
    }
  }

  // Ajouter un résultat
  const addPlayer = (item: Player): void => {
    players.value.push(item)
    savePlayer()
  }

  // Supprimer un résultat
  const removePlayer = (index: number): void => {
    players.value.splice(index, 1)
    savePlayer()
  }

  // Vider tous les résultats
  const clearAll = (): void => {
    players.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  // Télécharger en JSON
  const downloadAsJSON = (): void => {
    const json = JSON.stringify(players.value, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ttba-players-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Computed: Nombre de résultats
  const count = computed(() => players.value.length)

  // Charger au montage
  loadPlayer()

  return {
    players,
    count,
    addPlayer,
    removePlayer,
    clearAll,
    downloadAsJSON,
    loadPlayer,
    savePlayer
  }
}

