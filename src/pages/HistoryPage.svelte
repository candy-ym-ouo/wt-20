<script>
  import { onMount } from 'svelte'
  import { Storage } from '../utils/storage.js'
  import { getCardById } from '../utils/cardSystem.js'
  import CardDisplay from '../components/CardDisplay.svelte'
  import ResultModal from '../components/ResultModal.svelte'

  let activeTab = 'divination'
  let history = []
  let dailyHistory = []
  let selectedRecord = null
  let showDetail = false

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
  }

  function clearHistory() {
    if (activeTab === 'divination') {
      if (confirm('确定要清空所有占卜历史记录吗？此操作不可撤销。')) {
        Storage.clearDrawHistory()
        refresh()
      }
    } else {
      if (confirm('确定要清空所有每日签历史记录吗？此操作不可撤销。')) {
        Storage.clearDailyFortuneHistory()
        refresh()
      }
    }
  }

  function goToDaily() {
    const event = new CustomEvent('navigate', { detail: 'daily' })
    window.dispatchEvent(event)
  }

  onMount(() => {
    refresh()
  })
</script>

<div class="header-actions">
  <h1 class="page-title" style="flex:1; text-align: left; margin: 0; font-size: 18px;">◆ 历 史 记 录 ◆</h1>
  {#if (activeTab === 'divination' && history.length > 0) || (activeTab === 'daily' && dailyHistory.length > 0)}
    <button class="btn icon-btn" on:click={clearHistory} title="清空历史">
      🗑️
    </button>
  {/if}
</div>

<div class="tabs">
  <div class="tab {activeTab === 'divination' ? 'active' : ''}" on:click={() => (activeTab = 'divination')}>
    🎴 占卜记录
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
          <div class="history-time mono">{formatTime(record.timestamp)}</div>
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
          <div class="history-time mono">{formatDateStr(record.date)}</div>
        </div>
      {/each}
    </div>
  {/if}
{/if}

{#if showDetail && selectedRecord}
  <ResultModal
    results={selectedRecord}
    spreadType={selectedRecord.length === 1 ? 'single' : 'three'}
    onClose={closeDetail}
    onDrawAgain={closeDetail}
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
</style>
