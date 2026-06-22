<script>
  import { onMount } from 'svelte'
  import CardDisplay from './CardDisplay.svelte'
  import { RARITY_CONFIG, THEME_CONFIG } from '../data/constants.js'
  import ShareModal from './ShareModal.svelte'
  import {
    getActiveWishes,
    linkDrawToWish,
    buildDrawRecordForLinking,
    WISH_STATUS
  } from '../utils/wishSystem.js'

  export let results
  export let spreadType
  export let onClose
  export let onDrawAgain
  export let customTitle = null
  export let spreadConfig = null
  export let question = null
  export let theme = null
  export let spreadName = null
  export let timestamp = Date.now()
  export let recordType = null
  export let consecutiveDays = null

  $: {
    if (customTitle) {
      modalTitle = customTitle
    } else if (spreadType === 'single' || results.length === 1) {
      modalTitle = '◆ 占 卜 结 果 ◆'
    } else {
      modalTitle = `◆ ${results.length} 牌 阵 结 果 ◆`
    }
  }

  $: isMultiSpread = spreadType === 'multi-spread' && spreadConfig

  let modalTitle = ''
  let showShareModal = false
  let showWishSelector = false
  let activeWishes = []
  let linkedWishId = null
  let linkSuccess = false

  onMount(() => {
    activeWishes = getActiveWishes().filter(w => 
      w.status === WISH_STATUS.ACTIVE || w.status === WISH_STATUS.IN_PROGRESS
    )
  })

  function hasPosition(result) {
    return !!result.position
  }

  function getResultByPositionId(posId) {
    return results.find(r => r.positionId === posId)
  }

  function openShare() {
    showShareModal = true
  }

  function closeShare() {
    showShareModal = false
  }

  function goToReview() {
    const event = new CustomEvent('navigate', { detail: 'review' })
    window.dispatchEvent(event)
    onClose()
  }

  function goToWishList() {
    const event = new CustomEvent('navigate', { detail: 'wishlist' })
    window.dispatchEvent(event)
    onClose()
  }

  function handleLinkToWish(wishId) {
    const drawRecord = buildDrawRecordForLinking(results, spreadType, question || '')
    linkDrawToWish(wishId, drawRecord)
    linkedWishId = wishId
    linkSuccess = true
    setTimeout(() => {
      showWishSelector = false
    }, 1000)
  }

  $: derivedSpreadName = spreadName || (() => {
    if (spreadType === 'single' || results.length === 1) return '单张占卜'
    if (spreadType === 'three') return '三牌阵'
    if (theme) {
      const tc = THEME_CONFIG[theme]
      return tc?.spreadTypes?.find(s => s.id === spreadType)?.name || `${results.length}牌阵`
    }
    return `${results.length}牌阵`
  })()
</script>

