<script>
  import { onMount } from 'svelte'
  import { Storage } from '../utils/storage.js'
  import { THEME_CONFIG } from '../data/constants.js'
  import {
    getAllRecordsForReview,
    generateReviewSummary,
    buildShareDataFromRecord,
    formatTimestamp,
    formatDateShort
  } from '../utils/shareSystem.js'
  import ShareModal from '../components/ShareModal.svelte'
  import ResultModal from '../components/ResultModal.svelte'
  import { getCardById } from '../utils/cardSystem.js'

  let dateRange = 'all'
  let allRecords = []
  let filteredRecords = []
  let summary = null
  let showShareModal = false
  let currentShareData = null
  let showDetailModal = false
  let detailResults = null
  let detailCustomTitle = null

  const RANGE_OPTIONS = [
    { id: '7d', label: '近 7 天', days: 7 },
    { id: '30d', label: '近 30 天', days: 30 },
    { id: 'all', label: '全部时间', days: null }
  ]

  onMount(() => {
    refresh()
  })

  function refresh() {
    allRecords = getAllRecordsForReview()
    applyDateFilter()
  }

  function applyDateFilter() {
    const now = Date.now()
    const rangeOption = RANGE_OPTIONS.find(r => r.id === dateRange)

    if (rangeOption?.days) {
      const cutoff = now - rangeOption.days * 86400000
      filteredRecords = allRecords.filter(r => (r.timestamp || 0) >= cutoff)
    } else {
      filteredRecords = [...allRecords]
    }

    summary = generateReviewSummary(filteredRecords)
  }

  $: if (dateRange) {
    applyDateFilter()
  }

  function getRecordTypeInfo(record) {
    const types = {
      daily: { icon: '🎐', label: '每日签', color: 'var(--accent-yellow)' },
      theme: { icon: '🔮', label: '主题占卜', color: 'var(--accent-magenta)' },
      divination: { icon: '🎴', label: '普通占卜', color: 'var(--accent-cyan)' }
    }
    return types[record._type] || types.divination
  }

  function getRecordTitle(record) {
    const cardIds = getRecordCardIds(record)
    const cardNames = cardIds
      .slice(0, 3)
      .map(id => {
        const card = getCardById(id)
        return card ? `${card.symbol}${card.name}` : '?'
      })
    const extra = cardIds.length > 3 ? ` +${cardIds.length - 3}` : ''
    return cardNames.join('、') + extra
  }

  function getRecordCardIds(record) {
    if (record._type === 'daily') return [record.cardId]
    if (record._type === 'theme') return (record.cards || []).map(c => c.cardId)
    if (record._type === 'divination') {
      if (record.spreadType === 'single') return [record.cardId]
      return (record.cards || []).map(c => c.cardId)
    }
    return []
  }

  function openShare(record) {
    const shareData = buildShareDataFromRecord(record, record._type)
    if (!shareData) return
    currentShareData = shareData
    showShareModal = true
  }

  function openDetail(record) {
    if (record._type === 'daily') {
      const card = getCardById(record.cardId)
      if (!card) return
      detailResults = [{
        card,
        isReversed: record.isReversed,
        reading: {
          title: record.title,
          meaning: record.meaning,
          advice: record.advice,
          fortune: record.fortune
        }
      }]
      detailCustomTitle = '◆ 🎐 每日命运签 ◆'
    } else if (record._type === 'theme') {
      const themeConfig = THEME_CONFIG[record.theme]
      const spreadName = themeConfig?.spreadTypes?.find(s => s.id === record.spreadTypeId)?.name || `${record.cards.length}牌阵`
      detailResults = record.cards.map(c => {
        const card = getCardById(c.cardId)
        return {
          card,
          isReversed: c.isReversed,
          position: c.position,
          reading: {
            title: c.title,
            meaning: c.meaning,
            advice: c.advice,
            fortune: c.fortune
          }
        }
      })
      detailCustomTitle = themeConfig
        ? `◆ ${themeConfig.icon} ${themeConfig.name} · ${spreadName} ◆`
        : null
    } else {
      if (record.spreadType === 'single') {
        const card = getCardById(record.cardId)
        if (!card) return
        const reading = record.isReversed ? card.reversed : card.upright
        detailResults = [{
          card,
          isReversed: record.isReversed,
          reading
        }]
        detailCustomTitle = '◆ 占 卜 结 果 ◆'
      } else {
        detailResults = record.cards.map(c => {
          const card = getCardById(c.cardId)
          const reading = c.isReversed ? card.reversed : card.upright
          return {
            card,
            isReversed: c.isReversed,
            position: c.position,
            reading
          }
        })
        detailCustomTitle = '◆ 三 牌 阵 结 果 ◆'
      }
    }
    showDetailModal = true
  }

  function closeShare() {
    showShareModal = false
    currentShareData = null
  }

  function closeDetail() {
    showDetailModal = false
    detailResults = null
    detailCustomTitle = null
  }

  function goToHistory() {
    const event = new CustomEvent('navigate', { detail: 'history' })
    window.dispatchEvent(event)
  }

  function formatRelativeTime(timestamp) {
    if (!timestamp) return ''
    const now = Date.now()
    const diff = now - timestamp
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    return formatDateShort(timestamp)
  }

  const RECORD_TYPES_STATS = [
    { key: 'dailyCount', label: '每日签', icon: '🎐', color: 'var(--accent-yellow)' },
    { key: 'themeCount', label: '主题占卜', icon: '🔮', color: 'var(--accent-magenta)' },
    { key: 'divinationCount', label: '普通占卜', icon: '🎴', color: 'var(--accent-cyan)' }
  ]
