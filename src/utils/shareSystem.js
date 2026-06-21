import { CARDS } from '../data/cards.js'
import { RARITY_CONFIG, CATEGORY_CONFIG, THEME_CONFIG, MULTI_SPREAD_CONFIG } from '../data/constants.js'
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
  const uprightPercent = Math.round((uprightCount / results.length) * 100)

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
  } else if (recordType === 'spread') {
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
    const spreadConfig = MULTI_SPREAD_CONFIG[record.spreadId]
    return {
      id: record.id,
      results,
      theme: null,
      spreadName: spreadConfig?.name || `${record.cards.length}牌阵`,
      question: record.question,
      timestamp: record.timestamp || Date.now(),
      recordType: 'spread',
      spreadId: record.spreadId,
      spreadConfig
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
  const spreadHistory = Storage.getMultiSpreadHistory().map(r => ({ ...r, _type: 'spread' }))

  const all = [...drawHistory, ...dailyHistory, ...themeHistory, ...spreadHistory].sort((a, b) => {
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
      spreadCount: 0,
      mostCommonCards: [],
      cardFrequency: {},
      themeBreakdown: {},
      dateRange: null
    }
  }

  const dailyCount = records.filter(r => r._type === 'daily').length
  const themeCount = records.filter(r => r._type === 'theme').length
  const divinationCount = records.filter(r => r._type === 'divination').length
  const spreadCount = records.filter(r => r._type === 'spread').length

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
    } else if (record._type === 'spread') {
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
    spreadCount,
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

export async function generateShareImage(results, options = {}) {
  const { theme = null, spreadName = null, question = null, timestamp = Date.now(), recordType = null, consecutiveDays = null } = options

  const colors = getShareCardColor(results)
  const themeConfig = theme ? THEME_CONFIG[theme] : null
  const spreadConfig = options.spreadConfig || (recordType === 'spread' && options.spreadId ? MULTI_SPREAD_CONFIG[options.spreadId] : null)

  const cardWidth = 420
  const headerHeight = 70
  const metaPadding = 16
  const cardItemHeight = 220
  const statsHeight = results.length > 1 ? 60 : 0
  const footerHeight = 50
  const gap = 16

  let metaHeight = 0
  if (themeConfig || spreadName || question || (recordType === 'daily' && consecutiveDays)) {
    metaHeight = metaPadding * 2
    if (question) metaHeight += 40
    if (themeConfig || spreadName) metaHeight += 30
  }

  const totalHeight = headerHeight + metaHeight + gap + results.length * cardItemHeight + (results.length - 1) * gap + statsHeight + footerHeight + 40

  const canvas = document.createElement('canvas')
  const scale = 2
  canvas.width = cardWidth * scale
  canvas.height = totalHeight * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  const bgGradient = ctx.createLinearGradient(0, 0, cardWidth, totalHeight)
  bgGradient.addColorStop(0, '#1a1a2e')
  bgGradient.addColorStop(1, '#16213e')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, cardWidth, totalHeight)

  ctx.strokeStyle = colors.primary
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, cardWidth - 1, totalHeight - 1)

  let y = 20
  ctx.fillStyle = colors.primary
  ctx.font = 'bold 18px "Courier New", monospace'
  ctx.fillText('🔮 赛博占卜', 20, y + 16)
  ctx.fillStyle = '#8a8a9a'
  ctx.font = '9px "Courier New", monospace'
  ctx.fillText('CYBER DIVINATION', 20, y + 32)

  ctx.fillStyle = '#8a8a9a'
  ctx.font = '10px "Courier New", monospace'
  ctx.textAlign = 'right'
  const timeStr = formatTimestamp(timestamp)
  ctx.fillText(timeStr, cardWidth - 20, y + 16)
  ctx.textAlign = 'left'

  y = headerHeight + 10

  if (themeConfig || spreadName || question || (recordType === 'daily' && consecutiveDays)) {
    let badgeX = 20
    ctx.font = '12px sans-serif'

    if (themeConfig) {
      const badgeText = `${themeConfig.icon} ${themeConfig.name}占卜`
      const badgeWidth = ctx.measureText(badgeText).width + 24
      ctx.fillStyle = hexToRgba(themeConfig.color || colors.primary, 0.15)
      roundRect(ctx, badgeX, y, badgeWidth, 28, 14)
      ctx.fill()
      ctx.strokeStyle = hexToRgba(themeConfig.color || colors.primary, 0.4)
      ctx.lineWidth = 1
      roundRect(ctx, badgeX, y, badgeWidth, 28, 14)
      ctx.stroke()
      ctx.fillStyle = themeConfig.color || colors.primary
      ctx.fillText(badgeText, badgeX + 12, y + 19)
      badgeX += badgeWidth + 8
    }

    if (spreadName) {
      const badgeText = `🎴 ${spreadName}`
      const badgeWidth = ctx.measureText(badgeText).width + 24
      ctx.fillStyle = hexToRgba(colors.secondary, 0.15)
      roundRect(ctx, badgeX, y, badgeWidth, 28, 14)
      ctx.fill()
      ctx.strokeStyle = hexToRgba(colors.secondary, 0.4)
      ctx.lineWidth = 1
      roundRect(ctx, badgeX, y, badgeWidth, 28, 14)
      ctx.stroke()
      ctx.fillStyle = colors.secondary
      ctx.fillText(badgeText, badgeX + 12, y + 19)
      badgeX += badgeWidth + 8
    }

    if (recordType === 'daily' && consecutiveDays) {
      const badgeText = `🔥 连续 ${consecutiveDays} 天`
      const badgeWidth = ctx.measureText(badgeText).width + 24
      ctx.fillStyle = hexToRgba('#ff5252', 0.15)
      roundRect(ctx, badgeX, y, badgeWidth, 28, 14)
      ctx.fill()
      ctx.strokeStyle = hexToRgba('#ff5252', 0.4)
      ctx.lineWidth = 1
      roundRect(ctx, badgeX, y, badgeWidth, 28, 14)
      ctx.stroke()
      ctx.fillStyle = '#ff5252'
      ctx.fillText(badgeText, badgeX + 12, y + 19)
    }

    if (question) {
      y += 38
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(20, y, cardWidth - 40, 36)
      ctx.strokeStyle = colors.secondary
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(20, y + 36)
      ctx.stroke()
      ctx.fillStyle = '#e0e0e0'
      ctx.font = '13px sans-serif'
      const displayQuestion = question.length > 28 ? question.slice(0, 28) + '...' : question
      ctx.fillText(`💭 ${displayQuestion}`, 30, y + 23)
    }

    y = headerHeight + metaHeight + gap
  }

  results.forEach((result, index) => {
    const card = result.card
    const rarity = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common
    const category = CATEGORY_CONFIG[card.category] || { label: '未知', icon: '❓' }

    if (result.position) {
      ctx.fillStyle = rarity.color
      ctx.font = 'bold 12px "Courier New", monospace'
      ctx.fillText(`▸ ${result.position}`, 20, y + 14)
      y += 20
    }

    const visualY = y
    const visualHeight = 120
    const visualWidth = cardWidth - 40

    const cardBgGradient = ctx.createLinearGradient(20, visualY, cardWidth - 20, visualY + visualHeight)
    cardBgGradient.addColorStop(0, '#1a1a2e')
    cardBgGradient.addColorStop(1, '#0f0f1a')
    ctx.fillStyle = cardBgGradient
    roundRect(ctx, 20, visualY, visualWidth, visualHeight, 10)
    ctx.fill()
    ctx.strokeStyle = rarity.borderColor || rarity.color
    ctx.lineWidth = 2
    roundRect(ctx, 20, visualY, visualWidth, visualHeight, 10)
    ctx.stroke()

    if (result.isReversed) {
      ctx.save()
      ctx.translate(20 + visualWidth / 2, visualY + visualHeight / 2)
      ctx.rotate(Math.PI)
      ctx.translate(-(20 + visualWidth / 2), -(visualY + visualHeight / 2))
    }

    ctx.fillStyle = '#8a8a9a'
    ctx.font = '11px "Courier New", monospace'
    ctx.fillText(String(card.number).padStart(2, '0'), 30, visualY + 20)
    ctx.font = '13px sans-serif'
    ctx.fillText(category.icon, cardWidth - 40, visualY + 20)

    ctx.fillStyle = rarity.color
    ctx.font = 'bold 42px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(card.symbol, 20 + visualWidth / 2, visualY + 65)

    ctx.font = 'bold 13px "Courier New", monospace'
    ctx.fillText(card.name, 20 + visualWidth / 2, visualY + 88)

    ctx.font = '9px "Courier New", monospace'
    const tagText = `${rarity.label} · ${result.isReversed ? '逆位' : '正位'}`
    const tagWidth = ctx.measureText(tagText).width + 16
    ctx.fillStyle = hexToRgba(rarity.glow || rarity.color, 0.25)
    roundRect(ctx, 20 + visualWidth / 2 - tagWidth / 2, visualY + visualHeight - 22, tagWidth, 18, 4)
    ctx.fill()
    ctx.fillStyle = rarity.color
    ctx.fillText(tagText, 20 + visualWidth / 2, visualY + visualHeight - 9)
    ctx.textAlign = 'left'

    if (result.isReversed) {
      ctx.restore()
    }

    y = visualY + visualHeight + 10

    ctx.fillStyle = colors.primary
    ctx.font = '11px "Courier New", monospace'
    ctx.fillText(`📝 ${result.reading.title}`, 20, y + 14)
    y += 22

    ctx.fillStyle = '#ffd54f'
    ctx.font = '11px "Courier New", monospace'
    ctx.fillText(result.reading.fortune, 20, y + 14)
    y += 24

    if (index < results.length - 1) {
      y += gap
    }
  })

  if (results.length > 1) {
    const reversedCount = results.filter(r => r.isReversed).length
    const uprightCount = results.length - reversedCount
    y += gap

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    roundRect(ctx, 20, y, cardWidth - 40, statsHeight - 10, 10)
    ctx.fill()

    const centerY = y + (statsHeight - 10) / 2
    const colWidth = (cardWidth - 40) / 3

    ctx.textAlign = 'center'
    ctx.fillStyle = colors.primary
    ctx.font = 'bold 20px "Courier New", monospace'
    ctx.fillText(uprightCount, 20 + colWidth / 2, centerY + 2)
    ctx.fillStyle = '#8a8a9a'
    ctx.font = '10px "Courier New", monospace'
    ctx.fillText('正位', 20 + colWidth / 2, centerY + 18)

    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(20 + colWidth, y + 10)
    ctx.lineTo(20 + colWidth, y + statsHeight - 20)
    ctx.stroke()

    ctx.fillStyle = '#ff5252'
    ctx.font = 'bold 20px "Courier New", monospace'
    ctx.fillText(reversedCount, 20 + colWidth + colWidth / 2, centerY + 2)
    ctx.fillStyle = '#8a8a9a'
    ctx.font = '10px "Courier New", monospace'
    ctx.fillText('逆位', 20 + colWidth + colWidth / 2, centerY + 18)

    ctx.beginPath()
    ctx.moveTo(20 + colWidth * 2, y + 10)
    ctx.lineTo(20 + colWidth * 2, y + statsHeight - 20)
    ctx.stroke()

    ctx.fillStyle = colors.secondary
    ctx.font = 'bold 20px "Courier New", monospace'
    ctx.fillText(results.length, 20 + colWidth * 2 + colWidth / 2, centerY + 2)
    ctx.fillStyle = '#8a8a9a'
    ctx.font = '10px "Courier New", monospace'
    ctx.fillText('总计', 20 + colWidth * 2 + colWidth / 2, centerY + 18)

    ctx.textAlign = 'left'
    y += statsHeight
  }

  y += 20
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(20, y)
  ctx.lineTo(cardWidth - 20, y)
  ctx.stroke()
  ctx.setLineDash([])

  y += 15
  ctx.textAlign = 'center'
  ctx.fillStyle = colors.secondary
  ctx.font = '11px "Courier New", monospace'
  ctx.fillText('✨ 命运数据流 · 连接未来 ✨', cardWidth / 2, y + 12)
  y += 18
  ctx.fillStyle = '#6a6a7a'
  ctx.font = '10px "Courier New", monospace'
  ctx.fillText('🔗 Cyber Divination System', cardWidth / 2, y + 12)

  return canvas.toDataURL('image/png')
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function hexToRgba(hex, alpha) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return `rgba(224, 64, 251, ${alpha})`
  }
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

export async function downloadShareImage(results, options = {}) {
  const dataUrl = await generateShareImage(results, options)
  const timestamp = options.timestamp || Date.now()
  const filename = `塔罗占卜_${new Date(timestamp).toISOString().slice(0, 10)}_${Math.random().toString(36).slice(2, 6)}.png`

  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  return { dataUrl, filename }
}
