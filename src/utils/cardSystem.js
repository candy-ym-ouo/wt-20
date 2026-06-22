import { CARDS } from '../data/cards.js'
import { RARITY_CONFIG, CARD_RARITY, getConsecutiveReward, THEME_CONFIG, MULTI_SPREAD_CONFIG, DIVINATION_THEMES } from '../data/constants.js'
import { Storage } from './storage.js'
import { checkAchievementsAfterAction, triggerHiddenAchievement } from './achievementSystem.js'
import { checkSeasonTasksAfterAction } from './seasonSystem.js'
import { checkVisitorTriggers, triggerVisitor } from './mysteriousVisitorSystem.js'
import { 
  getCurrentPackCards, 
  getCurrentPackRarityConfig, 
  getCurrentPackId,
  getPackCards,
  getPackRarityConfig
} from './themePackSystem.js'

export function getAllCards() {
  return CARDS
}

export function getCardById(id) {
  return CARDS.find(c => c.id === id)
}

function weightedRandomSelect(cards) {
  const totalWeight = cards.reduce((sum, card) => {
    return sum + RARITY_CONFIG[card.rarity].weight
  }, 0)
  
  let random = Math.random() * totalWeight
  
  for (const card of cards) {
    random -= RARITY_CONFIG[card.rarity].weight
    if (random <= 0) {
      return card
    }
  }
  
  return cards[cards.length - 1]
}

export function drawSingleCard() {
  const card = weightedRandomSelect(CARDS)
  const isReversed = Math.random() < 0.35
  
  const reading = isReversed ? card.reversed : card.upright
  
  return {
    card,
    isReversed,
    reading
  }
}

export function drawThreeCards() {
  const drawnIds = new Set()
  const results = []
  
  for (let i = 0; i < 3; i++) {
    let card
    let attempts = 0
    do {
      const draw = drawSingleCard()
      card = draw
      attempts++
    } while (drawnIds.has(card.card.id) && attempts < 20)
    
    drawnIds.add(card.card.id)
    results.push(card)
  }
  
  return results.map((result, index) => ({
    ...result,
    position: ['过去', '现在', '未来'][index]
  }))
}

function weightedRandomSelectWithConfig(cards, rarityConfig) {
  const totalWeight = cards.reduce((sum, card) => {
    return sum + (rarityConfig[card.rarity]?.weight ?? RARITY_CONFIG[card.rarity]?.weight ?? 1)
  }, 0)
  
  let random = Math.random() * totalWeight
  
  for (const card of cards) {
    random -= (rarityConfig[card.rarity]?.weight ?? RARITY_CONFIG[card.rarity]?.weight ?? 1)
    if (random <= 0) {
      return card
    }
  }
  
  return cards[cards.length - 1]
}

export function drawSingleCardFromPack(packId = null) {
  const cards = packId ? getPackCards(packId) : getCurrentPackCards()
  const rarityConfig = packId ? getPackRarityConfig(packId) : getCurrentPackRarityConfig()
  
  if (cards.length === 0) {
    return drawSingleCard()
  }
  
  const card = weightedRandomSelectWithConfig(cards, rarityConfig)
  const isReversed = Math.random() < 0.35
  
  const reading = isReversed ? card.reversed : card.upright
  
  return {
    card,
    isReversed,
    reading,
    packId: packId || getCurrentPackId()
  }
}

export function drawThreeCardsFromPack(packId = null) {
  const cards = packId ? getPackCards(packId) : getCurrentPackCards()
  const rarityConfig = packId ? getPackRarityConfig(packId) : getCurrentPackRarityConfig()
  
  if (cards.length < 3) {
    return drawThreeCards()
  }
  
  const drawnIds = new Set()
  const results = []
  
  for (let i = 0; i < 3; i++) {
    let card
    let attempts = 0
    do {
      const selectedCard = weightedRandomSelectWithConfig(cards, rarityConfig)
      const isReversed = Math.random() < 0.35
      const reading = isReversed ? selectedCard.reversed : selectedCard.upright
      card = { card: selectedCard, isReversed, reading }
      attempts++
    } while (drawnIds.has(card.card.id) && attempts < 20)
    
    drawnIds.add(card.card.id)
    results.push(card)
  }
  
  return results.map((result, index) => ({
    ...result,
    position: ['过去', '现在', '未来'][index],
    packId: packId || getCurrentPackId()
  }))
}

