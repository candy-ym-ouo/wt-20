<script>
  import { onMount } from 'svelte'
  import { Storage } from '../utils/storage.js'
  import { getCardById } from '../utils/cardSystem.js'
  import CardDisplay from '../components/CardDisplay.svelte'
  import ResultModal from '../components/ResultModal.svelte'
  import ShareModal from '../components/ShareModal.svelte'
  import { THEME_CONFIG, MULTI_SPREAD_CONFIG } from '../data/constants.js'
  import { buildShareDataFromRecord } from '../utils/shareSystem.js'

  export let initialTab = 'divination'

  let activeTab = initialTab
  let history = []
  let dailyHistory = []
  let themeHistory = []
  let spreadHistory = []
  let selectedRecord = null
  let selectedCustomTitle = null
  let selectedSpreadConfig = null
  let showDetail = false
  let showShare = false
  let currentShareData = null

  function refresh() {
    const raw = Storage.getDrawHistory()
    history = raw.map(record => {
      if (record.spreadType === 'single') {
        return {
          ...record,
          _card: getCardById(record.cardId)
        }
      } else if (record.spreadType === 'three') {
        return {
          ...record,
          _cards: record.cards.map(c => ({
            ...c,
            _card: getCardById(c.cardId)
          }))
        }
      }
      return record
    })

    const dailyRaw = Storage.getDailyFortuneHistory()
    dailyHistory = dailyRaw.map(record => ({
      ...record,
      _card: getCardById(record.cardId)
    }))

    const themeRaw = Storage.getThemeDivinationHistory()
    themeHistory = themeRaw.map(record => ({
      ...record,
      _theme: THEME_CONFIG[record.theme],
      _cards: record.cards.map(c => ({
        ...c,
        _card: getCardById(c.cardId)
      }))
    }))

    const spreadRaw = Storage.getMultiSpreadHistory()
    spreadHistory = spreadRaw.map(record => ({
      ...record,
      _spread: MULTI_SPREAD_CONFIG[record.spreadId],
      _cards: record.cards.map(c => ({
        ...c,
        _card: getCardById(c.cardId)
      }))
    }))
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatDateStr(dateStr) {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      })
    } catch {
      return dateStr
    }
  }

  function openDivinationRecord(record) {
    selectedCustomTitle = null
    if (record.spreadType === 'single') {
      const card = getCardById(record.cardId)
      if (!card) return
      selectedRecord = [{
        card,
        isReversed: record.isReversed,
        reading: record.isReversed ? card.reversed : card.upright
      }]
    } else if (record.spreadType === 'three') {
      selectedRecord = record.cards.map(c => {
        const card = getCardById(c.cardId)
        return {
          card,
          isReversed: c.isReversed,
          position: c.position,
          reading: c.isReversed ? card.reversed : card.upright
        }
      })
    }
    showDetail = true
  }

  function openDailyRecord(record) {
    selectedCustomTitle = null
    const card = getCardById(record.cardId)
    if (!card) return
    selectedRecord = [{
      card,
      isReversed: record.isReversed,
      reading: {
        title: record.title,
        meaning: record.meaning,
        advice: record.advice,
        fortune: record.fortune
      }
    }]
    showDetail = true
  }

  function closeDetail() {
    showDetail = false
    selectedRecord = null
    selectedCustomTitle = null
    selectedSpreadConfig = null
  }

  function clearHistory() {
    if (activeTab === 'divination') {
      if (confirm('确定要清空所有占卜历史记录吗？此操作不可撤销。')) {
        Storage.clearDrawHistory()
        refresh()
      }
    } else if (activeTab === 'daily') {
      if (confirm('确定要清空所有每日签历史记录吗？此操作不可撤销。')) {
        Storage.clearDailyFortuneHistory()
        refresh()
      }
    } else if (activeTab === 'theme') {
      if (confirm('确定要清空所有主题占卜历史记录吗？此操作不可撤销。')) {
        Storage.clearThemeDivinationHistory()
        refresh()
      }
    } else if (activeTab === 'spread') {
      if (confirm('确定要清空所有牌阵历史记录吗？此操作不可撤销。')) {
        Storage.clearMultiSpreadHistory()
        refresh()
      }
    }
  }

  function goToDaily() {
    const event = new CustomEvent('navigate', { detail: 'daily' })
    window.dispatchEvent(event)
  }

  function goToDivination() {
    const event = new CustomEvent('navigate', { detail: 'divination' })
    window.dispatchEvent(event)
  }

  function goToReview() {
    const event = new CustomEvent('navigate', { detail: 'review' })
    window.dispatchEvent(event)
  }

  function openShareFromRecord(record, recordType) {
    const shareData = buildShareDataFromRecord(record, recordType)
    if (!shareData) return
    currentShareData = shareData
    showShare = true
  }

  function closeShare() {
    showShare = false
    currentShareData = null
  }

  function openThemeRecord(record) {
    const theme = record._theme || THEME_CONFIG[record.theme]
    const spreadName = theme?.spreadTypes?.find(s => s.id === record.spreadTypeId)?.name || `${record.cards.length}牌阵`
    
    if (theme) {
      selectedCustomTitle = `◆ ${theme.icon} ${theme.name} · ${spreadName} ◆`
    } else {
      selectedCustomTitle = null
    }

    selectedSpreadConfig = null
    
    selectedRecord = record._cards.map(c => {
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
    showDetail = true
  }

  function openSpreadRecord(record) {
    const spread = record._spread || MULTI_SPREAD_CONFIG[record.spreadId]
    
    if (spread) {
      selectedCustomTitle = `◆ ${spread.icon} ${spread.name} ◆`
      selectedSpreadConfig = spread
    } else {
      selectedCustomTitle = null
      selectedSpreadConfig = null
    }
    
    selectedRecord = record._cards.map(c => {
      const card = getCardById(c.cardId)
      return {
        card,
        isReversed: c.isReversed,
        position: c.position,
        positionId: c.positionId,
        positionDesc: c.positionDesc,
        reading: {
          title: c.title,
          meaning: c.meaning,
          advice: c.advice,
          fortune: c.fortune
        }
      }
    })
    showDetail = true
  }

  function goToSpreads() {
    const event = new CustomEvent('navigate', { detail: 'spreads' })
    window.dispatchEvent(event)
  }

  onMount(() => {
    refresh()
  })
</script>

<div class="header-actions">
  <h1 class="page-title" style="flex:1; text-align: left; margin: 0; font-size: 18px;">◆ 历 史 记 录 ◆</h1>
  <button class="btn icon-btn" on:click={goToReview} title="数据回顾">
    📊
  </button>
  {#if (activeTab === 'divination' && history.length > 0) || (activeTab === 'daily' && dailyHistory.length > 0) || (activeTab === 'theme' && themeHistory.length > 0) || (activeTab === 'spread' && spreadHistory.length > 0)}
    <button class="btn icon-btn" on:click={clearHistory} title="清空历史">
      🗑️
    </button>
  {/if}
</div>

<div class="tabs">
  <div class="tab {activeTab === 'divination' ? 'active' : ''}" on:click={() => (activeTab = 'divination')}>
    🎴 占卜记录
  </div>
  <div class="tab {activeTab === 'spread' ? 'active' : ''}" on:click={() => (activeTab = 'spread')}>
    ✚ 牌阵占卜
  </div>
  <div class="tab {activeTab === 'theme' ? 'active' : ''}" on:click={() => (activeTab = 'theme')}>
    🔮 主题占卜
  </div>
  <div class="tab {activeTab === 'daily' ? 'active' : ''}" on:click={() => (activeTab = 'daily')}>
    🎐 每日命运签
  </div>
</div>

{#if activeTab === 'divination'}
  {#if history.length === 0}
    <div class="empty-state">
      <div class="empty-state-icon">📜</div>
      <div class="empty-state-text">暂无占卜记录<br/>快去抽一张卡吧
      </div>
    </div>
  {:else}
    <div class="history-list">
      {#each history as record}
        <div class="history-item" on:click={() => openDivinationRecord(record)}>
          {#if record.spreadType === 'single' && record._card}
            <div class="history-symbol" style="color: var(--accent-cyan)">
              {record._card.symbol}
            </div>
            <div class="history-info">
              <div class="history-card-name">{record._card.name}</div>
              <div class="history-meta">
                <span class="badge badge-{record._card.rarity}">单张</span>
                {#if record.isReversed}
                  <span class="reversed">逆位</span>
                {/if}
              </div>
            </div>
          {:else}
            <div class="history-symbol" style="color: var(--accent-magenta)">🔮</div>
            <div class="history-info">
              <div class="history-card-name">三牌阵</div>
              <div class="history-meta">
                {#each record._cards || [] as c}
                  <span style="margin-right: 4px;">{c._card?.symbol || '?'}</span>
                {/each}
              </div>
            </div>
          {/if}
          <div class="history-actions">
            <button
              class="history-share-btn"
              on:click|stopPropagation={() => openShareFromRecord(record, 'divination')}
              title="分享"
            >
              📤
            </button>
            <div class="history-time mono">{formatTime(record.timestamp)}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
{:else if activeTab === 'spread'}
  {#if spreadHistory.length === 0}
    <div class="empty-state">
      <div class="empty-state-icon">✚</div>
      <div class="empty-state-text">暂无牌阵占卜记录<br/>
        <button class="btn btn-primary" style="margin-top: 16px; font-size: 12px;" on:click={goToSpreads}>
          ✚ 去进行牌阵占卜
        </button>
      </div>
    </div>
  {:else}
    <div class="history-list">
      {#each spreadHistory as record}
        <div
          class="history-item spread-item"
          style="--theme-color: {record._spread?.color || '#e040fb'}; --theme-glow: {record._spread?.glowColor || 'rgba(224, 64, 251, 0.3)'}"
          on:click={() => openSpreadRecord(record)}
        >
          <div class="history-symbol" style="color: var(--theme-color)">
            {record._spread?.icon || '✚'}
          </div>
          <div class="history-info">
            <div class="history-card-name">{record._spread?.name || '牌阵'}占卜</div>
            <div class="history-meta">
              <span class="badge" style="background: var(--theme-glow); color: var(--theme-color)">{record._cards.length}张牌</span>
              {#if record.question}
                <span class="question-preview">"{record.question}"</span>
              {/if}
            </div>
            <div class="history-cards">
              {#each record._cards as c, i}
                <span title="{c._card?.name || '未知'}" style="margin-right: 4px;">{c._card?.symbol || '?'}</span>
              {/each}
            </div>
          </div>
          <div class="history-actions">
            <button
              class="history-share-btn"
              on:click|stopPropagation={() => openShareFromRecord(record, 'spread')}
              title="分享"
            >
              📤
            </button>
            <div class="history-time mono">{formatTime(record.timestamp)}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
{:else if activeTab === 'theme'}
  {#if themeHistory.length === 0}
    <div class="empty-state">
      <div class="empty-state-icon">🔮</div>
      <div class="empty-state-text">暂无主题占卜记录<br/>
        <button class="btn btn-primary" style="margin-top: 16px; font-size: 12px;" on:click={goToDivination}>
          🔮 去进行主题占卜
        </button>
      </div>
    </div>
  {:else}
    <div class="history-list">
      {#each themeHistory as record}
        <div
          class="history-item theme-item"
          style="--theme-color: {record._theme?.color || '#00e5ff'}; --theme-glow: {record._theme?.glowColor || 'rgba(0, 229, 255, 0.3)'}"
          on:click={() => openThemeRecord(record)}
        >
          <div class="history-symbol" style="color: var(--theme-color)">
            {record._theme?.icon || '🔮'}
          </div>
          <div class="history-info">
            <div class="history-card-name">{record._theme?.name || '主题'}占卜</div>
            <div class="history-meta">
              <span class="badge" style="background: var(--theme-glow); color: var(--theme-color)">{record._cards.length}张牌</span>
              {#if record.question}
                <span class="question-preview">"{record.question}"</span>
              {/if}
            </div>
            <div class="history-cards">
              {#each record._cards as c, i}
                <span title="{c._card?.name || '未知'}" style="margin-right: 4px;">{c._card?.symbol || '?'}</span>
              {/each}
            </div>
          </div>
          <div class="history-actions">
            <button
              class="history-share-btn"
              on:click|stopPropagation={() => openShareFromRecord(record, 'theme')}
              title="分享"
            >
              📤
            </button>
            <div class="history-time mono">{formatTime(record.timestamp)}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
{:else}
  {#if dailyHistory.length === 0}
    <div class="empty-state">
      <div class="empty-state-icon">🎐</div>
      <div class="empty-state-text">暂无每日签记录<br/>
        <button class="btn btn-yellow" style="margin-top: 16px; font-size: 12px;" on:click={goToDaily}>
          🎴 去抽今日签
        </button>
      </div>
    </div>
  {:else}
    <div class="history-list">
      {#each dailyHistory as record}
        <div class="history-item daily-item" on:click={() => openDailyRecord(record)}>
          <div class="history-symbol" style="color: var(--accent-yellow)">
            {record._card?.symbol || '🎐'}
          </div>
          <div class="history-info">
            <div class="history-card-name">{record._card?.name || '命运签'}</div>
            <div class="history-meta">
              <span class="badge badge-daily">每日签</span>
              {#if record.isReversed}
                <span class="reversed">逆位</span>
              {/if}
              {#if record.consecutiveDays}
                <span class="consecutive-badge">🔥 {record.consecutiveDays}天</span>
              {/if}
            </div>
          </div>
          <div class="history-actions">
            <button
              class="history-share-btn"
              on:click|stopPropagation={() => openShareFromRecord(record, 'daily')}
              title="分享"
            >
              📤
            </button>
            <div class="history-time mono">{formatDateStr(record.date)}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
{/if}

{#if showDetail && selectedRecord}
  <ResultModal
    results={selectedRecord}
    spreadType={selectedSpreadConfig ? 'multi-spread' : (selectedCustomTitle ? 'theme' : (selectedRecord.length === 1 ? 'single' : 'three'))}
    spreadConfig={selectedSpreadConfig}
    customTitle={selectedCustomTitle}
    onClose={closeDetail}
    onDrawAgain={closeDetail}
  />
{/if}

{#if showShare && currentShareData}
  <ShareModal
    results={currentShareData.results}
    theme={currentShareData.theme}
    spreadName={currentShareData.spreadName}
    question={currentShareData.question}
    timestamp={currentShareData.timestamp}
    recordType={currentShareData.recordType}
    consecutiveDays={currentShareData.consecutiveDays}
    spreadId={currentShareData.spreadId}
    spreadConfig={currentShareData.spreadConfig}
    onClose={closeShare}
  />
{/if}

<style>
  .history-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .history-meta .reversed {
    color: var(--accent-red);
    font-size: 10px;
  }
  .badge-daily {
    background: rgba(255, 213, 79, 0.3);
    color: var(--accent-yellow);
  }
  .consecutive-badge {
    background: rgba(255, 82, 82, 0.2);
    color: var(--accent-red);
    padding: 2px 8px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.5px;
  }
  .daily-item {
    background: linear-gradient(135deg, rgba(255, 213, 79, 0.05), var(--bg-card));
    border-color: rgba(255, 213, 79, 0.2);
  }
  .daily-item:hover {
    border-color: var(--accent-yellow);
    background: linear-gradient(135deg, rgba(255, 213, 79, 0.1), var(--bg-card));
  }
  .theme-item {
    background: linear-gradient(135deg, var(--theme-glow), var(--bg-card));
    border-color: var(--theme-glow);
  }
  .theme-item:hover {
    border-color: var(--theme-color);
    background: linear-gradient(135deg, var(--theme-glow), var(--bg-card));
    box-shadow: 0 0 15px var(--theme-glow);
  }
  .spread-item {
    background: linear-gradient(135deg, var(--theme-glow), var(--bg-card));
    border-color: var(--theme-glow);
  }
  .spread-item:hover {
    border-color: var(--theme-color);
    background: linear-gradient(135deg, var(--theme-glow), var(--bg-card));
    box-shadow: 0 0 15px var(--theme-glow);
  }
  .question-preview {
    color: var(--text-secondary);
    font-size: 11px;
    font-style: italic;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .history-cards {
    margin-top: 4px;
    font-size: 14px;
  }
  .history-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
  .history-share-btn {
    background: rgba(255, 213, 79, 0.1);
    border: 1px solid rgba(255, 213, 79, 0.3);
    color: var(--accent-yellow);
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    transition: all 0.2s ease;
  }
  .history-share-btn:hover {
    background: rgba(255, 213, 79, 0.2);
    border-color: var(--accent-yellow);
    transform: scale(1.05);
  }
</style>
