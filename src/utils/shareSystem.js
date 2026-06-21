import { CARDS } from '../data/cards.js'
import { RARITY_CONFIG, CATEGORY_CONFIG, THEME_CONFIG } from '../data/constants.js'
import { Storage } from './storage.js'

export function getCardById(id) {
  return CARDS.find(c => c.id === id)
}

export function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function formatDateShort(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  })
}

export function generateSummaryText(results, options = {}) {
  const { theme, spreadName, question, timestamp, shareType = 'summary' } = options

  const lines = []
  const dateStr = formatTimestamp(timestamp || Date.now())

  lines.push('━━━━━━━━━━━━━━━━━━━━')
  lines.push('  🔮 赛博占卜 · 结果分享')
  lines.push('━━━━━━━━━━━━━━━━━━━━')
  lines.push(`📅 占卜时间：${dateStr}`)
  lines.push('')

  if (theme) {
    const themeConfig = THEME_CONFIG[theme]
    if (themeConfig) {
      lines.push(`📌 主题：${themeConfig.icon} ${themeConfig.name}`)
    }
  }

  if (spreadName) {
    lines.push(`🎴 牌阵：${spreadName}`)
  }

  if (question) {
    lines.push(`💭 问题：${question}`)
  }

  lines.push('')

  results.forEach((result, index) => {
    const card = result.card || getCardById(result.cardId)
    if (!card) return

    const isReversed = result.isReversed
    const rarityConfig = RARITY_CONFIG[card.rarity]
    const categoryConfig = CATEGORY_CONFIG[card.category]
    const position = result.position || (results.length > 1 ? `第${index + 1}张` : '')
    const reading = result.reading || (isReversed ? card.reversed : card.upright)

    const orientation = isReversed ? '【逆位】' : '【正位】'

    lines.push(`── ${position ? position + ' ' : ''}${card.symbol} ${card.name} ${orientation} ──`)
    lines.push(`   稀有度：${rarityConfig.label} | ${categoryConfig.icon}${categoryConfig.label}`)
    lines.push(`   关键词：${card.keywords.join(' · ')}`)
    lines.push(`   📝 ${reading.title}`)
    if (shareType === 'detailed') {
      lines.push(`   ${reading.meaning}`)
      lines.push(`   💡 ${reading.advice}`)
    }
    lines.push(`   ${reading.fortune}`)
    lines.push('')
  })

  if (shareType === 'detailed') {
    const overallInsight = generateOverallInsight(results)
    if (overallInsight) {
      lines.push('━━━━━━━━━━━━━━━━━━━━')
      lines.push('  ✨ 整体启示')
      lines.push('━━━━━━━━━━━━━━━━━━━━')
      lines.push(overallInsight)
      lines.push('')
    }
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━')
  lines.push('  🔗 来自：赛博占卜系统')
  lines.push('━━━━━━━━━━━━━━━━━━━━')

  return lines.join('\n')
}

export function generateShortShareText(results, options = {}) {
  const { theme, question, timestamp } = options

  const cardNames = results.map(r => {
    const card = r.card || getCardById(r.cardId)
    if (!card) return '?'
    const orientation = r.isReversed ? '(逆)' : '(正)'
    return `${card.symbol}${card.name}${orientation}`
  }).join(' | ')

  const themeLabel = theme ? `【${THEME_CONFIG[theme]?.icon || '🔮'} ${THEME_CONFIG[theme]?.name || theme}】` : ''
  const questionStr = question ? `\n💭 ${question}` : ''
  const dateStr = formatDateShort(timestamp || Date.now())

  const mainAdvice = results.length > 0
    ? (results[0].reading?.advice || (results[0].card || getCardById(results[0].cardId))?.upright?.advice || '')
    : ''

  return `🔮 赛博占卜${themeLabel}\n🎴 ${cardNames}\n📅 ${dateStr}${questionStr}\n💡 ${mainAdvice}\n\n#赛博占卜 #命运数据流`
}

export function generateOverallInsight(results) {
  if (!results || results.length === 0) return ''

  const cards = results.map(r => r.card || getCardById(r.cardId)).filter(Boolean)
  const isReversedList = results.map(r => r.isReversed)

  const reversedCount = isReversedList.filter(Boolean).length
  const uprightCount = results.length - reversedCount
  const reversedPercent = Math.round((reversedCount / results.length) * 100)

  const allKeywords = new Set()
  let totalFortuneScore = 0
  let fortuneCount = 0

  cards.forEach((card, idx) => {
    card.keywords.forEach(k => allKeywords.add(k))
    const reading = results[idx].reading || (results[idx].isReversed ? card.reversed : card.upright)
    const stars = (reading.fortune || '').match(/★/g)?.length || 0
    totalFortuneScore += stars
    fortuneCount += (reading.fortune || '').split(' ').length
  })

  const avgFortune = fortuneCount > 0 ? (totalFortuneScore / fortuneCount) * 3 : 0
  const keywordsArray = Array.from(allKeywords).slice(0, 8)

  const insights = []

  if (results.length === 1) {
    const card = cards[0]
    const isReversed = isReversedList[0]
    if (card.rarity === 'legendary' && !isReversed) {
      insights.push('🌟 传说之光照亮了你的命运！这是一个极其吉祥的征兆，重大的机遇正在向你走来。')
    } else if (card.rarity === 'legendary' && isReversed) {
      insights.push('⚠️ 传说牌逆位出现，提醒你要谨慎行事。伟大的力量需要正确的引导。')
    } else if (reversedCount > 0) {
      insights.push('🔄 当前有些能量需要重新调整方向。这是内省和修正的好时机。')
    } else {
      insights.push('✨ 能量流动顺畅，现在是积极行动的好时机。')
    }
  } else {
    if (reversedPercent > 60) {
      insights.push('🔄 逆位牌占多数（' + reversedPercent + '%），提示你当前需要暂停、反思和重新评估。过去的模式可能需要调整。')
    } else if (uprightPercent > 70) {
      insights.push('✨ 正位牌占主导（' + uprightPercent + '%），整体能量积极向上，适合推进计划和把握机遇。')
    } else {
      insights.push('⚖️ 正逆位牌相对平衡，预示着变化与稳定并存。需要灵活应对不同的能量流。')
    }
  }

  if (keywordsArray.length > 0) {
    insights.push('🎯 核心关键词：' + keywordsArray.join(' · '))
  }

  if (avgFortune >= 3.5) {
    insights.push('💫 整体运势评分较高，各方面都有积极的信号。保持信心，顺势而为。')
  } else if (avgFortune <= 2) {
    insights.push('🌙 整体运势较为保守，建议韬光养晦，做好准备等待时机。')
  }

  const rareCards = cards.filter(c => c.rarity === 'epic' || c.rarity === 'legendary')
  if (rareCards.length >= 2) {
    insights.push('🔱 多张稀有牌同时出现，这是命运的强烈信号！重要的转折点即将到来。')
  }

  return insights.join('\n\n')
}

export function buildShareDataFromRecord(record, recordType) {
  if (recordType === 'daily') {
    const card = getCardById(record.cardId)
    if (!card) return null
    return {
      id: record.id,
      results: [{
        card,
        cardId: record.cardId,
        isReversed: record.isReversed,
        reading: {
          title: record.title,
          meaning: record.meaning,
          advice: record.advice,
          fortune: record.fortune
        }
      }],
      theme: null,
      spreadName: '每日命运签',
      question: null,
      timestamp: record.timestamp || Date.now(),
      recordType: 'daily',
      consecutiveDays: record.consecutiveDays
    }
  } else if (recordType === 'theme') {
    const results = record.cards.map(c => {
      const card = getCardById(c.cardId)
      return {
        card,
        cardId: c.cardId,
        isReversed: c.isReversed,
        position: c.position,
        positionId: c.positionId,
        reading: {
          title: c.title,
          meaning: c.meaning,
          advice: c.advice,
          fortune: c.fortune
        }
      }
    })
    const theme = record.theme
    const themeConfig = THEME_CONFIG[theme]
    const spreadName = themeConfig?.spreadTypes?.find(s => s.id === record.spreadTypeId)?.name || `${record.cards.length}牌阵`
    return {
      id: record.id,
      results,
      theme,
      spreadName,
      question: record.question,
      timestamp: record.timestamp || Date.now(),
      recordType: 'theme'
    }
  } else {
    if (record.spreadType === 'single') {
      const card = getCardById(record.cardId)
      if (!card) return null
      const reading = record.isReversed ? card.reversed : card.upright
      return {
        id: record.id,
        results: [{
          card,
          cardId: record.cardId,
          isReversed: record.isReversed,
          reading
        }],
        theme: null,
        spreadName: '单张占卜',
        question: null,
        timestamp: record.timestamp || Date.now(),
        recordType: 'divination'
      }
    } else {
      const results = record.cards.map(c => {
        const card = getCardById(c.cardId)
        const reading = c.isReversed ? card.reversed : card.upright
        return {
          card,
          cardId: c.cardId,
          isReversed: c.isReversed,
          position: c.position,
          reading
        }
      })
      return {
        id: record.id,
        results,
        theme: null,
        spreadName: '三牌阵',
        question: null,
        timestamp: record.timestamp || Date.now(),
        recordType: 'divination'
      }
    }
  }
}

export function getShareCardColor(results) {
  if (!results || results.length === 0) {
    return { primary: '#e040fb', secondary: '#00e5ff' }
  }

  const cards = results.map(r => r.card || getCardById(r.cardId)).filter(Boolean)
  if (cards.length === 0) {
    return { primary: '#e040fb', secondary: '#00e5ff' }
  }

  const highestRarity = cards.reduce((highest, card) => {
    const weight = { common: 0, rare: 1, epic: 2, legendary: 3 }
    return weight[card.rarity] > weight[highest] ? card.rarity : highest
  }, 'common')

  const rarityColors = {
    common: { primary: '#8a8a9a', secondary: '#4fc3f7' },
    rare: { primary: '#4fc3f7', secondary: '#00e5ff' },
    epic: { primary: '#ba68c8', secondary: '#e040fb' },
    legendary: { primary: '#ffd54f', secondary: '#ffab40' }
  }

  return rarityColors[highestRarity] || rarityColors.common
}

export function getAllRecordsForReview() {
  const drawHistory = Storage.getDrawHistory().map(r => ({ ...r, _type: 'divination' }))
  const dailyHistory = Storage.getDailyFortuneHistory().map(r => ({ ...r, _type: 'daily' }))
  const themeHistory = Storage.getThemeDivinationHistory().map(r => ({ ...r, _type: 'theme' }))

  const all = [...drawHistory, ...dailyHistory, ...themeHistory].sort((a, b) => {
    return (b.timestamp || 0) - (a.timestamp || 0)
  })

  return all
}

export function getRecordsByDateRange(startDate, endDate) {
  const all = getAllRecordsForReview()
  const start = new Date(startDate).setHours(0, 0, 0, 0)
  const end = new Date(endDate).setHours(23, 59, 59, 999)
  return all.filter(r => {
    const ts = r.timestamp || 0
    return ts >= start && ts <= end
  })
}

export function generateReviewSummary(records) {
  if (!records || records.length === 0) {
    return {
      totalCount: 0,
      dailyCount: 0,
      themeCount: 0,
      divinationCount: 0,
      mostCommonCards: [],
      cardFrequency: {},
      themeBreakdown: {},
      dateRange: null
    }
  }

  const dailyCount = records.filter(r => r._type === 'daily').length
  const themeCount = records.filter(r => r._type === 'theme').length
  const divinationCount = records.filter(r => r._type === 'divination').length

  const cardFrequency = {}
  const themeBreakdown = {}

  records.forEach(record => {
    if (record._type === 'daily') {
      cardFrequency[record.cardId] = (cardFrequency[record.cardId] || 0) + 1
    } else if (record._type === 'theme') {
      const theme = record.theme
      themeBreakdown[theme] = (themeBreakdown[theme] || 0) + 1
      record.cards.forEach(c => {
        cardFrequency[c.cardId] = (cardFrequency[c.cardId] || 0) + 1
      })
    } else {
      if (record.spreadType === 'single') {
        cardFrequency[record.cardId] = (cardFrequency[record.cardId] || 0) + 1
      } else if (record.cards) {
        record.cards.forEach(c => {
          cardFrequency[c.cardId] = (cardFrequency[c.cardId] || 0) + 1
        })
      }
    }
  })

  const mostCommonCards = Object.entries(cardFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cardId, count]) => {
      const card = getCardById(cardId)
      return { cardId, count, card }
    })

  const timestamps = records.map(r => r.timestamp).filter(Boolean)
  const minDate = timestamps.length > 0 ? Math.min(...timestamps) : null
  const maxDate = timestamps.length > 0 ? Math.max(...timestamps) : null

  return {
    totalCount: records.length,
    dailyCount,
    themeCount,
    divinationCount,
    mostCommonCards,
    cardFrequency,
    themeBreakdown,
    dateRange: { start: minDate, end: maxDate }
  }
}

export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
  }
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

export function saveShareRecord(shareData) {
  const history = Storage.getShareHistory?.() || []
  history.unshift({
    ...shareData,
    sharedAt: Date.now(),
    id: `share_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  })
  if (history.length > 50) {
    history.splice(50)
  }
  Storage.setShareHistory?.(history)
  return history
}
