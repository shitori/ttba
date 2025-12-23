// composables/useFileHandling.ts
import {ref} from 'vue'

export interface FileState {
  fileName: string
  isProcessing: boolean
  progress: number
  fileSize: string
  totalItems: string
}

/**
 * Validate que le fichier est au bon format
 */
const isValidJsonFile = (file: File): boolean => {
  return file.name.endsWith('.json')
}

/**
 * Valide que tous les fichiers sont au format JSON
 */
const validateFiles = (files: FileList): boolean => {
  return Array.from(files).every(isValidJsonFile)
}

/**
 * Lit un fichier en tant que texte avec progression
 */
const readFileAsText = (file: File, onProgress?: (percent: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onprogress = (e: ProgressEvent<FileReader>) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100)
        onProgress(percent)
      }
    }

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Impossible de lire le fichier'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'))
    }

    reader.readAsText(file)
  })
}

/**
 * Parse un fichier JSON
 */
const parseJsonFile = (content: string) => {
  try {
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`JSON invalide: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

/**
 * Détecte le format des données (array, object, etc.)
 */
const detectDataFormat = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data
  }

  if (data && typeof data === 'object') {
    // Chercher une propriété qui contient un tableau
    const arrayProp = Object.entries(data).find(([_, v]) => Array.isArray(v))
    if (arrayProp) {
      return arrayProp[1] as any[]
    }

    // Sinon, envelopper l'objet dans un tableau
    return [data]
  }

  throw new Error('Format de données non reconnu')
}

export const useFileHandling = () => {
  const fileState = ref<FileState>({
    fileName: '',
    isProcessing: false,
    progress: 0,
    fileSize: '0 MB',
    totalItems: '0'
  })

  const fileInput = ref<HTMLInputElement | null>(null)

  /**
   * Traite un fichier complètement
   */
  const processFile = async (file: File): Promise<{
    data: any[]
    stats: Partial<FileState>
    fileName: string
  }> => {
    fileState.value.fileName = file.name
    fileState.value.isProcessing = true
    fileState.value.progress = 0

    try {
      // Lire le fichier
      const content = await readFileAsText(file, (percent) => {
        fileState.value.progress = percent
      })

      // Parser JSON
      const parsed = parseJsonFile(content)

      // Détecter le format
      const data = detectDataFormat(parsed)

      // Calculer les stats
      const fileSize = (file.size / (1024 * 1024)).toFixed(2)
      const stats = {
        fileName: file.name,
        fileSize: `${fileSize} MB`,
        totalItems: data.length.toString()
      }

      fileState.value.progress = 100

      return {
        data,
        stats,
        fileName: file.name
      }
    } finally {
      fileState.value.isProcessing = false
    }
  }

  /**
   * Traite plusieurs fichiers
   */
  const processFiles = async (
    files: FileList,
    onEachFile?: (file: File, data: any[], index: number) => Promise<void>
  ): Promise<void> => {
    // Valider d'abord tous les fichiers
    if (!validateFiles(files)) {
      throw new Error('Tous les fichiers doivent être au format JSON')
    }

    const fileArray = Array.from(files)

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]

      try {
        const result = await processFile(file)
        if (onEachFile) {
          await onEachFile(file, result.data, i)
        }

        // Attendre avant le prochain fichier
        if (i < fileArray.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error(`Erreur fichier ${file.name}:`, error)
        // Continuer avec les fichiers suivants
      }
    }

    // Réinitialiser
    clearFile()
  }

  /**
   * Efface l'état du fichier
   */
  const clearFile = (): void => {
    fileState.value = {
      fileName: '',
      isProcessing: false,
      progress: 0,
      fileSize: '0 MB',
      totalItems: '0'
    }

    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  return {
    fileState,
    fileInput,
    processFile,
    processFiles,
    clearFile,
    validateFiles,
    readFileAsText,
    parseJsonFile,
    detectDataFormat
  }
}

