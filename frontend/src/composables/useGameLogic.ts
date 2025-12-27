import type { Ref } from 'vue'
import type { Player } from './usePlayers'
import { extractTikTokId, getRandomInt } from '@/utils/helpers'

export interface CurrentVideo {
  id: string
  player: string
  isShared: boolean
  sharedUser: string
  url?: string // URL complète de la vidéo (optionnelle)
}

export function useGameLogic(players: Ref<Player[]>, options: Ref<{ tiktokOption: string; whitelist: string[] }>) {
  function getRandomLikedVideoFromPlayer(player: Player): CurrentVideo | null {
    if (Array.isArray(player.likedVideos) && player.likedVideos.length > 0) {
      const link = player.likedVideos[getRandomInt(player.likedVideos.length)]
      const id = extractTikTokId(link)
      if (id) return {
        id,
        player: player.username,
        isShared: false,
        sharedUser: '',
        url: `https://www.tiktok.com/v/${id}`
      }
    }
    return null
  }

  function getRandomSharedVideoFromPlayer(player: Player): CurrentVideo | null {
    if (Array.isArray(player.sharedVideos) && player.sharedVideos.length > 0) {
      const whitelisted = options.value.whitelist.length > 0
        ? player.sharedVideos.filter(sv => options.value.whitelist.includes(sv.sentAt))
        : player.sharedVideos
      if (whitelisted.length === 0) return null
      const sharedVideo = whitelisted[getRandomInt(whitelisted.length)]
      const id = extractTikTokId(sharedVideo.video)
      if (id) return {
        id,
        player: player.username,
        isShared: true,
        sharedUser: sharedVideo.sentAt,
        url: `https://www.tiktok.com/v/${id}`
      }
    }
    return null
  }

  function getRandomVideoFromPlayers(): CurrentVideo | null {
    if (!Array.isArray(players.value) || players.value.length === 0) return null

    const maxAttempts = Math.max(6, players.value.length * 3)
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const indexPlayer = getRandomInt(players.value.length)
      const player = players.value[indexPlayer]
      if (!player) continue

      const pickType = (() => {
        if (options.value.tiktokOption === 'Like') return 'like'
        if (options.value.tiktokOption === 'Partage') return 'share'
        return Math.random() < 0.5 ? 'like' : 'share'
      })()

      let candidate: CurrentVideo | null = null
      if (pickType === 'like') candidate = getRandomLikedVideoFromPlayer(player)
      else candidate = getRandomSharedVideoFromPlayer(player)

      if (candidate) return candidate
    }

    return null
  }

  return {
    getRandomVideoFromPlayers,
  }
}

