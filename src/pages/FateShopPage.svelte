<script>
  import { onMount } from 'svelte'
  import {
    SHOP_ITEMS,
    SHOP_ITEM_TYPE,
    ITEM_TYPE_CONFIG,
    SHOP_ITEM_RARITY,
    RARITY_CONFIG,
    getFeaturedItems
  } from '../data/fateShop.js'
  import {
    availableAchievementPoints,
    achievementPoints
  } from '../utils/achievementSystem.js'
  import {
    ownedShopItems,
    shopStats,
    purchaseItem,
    equipItem,
    ownsItem,
    isItemEquipped,
    canAfford,
    refreshShopData
  } from '../utils/fateShopSystem.js'
  import FateShopItemModal from '../components/FateShopItemModal.svelte'

  let activeType = 'all'
  let activeRarity = 'all'
  let filterOwned = 'all'
  let selectedItem = null
  let purchaseMessage = null
  let messageType = 'success'

  const TYPE_TABS = [
    { id: 'all', label: '全部', icon: '✨', color: '#ffffff' },
    ...Object.entries(ITEM_TYPE_CONFIG).map(([id, config]) => ({
      id,
      label: config.label,
      icon: config.icon,
      color: config.color
    }))
  ]

  const RARITY_FILTERS = [
    { id: 'all', label: '全部稀有度' },
    ...Object.entries(RARITY_CONFIG).map(([id, config]) => ({
      id,
      label: config.label,
      color: config.color
    }))
  ]

  const OWNED_FILTERS = [
    { id: 'all', label: '全部' },
    { id: 'owned', label: '已拥有' },
    { id: 'not_owned', label: '未拥有' }
  ]

  $: filteredItems = SHOP_ITEMS.filter(item => {
    const matchesType = activeType === 'all' || item.type === activeType
    const matchesRarity = activeRarity === 'all' || item.rarity === activeRarity
    const owned = ownsItem(item.id)
    const matchesOwned = filterOwned === 'all' ||
      (filterOwned === 'owned' && owned) ||
      (filterOwned === 'not_owned' && !owned)
    return matchesType && matchesRarity && matchesOwned
  })

  $: featuredItems = getFeaturedItems()

  function openItemDetail(item) {
    selectedItem = item
  }

  function closeDetail() {
    selectedItem = null
  }

  function displayItemStatus(item) {
    if (ownsItem(item.id)) {
      if (isItemEquipped(item.id)) {
        return { text: '已装备', class: 'equipped' }
      }
      return { text: '已拥有', class: 'owned' }
    }
    if (canAfford(item)) {
      return { text: '可兑换', class: 'available' }
    }
    return { text: '点数不足', class: 'unavailable' }
  }

  function handlePurchase(item) {
    const result = purchaseItem(item.id)
    purchaseMessage = result.message
    messageType = result.success ? 'success' : 'error'
    
    setTimeout(() => {
      purchaseMessage = null
    }, 3000)
  }

  function handleEquip(item) {
    const result = equipItem(item.id)
    purchaseMessage = result.message
    messageType = result.success ? 'success' : 'error'
    
    setTimeout(() => {
      purchaseMessage = null
    }, 3000)
  }

  function handleRefresh() {
    refreshShopData()
  }

  onMount(() => {
    refreshShopData()
  })
</script>

<h1 class="page-title">◆ 命 运 商 店 ◆</h1>

