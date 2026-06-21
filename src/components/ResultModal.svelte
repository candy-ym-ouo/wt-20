<script>
  import CardDisplay from './CardDisplay.svelte'
  import { RARITY_CONFIG } from '../data/constants.js'

  export let results
  export let spreadType
  export let onClose
  export let onDrawAgain
  export let customTitle = null
  export let spreadConfig = null

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

  function hasPosition(result) {
    return !!result.position
  }

  function getResultByPositionId(posId) {
    return results.find(r => r.positionId === posId)
  }
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

    <div class="action-row">
      <button class="btn btn-block" on:click={onClose}>关闭</button>
      <button class="btn btn-block btn-primary" on:click={onDrawAgain}>再次抽卡</button>
    </div>
  </div>
</div>

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
</style>