export function saveDrawResultWithPack(drawResult, spreadType = 'single', packId = null) {
  const actualPackId = packId || getCurrentPackId()
  let records = []
  
  if (spreadType === 'single') {
    const { card, isReversed, reading } = drawResult
    Storage.addToCollection(card.id, isReversed)
    Storage.updateStats(card.rarity, isReversed)
    records = Storage.addDrawRecord({
      spreadType,
      cardId: card.id,
      isReversed,
      title: reading.title,
      meaning: reading.meaning,
      packId: actualPackId
    })
  } else if (spreadType === 'three') {
    drawResult.forEach(({ card, isReversed }) => {
      Storage.addToCollection(card.id, isReversed)
      Storage.updateStats(card.rarity, isReversed)
    })
    records = Storage.addDrawRecord({
      spreadType,
      cards: drawResult.map(({ card, isReversed, position }) => ({
        cardId: card.id,
        isReversed,
        position
      })),
      packId: actualPackId
    })
  }
  
  checkHiddenEvents(drawResult, spreadType)
  checkAchievementsAfterAction('draw')
  checkSeasonTasksAfterAction('draw')

  const drawnCards = spreadType === 'single' ? [drawResult] : drawResult
  checkVisitorTriggerAfterDraw(drawnCards)

  return records
}

export function saveDrawResult(drawResult, spreadType = 'single') {
  let records = []
  
  if (spreadType === 'single') {
    const { card, isReversed, reading } = drawResult
    Storage.addToCollection(card.id, isReversed)
    Storage.updateStats(card.rarity, isReversed)
    records = Storage.addDrawRecord({
      spreadType,
      cardId: card.id,
      isReversed,
      title: reading.title,
      meaning: reading.meaning
    })
  } else if (spreadType === 'three') {
    drawResult.forEach(({ card, isReversed }) => {
      Storage.addToCollection(card.id, isReversed)
      Storage.updateStats(card.rarity, isReversed)
    })
    records = Storage.addDrawRecord({
      spreadType,
      cards: drawResult.map(({ card, isReversed, position }) => ({
        cardId: card.id,
        isReversed,
        position
      }))
    })
  }
  
  checkHiddenEvents(drawResult, spreadType)
  checkAchievementsAfterAction('draw')
  checkSeasonTasksAfterAction('draw')

  const drawnCards = spreadType === 'single' ? [drawResult] : drawResult
  checkVisitorTriggerAfterDraw(drawnCards)

  return records
}

function checkVisitorTriggerAfterDraw(drawnCards) {
  const triggeredVisitors = checkVisitorTriggers(drawnCards)
  if (triggeredVisitors.length > 0) {
    const selected = triggeredVisitors[Math.floor(Math.random() * triggeredVisitors.length)]
    setTimeout(() => {
      triggerVisitor(selected.visitor)
    }, 1500)
  }
}

function checkHiddenEvents(drawResult, spreadType) {
  const stats = Storage.getStats()
  
  if (stats.totalDraws === 1) {
    const card = spreadType === 'single' ? drawResult.card : drawResult[0].card
    if (card.hiddenEvent && card.hiddenEvent.trigger === 'first_draw') {
      triggerHiddenEvent(card)
    }
  }
  
  if (stats.totalDraws === 3) {
    const loversCard = getCardById('neon-lovers')
    if (loversCard && loversCard.hiddenEvent && loversCard.hiddenEvent.trigger === 'draw_3_times') {
      triggerHiddenEvent(loversCard)
    }
  }
  
  if (spreadType === 'single') {
    checkSingleCardEvents(drawResult.card, drawResult.isReversed)
  } else if (spreadType === 'three') {
    drawResult.forEach(({ card }) => checkSingleCardEvents(card))
  }
}

function checkSingleCardEvents(card, isReversed) {
  if (!card.hiddenEvent) return
  
  const trigger = card.hiddenEvent.trigger
  
  if (trigger === 'draw_world' && card.id === 'cyber-world') {
    triggerHiddenEvent(card)
  }
  
  if (trigger === 'draw_ghost' && card.id === 'ghost-protocol') {
    triggerHiddenEvent(card)
  }
  
  if (trigger === 'legendary_draw' && card.rarity === CARD_RARITY.LEGENDARY && !isReversed) {
    triggerHiddenEvent(card)
  }
  
  if (trigger === 'lucky_draw' && card.rarity !== CARD_RARITY.COMMON && card.rarity !== CARD_RARITY.RARE) {
    if (Math.random() < 0.1) {
      triggerHiddenEvent(card)
    }
  }
}

const eventListeners = []

