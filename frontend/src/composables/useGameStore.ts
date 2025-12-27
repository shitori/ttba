import { computed, ref } from 'vue'
import { usePlayers } from './usePlayers'
import type { CurrentVideo } from './useGameLogic'

export function useGameStore() {
  // ======== FILE UPLOAD STATE ========
  const errorMessage = ref<string>('')
  const successMessage = ref<string>('')
  const submissionInfo = ref<Record<string, unknown> | null>(null)

  // ======== GAME STATE ========
  const isRunningGame = ref<boolean>(false)
  const currentVideo = ref<CurrentVideo>({
    id: '6718335390845095173',
    player: 'michel',
    isShared: false,
    sharedUser: '',
  })
  const showResultVideo = ref<boolean>(false)
  const gameScore = ref<{ correct: number; total: number }>({
    correct: 0,
    total: 0,
  })
  const celebratingPlayer = ref<string | null>(null)

  // ======== OPTIONS STATE ========
  const options = ref({
    tiktokOption: 'Like et partage',
    susMode: true,
    whitelist: [] as string[],
  })

  // ======== PLAYERS (from composable) ========
  const { players, addPlayer, removePlayer, clearAll } = usePlayers()

  // ======== COMPUTED ========
  const sharedUsersSorted = computed(() => {
    try {
      const sentAtList = players.value.flatMap((player: any) =>
        Array.isArray(player.sharedVideos)
          ? player.sharedVideos.map((sv: any) => sv.sentAt)
          : []
      )
      return Array.from(new Set(sentAtList)).sort()
    } catch (e) {
      return []
    }
  })

  // ======== ACTIONS ========
  function toggleWhitelistUser(name: string) {
    if (options.value.whitelist.includes(name)) {
      options.value.whitelist = options.value.whitelist.filter(
        (n) => n !== name
      )
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

  function clearError() {
    errorMessage.value = ''
  }

  function setError(message: string) {
    errorMessage.value = message
  }

  function setSubmissionInfo(info: Record<string, unknown> | null) {
    submissionInfo.value = info
  }

  function startGame() {
    isRunningGame.value = true
    showResultVideo.value = false
  }

  function endGame() {
    isRunningGame.value = false
    gameScore.value.correct = 0
    gameScore.value.total = 0
    players.value.forEach((player) => (player.susNumber = 0))
    showResultVideo.value = false
    celebratingPlayer.value = null
  }

  function setCurrentVideo(video: CurrentVideo) {
    currentVideo.value = video
  }

  function showResult() {
    showResultVideo.value = true
  }

  function hideResult() {
    showResultVideo.value = false
  }

  function incrementScore() {
    gameScore.value.correct++
  }

  function incrementTotal() {
    gameScore.value.total++
  }

  function setCelebratingPlayer(playerName: string | null) {
    celebratingPlayer.value = playerName
  }

  function addSusVote() {
    const player = players.value.find((p) => p.username === currentVideo.value.player)
    if (player) {
      player.susNumber += 1
    }
  }

  return {
    // State - UI
    errorMessage,
    successMessage,
    submissionInfo,

    // State - Game
    isRunningGame,
    currentVideo,
    showResultVideo,
    gameScore,
    celebratingPlayer,

    // State - Options
    options,

    // State - Players
    players,

    // Computed
    sharedUsersSorted,

    // Actions - UI
    clearError,
    setError,
    setSubmissionInfo,

    // Actions - Game
    startGame,
    endGame,
    setCurrentVideo,
    showResult,
    hideResult,
    incrementScore,
    incrementTotal,
    setCelebratingPlayer,
    addSusVote,

    // Actions - Options
    toggleWhitelistUser,
    isWhitelisted,
    toggleSusMode,

    // Actions - Players
    addPlayer,
    removePlayer,
    clearAll,
  }
}