{#if purchaseMessage}
  <div class="purchase-message {messageType}">
    {purchaseMessage}
  </div>
{/if}

<div class="overview-section">
  <div class="points-display-card">
    <div class="points-icon">🏆</div>
    <div class="points-info">
      <div class="points-label mono">可用成就点数</div>
      <div class="points-value">{$availableAchievementPoints}</div>
      <div class="points-sub mono">
        累计获得 {$achievementPoints} · 已消费 {$shopStats.totalSpent}
      </div>
    </div>
  </div>

  <div class="shop-stats-grid">
    <div class="shop-stat-card">
      <div class="stat-value">{$shopStats.ownedCount}</div>
      <div class="stat-label">已拥有</div>
      <div class="stat-sub mono">{$shopStats.totalCount} 件商品</div>
    </div>
    <div class="shop-stat-card">
      <div class="stat-value">{$shopStats.percent}%</div>
      <div class="stat-label">收藏进度</div>
      <div class="stat-progress">
        <div class="stat-progress-fill" style="width: {$shopStats.percent}%"></div>
      </div>
    </div>
  </div>
</div>

<div class="featured-section">
  <div class="section-title">
    <span class="section-icon">⭐</span>
    精选推荐 · Featured
  </div>
  <div class="featured-grid">
    {#each featuredItems as item}
      <div
        class="featured-card rarity-{item.rarity} {item.limited ? 'limited' : ''}"
        style="--item-color: {RARITY_CONFIG[item.rarity].color};"
        on:click={() => openItemDetail(item)}
      >
        {#if item.limited}
          <div class="limited-badge">限定</div>
        {/if}
        <div class="featured-icon">{item.icon}</div>
        <div class="featured-name">{item.name}</div>
        <div class="featured-type">{ITEM_TYPE_CONFIG[item.type].label}</div>
        <div class="featured-price">
          <span class="price-icon">🏆</span>
          <span class="price-value">{item.price}</span>
        </div>
        <div class="featured-status {displayItemStatus(item).class}">
          {displayItemStatus(item).text}
        </div>
      </div>
    {/each}
  </div>
</div>

<div class="filter-section">
  <div class="tabs category-tabs">
    {#each TYPE_TABS as tab}
      <div
        class="tab {activeType === tab.id ? 'active' : ''}"
        style="--tab-color: {tab.color};"
        on:click={() => (activeType = tab.id)}
      >
        <span>{tab.icon}</span>
        <span>{tab.label}</span>
      </div>
    {/each}
  </div>

  <div class="filter-row">
    <div class="filter-group">
      <span class="filter-label mono">稀有度:</span>
      <div class="tier-filters">
        {#each RARITY_FILTERS as filter}
          <button
            class="tier-btn {activeRarity === filter.id ? 'active' : ''}"
            style="--filter-color: {filter.color || 'var(--text-dim)'};"
            on:click={() => (activeRarity = filter.id)}
          >
            {filter.label}
          </button>
        {/each}
      </div>
    </div>
    <div class="filter-group">
      <span class="filter-label mono">状态:</span>
      <div class="tier-filters">
        {#each OWNED_FILTERS as filter}
          <button
            class="tier-btn {filterOwned === filter.id ? 'active' : ''}"
            style="--filter-color: var(--accent-cyan);"
            on:click={() => (filterOwned = filter.id)}
          >
            {filter.label}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

{#if filteredItems.length === 0}
  <div class="empty-state">
    <div class="empty-state-icon">🏪</div>
    <div class="empty-state-text">没有找到匹配的商品</div>
  </div>
{:else}
  <div class="shop-grid">
    {#each filteredItems as item}
      <div
        class="shop-item-card rarity-{item.rarity} {item.limited ? 'limited' : ''}"
        style="--item-color: {RARITY_CONFIG[item.rarity].color}; --item-glow: {RARITY_CONFIG[item.rarity].glow};"
        on:click={() => openItemDetail(item)}
      >
        {#if item.limited}
          <div class="item-limited-tag">限定</div>
        {/if}
        {#if item.tag}
          <div class="item-tag" style="--tag-color: {RARITY_CONFIG[item.rarity].color};">
            {item.tag}
          </div>
        {/if}
        
        <div class="item-icon">{item.icon}</div>
        <div class="item-name">{item.name}</div>
        <div class="item-type" style="color: {ITEM_TYPE_CONFIG[item.type].color};">
          {ITEM_TYPE_CONFIG[item.type].icon} {ITEM_TYPE_CONFIG[item.type].label}
        </div>
        
        <div class="item-footer">
          <div class="item-price">
            <span class="price-icon">🏆</span>
            <span class="price-value">{item.price}</span>
          </div>
          <div class="item-status {displayItemStatus(item).class}">
            {displayItemStatus(item).text}
          </div>
        </div>

        <div class="item-actions">
          {#if ownsItem(item.id)}
            {#if item.type !== 'divination_access'}
              {#if isItemEquipped(item.id)}
                <button
                  class="btn btn-small btn-equipped"
                  disabled
                >
                  已装备
                </button>
              {:else}
                <button
                  class="btn btn-small btn-yellow"
                  on:click|stopPropagation={() => handleEquip(item)}
                >
                  装备
                </button>
              {/if}
            {/if}
          {:else if canAfford(item)}
            <button
              class="btn btn-small btn-primary"
              on:click|stopPropagation={() => handlePurchase(item)}
            >
              兑换
            </button>
          {:else}
            <button
              class="btn btn-small btn-disabled"
              disabled
            >
              点数不足
            </button>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

<div class="header-actions" style="margin-top: 20px;">
  <button class="btn" on:click={handleRefresh}>
    🔄 刷新
  </button>
</div>

{#if selectedItem}
  <FateShopItemModal
    item={selectedItem}
    isOwned={ownsItem(selectedItem.id)}
    isEquipped={isItemEquipped(selectedItem.id)}
    canAfford={canAfford(selectedItem)}
    onClose={closeDetail}
    onPurchase={() => handlePurchase(selectedItem)}
    onEquip={() => handleEquip(selectedItem)}
  />
{/if}

<style>
  .overview-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .points-display-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
    border: 1px solid var(--accent-yellow);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 0 30px rgba(255, 213, 79, 0.15);
  }

  .points-icon {
    font-size: 48px;
    filter: drop-shadow(0 0 10px var(--accent-yellow));
  }

  .points-info {
    flex: 1;
  }

  .points-label {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 4px;
    letter-spacing: 1px;
  }

  .points-value {
    font-family: var(--font-mono);
    font-size: 36px;
    font-weight: bold;
    background: linear-gradient(135deg, var(--accent-yellow), var(--accent-magenta));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 10px rgba(255, 213, 79, 0.5));
  }

  .points-sub {
    font-size: 10px;
    color: var(--text-dim);
    margin-top: 4px;
  }

  .shop-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .shop-stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 16px;
    text-align: center;
  }

  .stat-value {
    font-family: var(--font-mono);
    font-size: 28px;
    color: var(--accent-cyan);
    text-shadow: 0 0 10px var(--accent-cyan);
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 4px 0;
  }

  .stat-sub {
    font-size: 10px;
    color: var(--text-dim);
  }

  .stat-progress {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    margin-top: 8px;
    overflow: hidden;
  }

  .stat-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta));
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  .featured-section {
    margin-bottom: 20px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--accent-magenta);
    padding: 10px 14px;
    border-left: 3px solid var(--accent-magenta);
    background: linear-gradient(90deg, rgba(224, 64, 251, 0.1), transparent);
    border-radius: 4px;
    margin-bottom: 14px;
    letter-spacing: 1px;
  }

  .section-icon {
    font-size: 18px;
  }

  .featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .featured-card {
    position: relative;
    background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
    border: 1px solid var(--item-color);
    border-radius: 12px;
    padding: 16px 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .featured-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px var(--item-glow);
  }

  .featured-card.limited {
    border-color: var(--accent-yellow);
    animation: glow-pulse 2s ease-in-out infinite;
  }

  .limited-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 8px;
    background: var(--accent-yellow);
    color: var(--bg-primary);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: bold;
  }

  .featured-icon {
    font-size: 36px;
    margin-bottom: 8px;
    filter: drop-shadow(0 0 10px var(--item-color));
  }

  .featured-name {
    font-size: 12px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    margin-bottom: 4px;
  }

  .featured-type {
    font-size: 10px;
    color: var(--text-dim);
    margin-bottom: 8px;
  }

  .featured-price {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-bottom: 6px;
  }

  .price-icon {
    font-size: 12px;
  }

  .price-value {
    font-family: var(--font-mono);
    font-size: 16px;
    color: var(--accent-yellow);
    font-weight: bold;
  }

  .featured-status {
    font-size: 10px;
    font-family: var(--font-mono);
    padding: 3px 8px;
    border-radius: 4px;
    display: inline-block;
  }

  .featured-status.equipped {
    background: rgba(105, 240, 174, 0.2);
    color: var(--accent-green);
  }

  .featured-status.owned {
    background: rgba(0, 229, 255, 0.2);
    color: var(--accent-cyan);
  }

  .featured-status.available {
    background: rgba(255, 213, 79, 0.2);
    color: var(--accent-yellow);
  }

  .featured-status.unavailable {
    background: rgba(255, 82, 82, 0.2);
    color: var(--accent-red);
  }

  .filter-section {
    margin-bottom: 16px;
  }

  .category-tabs {
    margin-bottom: 12px;
    overflow-x: auto;
    flex-wrap: nowrap;
    border-bottom: none;
    gap: 4px;
  }

  .category-tabs .tab {
    flex: none;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid transparent;
    border-radius: 6px;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .category-tabs .tab.active {
    background: rgba(0, 0, 0, 0.3);
    border-color: var(--tab-color);
    color: var(--tab-color);
  }

  .filter-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .filter-label {
    font-size: 11px;
    color: var(--text-dim);
  }

  .tier-filters {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tier-btn {
    padding: 4px 10px;
    font-family: var(--font-mono);
    font-size: 11px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: var(--text-dim);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tier-btn:hover {
    border-color: var(--filter-color);
  }

  .tier-btn.active {
    border-color: var(--filter-color);
    color: var(--filter-color);
    background: rgba(0, 0, 0, 0.3);
  }

  .shop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .shop-item-card {
    position: relative;
    background: var(--bg-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 14px 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .shop-item-card:hover {
    transform: translateY(-3px);
    border-color: var(--item-color);
    box-shadow: 0 5px 20px var(--item-glow);
  }

  .shop-item-card.limited {
    border-color: var(--accent-yellow);
  }

  .item-limited-tag {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 6px;
    background: var(--accent-yellow);
    color: var(--bg-primary);
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 8px;
    font-weight: bold;
    z-index: 1;
  }

  .item-tag {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.5);
    color: var(--tag-color);
    border: 1px solid var(--tag-color);
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 8px;
    z-index: 1;
  }

  .item-icon {
    font-size: 36px;
    margin-bottom: 8px;
    position: relative;
    z-index: 1;
  }

  .shop-item-card:hover .item-icon {
    filter: drop-shadow(0 0 10px var(--item-color));
  }

  .item-name {
    font-size: 12px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    margin-bottom: 4px;
    position: relative;
    z-index: 1;
  }

  .item-type {
    font-size: 10px;
    margin-bottom: 10px;
    position: relative;
    z-index: 1;
  }

  .item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    position: relative;
    z-index: 1;
  }

  .item-price {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .item-price .price-icon {
    font-size: 10px;
  }

  .item-price .price-value {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent-yellow);
    font-weight: bold;
  }

  .item-status {
    font-size: 9px;
    font-family: var(--font-mono);
    padding: 2px 6px;
    border-radius: 3px;
  }

  .item-status.equipped {
    background: rgba(105, 240, 174, 0.2);
    color: var(--accent-green);
  }

  .item-status.owned {
    background: rgba(0, 229, 255, 0.2);
    color: var(--accent-cyan);
  }

  .item-status.available {
    background: rgba(255, 213, 79, 0.2);
    color: var(--accent-yellow);
  }

  .item-status.unavailable {
    background: rgba(255, 82, 82, 0.2);
    color: var(--accent-red);
  }

  .item-actions {
    position: relative;
    z-index: 1;
  }

  .btn-small {
    width: 100%;
    padding: 6px 12px;
    font-size: 11px;
  }

  .btn-equipped {
    background: rgba(105, 240, 174, 0.1);
    border-color: var(--accent-green);
    color: var(--accent-green);
    opacity: 0.7;
  }

  .btn-disabled {
    opacity: 0.4;
    cursor: not-allowed;
    border-color: var(--text-dim);
    color: var(--text-dim);
  }

  .purchase-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 8px;
    font-family: var(--font-mono);
    font-size: 13px;
    z-index: 1000;
    animation: slide-down 0.3s ease;
  }

  .purchase-message.success {
    background: rgba(105, 240, 174, 0.95);
    color: var(--bg-primary);
    border: 1px solid var(--accent-green);
  }

  .purchase-message.error {
    background: rgba(255, 82, 82, 0.95);
    color: white;
    border: 1px solid var(--accent-red);
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @media (max-width: 600px) {
    .overview-section {
      grid-template-columns: 1fr;
    }
  }
</style>
