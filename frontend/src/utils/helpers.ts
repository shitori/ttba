// utils/formatters.ts

/**
 * Formate un objet pour affichage
 */
export const formatObject = (obj: unknown): string => {
  if (obj === undefined || obj === null) {
    return '(vide)'
  }
  if (typeof obj === 'string') {
    return obj
  }
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}


export const getRandomInt =(max:number) =>{
  return Math.floor(Math.random() * max);
}

// sleep utilitaire supprimé car non utilisé

/**
 * Extrait un ID TikTok depuis divers formats d'URL/texte.
 * Gère notamment:
 *  - https://www.tiktok.com/@user/video/123...
 *  - https://www.tiktok.com/video/123...
 *  - https://www.tiktok.com/v/123...
 *  - https://www.tiktokv.com/share/video/123...
 *  - et fallback: toute suite de >= 9 chiffres dans le texte
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const extractTikTokId = (link: unknown): string | null => {
  if (typeof link !== 'string') return null
  const str = link.trim()
  if (!str) return null

  // Essayer via URL si possible
  try {
    const u = new URL(str)
    const p = u.pathname

    // Patterns courants
    let m = p.match(/\/[@][^/]+\/video\/(\d+)/)
    if (m && m[1]) return m[1]

    m = p.match(/\/video\/(\d+)/)
    if (m && m[1]) return m[1]

    m = p.match(/\/v\/(\d+)/)
    if (m && m[1]) return m[1]

    m = p.match(/\/share\/video\/(\d+)/)
    if (m && m[1]) return m[1]
  } catch {
    // ignore si ce n'est pas une URL absolue, on tentera en regex libre
  }

  // Tentative regex libre dans la chaîne
  let m = str.match(/(?:\/[@][^/]+\/video\/|\/video\/|\/v\/|\/share\/video\/)(\d{6,})/)
  if (m && m[1]) return m[1]

  // Fallback: toute longue suite de chiffres (>=9)
  m = str.match(/(\d{9,})/)
  if (m && m[1]) return m[1]

  return null
}

/**
 * Détecte si un texte contient un lien TikTok (formats courants)
 */
export const isTikTokShare = (text: unknown): boolean => {
  if (typeof text !== 'string') return false
  return /tiktok\.com|tiktokv\.com|vm\.tiktok\.com/.test(text)
}
