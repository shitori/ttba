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

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}
