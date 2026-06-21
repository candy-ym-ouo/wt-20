<script>
  import { RARITY_CONFIG, CATEGORY_CONFIG } from '../data/constants.js'

  export let card
  export let isReversed = false
  export let size = 'normal'
  export let showDetails = true

  $: rarityConfig = RARITY_CONFIG[card.rarity]
  $: categoryConfig = CATEGORY_CONFIG[card.category]
</script>

<div
  class="card-visual card-{card.rarity} {isReversed ? 'reversed' : ''} {size}"
  style="--card-color: {rarityConfig.color}"
>
  <span class="card-number mono">{String(card.number).padStart(2, '0')}</span>
  <span class="card-category-icon">{categoryConfig.icon}</span>
  <span class="card-symbol" style="color: {rarityConfig.color}">{card.symbol}</span>
  {#if showDetails}
    <span class="card-name" style="color: {rarityConfig.color}">{card.name}</span>
    <span class="card-rarity-badge" style="background: {rarityConfig.glow}40; color: {rarityConfig.color}">
      {rarityConfig.label}
    </span>
  {/if}
</div>

<style>
  .card-visual.small {
    width: 100px;
    height: 160px;
  }
  .card-visual.small .card-symbol {
    font-size: 36px;
  }
  .card-visual.small .card-name {
    font-size: 11px;
  }
  .card-visual.large {
    width: 180px;
    height: 280px;
  }
  .card-visual.large .card-symbol {
    font-size: 64px;
  }
  .card-visual.large .card-name {
    font-size: 16px;
  }
</style>
