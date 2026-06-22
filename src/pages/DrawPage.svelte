<script>
  import { onMount, onDestroy } from 'svelte'
  import CardDrawCanvas from '../components/CardDrawCanvas.svelte'
  import CardDisplay from '../components/CardDisplay.svelte'
  import ResultModal from '../components/ResultModal.svelte'
  import ThemePackSelector from '../components/ThemePackSelector.svelte'
  import { drawSingleCard, drawThreeCards, saveDrawResult, drawSingleCardFromPack, drawThreeCardsFromPack, saveDrawResultWithPack, getCurrentPityInfo, calculateEffectiveProbabilities } from '../utils/cardSystem.js'
  import { Storage } from '../utils/storage.js'
  import { CARDS } from '../data/cards.js'
  import { CARD_RARITY, RARITY_CONFIG, PITY_CONFIG } from '../data/constants.js'
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
  let pityInfo = null
  let effectiveProbs = null
  let showProbDetail = false

  const RARITY_ORDER = [CARD_RARITY.COMMON, CARD_RARITY.RARE, CARD_RARITY.EPIC, CARD_RARITY.LEGENDARY]

  function refresh() {
    stats = Storage.getStats()
    currentPack = getCurrentPack()
    const packId = getCurrentPackId()
    packStats = getPackStats(packId)
    collectionStats = getPackCollectionStats(packId)
    pityInfo = getCurrentPityInfo(packId)
    effectiveProbs = calculateEffectiveProbabilities(packId)
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

  function getProgressPercent(count, hardPity) {
    if (hardPity === 0) return 0
    return Math.min(100, (count / hardPity) * 100)
  }

  function getPityStatus(rarity) {
    const info = pityInfo?.[rarity]
    if (!info) return null
    const config = info.config
    const count = info.count
    const softStart = config.softPityStart
    const hardPity = config.hardPity
    
    if (count >= hardPity) {
      return { text: '硬保底已触发', class: 'hard-pity' }
    }
    if (count >= softStart) {
      const increase = (count - softStart + 1) * config.rateIncrease
      return { text: `软保底中 +${increase}%/抽`, class: 'soft-pity' }
    }
    return { text: `${softStart - count}抽后软保底`, class: 'normal' }
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

<div class="prob-section">
  <div class="prob-header" on:click={() => showProbDetail = !showProbDetail}>
    <span class="prob-title">🎲 当前概率</span>
    <span class="prob-toggle">{showProbDetail ? '收起 ▲' : '展开 ▼'}</span>
  </div>
  
  {#if showProbDetail && effectiveProbs}
    <div class="prob-grid">
      {#each RARITY_ORDER as rarity}
        {@const rarityData = effectiveProbs[rarity]}
        {@const config = RARITY_CONFIG[rarity]}
        <div class="prob-item" style="--rarity-color: {config.color}">
          <div class="prob-rarity" style="color: {config.color}">{config.label}</div>
          <div class="prob-rate">{rarityData?.effectiveRate?.toFixed(1)}%</div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if pityInfo}
  <div class="pity-section">
    <div class="pity-title">
      <span>🛡️ 保底进度</span>
      {#if pityInfo.totalPityTriggers}
        <span class="pity-total mono">
          共触发保底 {pityInfo.totalPityTriggers.legendary + pityInfo.totalPityTriggers.epic + pityInfo.totalPityTriggers.rare} 次
        </span>
      {/if}
    </div>
    
    {#each [CARD_RARITY.LEGENDARY, CARD_RARITY.EPIC, CARD_RARITY.RARE] as rarity}
      {@const info = pityInfo[rarity]}
      {@const config = info.config}
      {@const status = getPityStatus(rarity)}
      {@const progress = getProgressPercent(info.count, config.hardPity)}
      <div class="pity-item pity-{rarity}" style="--rarity-color: {RARITY_CONFIG[rarity].color}">
        <div class="pity-info">
          <div class="pity-label" style="color: {RARITY_CONFIG[rarity].color}">
            {RARITY_CONFIG[rarity].label}
          </div>
          <div class="pity-count mono">{info.count}/{config.hardPity}</div>
        </div>
        <div class="pity-progress">
          <div class="pity-progress-fill" style="width: {progress}%"></div>
          {#if config.softPityStart > 0}
            <div 
              class="soft-pity-line" 
              style="left: {(config.softPityStart / config.hardPity) * 100}%"
              title="软保底起点">
            </div>
          {/if}
        </div>
        <div class="pity-status {status?.class || ''}">
          {status?.text || ''}
        </div>
      </div>
    {/each}
  </div>
{/if}

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

  .prob-section {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;
  }

  .prob-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .prob-header:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .prob-title {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--text-secondary);
  }

  .prob-toggle {
    font-size: 10px;
    color: var(--text-dim);
  }

  .prob-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 0 14px 12px;
  }

  .prob-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--rarity-color);
    border-radius: 6px;
    padding: 8px;
    text-align: center;
  }

  .prob-rarity {
    font-size: 11px;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .prob-rate {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: bold;
    color: var(--rarity-color);
  }

  .pity-section {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 12px;
  }

  .pity-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--text-secondary);
  }

  .pity-total {
    font-size: 10px;
    color: var(--text-dim);
  }

  .pity-item {
    margin-bottom: 10px;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid color-mix(in srgb, var(--rarity-color) 30%, transparent);
    border-radius: 6px;
  }

  .pity-item:last-child {
    margin-bottom: 0;
  }

  .pity-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .pity-label {
    font-size: 12px;
    font-weight: 500;
  }

  .pity-count {
    font-size: 11px;
    color: var(--text-dim);
  }

  .pity-progress {
    position: relative;
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    overflow: visible;
    margin-bottom: 6px;
  }

  .pity-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--rarity-color), color-mix(in srgb, var(--rarity-color)) 70%, transparent);
    border-radius: 3px;
    transition: width 0.4s ease;
    box-shadow: 0 0 6px var(--rarity-color);
  }

  .soft-pity-line {
    position: absolute;
    top: -2px;
    width: 2px;
    height: 10px;
    background: var(--accent-yellow);
    transform: translateX(-50%);
    border-radius: 1px;
  }

  .pity-status {
    font-size: 10px;
    font-family: var(--font-mono);
    text-align: right;
  }

  .pity-status.normal {
    color: var(--text-dim);
  }

  .pity-status.soft-pity {
    color: var(--accent-yellow);
  }

  .pity-status.hard-pity {
    color: var(--accent-red);
    font-weight: bold;
  }
</style>