export function onHiddenEvent(callback) {
  eventListeners.push(callback)
  return () => {
    const idx = eventListeners.indexOf(callback)
    if (idx > -1) eventListeners.splice(idx, 1)
  }
}

function triggerHiddenEvent(card) {
  const event = card.hiddenEvent
  if (!event) return

  const achievementId = event.reward?.value
  if (!achievementId) return

  const isNew = triggerHiddenAchievement(achievementId)
  if (!isNew) return

  const eventData = {
    ...event,
    achievementId,
    cardId: card.id,
    cardName: card.name,
    unlockedAt: Date.now()
  }

  Storage.addHiddenEventLog(eventData)

  eventListeners.forEach(cb => {
    try {
      cb(eventData)
    } catch (e) {
      console.error('Hidden event callback error:', e)
    }
  })
}

export function filterCardsByRarity(rarity) {
  return CARDS.filter(c => c.rarity === rarity)
}

export function filterCardsByCategory(category) {
  return CARDS.filter(c => c.category === category)
}

export function searchCards(query) {
  const q = query.toLowerCase().trim()
  if (!q) return CARDS
  return CARDS.filter(c => 
    c.name.toLowerCase().includes(q) ||
    c.keywords.some(k => k.toLowerCase().includes(q))
  )
}

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function getDateSeed(dateStr) {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function drawDailyFortune(consecutiveDays = 1) {
  const today = new Date().toDateString()
  const seed = getDateSeed(today + '_daily_fortune')
  
  const reward = getConsecutiveReward(consecutiveDays)
  
  let cardPool = [...CARDS]
  let weights = cardPool.map(card => {
    let weight = RARITY_CONFIG[card.rarity].weight
    if (reward) {
      if (reward.days >= 3 && card.rarity === CARD_RARITY.RARE) weight *= 1.5
      if (reward.days >= 14 && card.rarity === CARD_RARITY.EPIC) weight *= 1.8
      if (reward.days >= 30 && card.rarity === CARD_RARITY.LEGENDARY) weight *= 2.5
    }
    return weight
  })
  
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let random = seededRandom(seed) * totalWeight
  
  let selectedCard = cardPool[0]
  for (let i = 0; i < cardPool.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      selectedCard = cardPool[i]
      break
    }
  }
  
  const isReversed = seededRandom(seed + 999) < 0.3
  const reading = isReversed ? selectedCard.reversed : selectedCard.upright
  
  return {
    card: selectedCard,
    isReversed,
    reading
  }
}

export function saveDailyFortuneResult(result) {
  const { card, isReversed, reading } = result
  Storage.addToCollection(card.id, isReversed)
  Storage.updateStats(card.rarity, isReversed)
  const saved = Storage.saveDailyFortune(card.id, isReversed, reading)
  checkAchievementsAfterAction('daily')
  checkSeasonTasksAfterAction('daily')
  return saved
}

export function drawThemeCards(theme, spreadTypeId) {
  const themeConfig = THEME_CONFIG[theme]
  if (!themeConfig) throw new Error(`Unknown theme: ${theme}`)

  const spreadType = themeConfig.spreadTypes.find(s => s.id === spreadTypeId)
  if (!spreadType) throw new Error(`Unknown spread type: ${spreadTypeId}`)

  const cardCount = spreadType.cardCount
  const drawnIds = new Set()
  const results = []

  for (let i = 0; i < cardCount; i++) {
    let card
    let attempts = 0
    do {
      const draw = drawSingleCard()
      card = draw
      attempts++
    } while (drawnIds.has(card.card.id) && attempts < 20)

    drawnIds.add(card.card.id)
    results.push({
      ...card,
      position: spreadType.positions[i]
    })
  }

  return results
}

export function saveThemeDivinationResult(theme, spreadTypeId, results, question = '') {
  results.forEach(({ card, isReversed }) => {
    Storage.addToCollection(card.id, isReversed)
    Storage.updateStats(card.rarity, isReversed)
  })

  const record = {
    theme,
    spreadTypeId,
    question,
    cards: results.map(({ card, isReversed, position }) => ({
      cardId: card.id,
      isReversed,
      position,
      title: isReversed ? card.reversed.title : card.upright.title,
      meaning: isReversed ? card.reversed.meaning : card.upright.meaning,
      advice: isReversed ? card.reversed.advice : card.upright.advice,
      fortune: isReversed ? card.reversed.fortune : card.upright.fortune
    }))
  }

  checkHiddenEvents(results, results.length === 1 ? 'single' : 'three')
  checkAchievementsAfterAction('theme')
  checkSeasonTasksAfterAction('draw')

  checkVisitorTriggerAfterDraw(results)

  return Storage.addThemeDivinationRecord(record)
}

