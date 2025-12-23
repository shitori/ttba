// composables/useExtraction.ts
import { computed, Ref } from 'vue'

export const EXTRACTION_PATHS = {
  CHAT_HISTORY: '"Direct Message"."Direct Messages".ChatHistory',
  USERNAME: 'Profile."Profile Info".ProfileMap.userName',
  LIKED_VIDEOS: '"Your Activity"."Like List".ItemFavoriteList'
} as const

interface ExtractedData {
  [EXTRACTION_PATHS.CHAT_HISTORY]?: any
  [EXTRACTION_PATHS.USERNAME]?: any
  [EXTRACTION_PATHS.LIKED_VIDEOS]?: any
}

/**
 * Parse un chemin JSON avec guillemets et points imbriqués
 * Ex: "Direct Message"."Direct Messages".ChatHistory
 */
const parseNestedPath = (path: string): string[] => {
  const parts: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < path.length; i++) {
    const char = path[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === '.' && !inQuotes) {
      if (current.trim()) {
        parts.push(current.trim().replace(/^"|"$/g, ''))
      }
      current = ''
    } else {
      current += char
    }
  }

  if (current.trim()) {
    parts.push(current.trim().replace(/^"|"$/g, ''))
  }

  return parts
}

/**
 * Récupère une valeur profondément imbriquée dans un objet
 */
const getValueByPath = <T = any>(obj: any, path: string): T | undefined => {
  const parts = parseNestedPath(path)
  let value = obj

  for (const part of parts) {
    if (value === null || value === undefined) return undefined
    value = value[part]
  }

  return value as T
}

export const useExtraction = (rawFileData: Ref<any[] | null>) => {
  /**
   * Extrait les données filtrées selon les chemins prédéfinis
   */
  const getFilteredData = () => {
    if (!rawFileData.value) return []

    return rawFileData.value.map(item => {
      const filtered: Record<string, unknown> = {}

      Object.values(EXTRACTION_PATHS).forEach(path => {
        const value = getValueByPath(item, path)
        if (value !== undefined) {
          filtered[path] = value
        }
      })

      return filtered
    })
  }

  /**
   * Crée un objet résultat avec clés simplifiées
   */
  const createResultObject = (firstItem: any) => {
    return {
      username: getValueByPath(firstItem, EXTRACTION_PATHS.USERNAME) || null,
      chatHistory: getValueByPath(firstItem, EXTRACTION_PATHS.CHAT_HISTORY) || [],
      likedVideos: getValueByPath(firstItem, EXTRACTION_PATHS.LIKED_VIDEOS) || []
    }
  }

  /**
   * Extrait les objets bruts depuis les données filtrées
   */
  const extractRawObjects = () => {
    const filtered = getFilteredData()
    if (filtered.length === 0) return {}

    const extracted: ExtractedData = {}
    Object.values(EXTRACTION_PATHS).forEach(path => {
      if (filtered[0] && path in filtered[0]) {
        extracted[path as keyof ExtractedData] = filtered[0][path]
      }
    })

    return extracted
  }

  const filteredData = computed(() => getFilteredData())

  return {
    EXTRACTION_PATHS,
    getFilteredData,
    createResultObject,
    extractRawObjects,
    filteredData,
    parseNestedPath,
    getValueByPath
  }
}

