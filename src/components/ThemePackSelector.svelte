<script>
  import { onMount, onDestroy } from 'svelte'
  import { 
    getAllThemePacks, 
    getCurrentPack, 
    getCurrentPackId,
    setCurrentPack,
    isPackUnlocked,
    getPackCollectionStats
  } from '../utils/themePackSystem.js'
  import { getThemePack, getPackStats } from '../data/themePacks.js'
  import { CARD_RARITY, RARITY_CONFIG } from '../data/constants.js'

  export let showSelector = false
  export let compact = false

  let packs = []
  let currentPackId = ''
  let currentPack = null

  function refresh() {
    packs = getAllThemePacks().map(pack => ({
      ...pack,
      isUnlocked: isPackUnlocked(pack.id),
      isCurrent: pack.id === getCurrentPackId(),
      stats: getPackStats(pack.id),
      collectionStats: getPackCollectionStats(pack.id)
    }))
    currentPackId = getCurrentPackId()
    currentPack = getCurrentPack()
  }

  function handleSelectPack(packId) {
    if (!isPackUnlocked(packId)) return
    if (packId === currentPackId) return
    
    setCurrentPack(packId)
    refresh()
    
    const event = new CustomEvent('packChanged', { detail: getThemePack(packId) })
    window.dispatchEvent(event)
    
    if (compact) {
      showSelector = false
    }
  }

  function toggleSelector() {
    showSelector = !showSelector
  }

  let removePackListener
  onMount(() => {
    refresh()
    removePackListener = (e) => {
      if (e.detail?.type === 'packChanged' || e.detail?.type === 'packUnlocked') {
        refresh()
      }
    }
    window.addEventListener('themePackEvent', removePackListener)
  })

  onDestroy(() => {
    if (removePackListener) {
      window.removeEventListener('themePackEvent', removePackListener)
    }
  })

  $: selectedPackInfo = packs.find(p => p.id === currentPackId)
</script>

