<script>
  import { onMount, onDestroy } from 'svelte'
  import { Storage } from '../utils/storage.js'
  import { getCardById } from '../utils/cardSystem.js'
  import CardDisplay from '../components/CardDisplay.svelte'
  import ResultModal from '../components/ResultModal.svelte'
  import ShareModal from '../components/ShareModal.svelte'
  import { THEME_CONFIG, MULTI_SPREAD_CONFIG } from '../data/constants.js'
  import { buildShareDataFromRecord } from '../utils/shareSystem.js'
  import { getAllThemePacks, isPackUnlocked } from '../utils/themePackSystem.js'
  import { getThemePack, THEME_PACK_IDS } from '../data/themePacks.js'

  export let initialTab = 'divination'

  let activeTab = initialTab
  let history = []
  let dailyHistory = []
  let themeHistory = []
  let spreadHistory = []
  let qdHistory = []
  let selectedRecord = null
  let selectedCustomTitle = null
  let selectedSpreadConfig = null
  let showDetail = false
  let showShare = false
  let currentShareData = null
  let currentQuestionContext = null
  let currentRecordId = null
  let currentInterpretation = null
  let activePackFilter = 'all'
  let packs = []
  let removePackListener

  function refreshPacks() {
    packs = getAllThemePacks().filter(p => isPackUnlocked(p.id))
  }

  function getPackInfo(packId) {
    if (!packId) {
      return { id: THEME_PACK_IDS.CORE, name: '核心卡包', icon: '🎴', color: '#00e5ff' }
    }
    const pack = getThemePack(packId)
    return pack || { id: packId, name: packId, icon: '🎴', color: '#888' }
  }

  function filterByPack(records, packId) {
    if (packId === 'all') return records
    return records.filter(r => {
      const recordPackId = r.packId || THEME_PACK_IDS.CORE
      return recordPackId === packId
    })
  }

  $: filteredHistory = filterByPack(history, activePackFilter)
  $: filteredDailyHistory = filterByPack(dailyHistory, activePackFilter)
  $: filteredThemeHistory = filterByPack(themeHistory, activePackFilter)
  $: filteredSpreadHistory = filterByPack(spreadHistory, activePackFilter)
  $: filteredQdHistory = filterByPack(qdHistory, activePackFilter)

  function refresh() {
    const raw = Storage.getDrawHistory()
    history = raw.map(record => {
      if (record.spreadType === 'single') {
        return {
          ...record,
          _card: getCardById(record.cardId),
          _pack: getPackInfo(record.packId)
        }
      } else if (record.spreadType === 'three') {
        return {
          ...record,
          _cards: record.cards.map(c => ({
            ...c,
            _card: getCardById(c.cardId)
          })),
          _pack: getPackInfo(record.packId)
        }
      }
      return { ...record, _pack: getPackInfo(record.packId) }
    })

    const dailyRaw = Storage.getDailyFortuneHistory()
    dailyHistory = dailyRaw.map(record => ({
      ...record,
      _card: getCardById(record.cardId),
      _pack: getPackInfo(record.packId)
    }))

    const themeRaw = Storage.getThemeDivinationHistory()
    themeHistory = themeRaw.map(record => ({
      ...record,
      _theme: THEME_CONFIG[record.theme],
      _cards: record.cards.map(c => ({
        ...c,
        _card: getCardById(c.cardId)
      })),
      _pack: getPackInfo(record.packId)
    }))

    const spreadRaw = Storage.getMultiSpreadHistory()
    spreadHistory = spreadRaw.map(record => ({
      ...record,
      _spread: MULTI_SPREAD_CONFIG[record.spreadId],
      _cards: record.cards.map(c => ({
        ...c,
        _card: getCardById(c.cardId)
      })),
      _pack: getPackInfo(record.packId)
    }))

    const qdRaw = Storage.getQuestionDrivenHistory()
    qdHistory = qdRaw.map(record => ({
      ...record,
      _cards: record.cards.map(c => ({
        ...c,
        _card: getCardById(c.cardId)
      })),
      _pack: getPackInfo(record.packId)
    }))
  }

  function handlePackChanged() {
    refreshPacks()
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

  function hasPity(pityInfo) {
    return pityInfo && (pityInfo.triggered || pityInfo.pityCount || pityInfo.type)
  }

  function getPityBadgeText(pityInfo) {
    if (!pityInfo) return ''
    if (pityInfo.type === 'hard') return '🛡️硬保底'
    if (pityInfo.type === 'soft') return '🛡️软保底'
    return ''
  }

  function openDivinationRecord(record) {
    selectedCustomTitle = null
    if (record.spreadType === 'single') {
      const card = getCardById(record.cardId)
      if (!card) return
      selectedRecord = [{
        card,
        isReversed: record.isReversed,
        reading: record.isReversed ? card.reversed : card.upright,
        pityInfo: record.pityInfo || null
      }]
    } else if (record.spreadType === 'three') {
      selectedRecord = record.cards.map(c => {
        const card = getCardById(c.cardId)
        return {
          card,
          isReversed: c.isReversed,
          position: c.position,
          reading: c.isReversed ? card.reversed : card.upright,
          pityInfo: c.pityInfo || null
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
      },
      pityInfo: record.pityInfo || null
    }]
    showDetail = true
  }

  function closeDetail() {
    showDetail = false
    selectedRecord = null
    selectedCustomTitle = null
    selectedSpreadConfig = null
    currentQuestionContext = null
    currentRecordId = null
    currentInterpretation = null
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
    } else if (activeTab === 'question-driven') {
      if (confirm('确定要清空所有问题占卜历史记录吗？此操作不可撤销。')) {
        Storage.clearQuestionDrivenHistory()
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

  function goToQuestionDriven() {
    const event = new CustomEvent('navigate', { detail: 'question-driven' })
    window.dispatchEvent(event)
  }

  function openQDRecord(record) {
    const spreadMeta = record.spreadMeta || {}
    selectedCustomTitle = `◆ ${spreadMeta.icon || '🎴'} ${spreadMeta.name || '问题占卜'} ◆`
    currentRecordId = record.id
    currentInterpretation = record.userInterpretation || null

    if (spreadMeta.type === 'multi-spread' && spreadMeta.spreadId) {
      selectedSpreadConfig = MULTI_SPREAD_CONFIG[spreadMeta.spreadId] || null
    } else {
      selectedSpreadConfig = null
    }

    currentQuestionContext = {
      question: record.questionContext?.question,
      context: record.questionContext?.context,
      urgency: record.questionContext?.urgency,
      category: record.questionContext?.categoryAnalysis?.category
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

  onMount(() => {
    refresh()
    refreshPacks()
    removePackListener = handlePackChanged
    window.addEventListener('packChanged', removePackListener)
  })

  onDestroy(() => {
    if (removePackListener) {
      window.removeEventListener('packChanged', removePackListener)
    }
  })
</script>

<div class="header-actions">
  <h1 class="page-title" style="flex:1; text-align: left; margin: 0; font-size: 18px;">◆ 历 史 记 录 ◆</h1>
  <button class="btn icon-btn" on:click={goToReview} title="数据回顾">
    📊
  </button>
  {#if (activeTab === 'divination' && filteredHistory.length > 0) || (activeTab === 'daily' && filteredDailyHistory.length > 0) || (activeTab === 'theme' && filteredThemeHistory.length > 0) || (activeTab === 'spread' && filteredSpreadHistory.length > 0) || (activeTab === 'question-driven' && filteredQdHistory.length > 0)}
    <button class="btn icon-btn" on:click={clearHistory} title="清空历史">
      🗑️
    </button>
  {/if}
</div>

<div class="pack-filter-bar">
  <button 
    class="pack-chip {activePackFilter === 'all' ? 'active' : ''}"
    on:click={() => activePackFilter = 'all'}
  >
    📚 全部卡包
  </button>
  {#each packs as pack}
    <button 
      class="pack-chip {activePackFilter === pack.id ? 'active' : ''}"
      style="--pack-color: {pack.color}"
      on:click={() => activePackFilter = pack.id}
    >
      <span class="chip-icon">{pack.icon}</span>
      <span>{pack.name}</span>
    </button>
  {/each}
</div>

<div class="tabs">
  <div class="tab {activeTab === 'divination' ? 'active' : ''}" on:click={() => (activeTab = 'divination')}>
    🎴 占卜记录
  </div>
  <div class="tab {activeTab === 'question-driven' ? 'active' : ''}" on:click={() => (activeTab = 'question-driven')}>
    💬 问题占卜
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
  {#if filteredHistory.length === 0}
    <div class="empty-state">
      <div class="empty-state-icon">📜</div>
      <div class="empty-state-text">暂无占卜记录<br/>快去抽一张卡吧
      </div>
    </div>
  {:else}
    <div class="history-list">
      {#each filteredHistory as record}
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
                {#if hasPity(record.pityInfo)}
                  <span class="pity-history-badge pity-{record.pityInfo?.type || 'soft'}">
                    {getPityBadgeText(record.pityInfo)}
                  </span>
                {/if}
                {#if record._pack}
                  <span 
                    class="pack-badge" 
                    style="background: {record._pack.color + '22'}; color: {record._pack.color}"
                  >
                    {record._pack.icon} {record._pack.name}
                  </span>
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
                {#if (record._cards || []).some(c => hasPity(c.pityInfo))}
                  {#each record._cards || [] as c}
                    {#if hasPity(c.pityInfo)}
                      <span class="pity-history-badge pity-{c.pityInfo?.type || 'soft'}">
                        {getPityBadgeText(c.pityInfo)}
                      </span>
                    {/if}
                  {/each}
                {/if}
                {#if record._pack}
                  <span 
                    class="pack-badge" 
                    style="background: {record._pack.color + '22'}; color: {record._pack.color}"
                  >
                    {record._pack.icon} {record._pack.name}
                  </span>
                {/if}
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
{:else if activeTab === 'question-driven'}
  {#if filteredQdHistory.length === 0}
    <div class="empty-state">
      <div class="empty-state-icon">💬</div>
      <div class="empty-state-text">暂无问题占卜记录<br/>
        <button class="btn btn-primary" style="margin-top: 16px; font-size: 12px;" on:click={goToQuestionDriven}>
          💬 去进行问题驱动占卜
        </button>
      </div>
    </div>
  {:else}
    <div class="history-list">
      {#each filteredQdHistory as record}
        <div
          class="history-item qd-item"
          style="--theme-color: {record.spreadMeta?.color || '#00e5ff'}; --theme-glow: {(record.spreadMeta?.color || '#00e5ff') + '33'}"
          on:click={() => openQDRecord(record)}
        >
          <div class="history-symbol" style="color: var(--theme-color)">
            {record.questionContext?.categoryAnalysis?.category?.icon || record.spreadMeta?.icon || '💬'}
          </div>
          <div class="history-info">
            <div class="history-card-name">
              {record.spreadMeta?.name || '问题占卜'}
            </div>
            <div class="history-meta">
              {#if record.questionContext?.urgency}
                <span
                  class="urgency-badge"
                  style="background: {record.questionContext.urgency.color + '33'}; color: {record.questionContext.urgency.color}"
                >
                  {record.questionContext.urgency.icon} {record.questionContext.urgency.name}
                </span>
              {/if}
              <span class="badge" style="background: var(--theme-glow); color: var(--theme-color)">
                {record._cards.length}张牌
              </span>
              {#if record.userInterpretation}
                <span class="badge badge-interpreted" title="已写解读笔记">📖 已解读</span>
              {/if}
              {#if record._pack}
                <span 
                  class="pack-badge" 
                  style="background: {record._pack.color + '22'}; color: {record._pack.color}"
                >
                  {record._pack.icon}
                </span>
              {/if}
            </div>
            {#if record.questionContext?.question}
              <div class="question-preview">
                "{record.questionContext.question}"
              </div>
            {:else if record.questionContext?.context}
              <div class="question-preview">
                "{record.questionContext.context.slice(0, 50)}{record.questionContext.context.length > 50 ? '...' : ''}"
              </div>
            {/if}
            <div class="history-cards">
              {#each record._cards as c, i}
                <span title="{c._card?.name || '未知'}" style="margin-right: 4px;">{c._card?.symbol || '?'}</span>
              {/each}
            </div>
          </div>
          <div class="history-actions">
            <button
              class="history-share-btn"
              on:click|stopPropagation={() => openShareFromRecord(record, 'question-driven')}
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
  {#if filteredSpreadHistory.length === 0}
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
      {#each filteredSpreadHistory as record}
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
              {#if record._pack}
                <span 
                  class="pack-badge" 
                  style="background: {record._pack.color + '22'}; color: {record._pack.color}"
                >
                  {record._pack.icon}
                </span>
              {/if}
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
  {#if filteredThemeHistory.length === 0}
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
      {#each filteredThemeHistory as record}
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
              {#if record._pack}
                <span 
                  class="pack-badge" 
                  style="background: {record._pack.color + '22'}; color: {record._pack.color}"
                >
                  {record._pack.icon}
                </span>
              {/if}
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
  {#if filteredDailyHistory.length === 0}
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
      {#each filteredDailyHistory as record}
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
                {#if hasPity(record.pityInfo)}
                  <span class="pity-history-badge pity-{record.pityInfo?.type || 'soft'}">
                    {getPityBadgeText(record.pityInfo)}
                  </span>
                {/if}
                {#if record.consecutiveDays}
                  <span class="consecutive-badge">🔥 {record.consecutiveDays}天</span>
                {/if}
                {#if record._pack}
                  <span 
                    class="pack-badge" 
                    style="background: {record._pack.color + '22'}; color: {record._pack.color}"
                  >
                    {record._pack.icon}
                  </span>
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
    questionContext={currentQuestionContext}
    recordId={currentRecordId}
    recordType="question-driven"
    existingInterpretation={currentInterpretation}
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
  .qd-item {
    background: linear-gradient(135deg, var(--theme-glow), var(--bg-card));
    border-color: var(--theme-glow);
  }
  .qd-item:hover {
    border-color: var(--theme-color);
    background: linear-gradient(135deg, var(--theme-glow), var(--bg-card));
    box-shadow: 0 0 15px var(--theme-glow);
  }
  .urgency-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 10px;
  }
  .badge-interpreted {
    background: rgba(105, 240, 174, 0.2);
    color: #69f0ae;
    font-size: 10px;
  }
  .history-item .question-preview {
    color: var(--text-secondary);
    font-size: 11px;
    font-style: italic;
    margin-top: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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

  .pack-filter-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .pack-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 16px;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .pack-chip:hover {
    border-color: var(--pack-color, var(--accent-cyan));
    color: var(--pack-color, var(--accent-cyan));
  }

  .pack-chip.active {
    background: color-mix(in srgb, var(--pack-color, var(--accent-cyan)) 15%, transparent);
    border-color: var(--pack-color, var(--accent-cyan));
    color: var(--pack-color, var(--accent-cyan));
    box-shadow: 0 0 10px color-mix(in srgb, var(--pack-color, var(--accent-cyan)) 25%, transparent);
  }

  .chip-icon {
    font-size: 14px;
  }

  .pack-badge {
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-family: var(--font-mono);
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .pity-history-badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
  }

  .pity-history-badge.pity-soft {
    background: rgba(255, 207, 64, 0.15);
    border: 1px solid rgba(255, 207, 64, 0.35);
    color: var(--accent-yellow);
  }

  .pity-history-badge.pity-hard {
    background: rgba(255, 71, 87, 0.15);
    border: 1px solid rgba(255, 71, 87, 0.35);
    color: var(--accent-red);
  }
</style>
