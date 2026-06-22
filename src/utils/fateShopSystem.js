import { writable, derived } from 'svelte/store'
import { Storage } from './storage.js'
import { availableAchievementPoints, refreshAchievements } from './achievementSystem.js'
import { SHOP_ITEMS, getShopItemById, SHOP_ITEM_TYPE, SHOP_ITEM_RARITY } from '../data/fateShop.js'

const ownedItemsStore = writable({})
const purchaseHistoryStore = writable([])
const equippedItemsStore = writable({
  [SHOP_ITEM_TYPE.SKIN]: null,
  [SHOP_ITEM_TYPE.CARD_BACK]: null,
  [SHOP_ITEM_TYPE.ANIMATION]: null,
  [SHOP_ITEM_TYPE.CARD_BORDER]: null,
  [SHOP_ITEM_TYPE.SPECIAL_TITLE]: null
})

let initialized = false
let pointsUnsubscribe = null
let currentPoints = 0

function init() {
  if (initialized) return
  initialized = true

  const owned = Storage.getOwnedShopItems()
  ownedItemsStore.set(owned)

  const history = Storage.getShopPurchaseHistory()
  purchaseHistoryStore.set(history)

  const equipped = Storage.getEquippedShopItems()
  equippedItemsStore.set(equipped)

  pointsUnsubscribe = availableAchievementPoints.subscribe(p => {
    currentPoints = p
  })
}

export const ownedShopItems = {
  subscribe: (run) => {
    init()
    return ownedItemsStore.subscribe(run)
  }
}

export const shopPurchaseHistory = {
  subscribe: (run) => {
    init()
    return purchaseHistoryStore.subscribe(run)
  }
}

export const equippedShopItems = {
  subscribe: (run) => {
    init()
    return equippedItemsStore.subscribe(run)
  }
}

export const shopStats = derived(
  [ownedItemsStore, purchaseHistoryStore],
  ([$owned, $history]) => {
    const ownedIds = Object.keys($owned)
    const ownedByType = {}
    const totalSpent = $history.reduce((sum, item) => sum + item.price, 0)

    Object.values(SHOP_ITEM_TYPE).forEach(type => {
      ownedByType[type] = SHOP_ITEMS.filter(
        item => item.type === type && ownedIds.includes(item.id)
      ).length
    })

    const totalByType = {}
    Object.values(SHOP_ITEM_TYPE).forEach(type => {
      totalByType[type] = SHOP_ITEMS.filter(item => item.type === type).length
    })

    return {
      ownedCount: ownedIds.length,
      totalCount: SHOP_ITEMS.length,
      totalSpent,
      ownedByType,
      totalByType,
      percent: SHOP_ITEMS.length > 0
        ? Math.round((ownedIds.length / SHOP_ITEMS.length) * 100)
        : 0
    }
  }
)

export function ownsItem(itemId) {
  let owned
  ownedItemsStore.subscribe(v => { owned = v })()
  return !!owned[itemId]
}

export function isItemEquipped(itemId) {
  const item = getShopItemById(itemId)
  if (!item) return false

  let equipped
  equippedItemsStore.subscribe(v => { equipped = v })()
  return equipped[item.type] === itemId
}

export function getEquippedItem(type) {
  let equipped
  equippedItemsStore.subscribe(v => { equipped = v })()
  return equipped[type] || null
}

export function canAfford(item) {
  if (!item) return false
  return currentPoints >= item.price
}

export function purchaseItem(itemId) {
  init()

  const item = getShopItemById(itemId)
  if (!item) {
    return { success: false, message: '商品不存在' }
  }

  if (ownsItem(itemId)) {
    return { success: false, message: '你已经拥有这个商品了' }
  }

  if (!canAfford(item)) {
    return { success: false, message: '成就点数不足' }
  }

  const success = Storage.spendAchievementPoints(item.price)
  if (!success) {
    return { success: false, message: '扣除点数失败' }
  }

  Storage.addOwnedShopItem(itemId)
  Storage.addShopPurchaseRecord({
    itemId,
    price: item.price,
    purchasedAt: Date.now()
  })

  const updatedOwned = Storage.getOwnedShopItems()
  ownedItemsStore.set(updatedOwned)

  const updatedHistory = Storage.getShopPurchaseHistory()
  purchaseHistoryStore.set(updatedHistory)

  refreshAchievements()

  return {
    success: true,
    message: `成功兑换 ${item.name}！`,
    item
  }
}

