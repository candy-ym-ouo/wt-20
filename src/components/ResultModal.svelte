<script>
  import CardDisplay from './CardDisplay.svelte'
  import { RARITY_CONFIG } from '../data/constants.js'

  export let results
  export let spreadType
  export let onClose
  export let onDrawAgain
  export let customTitle = null

  $: {
    if (customTitle) {
      modalTitle = customTitle
    } else if (spreadType === 'single' || results.length === 1) {
      modalTitle = '◆ 占 卜 结 果 ◆'
    } else {
      modalTitle = `◆ ${results.length} 牌 阵 结 果 ◆`
    }
  }

  let modalTitle = ''

  function hasPosition(result) {
    return !!result.position
  }
</script>

<div class="modal-overlay" on:click|self={onClose}>
  <div class="modal-content">
    <h2 class="modal-title">{modalTitle}</h2>

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
