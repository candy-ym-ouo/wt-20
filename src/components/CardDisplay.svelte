<script>
  import { onMount } from 'svelte'
  import { RARITY_CONFIG, CATEGORY_CONFIG } from '../data/constants.js'
  import {
    getCurrentSkin,
    getCurrentBorder,
    equippedShopItems
  } from '../utils/fateShopSystem.js'
  import { SHOP_ITEM_TYPE } from '../data/fateShop.js'

  export let card
  export let isReversed = false
  export let size = 'normal'
  export let showDetails = true

  $: rarityConfig = RARITY_CONFIG[card.rarity]
  $: categoryConfig = CATEGORY_CONFIG[card.category]

  let currentSkin = null
  let currentBorder = null

  $: skinColor = currentSkin?.preview?.color || null
  $: borderColor = currentBorder?.preview?.color || null
  $: borderStyle = currentBorder?.preview?.style || null
  $: primaryColor = skinColor || rarityConfig.color
  $: cardClasses = [
    'card-visual',
    `card-${card.rarity}`,
    isReversed ? 'reversed' : '',
    size,
    currentSkin ? 'has-skin' : '',
    currentBorder ? 'has-border' : '',
    borderStyle ? `border-style-${borderStyle}` : ''
  ].join(' ')

  function updateEquipped() {
    currentSkin = getCurrentSkin()
    currentBorder = getCurrentBorder()
  }

  onMount(() => {
    updateEquipped()
    const unsubscribe = equippedShopItems.subscribe(() => {
      updateEquipped()
    })
    return () => unsubscribe && unsubscribe()
  })
</script>

<div
  class={cardClasses}
  style="
    --card-color: {primaryColor};
    --skin-color: {skinColor || 'transparent'};
    --border-color: {borderColor || 'transparent'};
  "
>
  {#if currentBorder}
    <div class="card-border-outer"></div>
    <div class="card-border-inner"></div>
  {/if}

  {#if currentSkin}
    <div class="card-skin-overlay"></div>
    <div class="card-skin-particles"></div>
  {/if}

  <span class="card-number mono">{String(card.number).padStart(2, '0')}</span>
  <span class="card-category-icon">{categoryConfig.icon}</span>
  <span class="card-symbol" style="color: {primaryColor}">{card.symbol}</span>
  {#if showDetails}
    <span class="card-name" style="color: {primaryColor}">{card.name}</span>
    <span class="card-rarity-badge" style="background: {rarityConfig.glow}40; color: {primaryColor}">
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

  .card-visual.has-skin {
    background: linear-gradient(145deg, var(--skin-color)20, var(--bg-card));
  }

  .card-skin-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10px;
    pointer-events: none;
    background: 
      radial-gradient(circle at 20% 20%, var(--skin-color)20 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, var(--skin-color)15 0%, transparent 50%);
    z-index: 1;
  }

  .card-skin-particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10px;
    pointer-events: none;
    overflow: hidden;
    z-index: 1;
  }

  .card-skin-particles::before,
  .card-skin-particles::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    background: var(--skin-color);
    border-radius: 50%;
    animation: skin-particle-float 3s ease-in-out infinite;
    opacity: 0.6;
  }

  .card-skin-particles::before {
    top: 20%;
    left: 15%;
    animation-delay: 0s;
  }

  .card-skin-particles::after {
    bottom: 30%;
    right: 20%;
    animation-delay: 1.5s;
  }

  @keyframes skin-particle-float {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
    50% { transform: translateY(-10px) scale(1.2); opacity: 1; }
  }

  .card-visual.has-border {
    border: none;
  }

  .card-border-outer,
  .card-border-inner {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 12px;
    pointer-events: none;
    z-index: 0;
  }

  .card-border-outer {
    background: var(--border-color);
    opacity: 0.3;
    filter: blur(4px);
  }

  .card-border-inner {
    border: 2px solid var(--border-color);
    z-index: 2;
  }

  .card-visual.border-style-pulse .card-border-inner {
    animation: border-pulse 2s ease-in-out infinite;
  }

  .card-visual.border-style-rainbow_flow .card-border-inner {
    background: linear-gradient(90deg, 
      #ff5252, #ffab40, #ffd54f, #69f0ae, #00e5ff, #e040fb, #ff5252
    );
    background-size: 400% 400%;
    animation: rainbow-flow 3s ease infinite;
    -webkit-background-clip: border-box;
    border: 2px solid transparent;
  }

  .card-visual.border-style-rainbow_flow .card-border-inner::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10px;
    background: var(--bg-card);
    z-index: -1;
  }

  .card-visual.border-style-dragon_dance .card-border-inner {
    animation: dragon-dance 2s ease-in-out infinite;
    box-shadow: 
      0 0 10px var(--border-color),
      inset 0 0 10px var(--border-color)40;
  }

  @keyframes border-pulse {
    0%, 100% { opacity: 0.6; box-shadow: 0 0 5px var(--border-color); }
    50% { opacity: 1; box-shadow: 0 0 15px var(--border-color), 0 0 30px var(--border-color)40; }
  }

  @keyframes rainbow-flow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes dragon-dance {
    0%, 100% { 
      border-color: var(--border-color);
      transform: scale(1);
    }
    25% { 
      border-color: #ff5252;
    }
    50% { 
      border-color: var(--border-color);
      transform: scale(1.02);
    }
    75% { 
      border-color: #e040fb;
    }
  }
</style>