export function equipItem(itemId) {
  init()

  const item = getShopItemById(itemId)
  if (!item) {
    return { success: false, message: '商品不存在' }
  }

  if (!ownsItem(itemId)) {
    return { success: false, message: '你还没有拥有这个商品' }
  }

  if (item.type === SHOP_ITEM_TYPE.DIVINATION_ACCESS) {
    return { success: false, message: '占卜权限无需装备，购买后自动生效' }
  }

  Storage.equipShopItem(item.type, itemId)

  const updatedEquipped = Storage.getEquippedShopItems()
  equippedItemsStore.set(updatedEquipped)

  return {
    success: true,
    message: `已装备 ${item.name}`,
    item
  }
}

export function unequipItem(type) {
  init()

  Storage.unequipShopItem(type)

  const updatedEquipped = Storage.getEquippedShopItems()
  equippedItemsStore.set(updatedEquipped)

  return { success: true }
}

export function hasDivinationAccess(accessId) {
  return ownsItem(accessId)
}

export function getAvailableDivinationTypes() {
  let owned
  ownedItemsStore.subscribe(v => { owned = v })()

  return SHOP_ITEMS
    .filter(item =>
      item.type === SHOP_ITEM_TYPE.DIVINATION_ACCESS &&
      owned[item.id]
    )
    .map(item => item.id)
}

export function getOwnedItemsByType(type) {
  let owned
  ownedItemsStore.subscribe(v => { owned = v })()

  return SHOP_ITEMS.filter(
    item => item.type === type && owned[item.id]
  )
}

export function getEquippedItemData(type) {
  init()
  const itemId = getEquippedItem(type)
  if (!itemId) return null
  return getShopItemById(itemId)
}

export function getCurrentSkin() {
  return getEquippedItemData(SHOP_ITEM_TYPE.SKIN)
}

export function getCurrentCardBack() {
  return getEquippedItemData(SHOP_ITEM_TYPE.CARD_BACK)
}

export function getCurrentAnimation() {
  return getEquippedItemData(SHOP_ITEM_TYPE.ANIMATION)
}

export function getCurrentBorder() {
  return getEquippedItemData(SHOP_ITEM_TYPE.CARD_BORDER)
}

export function getCurrentTitle() {
  return getEquippedItemData(SHOP_ITEM_TYPE.SPECIAL_TITLE)
}

export function getSkinColor() {
  const skin = getCurrentSkin()
  return skin?.preview?.color || null
}

export function getCardBackColor() {
  const cardBack = getCurrentCardBack()
  return cardBack?.preview?.color || null
}

export function getBorderColor() {
  const border = getCurrentBorder()
  return border?.preview?.color || null
}

export function hasSkin() {
  return !!getCurrentSkin()
}

export function hasCardBack() {
  return !!getCurrentCardBack()
}

export function hasAnimation() {
  return !!getCurrentAnimation()
}

export function hasBorder() {
  return !!getCurrentBorder()
}

export function refreshShopData() {
  init()
  const owned = Storage.getOwnedShopItems()
  ownedItemsStore.set(owned)

  const history = Storage.getShopPurchaseHistory()
  purchaseHistoryStore.set(history)

  const equipped = Storage.getEquippedShopItems()
  equippedItemsStore.set(equipped)
}

export function cleanup() {
  if (pointsUnsubscribe) {
    pointsUnsubscribe()
    pointsUnsubscribe = null
  }
  initialized = false
}