<div class="modal-overlay" on:click|self={onClose}>
  <div class="modal-content">
    <h2 class="modal-title">{modalTitle}</h2>

    {#if isMultiSpread}
      <div
        class="spread-result-layout layout-{spreadConfig.layout.type}"
        style="--spread-color: {spreadConfig.color};"
      >
        {#each spreadConfig.layout.positions as lp}
          {@const result = getResultByPositionId(lp.key)}
          {@const posConfig = spreadConfig.positions.find(p => p.id === lp.key)}
          <div
            class="spread-slot"
            style="grid-row: {lp.row + 1}; grid-column: {lp.col + 1};"
          >
            {#if result}
              <div class="slot-position-name mono">{posConfig?.name || lp.key}</div>
              <CardDisplay
                card={result.card}
                isReversed={result.isReversed}
                size="small"
              />
              <div class="mono slot-orientation">
                {result.isReversed ? '逆位' : '正位'}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="result-cards">
        {#each results as result, i}
          <div class="result-card-wrapper">
            {#if hasPosition(result)}
              <div class="result-position mono">{result.position}</div>
            {/if}
            <CardDisplay
              card={result.card}
              isReversed={result.isReversed}
              size="small"
            />
            <div class="mono" style="font-size: 10px; color: var(--text-dim)">
              {result.isReversed ? '逆位' : '正位'}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="reading-content">
      {#each results as result, i}
        {#if hasPosition(result)}
          <div class="reading-position-label mono glow-magenta">
            ▸ {result.position}
          </div>
        {/if}

        <div class="reading-block">
          <div class="keywords">
            {#each result.card.keywords as kw}
              <span class="keyword">{kw}</span>
            {/each}
          </div>

          <h3 class="reading-title">{result.reading.title}</h3>
          <p class="reading-text">{result.reading.meaning}</p>
          <div class="reading-advice">
            💡 {result.reading.advice}
          </div>
          <div class="reading-fortune">{result.reading.fortune}</div>
        </div>
      {/each}
    </div>

    {#if !showWishSelector}
      <div class="action-row-secondary">
        <button class="btn btn-block btn-yellow" on:click={openShare}>
          📤 分享结果
        </button>
        <button class="btn btn-block btn-magenta" on:click={goToReview}>
          📊 历史回顾
        </button>
      </div>

      <div class="action-row-secondary">
        {#if activeWishes.length > 0}
          <button class="btn btn-block btn-cyan" on:click={() => showWishSelector = true}>
            ✨ 关联到愿望
          </button>
        {:else}
          <button class="btn btn-block btn-cyan" on:click={goToWishList}>
            ✨ 去创建愿望
          </button>
        {/if}
      </div>

      <div class="action-row">
        <button class="btn btn-block" on:click={onClose}>关闭</button>
        <button class="btn btn-block btn-primary" on:click={onDrawAgain}>再次抽卡</button>
      </div>
    {:else}
      <div class="wish-selector">
        <div class="wish-selector-header">
          <span class="wish-selector-title">✨ 选择要关联的愿望</span>
          <button class="close-btn" on:click={() => showWishSelector = false}>✕</button>
        </div>
        
        {#if linkSuccess}
          <div class="link-success">
            <span class="success-icon">✅</span>
            <span class="success-text">关联成功！</span>
          </div>
        {:else}
          <div class="wish-selector-list">
            {#each activeWishes as wish}
              <div
                class="wish-selector-item {linkedWishId === wish.id ? 'selected' : ''}"
                on:click={() => handleLinkToWish(wish.id)}
              >
                <span class="wish-item-icon">{wish._category?.icon || '✨'}</span>
                <span class="wish-item-title">{wish.title}</span>
                {#if linkedWishId === wish.id}
                  <span class="wish-item-check">✓</span>
                {/if}
              </div>
            {/each}
          </div>
          
          <div class="wish-selector-footer">
            <button class="btn btn-secondary" on:click={() => showWishSelector = false}>
              取消
            </button>
            <button class="btn btn-primary" on:click={goToWishList}>
              管理愿望
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

{#if showShareModal}
  <ShareModal
    {results}
    {theme}
    spreadName={derivedSpreadName}
    {question}
    {timestamp}
    {recordType}
    {consecutiveDays}
    spreadId={spreadType === 'multi-spread' && spreadConfig ? spreadConfig.id : null}
    spreadConfig={spreadType === 'multi-spread' ? spreadConfig : null}
    onClose={closeShare}
    onGoToReview={goToReview}
  />
{/if}

<style>
  .reading-position-label {
    font-size: 12px;
    letter-spacing: 2px;
    margin-bottom: 8px;
    padding-left: 4px;
  }
  .result-cards {
    animation: fade-in 0.5s ease;
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
    margin: 20px 0;
  }
  .spread-result-layout {
    animation: fade-in 0.5s ease;
    display: grid;
    gap: 10px;
    justify-content: center;
    align-items: center;
    padding: 20px 10px;
    margin: 20px 0;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid var(--spread-color);
    box-shadow: 0 0 20px color-mix(in srgb, var(--spread-color) 20%, transparent);
  }
  .spread-result-layout.layout-cross {
    grid-template-columns: repeat(3, 80px);
    grid-template-rows: repeat(3, auto);
  }
  .spread-result-layout.layout-relationship {
    grid-template-columns: repeat(2, 90px);
    grid-template-rows: repeat(2, auto);
    gap: 16px;
  }
  .spread-result-layout.layout-decision {
    grid-template-columns: repeat(3, 80px);
    grid-template-rows: repeat(3, auto);
  }
  .spread-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .slot-position-name {
    font-size: 11px;
    color: var(--spread-color);
    letter-spacing: 0.5px;
    white-space: nowrap;
    text-shadow: 0 0 8px var(--spread-color);
  }
  .slot-orientation {
    font-size: 10px;
    color: var(--text-dim);
  }
  .reading-content {
    width: 100%;
    margin-top: 20px;
  }
  .reading-block {
    animation: fade-in 0.6s ease backwards;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }
  .reading-block:nth-child(2) { animation-delay: 0.1s; }
  .reading-block:nth-child(3) { animation-delay: 0.2s; }
  .reading-block:nth-child(4) { animation-delay: 0.3s; }
  .reading-block:nth-child(5) { animation-delay: 0.4s; }
  .keywords {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
    margin-bottom: 8px;
  }
  .keyword {
    background: rgba(224, 64, 251, 0.2);
    color: var(--accent-magenta);
    padding: 3px 10px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
  }
  .reading-title {
    font-family: var(--font-mono);
    font-size: 15px;
    color: var(--accent-cyan);
    margin-bottom: 10px;
    letter-spacing: 0.5px;
  }
  .reading-text {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.8;
    margin-bottom: 10px;
  }
  .reading-advice {
    background: rgba(0, 229, 255, 0.08);
    border-left: 3px solid var(--accent-cyan);
    padding: 10px 14px;
    margin-top: 10px;
    font-size: 13px;
    color: var(--accent-cyan);
    line-height: 1.7;
    border-radius: 0 4px 4px 0;
  }
  .reading-fortune {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--accent-yellow);
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--border-glow);
  }

  .action-row-secondary {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }

  .action-row-secondary .btn {
    flex: 1;
    font-size: 12px;
    padding: 10px 16px;
  }

  .btn-cyan {
    background: rgba(0, 229, 255, 0.15);
    border: 1px solid var(--accent-cyan);
    color: var(--accent-cyan);
  }

  .btn-cyan:hover {
    background: rgba(0, 229, 255, 0.3);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
  }

  .wish-selector {
    animation: fade-in 0.3s ease;
  }

  .wish-selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px dashed var(--border-glow);
  }

  .wish-selector-title {
    font-size: 16px;
    font-weight: bold;
    color: var(--accent-cyan);
    font-family: var(--font-mono);
  }

  .wish-selector-list {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 16px;
  }

  .wish-selector-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .wish-selector-item:hover {
    border-color: var(--accent-cyan);
    background: rgba(0, 229, 255, 0.05);
    transform: translateX(4px);
  }

  .wish-selector-item.selected {
    border-color: var(--accent-green);
    background: rgba(105, 240, 174, 0.1);
  }

  .wish-item-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .wish-item-title {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
  }

  .wish-item-check {
    color: var(--accent-green);
    font-weight: bold;
    font-size: 16px;
  }

  .wish-selector-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .link-success {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 30px 20px;
    color: var(--accent-green);
    animation: success-pulse 0.5s ease;
  }

  @keyframes success-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .success-icon {
    font-size: 32px;
  }

  .success-text {
    font-size: 18px;
    font-weight: bold;
    text-shadow: 0 0 10px var(--accent-green);
  }
</style>
