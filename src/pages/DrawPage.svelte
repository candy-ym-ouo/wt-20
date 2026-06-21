<script>
  import { onMount } from 'svelte'
  import CardDrawCanvas from '../components/CardDrawCanvas.svelte'
  import CardDisplay from '../components/CardDisplay.svelte'
  import ResultModal from '../components/ResultModal.svelte'
  import { drawSingleCard, drawThreeCards, saveDrawResult } from '../utils/cardSystem.js'
  import { Storage } from '../utils/storage.js'
  import { CARDS } from '../data/cards.js'

  let canvas
  let isAnimating = false
  let drawResults = null
  let showResult = false
  let currentSpread = 'single'
  let stats = Storage.getStats()

  function refreshStats() {
    stats = Storage.getStats()
  }

  async function handleDraw(type) {
    if (isAnimating) return
    isAnimating = true
    currentSpread = type

    let results
    if (type === 'single') {
      results = [drawSingleCard()]
    } else {
      results = drawThreeCards()
    }

    drawResults = results

    if (canvas && canvas.playDrawAnimation) {
      await canvas.playDrawAnimation(results)
    }

    saveDrawResult(type === 'single' ? results[0] : results, type)
    refreshStats()

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
</script>

<h1 class="page-title">◆ 赛博占卜 ◆</h1>

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-value">{stats.totalDraws}</div>
    <div class="stat-label">总抽卡次数</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">{Object.keys(Storage.getCollection()).length}/{CARDS.length}</div>
    <div class="stat-label">已收集</div>
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
  点击按钮开始抽卡，系统将连接命运数据流...
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
