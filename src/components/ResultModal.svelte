<script>
  import CardDisplay from './CardDisplay.svelte'
  import { RARITY_CONFIG } from '../data/constants.js'

  export let results
  export let spreadType
  export let onClose
  export let onDrawAgain
</script>

<div class="modal-overlay" on:click|self={onClose}>
  <div class="modal-content">
    <h2 class="modal-title">
      {spreadType === 'single' ? '◆ 占 卜 结 果 ◆' : '◆ 三 牌 阵 结 果 ◆'}
    </h2>

    <div class="result-cards">
      {#each results as result, i}
        <div class="result-card-wrapper">
          {#if spreadType === 'three'}
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
        {#if spreadType === 'three'}
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
  }
  .reading-block {
    animation: fade-in 0.6s ease backwards;
  }
  .reading-block:nth-child(2) { animation-delay: 0.1s; }
  .reading-block:nth-child(3) { animation-delay: 0.2s; }
</style>
