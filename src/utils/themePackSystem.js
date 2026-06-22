import { Storage } from './storage.js'
import { 
  getAllThemePacks, 
  getThemePack, 
  getDefaultPack, 
  getPackCards, 
  getPackRarityConfig,
  getPackStats,
  THEME_PACK_IDS
} from '../data/themePacks.js'

const STORAGE_KEY = 'cyber_divination_theme_pack_state'
const CURRENT_PACK_KEY = 'cyber_divination_current_pack'

const listeners = []

function getPackState() {
  return Storage.safeGet
    ? Storage.safeGet(STORAGE_KEY, { unlockedPacks: [THEME_PACK_IDS.CORE] })
    : (() => {
        try {
          const data = localStorage.getItem(STORAGE_KEY)
          return data ? JSON.parse(data) : { unlockedPacks: [THEME_PACK_IDS.CORE] }
        } catch (e) {
          return { unlockedPacks: [THEME_PACK_IDS.CORE] }
        }
      })()
}

function savePackState(state) {
  if (Storage.safeSet) {
    Storage.safeSet(STORAGE_KEY, state)
  } else {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.error('Failed to save pack state:', e)
    }
  }
}

export function getCurrentPackId() {
  try {
    const saved = localStorage.getItem(CURRENT_PACK_KEY)
    if (saved) {
      const pack = getThemePack(saved)
      if (pack && isPackUnlocked(saved)) {
        return saved
      }
    }
  } catch (e) {}
  return getDefaultPack().id
}

export function getCurrentPack() {
  return getThemePack(getCurrentPackId())
}

export function setCurrentPack(packId) {
  if (!isPackUnlocked(packId)) return false
  
  try {
    localStorage.setItem(CURRENT_PACK_KEY, packId)
    notifyListeners('packChanged', getThemePack(packId))
    return true
  } catch (e) {
    return false
  }
}

export function isPackUnlocked(packId) {
  const pack = getThemePack(packId)
  if (!pack) return false
  if (pack.unlocked) return true
  
  const state = getPackState()
  return state.unlockedPacks?.includes(packId) || false
}

export function unlockPack(packId) {
  if (isPackUnlocked(packId)) return false
  
  const state = getPackState()
  if (!state.unlockedPacks) {
    state.unlockedPacks = []
  }
  state.unlockedPacks.push(packId)
  savePackState(state)
  notifyListeners('packUnlocked', getThemePack(packId))
  return true
}

export function getUnlockedPacks() {
  return getAllThemePacks().filter(pack => isPackUnlocked(pack.id))
}

export function getCurrentPackCards() {
  return getPackCards(getCurrentPackId())
}

export function getCurrentPackRarityConfig() {
  return getPackRarityConfig(getCurrentPackId())
}

export function getCurrentPackStats() {
  return getPackStats(getCurrentPackId())
}

export function getPackCollectionStats(packId) {
  const packCards = getPackCards(packId)
  const collection = Storage.getCollection()
  
  let collectedCount = 0
  const byRarity = {}
  
  Object.keys(getPackRarityConfig(packId)).forEach(rarity => {
    byRarity[rarity] = { total: 0, collected: 0 }
  })
  
  packCards.forEach(card => {
    if (byRarity[card.rarity]) {
      byRarity[card.rarity].total++
    }
    if (collection[card.id]) {
      collectedCount++
      if (byRarity[card.rarity]) {
        byRarity[card.rarity].collected++
      }
    }
  })
  
  return {
    packId,
    totalCards: packCards.length,
    collectedCount,
    progressPercent: packCards.length > 0 ? Math.round((collectedCount / packCards.length) * 100) : 0,
    byRarity
  }
}

export function onThemePackEvent(callback) {
  listeners.push(callback)
  return () => {
    const idx = listeners.indexOf(callback)
    if (idx > -1) listeners.splice(idx, 1)
  }
}

function notifyListeners(eventType, data) {
  listeners.forEach(cb => {
    try {
      cb({ type: eventType, data })
    } catch (e) {
      console.error('Theme pack listener error:', e)
    }
  })
}

export function getAllPackStats() {
  return getAllThemePacks().map(pack => ({
    ...pack,
    stats: getPackStats(pack.id),
    collectionStats: getPackCollectionStats(pack.id),
    isUnlocked: isPackUnlocked(pack.id),
    isCurrent: getCurrentPackId() === pack.id
  }))
}

export { getPackCards, getPackRarityConfig, getPackStats, getAllThemePacks, getThemePack }