export function getThemeConfig(theme) {
  return THEME_CONFIG[theme] || null
}

export function getAllThemes() {
  return Object.values(THEME_CONFIG)
}

export function drawMultiSpread(spreadId) {
  const spreadConfig = MULTI_SPREAD_CONFIG[spreadId]
  if (!spreadConfig) throw new Error(`Unknown spread: ${spreadId}`)

  const cardCount = spreadConfig.cardCount
  const drawnIds = new Set()
  const results = []

  for (let i = 0; i < cardCount; i++) {
    let card
    let attempts = 0
    do {
      const draw = drawSingleCard()
      card = draw
      attempts++
    } while (drawnIds.has(card.card.id) && attempts < 20)

    drawnIds.add(card.card.id)
    const posConfig = spreadConfig.positions[i]
    results.push({
      ...card,
      position: posConfig.name,
      positionId: posConfig.id,
      positionDesc: posConfig.desc
    })
  }

  return results
}

export function saveMultiSpreadResult(spreadId, results, question = '') {
  results.forEach(({ card, isReversed }) => {
    Storage.addToCollection(card.id, isReversed)
    Storage.updateStats(card.rarity, isReversed)
  })

  const record = {
    spreadId,
    question,
    cards: results.map(({ card, isReversed, position, positionId, positionDesc }) => ({
      cardId: card.id,
      isReversed,
      position,
      positionId,
      positionDesc,
      title: isReversed ? card.reversed.title : card.upright.title,
      meaning: isReversed ? card.reversed.meaning : card.upright.meaning,
      advice: isReversed ? card.reversed.advice : card.upright.advice,
      fortune: isReversed ? card.reversed.fortune : card.upright.fortune
    }))
  }

  checkHiddenEvents(results, results.length === 1 ? 'single' : 'three')
  checkAchievementsAfterAction('spread')
  checkSeasonTasksAfterAction('draw')

  checkVisitorTriggerAfterDraw(results)

  return Storage.addMultiSpreadRecord(record)
}

export const QUESTION_CATEGORIES = {
  LOVE: {
    id: 'love',
    name: '情感关系',
    icon: '💕',
    color: '#e040fb',
    keywords: ['爱', '恋', '情', '喜欢', '表白', '分手', '复合', '对象', '伴侣', '婚姻', '关系', '暧昧', '暗恋', '前任', '感情', '恋爱', '约会', '吵架', '冷战', '相处'],
    description: '关于爱情、恋爱、人际关系问题'
  },
  CAREER: {
    id: 'career',
    name: '事业发展',
    icon: '💼',
    color: '#00e5ff',
    keywords: ['工作', '事业', '职业', '跳槽', '面试', '辞职', '升职', '加薪', '创业', '项目', '领导', '同事', '公司', 'offer', '换工作', '转行', '失业'],
    description: '关于工作、职业发展相关'
  },
  WEALTH: {
    id: 'wealth',
    name: '财运投资',
    icon: '💰',
    color: '#ffd54f',
    keywords: ['钱', '财', '投资', '理财', '股票', '基金', '买房', '贷款', '债务', '收入', '支出', '消费', '储蓄', '财运', '赚钱', '亏损', '中奖'],
    description: '关于金钱、投资理财问题'
  },
  HEALTH: {
    id: 'health',
    name: '健康身心',
    icon: '🌿',
    color: '#69f0ae',
    keywords: ['身体', '健康', '病', '医', '睡眠', '饮食', '运动', '减肥', '压力', '焦虑', '心理', '情绪', '精神', '身心'],
    description: '关于身心健康的问题'
  },
  FAMILY: {
    id: 'family',
    name: '家庭亲情',
    icon: '🏠',
    color: '#ff8a65',
    keywords: ['家人', '父母', '孩子', '家庭', '结婚', '亲戚', '兄弟姐妹', '亲情', '家人关系', '家庭矛盾', '原生家庭'],
    description: '关于家庭、亲情相关'
  },
  LEARNING: {
    id: 'learning',
    name: '学业考试',
    icon: '📚',
    color: '#7986cb',
    keywords: ['学习', '考试', '考研', '考公', '留学', '成绩', '论文', '毕业', '升学', '证书', '读书', '作业'],
    description: '关于学业、考试相关'
  },
  DECISION: {
    id: 'decision',
    name: '抉择选择',
    icon: '⚖️',
    color: '#4fc3f7',
    keywords: ['选择', '决定', '要不要', '选哪个', '犹豫', '纠结', '两难', '抉择', '决定方向'],
    description: '面临两难选择时'
  },
  GENERAL: {
    id: 'general',
    name: '综合指引',
    icon: '✨',
    color: '#b39ddb',
    keywords: [],
    description: '其他综合类问题'
  }
}

