<script>
  import { onMount } from 'svelte'
  import { Storage } from '../utils/storage.js'
  import { getCardById } from '../utils/cardSystem.js'
  import CardDisplay from '../components/CardDisplay.svelte'
  import ResultModal from '../components/ResultModal.svelte'

  let history = []
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

  function openRecord(record) {
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

  function closeDetail() {
    showDetail = false
    selectedRecord = null
  }

  function clearHistory() {
    if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
      Storage.clearDrawHistory()
      refresh()
    }
  }

  onMount(() => {
    refresh()
  })
</script>

<div class="header-actions">
  <h1 class="page-title" style="flex:1; text-align: left; margin: 0; font-size: 18px;">◆ 占 卜 历 史 ◆</h1>
  {#if history.length > 0}
    <button class="btn icon-btn" on:click={clearHistory} title="清空历史">
      🗑️
    </button>
  {/if}
</div>

{#if history.length === 0}
  <div class="empty-state">
    <div class="empty-state-icon">📜</div>
    <div class="empty-state-text">暂无占卜记录<br/>快去抽一张卡吧
    </div>
  </div>
{:else}
  <div class="history-list">
    {#each history as record}
      <div class="history-item" on:click={() => openRecord(record)}>
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
</style>