{#if compact}
  <div class="compact-selector">
    <button 
      class="pack-toggle-btn" 
      style="--pack-color: {currentPack?.color || '#00e5ff'}"
      on:click={toggleSelector}
    >
      <span class="pack-icon">{currentPack?.icon || '🎴'}</span>
      <span class="pack-name">{currentPack?.name || '卡包'}</span>
      <span class="toggle-arrow">{showSelector ? '▲' : '▼'}</span>
    </button>
    
    {#if showSelector}
      <div class="pack-dropdown">
        {#each packs as pack}
          <div 
            class="pack-option {pack.isCurrent ? 'current' : ''} {pack.isUnlocked ? '' : 'locked'}"
            style="--pack-color: {pack.color}"
            on:click={() => handleSelectPack(pack.id)}
          >
            <div class="pack-option-icon">{pack.icon}</div>
            <div class="pack-option-info">
              <div class="pack-option-name">{pack.name}</div>
              <div class="pack-option-stats mono">
                {pack.collectionStats.collectedCount}/{pack.stats.totalCards} 张
              </div>
            </div>
            {#if pack.isCurrent}
              <span class="check-mark">✓</span>
            {/if}
            {#if !pack.isUnlocked}
              <span class="lock-icon">🔒</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="pack-selector-panel">
    <h3 class="panel-title">◆ 选择卡包 ◆</h3>
    <div class="pack-grid">
      {#each packs as pack}
        <div 
          class="pack-card {pack.isCurrent ? 'active' : ''} {pack.isUnlocked ? '' : 'locked'}"
          style="--pack-color: {pack.color}; --pack-glow: {pack.glowColor}; --pack-bg: {pack.bgGradient}"
          on:click={() => handleSelectPack(pack.id)}
        >
          <div class="pack-card-bg" style="background: {pack.bgGradient}"></div>
          <div class="pack-card-content">
            <div class="pack-card-icon">{pack.icon}</div>
            <h4 class="pack-card-name">{pack.name}</h4>
            <p class="pack-card-desc">{pack.description}</p>
            
            <div class="pack-card-stats">
              <div class="pack-stat">
                <span class="stat-label">卡牌数</span>
                <span class="stat-value mono">{pack.stats.totalCards}</span>
              </div>
              <div class="pack-stat">
                <span class="stat-label">已收集</span>
                <span class="stat-value mono glow">{pack.collectionStats.collectedCount}</span>
              </div>
              <div class="pack-stat">
                <span class="stat-label">进度</span>
                <span class="stat-value mono">{pack.collectionStats.progressPercent}%</span>
              </div>
            </div>

            <div class="pack-rarity-preview">
              {#each Object.values(CARD_RARITY) as rarity}
                {#if pack.stats.byRarity[rarity] > 0}
                  <span 
                    class="rarity-dot" 
                    style="background: {RARITY_CONFIG[rarity]?.color}"
                    title="{RARITY_CONFIG[rarity]?.label}: {pack.stats.byRarity[rarity]}张"
                  ></span>
                {/if}
              {/each}
            </div>

            {#if pack.isCurrent}
              <div class="current-badge">当前使用</div>
            {/if}
            {#if !pack.isUnlocked}
              <div class="locked-overlay">
                <span class="lock-icon">🔒</span>
                <span>未解锁</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .compact-selector {
    position: relative;
    display: inline-block;
  }

  .pack-toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: var(--bg-card);
    border: 1px solid var(--pack-color, #00e5ff);
    border-radius: 20px;
    color: var(--text-primary);
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
  }

  .pack-toggle-btn:hover {
    background: color-mix(in srgb, var(--pack-color, #00e5ff) 10%, var(--bg-card));
    box-shadow: 0 0 12px color-mix(in srgb, var(--pack-color, #00e5ff) 30%, transparent);
  }

  .pack-icon {
    font-size: 16px;
  }

  .pack-name {
    font-weight: 500;
  }

  .toggle-arrow {
    font-size: 10px;
    color: var(--text-dim);
  }

  .pack-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    min-width: 200px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    z-index: 100;
    overflow: hidden;
  }

  .pack-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .pack-option:last-child {
    border-bottom: none;
  }

  .pack-option:hover {
    background: color-mix(in srgb, var(--pack-color) 8%, transparent);
  }

  .pack-option.current {
    background: color-mix(in srgb, var(--pack-color) 15%, transparent);
  }

  .pack-option.locked {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pack-option-icon {
    font-size: 22px;
  }

  .pack-option-info {
    flex: 1;
  }

  .pack-option-name {
    font-size: 13px;
    font-weight: 500;
  }

  .pack-option-stats {
    font-size: 10px;
    color: var(--text-dim);
    margin-top: 2px;
  }

  .check-mark {
    color: var(--pack-color);
    font-weight: bold;
  }

  .lock-icon {
    font-size: 14px;
  }

  .pack-selector-panel {
    margin-bottom: 20px;
  }

  .panel-title {
    font-size: 16px;
    text-align: center;
    margin-bottom: 16px;
    color: var(--text-primary);
  }

  .pack-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }

  .pack-card {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    min-height: 200px;
  }

  .pack-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px var(--pack-glow, rgba(0, 229, 255, 0.2));
  }

  .pack-card.active {
    border-color: var(--pack-color, #00e5ff);
    box-shadow: 0 0 20px var(--pack-glow, rgba(0, 229, 255, 0.3));
  }

  .pack-card.locked {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .pack-card-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
  }

  .pack-card-content {
    position: relative;
    z-index: 1;
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
  }

  .pack-card-icon {
    font-size: 36px;
    margin-bottom: 8px;
    filter: drop-shadow(0 0 8px var(--pack-glow));
  }

  .pack-card-name {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 6px 0;
    color: var(--text-primary);
  }

  .pack-card-desc {
    font-size: 11px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0 0 12px 0;
    flex: 1;
  }

  .pack-card-stats {
    display: flex;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .pack-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .stat-label {
    font-size: 9px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .stat-value.glow {
    color: var(--pack-color, #00e5ff);
  }

  .pack-rarity-preview {
    display: flex;
    gap: 4px;
    justify-content: center;
    margin-top: 8px;
  }

  .rarity-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .current-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 3px 8px;
    background: var(--pack-color, #00e5ff);
    color: #000;
    font-size: 9px;
    font-weight: bold;
    border-radius: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .locked-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    z-index: 10;
    border-radius: 12px;
  }

  .locked-overlay .lock-icon {
    font-size: 28px;
  }

  .locked-overlay span:last-child {
    font-size: 12px;
    color: var(--text-dim);
  }
</style>