export const URGENCY_LEVELS = [
  { id: 'low', name: '近期迷茫', color: '#4fc3f7', icon: '🌙', description: '想看看方向，不急，需要了解趋势' },
  { id: 'medium', name: '当前困惑', color: '#ffd54f', icon: '⚡', description: '遇到了一些阻碍，需要指导' },
  { id: 'high', name: '紧急重要', color: '#ff5252', icon: '🔥', description: '面临重大抉择，急需指引' }
]

function calculateKeywordMatch(text, keywords) {
  if (!text) return 0
  const lowerText = text.toLowerCase()
  let score = 0
  keywords.forEach(kw => {
    if (lowerText.includes(kw)) {
      score += 1
    }
  })
  return score
}

export function analyzeQuestionCategory(questionText, contextText = '') {
  const fullText = questionText + ' ' + contextText
  let bestCategory = QUESTION_CATEGORIES.GENERAL
  let bestScore = 0

  Object.values(QUESTION_CATEGORIES).forEach(cat => {
    const score = calculateKeywordMatch(fullText, cat.keywords)
    if (score > bestScore) {
      bestScore = score
      bestCategory = cat
    }
  })

  return {
    category: bestCategory,
    matchScore: bestScore,
    confidence: bestScore > 0 ? Math.min(0.5 + bestScore * 0.1, 0.95) : 0.2
  }
}

function getSpreadForQuestion(category, urgency, questionLength) {
  const categoryId = category.id
  const urgencyId = urgency.id

  let recommended = []

  if (categoryId === 'love') {
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.LOVE, spreadTypeId: 'relationship', confidence: 0.9 })
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.LOVE, spreadTypeId: 'three-love', confidence: 0.85 })
    recommended.push({ type: 'multi-spread', spreadId: 'relationship', confidence: 0.8 })
  } else if (categoryId === 'career') {
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.CAREER, spreadTypeId: 'career-path', confidence: 0.9 })
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.CAREER, spreadTypeId: 'three-career', confidence: 0.85 })
    recommended.push({ type: 'multi-spread', spreadId: 'decision', confidence: 0.7 })
  } else if (categoryId === 'wealth') {
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.WEALTH, spreadTypeId: 'wealth-flow', confidence: 0.9 })
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.WEALTH, spreadTypeId: 'three-wealth', confidence: 0.85 })
  } else if (categoryId === 'decision') {
    recommended.push({ type: 'multi-spread', spreadId: 'decision', confidence: 0.95 })
    recommended.push({ type: 'multi-spread', spreadId: 'cross', confidence: 0.8 })
  } else if (categoryId === 'health') {
    recommended.push({ type: 'multi-spread', spreadId: 'cross', confidence: 0.85 })
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.LOVE, spreadTypeId: 'single', confidence: 0.6 })
  } else if (categoryId === 'family') {
    recommended.push({ type: 'multi-spread', spreadId: 'relationship', confidence: 0.8 })
    recommended.push({ type: 'multi-spread', spreadId: 'cross', confidence: 0.75 })
  } else if (categoryId === 'learning') {
    recommended.push({ type: 'multi-spread', spreadId: 'cross', confidence: 0.8 })
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.CAREER, spreadTypeId: 'career-path', confidence: 0.7 })
  } else {
    recommended.push({ type: 'multi-spread', spreadId: 'cross', confidence: 0.7 })
    recommended.push({ type: 'theme', themeId: DIVINATION_THEMES.LOVE, spreadTypeId: 'single', confidence: 0.6 })
  }

  if (urgencyId === 'high') {
    recommended = recommended.map(r => ({ ...r, confidence: Math.min(r.confidence + 0.05, 1) }))
    recommended.push({ type: 'multi-spread', spreadId: 'cross', confidence: 0.85 })
  }

  if (questionLength > 100) {
    recommended = recommended.map(r => ({ ...r, confidence: Math.min(r.confidence + 0.03, 1) }))
  }

  recommended.sort((a, b) => b.confidence - a.confidence)

  return recommended.slice(0, 3).map((r, idx) => ({
    ...r,
    rank: idx + 1,
    reason: generateSpreadReason(r, category, urgency)
  }))
}

