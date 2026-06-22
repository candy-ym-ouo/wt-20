<script>
  import { onMount, onDestroy } from 'svelte'
  import CardDrawCanvas from '../components/CardDrawCanvas.svelte'
  import CardDisplay from '../components/CardDisplay.svelte'
  import ResultModal from '../components/ResultModal.svelte'
  import ThemePackSelector from '../components/ThemePackSelector.svelte'
  import { drawSingleCard, drawThreeCards, saveDrawResult, drawSingleCardFromPack, drawThreeCardsFromPack, saveDrawResultWithPack } from '../utils/cardSystem.js'
  import { Storage } from '../utils/storage.js'
  import { CARDS } from '../data/cards.js'
  import { getCurrentPack, getCurrentPackCards, getCurrentPackId, getPackCollectionStats } from '../utils/themePackSystem.js'
  import { getPackStats } from '../data/themePacks.js'

  let canvas
  let isAnimating = false
  let drawResults = null
  let showResult = false
  let currentSpread = 'single'
  let stats = Storage.getStats()
  let currentPack = null
  let packStats = null
  let collectionStats = null
  let showPackSelector = false
  let removePackListener

  function refresh() {
    stats = Storage.getStats()
    currentPack = getCurrentPack()
    const packId = getCurrentPackId()
    packStats = getPackStats(packId)
    collectionStats = getPackCollectionStats(packId)
  }

  async function handleDraw(type) {
    if (isAnimating) return
    isAnimating = true
    currentSpread = type

    let results
    if (type === 'single') {
      results = [drawSingleCardFromPack()]
    } else {
      results = drawThreeCardsFromPack()
    }

    drawResults = results

    if (canvas && canvas.playDrawAnimation) {
      await canvas.playDrawAnimation(results)
    }

    saveDrawResultWithPack(type === 'single' ? results[0] : results, type)
    refresh()

    setTimeout(() => {
      showResult = true
    }, 500)
  }

  function handleCloseResult() {
    showResult = false
    drawResults = null
    isAnimating = false
    if (canvas && canvas.reset) {
      canvas.reset()
    }
  }

  function handleDrawAgain() {
    showResult = false
    drawResults = null
    isAnimating = false
    if (canvas && canvas.reset) {
      canvas.reset()
    }
  }

  function handlePackChanged(e) {
    refresh()
    if (canvas && canvas.reset) {
      canvas.reset()
    }
    drawResults = null
    showResult = false
    isAnimating = false
  }

  onMount(() => {
    refresh()
    removePackListener = (e) => {
      if (e.type === 'packChanged') {
        refresh()
      }
    }
    window.addEventListener('packChanged', handlePackChanged)
  })

  onDestroy(() => {
    if (removePackListener) {
      window.removeEventListener('packChanged', handlePackChanged)
    }
  })
</script>

<div class="page-header">
  <h1 class="page-title">◆ 赛博占卜 ◆</h1>
  <button 
    class="pack-select-btn"
    style="--pack-color: {currentPack?.color || '#00e5ff'}"
    on:click={() => showPackSelector = !showPackSelector}
  >
    <span class="pack-icon">{currentPack?.icon || '🎴'}</span>
    <span class="pack-name">{currentPack?.name || '卡包'}</span>
    <span class="arrow">{showPackSelector ? '▲' : '▼'}</span>
  </button>
</div>

{#if showPackSelector}
  <div class="pack-selector-container">
    <ThemePackSelector {showPackSelector} compact={false} />
  </div>
{/if}

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-value">{stats.totalDraws}</div>
    <div class="stat-label">总抽卡次数</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">{collectionStats?.collectedCount || 0}/{packStats?.totalCards || CARDS.length}</div>
    <div class="stat-label">本包收集</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">{stats.legendaryCount}</div>
    <div class="stat-label glow-yellow">传说</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">{stats.epicCount}</div>
    <div class="stat-label glow-magenta">史诗</div>
  </div>
</div>

<div class="draw-btn-container">
  <button class="btn btn-primary btn-block" on:click={() => handleDraw('single')} disabled={isAnimating}>
    🎴 单张抽卡
  </button>
  <button class="btn btn-magenta btn-block" on:click={() => handleDraw('three')} disabled={isAnimating}>
    🔮 三牌阵（过去/现在/未来）
  </button>
</div>

<CardDrawCanvas
  bind:this={canvas}
  cardCount={currentSpread === 'single' ? 1 : 3}
  {isAnimating}
  {drawResults}
/>

<p class="hint mono">
  当前卡包：{currentPack?.name || '核心卡包'} · 点击按钮开始抽卡...
</p>

{#if showResult && drawResults}
  <ResultModal
    results={drawResults}
    spreadType={currentSpread}
    onClose={handleCloseResult}
    onDrawAgain={handleDrawAgain}
  />
{/if}

<style>
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .page-title {
    margin: 0;
    font-size: 20px;
  }

  .pack-select-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--bg-card);
    border: 1px solid var(--pack-color, #00e5ff);
    border-radius: 16px;
    color: var(--text-primary);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .pack-select-btn:hover {
    background: color-mix(in srgb, var(--pack-color, #00e5ff) 10%, var(--bg-card));
    box-shadow: 0 0 10px color-mix(in srgb, var(--pack-color, #00e5ff) 25%, transparent);
  }

  .pack-icon {
    font-size: 14px;
  }

  .pack-name {
    font-weight: 500;
  }

  .arrow {
    font-size: 9px;
    color: var(--text-dim);
  }

  .pack-selector-container {
    margin-bottom: 16px;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .hint {
    text-align: center;
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 16px;
    letter-spacing: 1px;
  }
  .draw-btn-container .btn {
    flex: 1;
    min-width: 140px;
  }
</style>