</script>

<h1 class="page-title">◆ 命 运 回 顾 ◆</h1>

<div class="review-controls">
  <div class="range-selector">
    {#each RANGE_OPTIONS as opt}
      <div
        class="range-btn {dateRange === opt.id ? 'active' : ''}"
        on:click={() => { dateRange = opt.id; applyDateFilter() }}
      >
        {opt.label}
      </div>
    {/each}
  </div>
  <button class="btn icon-btn" on:click={goToHistory} title="查看详细历史">
    📜
  </button>
</div>

{#if summary}
  <div class="summary-section">
    <div class="summary-card main-summary">
      <div class="summary-main-icon glow-magenta">📊</div>
      <div class="summary-main-text">
        <div class="summary-value">{summary.totalCount}</div>
        <div class="summary-label">总占卜次数</div>
      </div>
    </div>

    <div class="summary-types">
      {#each RECORD_TYPES_STATS as stat}
        <div class="type-stat" style="--stat-color: {stat.color};">
          <div class="type-stat-icon">{stat.icon}</div>
          <div class="type-stat-value" style="color: var(--stat-color)">{summary[stat.key]}</div>
          <div class="type-stat-label">{stat.label}</div>
        </div>
      {/each}
    </div>

    {#if summary.dateRange?.start}
      <div class="summary-daterange mono">
      📅 {formatDateShort(summary.dateRange.start)}
      {#if summary.dateRange.end && summary.dateRange.end !== summary.dateRange.start}
        ~ {formatDateShort(summary.dateRange.end)}
      {/if}
    </div>
    {/if}
  </div>

  {#if summary.mostCommonCards && summary.mostCommonCards.length > 0}
    <div class="section-title">🔥 高频卡牌 Top {summary.mostCommonCards.length}</div>
    <div class="top-cards">
      {#each summary.mostCommonCards as item}
        <div class="top-card" style="--card-color: var(--accent-cyan)">
          <div class="top-card-symbol">{item.card?.symbol || '?'}</div>
          <div class="top-card-name">{item.card?.name || '未知'}</div>
          <div class="top-card-count" style="color: var(--card-color)">× {item.count}</div>
        </div>
      {/each}
    </div>
  {/if}

  {#if Object.keys(summary.themeBreakdown).length > 0}
    <div class="section-title">📊 主题分布</div>
    <div class="theme-breakdown">
      {#each Object.entries(summary.themeBreakdown) as [themeId, count]}
        {@const tc = THEME_CONFIG[themeId]}
        <div class="theme-breakdown-item" style="--theme-color: {tc?.color || '#e040fb'}">
          <div class="tb-icon">{tc?.icon || '🔮'}</div>
          <div class="tb-info">
            <div class="tb-name" style="color: var(--theme-color)">{tc?.name || themeId}</div>
            <div class="tb-bar">
              <div
              class="tb-bar-fill"
              style="width: {Math.min(100, (count / summary.themeCount) * 100)}%; background: var(--theme-color);"
            ></div>
          </div>
          </div>
          <div class="tb-count">{count} 次</div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="section-title">
    🕐 时间线回顾
    <span class="section-count">({filteredRecords.length} 条记录</span>
  </div>

  {#if filteredRecords.length === 0}
    <div class="empty-state">
      <div class="empty-state-icon">🌟</div>
      <div class="empty-state-text">
        暂无占卜记录<br/>
        <button
          class="btn btn-primary"
          style="margin-top: 16px; font-size: 12px;"
          on:click={goToHistory}
        >
          🔮 去占卜
        </button>
      </div>
    </div>
  {:else}
    <div class="timeline">
      {#each filteredRecords as record, index}
        {@const typeInfo = getRecordTypeInfo(record)}
        <div class="timeline-item" class:first={index === 0}>
          <div class="timeline-dot" style="background: {typeInfo.color}">
            {typeInfo.icon}
          </div>
          <div class="timeline-line" style="background: linear-gradient(to bottom, {typeInfo.color}, transparent);"></div>
          <div class="timeline-content">
            <div class="timeline-card" on:click={() => openDetail(record)}>
              <div class="tc-header">
                <div class="tc-type" style="color: {typeInfo.color}">
                  {typeInfo.icon} {typeInfo.label}
                </div>
                <div class="tc-time mono">{formatRelativeTime(record.timestamp)}</div>
              </div>
              <div class="tc-title">{getRecordTitle(record)}</div>
              {#if record._type === 'theme' && record.question}
                <div class="tc-question">💭 {record.question}</div>
              {/if}
              <div class="tc-footer">
                <div class="tc-timestamp mono">{formatTimestamp(record.timestamp)}</div>
                <button
                  class="tc-share-btn"
                  on:click|stopPropagation={() => openShare(record)}
                >
                  📤 分享
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
{/if}

{#if showShareModal && currentShareData}
  <ShareModal
    results={currentShareData.results}
    theme={currentShareData.theme}
    spreadName={currentShareData.spreadName}
    question={currentShareData.question}
    timestamp={currentShareData.timestamp}
    recordType={currentShareData.recordType}
    consecutiveDays={currentShareData.consecutiveDays}
    onClose={closeShare}
  />
{/if}

{#if showDetailModal && detailResults}
  <ResultModal
    results={detailResults}
    spreadType="theme"
    customTitle={detailCustomTitle}
    onClose={closeDetail}
    onDrawAgain={closeDetail}
  />
{/if}

<style>
  .review-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 10px;
  }

  .range-selector {
    display: flex;
    gap: 0;
    background: var(--bg-secondary);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border-glow);
  }

  .range-btn {
    padding: 8px 14px;
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--text-dim);
    cursor: pointer;
    transition: all 0.2s;
    border-right: 1px solid var(--border-glow);
  }

  .range-btn:last-child {
    border-right: none;
  }

  .range-btn:hover {
    color: var(--text-secondary);
    background: rgba(0, 0, 0, 0.2);
  }

  .range-btn.active {
    color: var(--accent-cyan);
    background: rgba(0, 229, 255, 0.1);
    box-shadow: inset 0 -2px 0 var(--accent-cyan);
  }

  .summary-section {
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.08), rgba(0, 229, 255, 0.08));
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 18px;
    margin-bottom: 20px;
  }

  .main-summary {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px dashed var(--border-glow);
  }

  .summary-main-icon {
    font-size: 48px;
    animation: float 3s ease-in-out infinite;
  }

  .summary-main-text {
    flex: 1;
  }

  .summary-value {
    font-family: var(--font-mono);
    font-size: 36px;
    font-weight: bold;
    color: var(--accent-magenta);
    text-shadow: 0 0 15px var(--accent-magenta);
    line-height: 1;
  }

  .summary-label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .summary-types {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .type-stat {
    text-align: center;
    padding: 12px 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--stat-color) 30%, transparent);
  }

  .type-stat-icon {
    font-size: 24px;
    margin-bottom: 6px;
  }

  .type-stat-value {
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: bold;
    text-shadow: 0 0 10px currentColor;
  }

  .type-stat-label {
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 2px;
  }

  .summary-daterange {
    text-align: center;
    font-size: 11px;
    color: var(--text-dim);
    padding-top: 12px;
    border-top: 1px dashed var(--border-glow);
  }

  .section-title {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--accent-cyan);
    margin: 20px 0 12px;
    padding-left: 10px;
    border-left: 3px solid var(--accent-cyan);
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-count {
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0;
  }

  .top-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
    margin-bottom: 8px;
  }

  .top-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 14px 10px;
    text-align: center;
    transition: all 0.2s;
  }

  .top-card:hover {
    border-color: var(--card-color);
    box-shadow: 0 0 15px color-mix(in srgb, var(--card-color) 20%, transparent);
    transform: translateY(-2px);
  }

  .top-card-symbol {
    font-size: 32px;
    margin-bottom: 6px;
  }

  .top-card-name {
    font-size: 11px;
    color: var(--text-primary);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .top-card-count {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: bold;
    text-shadow: 0 0 6px currentColor;
  }

  .theme-breakdown {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 8px;
  }

  .theme-breakdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
  }

  .tb-icon {
    font-size: 28px;
    flex-shrink: 0;
  }

  .tb-info {
    flex: 1;
    min-width: 0;
  }

  .tb-name {
    font-size: 13px;
    font-family: var(--font-mono);
    margin-bottom: 6px;
  }

  .tb-bar {
    height: 6px;
    background: var(--bg-secondary);
    border-radius: 3px;
    overflow: hidden;
  }

  .tb-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
    box-shadow: 0 0 8px currentColor;
  }

  .tb-count {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--text-dim);
    flex-shrink: 0;
  }

  .timeline {
    position: relative;
    padding-left: 36px;
  }

  .timeline-item {
    position: relative;
    padding-bottom: 20px;
  }

  .timeline-item:last-child {
    padding-bottom: 0;
  }

  .timeline-dot {
    position: absolute;
    left: -36px;
    top: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    z-index: 2;
    box-shadow: 0 0 12px currentColor;
  }

  .timeline-line {
    position: absolute;
    left: -22px;
    top: 28px;
    width: 2px;
    bottom: 0;
  }

  .timeline-item:last-child .timeline-line {
    display: none;
  }

  .timeline-content {
    animation: fade-in 0.3s ease backwards;
  }

  .timeline-item:nth-child(1) .timeline-content { animation-delay: 0s; }
  .timeline-item:nth-child(2) .timeline-content { animation-delay: 0.05s; }
  .timeline-item:nth-child(3) .timeline-content { animation-delay: 0.1s; }
  .timeline-item:nth-child(4) .timeline-content { animation-delay: 0.15s; }
  .timeline-item:nth-child(5) .timeline-content { animation-delay: 0.2s; }

  .timeline-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .timeline-card:hover {
    border-color: var(--accent-cyan);
    background: rgba(0, 229, 255, 0.03);
    transform: translateX(4px);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.1);
  }

  .tc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .tc-type {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  .tc-time {
    font-size: 11px;
    color: var(--text-dim);
  }

  .tc-title {
    font-size: 13px;
    color: var(--text-primary);
    margin-bottom: 6px;
    line-height: 1.5;
  }

  .tc-question {
    font-size: 12px;
    color: var(--text-secondary);
    font-style: italic;
    padding: 6px 10px;
    background: rgba(0, 229, 255, 0.05);
    border-left: 2px solid var(--accent-magenta);
    border-radius: 0 6px 6px 0;
    margin-bottom: 8px;
  }

  .tc-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px dashed var(--border-glow);
  }

  .tc-timestamp {
    font-size: 10px;
    color: var(--text-dim);
  }

  .tc-share-btn {
    padding: 4px 10px;
    font-size: 11px;
    font-family: var(--font-mono);
    background: rgba(224, 64, 251, 0.15);
    color: var(--accent-magenta);
    border: 1px solid var(--accent-magenta);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tc-share-btn:hover {
    background: rgba(224, 64, 251, 0.3);
    box-shadow: 0 0 12px rgba(224, 64, 251, 0.3);
  }
</style>