function generateSpreadReason(recommendation, category, urgency) {
  const reasons = []
  if (recommendation.type === 'theme') {
    reasons.push(`匹配「${category.name}」主题`)
  } else {
    const spread = MULTI_SPREAD_CONFIG[recommendation.spreadId]
    if (spread) reasons.push(`「${spread.name}」最适合分析复杂情况`)
  }
  if (urgency.id === 'high') reasons.push('问题重要，需要深度分析')
  if (urgency.id === 'medium') reasons.push('需要多维度剖析')
  return reasons.join(' · ')
}

export function recommendSpreads(questionText, contextText = '', urgencyLevel = URGENCY_LEVELS[1]) {
  const categoryAnalysis = analyzeQuestionCategory(questionText, contextText)
  const spreads = getSpreadForQuestion(categoryAnalysis.category, urgencyLevel, (questionText + contextText).length)

  return {
    category: categoryAnalysis,
    urgency: urgencyLevel,
    recommendedSpreads: spreads,
    summary: generateRecommendationSummary(categoryAnalysis.category, urgencyLevel)
  }
}

function generateRecommendationSummary(category, urgency) {
  const parts = []
  parts.push(`你的问题偏向「${category.icon} ${category.name}」领域`)
  parts.push(`当前状态：${urgency.icon} ${urgency.name}`)
  if (urgency.id === 'high') {
    parts.push('建议使用多牌阵深入剖析')
  } else if (urgency.id === 'medium') {
    parts.push('可以选择三牌阵或多牌阵')
  } else {
    parts.push('可以先从简单牌阵获得指引')
  }
  return parts.join(' | ')
}

export function drawQuestionDrivenCards(recommendation) {
  const spread = recommendation
  if (spread.type === 'theme') {
    return drawThemeCards(spread.themeId, spread.spreadTypeId)
  } else {
    return drawMultiSpread(spread.spreadId)
  }
}

export function getSpreadMeta(recommendation) {
  if (recommendation.type === 'theme') {
    const theme = THEME_CONFIG[recommendation.themeId]
    const spreadType = theme?.spreadTypes?.find(s => s.id === recommendation.spreadTypeId)
    return {
      type: 'theme',
      theme,
      spreadType,
      name: `${theme?.icon || ''} ${theme?.name || ''} · ${spreadType?.name || ''}`,
      icon: theme?.icon || '🔮',
      color: theme?.color || '#00e5ff',
      cardCount: spreadType?.cardCount || 1,
      positions: spreadType?.positions || []
    }
  } else {
    const spread = MULTI_SPREAD_CONFIG[recommendation.spreadId]
    return {
      type: 'multi-spread',
      spread,
      name: `${spread?.icon || ''} ${spread?.name || ''}`,
      icon: spread?.icon || '✚',
      color: spread?.color || '#e040fb',
      cardCount: spread?.cardCount || 1,
      positions: spread?.positions?.map(p => p.name) || []
    }
  }
}

export function saveQuestionDrivenResult(questionContext, recommendation, spreadMeta, results, userInterpretation = '') {
  results.forEach(({ card, isReversed }) => {
    Storage.addToCollection(card.id, isReversed)
    Storage.updateStats(card.rarity, isReversed)
  })

  const record = {
    questionContext,
    recommendation,
    spreadMeta: {
      type: spreadMeta.type,
      name: spreadMeta.name,
      icon: spreadMeta.icon,
      color: spreadMeta.color,
      cardCount: spreadMeta.cardCount,
      positions: spreadMeta.positions,
      themeId: recommendation.themeId,
      spreadTypeId: recommendation.spreadTypeId,
      spreadId: recommendation.spreadId,
    },
    userInterpretation,
    cards: results.map(({ card, isReversed, position, positionId, positionDesc }) => ({
      cardId: card.id,
      isReversed,
      position,
      positionId,
      positionDesc,
      title: isReversed ? card.reversed.title : card.upright.title,
      meaning: isReversed ? card.reversed.meaning : card.upright.meaning,
      advice: isReversed ? card.reversed.advice : card.upright.advice,
      fortune: isReversed ? card.reversed.fortune : card.upright.fortune
    }))
  }

  checkHiddenEvents(results, results.length === 1 ? 'single' : 'three')
  checkAchievementsAfterAction('theme')
  checkSeasonTasksAfterAction('draw')

  checkVisitorTriggerAfterDraw(results)

  return Storage.addQuestionDrivenRecord(record)
}
