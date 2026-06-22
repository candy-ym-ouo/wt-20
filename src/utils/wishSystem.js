import { Storage } from './storage.js'
import { getCardById } from './cardSystem.js'

export const WISH_STATUS = {
  ACTIVE: 'active',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
}

export const WISH_CATEGORIES = [
  { id: 'career', name: '事业工作', icon: '💼', color: 'var(--accent-cyan)' },
  { id: 'love', name: '感情关系', icon: '💕', color: 'var(--accent-magenta)' },
  { id: 'wealth', name: '财富金钱', icon: '💰', color: 'var(--accent-yellow)' },
  { id: 'health', name: '健康身心', icon: '🌿', color: 'var(--accent-green)' },
  { id: 'personal', name: '个人成长', icon: '📈', color: '#ba68c8' },
  { id: 'other', name: '其他', icon: '✨', color: 'var(--text-secondary)' }
]

export function getWishCategory(categoryId) {
  return WISH_CATEGORIES.find(c => c.id === categoryId) || WISH_CATEGORIES[WISH_CATEGORIES.length - 1]
}

export function getWishStatusInfo(status) {
  const statusMap = {
    [WISH_STATUS.ACTIVE]: { label: '进行中', color: 'var(--accent-cyan)', icon: '🔮' },
    [WISH_STATUS.IN_PROGRESS]: { label: '持续追踪', color: 'var(--accent-magenta)', icon: '📊' },
    [WISH_STATUS.COMPLETED]: { label: '已达成', color: 'var(--accent-green)', icon: '✨' },
    [WISH_STATUS.ARCHIVED]: { label: '已归档', color: 'var(--text-dim)', icon: '📦' }
  }
  return statusMap[status] || statusMap[WISH_STATUS.ACTIVE]
}

export function createWish({ title, description, category, targetDate, question }) {
  return Storage.addWish({
    title,
    description: description || '',
    category: category || 'other',
    targetDate: targetDate || null,
    question: question || ''
  })
}

export function updateWish(wishId, updates) {
  return Storage.updateWish(wishId, updates)
}

export function deleteWish(wishId) {
  return Storage.deleteWish(wishId)
}

export function getWishList(filterStatus = null) {
  const wishes = Storage.getWishList()
  if (filterStatus) {
    return wishes.filter(w => w.status === filterStatus)
  }
  return wishes
}

export function getActiveWishes() {
  return getWishList(WISH_STATUS.ACTIVE).map(wish => ({
    ...wish,
    _category: getWishCategory(wish.category),
    _statusInfo: getWishStatusInfo(wish.status)
  }))
}

export function getWishById(wishId) {
  const wish = Storage.getWishById(wishId)
  if (!wish) return null
  
  return {
    ...wish,
    _category: getWishCategory(wish.category),
    _statusInfo: getWishStatusInfo(wish.status),
    _linkedCards: (wish.linkedDraws || []).map(draw => {
      const cardIds = draw.cardId ? [draw.cardId] : (draw.cards || []).map(c => c.cardId)
      return {
        ...draw,
        _cards: cardIds.map(id => getCardById(id)).filter(Boolean)
      }
    })
  }
}

export function linkDrawToWish(wishId, drawRecord) {
  const wish = Storage.linkDrawToWish(wishId, drawRecord)
  if (wish && wish.linkedDraws && wish.linkedDraws.length > 0 && wish.status === WISH_STATUS.ACTIVE) {
    Storage.updateWish(wishId, { status: WISH_STATUS.IN_PROGRESS })
  }
  return wish
}

export function addReviewToWish(wishId, { content, outcome, mood }) {
  const review = {
    content,
    outcome: outcome || 'neutral',
    mood: mood || 'neutral'
  }
  return Storage.addReviewToWish(wishId, review)
}

export function completeWish(wishId, finalNote = '') {
  const updates = {
    status: WISH_STATUS.COMPLETED,
    completedAt: Date.now()
  }
  if (finalNote) {
    updates.finalNote = finalNote
  }
  return Storage.updateWish(wishId, updates)
}

export function archiveWish(wishId) {
  return Storage.updateWish(wishId, { status: WISH_STATUS.ARCHIVED })
}

export function reactivateWish(wishId) {
  return Storage.updateWish(wishId, { status: WISH_STATUS.ACTIVE })
}

export function getWishStats() {
  const wishes = Storage.getWishList()
  const stats = {
    total: wishes.length,
    active: 0,
    inProgress: 0,
    completed: 0,
    archived: 0,
    byCategory: {},
    totalLinkedDraws: 0,
    totalReviews: 0
  }

  WISH_CATEGORIES.forEach(cat => {
    stats.byCategory[cat.id] = 0
  })

  wishes.forEach(wish => {
    stats[wish.status === WISH_STATUS.ACTIVE ? 'active' : 
          wish.status === WISH_STATUS.IN_PROGRESS ? 'inProgress' :
          wish.status === WISH_STATUS.COMPLETED ? 'completed' : 'archived']++
    stats.byCategory[wish.category] = (stats.byCategory[wish.category] || 0) + 1
    stats.totalLinkedDraws += (wish.linkedDraws || []).length
    stats.totalReviews += (wish.reviews || []).length
  })

  return stats
}

export function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateShort(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  const now = Date.now()
  const diff = now - timestamp
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  return formatDateShort(timestamp)
}

export function buildDrawRecordForLinking(results, spreadType, question = '') {
  if (spreadType === 'single' && results.length === 1) {
    const { card, isReversed, reading } = results[0]
    return {
      spreadType: 'single',
      cardId: card.id,
      isReversed,
      title: reading.title,
      meaning: reading.meaning,
      advice: reading.advice,
      fortune: reading.fortune,
      question
    }
  } else {
    return {
      spreadType,
      question,
      cards: results.map(({ card, isReversed, position, reading }) => ({
        cardId: card.id,
        isReversed,
        position: position || '',
        title: reading.title,
        meaning: reading.meaning,
        advice: reading.advice,
        fortune: reading.fortune
      }))
    }
  }
}
