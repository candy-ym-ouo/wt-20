<script>
  import {
    ITEM_TYPE_CONFIG,
    RARITY_CONFIG,
    SHOP_ITEM_TYPE
  } from '../data/fateShop.js'
  import { availableAchievementPoints } from '../utils/achievementSystem.js'

  export let item
  export let isOwned
  export let isEquipped
  export let canAfford
  export let onClose
  export let onPurchase
  export let onEquip

  $: typeConfig = ITEM_TYPE_CONFIG[item.type]
  $: rarityConfig = RARITY_CONFIG[item.rarity]
  $: isDivinationAccess = item.type === SHOP_ITEM_TYPE.DIVINATION_ACCESS

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  function handlePurchase() {
    onPurchase()
  }

  function handleEquip() {
    onEquip()
  }
</script>

<div class="modal-overlay shop-modal-overlay" on:click={handleOverlayClick}>
  <div class="modal-content shop-modal-content" style="--item-color: {rarityConfig.color};">
    <div class="modal-header">
      <button class="close-btn" on:click={onClose} title="关闭">✕</button>
    </div>

    <div class="shop-item-hero" style="--item-glow: {rarityConfig.glow};">
      {#if item.limited}
        <div class="hero-limited-badge">
          <span>⭐</span> 限定商品
        </div>
      {/if}
      
      <div class="hero-icon-wrapper">
        <div class="hero-icon">{item.icon}</div>
        <div class="hero-glow"></div>
      </div>
      
      <div class="hero-info">
        <div class="hero-rarity-badge" style="background: {rarityConfig.color}20; color: {rarityConfig.color};">
          {rarityConfig.label}
        </div>
        <h2 class="hero-name">{item.name}</h2>
        <div class="hero-type" style="color: {typeConfig.color};">
          <span>{typeConfig.icon}</span>
          <span>{typeConfig.label}</span>
        </div>
      </div>
    </div>

    <div class="shop-item-body">
      <div class="item-description-section">
        <div class="section-label mono">商品描述</div>
        <p class="item-description">{item.description}</p>
      </div>

      {#if item.preview}
        <div class="preview-section">
          <div class="section-label mono">预览效果</div>
          <div class="preview-display" style="--preview-color: {item.preview.color || rarityConfig.color};">
            {#if item.type === SHOP_ITEM_TYPE.SKIN}
              <div class="preview-card preview-skin">
                <div class="preview-card-symbol">{item.icon}</div>
                <div class="preview-card-name">{item.name}</div>
              </div>
            {:else if item.type === SHOP_ITEM_TYPE.CARD_BACK}
              <div class="preview-card preview-cardback" style="--pattern: {item.preview.pattern};">
                <div class="cardback-pattern"></div>
              </div>
            {:else if item.type === SHOP_ITEM_TYPE.ANIMATION}
              <div class="preview-animation">
                <div class="animation-demo">
                  <div class="demo-icon">{item.icon}</div>
                  <div class="animation-particles"></div>
                </div>
                <div class="animation-name">{item.preview.effect}</div>
              </div>
            {:else if item.type === SHOP_ITEM_TYPE.DIVINATION_ACCESS}
              <div class="preview-divination">
                <div class="divination-spread">
                  {#each Array(item.preview.cardCount) as _, i}
                    <div class="spread-card" style="--index: {i};">{i + 1}</div>
                  {/each}
                </div>
                <div class="divination-info">
                  <div class="spread-name">{item.preview.spread}</div>
                  <div class="spread-cards">{item.preview.cardCount} 张牌</div>
                </div>
              </div>
            {:else if item.type === SHOP_ITEM_TYPE.SPECIAL_TITLE}
              <div class="preview-title" style="color: {item.preview.color};">
                <span class="title-prefix">👑</span>
                <span class="title-text">{item.preview.title}</span>
              </div>
            {:else if item.type === SHOP_ITEM_TYPE.CARD_BORDER}
              <div class="preview-border" style="--border-style: {item.preview.style};">
                <div class="border-demo">
                  <div class="border-inner">{item.icon}</div>
                </div>
                <div class="border-name">{item.preview.style}</div>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <div class="price-section">
        <div class="price-info">
          <div class="price-label mono">兑换价格</div>
          <div class="price-value">
            <span class="price-icon">🏆</span>
            <span class="price-amount">{item.price}</span>
            <span class="price-unit">成就点数</span>
          </div>
          <div class="price-balance">
            当前余额: <span class={canAfford ? 'balance-ok' : 'balance-low'}>{$availableAchievementPoints}</span>
          </div>
        </div>

        {#if item.tag}
          <div class="item-tag-badge" style="background: {rarityConfig.color}20; color: {rarityConfig.color};">
            {item.tag}
          </div>
        {/if}
      </div>
    </div>

    <div class="shop-item-footer">
      {#if isOwned}
        {#if isDivinationAccess}
          <div class="owned-status access-granted">
            <span class="status-icon">✅</span>
            <span>占卜权限已解锁，可在占卜页面使用</span>
          </div>
          <button class="btn btn-block" on:click={onClose}>
            关闭
          </button>
        {:else if isEquipped}
          <div class="owned-status equipped">
            <span class="status-icon">✨</span>
            <span>已装备</span>
          </div>
          <button class="btn btn-block btn-disabled" disabled>
            已装备
          </button>
        {:else}
          <div class="owned-status owned">
            <span class="status-icon">📦</span>
            <span>已拥有，点击装备使用</span>
          </div>
          <button class="btn btn-block btn-yellow" on:click={handleEquip}>
            ⚡ 立即装备
          </button>
        {/if}
      {:else if canAfford}
        <button class="btn btn-block btn-primary" on:click={handlePurchase}>
          🔮 确认兑换
        </button>
      {:else}
        <div class="not-affordable">
          <span class="status-icon">💔</span>
          <span>成就点数不足，还需 {item.price - $availableAchievementPoints} 点</span>
        </div>
        <button class="btn btn-block btn-disabled" disabled>
          点数不足
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .shop-modal-overlay {
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
  }

  .shop-modal-content {
    max-width: 520px;
    width: 100%;
    max-height: 92vh;
    padding: 0;
    background: linear-gradient(180deg, var(--bg-secondary) 0%, #0e0e24 100%);
    border: 1px solid var(--item-color);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 60px var(--item-glow, rgba(224, 64, 251, 0.3));
  }

  .modal-header {
    position: relative;
    padding: 16px 20px 0;
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--text-dim);
    background: transparent;
    color: var(--text-dim);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    z-index: 10;
  }

  .close-btn:hover {
    color: var(--accent-red);
    border-color: var(--accent-red);
    transform: rotate(90deg);
  }

  .shop-item-hero {
    position: relative;
    padding: 30px 24px 24px;
    text-align: center;
    background: 
      radial-gradient(circle at 50% 30%, var(--item-glow) 0%, transparent 50%),
      linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%);
    overflow: hidden;
  }

  .hero-limited-badge {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 16px;
    background: linear-gradient(90deg, var(--accent-yellow), var(--accent-magenta));
    color: var(--bg-primary);
    border-radius: 20px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: bold;
    animation: glow-pulse 2s ease-in-out infinite;
  }

  .hero-icon-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 16px;
  }

  .hero-icon {
    font-size: 72px;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 0 20px var(--item-color));
    animation: float 3s ease-in-out infinite;
  }

  .hero-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, var(--item-color) 0%, transparent 70%);
    opacity: 0.3;
    animation: hero-pulse 2s ease-in-out infinite;
  }

  @keyframes hero-pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .hero-rarity-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  .hero-name {
    font-family: var(--font-mono);
    font-size: 22px;
    color: var(--text-primary);
    margin-bottom: 6px;
    text-shadow: 0 0 20px var(--item-color);
  }

  .hero-type {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    font-family: var(--font-mono);
  }

  .shop-item-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
  }

  .section-label {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  .item-description-section {
    margin-bottom: 20px;
  }

  .item-description {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.8;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px;
    padding: 14px;
  }

  .preview-section {
    margin-bottom: 20px;
  }

  .preview-display {
    background: var(--bg-card);
    border: 1px solid var(--preview-color);
    border-radius: 10px;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 150px;
    box-shadow: 0 0 20px var(--preview-color)20;
  }

  .preview-card {
    width: 100px;
    height: 160px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, var(--bg-card), var(--bg-secondary));
    border: 2px solid var(--preview-color);
    box-shadow: 0 0 25px var(--preview-color);
  }

  .preview-card-symbol {
    font-size: 36px;
    margin-bottom: 8px;
    filter: drop-shadow(0 0 8px var(--preview-color));
  }

  .preview-card-name {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--preview-color);
  }

  .preview-cardback {
    position: relative;
    overflow: hidden;
  }

  .cardback-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      repeating-linear-gradient(45deg, var(--preview-color)10 0px, transparent 10px, transparent 20px),
      repeating-linear-gradient(-45deg, var(--preview-color)10 0px, transparent 10px, transparent 20px);
    opacity: 0.5;
  }

  .preview-animation {
    text-align: center;
  }

  .animation-demo {
    position: relative;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
  }

  .demo-icon {
    font-size: 48px;
    animation: demo-glow 1.5s ease-in-out infinite;
    filter: drop-shadow(0 0 15px var(--preview-color));
  }

  @keyframes demo-glow {
    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px var(--preview-color)); }
    50% { transform: scale(1.1); filter: drop-shadow(0 0 25px var(--preview-color)); }
  }

  .animation-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .animation-particles::before,
  .animation-particles::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--preview-color);
    border-radius: 50%;
    animation: particle-float 2s ease-in-out infinite;
  }

  .animation-particles::before {
    top: 20%;
    left: 10%;
    animation-delay: 0s;
  }

  .animation-particles::after {
    bottom: 20%;
    right: 10%;
    animation-delay: 1s;
  }

  @keyframes particle-float {
    0%, 100% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1); opacity: 1; }
  }

  .animation-name {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--preview-color);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .preview-divination {
    text-align: center;
  }

  .divination-spread {
    display: flex;
    gap: 6px;
    justify-content: center;
    margin-bottom: 12px;
  }

  .spread-card {
    width: 28px;
    height: 44px;
    background: linear-gradient(145deg, var(--bg-card), var(--bg-secondary));
    border: 1px solid var(--preview-color);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--preview-color);
    animation: spread-fan 0.5s ease-out forwards;
    animation-delay: calc(var(--index) * 0.1s);
    opacity: 0;
    transform: translateY(10px);
  }

  @keyframes spread-fan {
    to { opacity: 1; transform: translateY(0); }
  }

  .divination-info {
    font-family: var(--font-mono);
  }

  .spread-name {
    font-size: 12px;
    color: var(--preview-color);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }

  .spread-cards {
    font-size: 10px;
    color: var(--text-dim);
  }

  .preview-title {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background: linear-gradient(90deg, var(--preview-color)10, transparent);
    border-left: 3px solid var(--preview-color);
    border-radius: 4px;
  }

  .title-prefix {
    font-size: 24px;
  }

  .title-text {
    font-family: var(--font-mono);
    font-size: 18px;
    font-weight: bold;
    text-shadow: 0 0 15px currentColor;
  }

  .preview-border {
    text-align: center;
  }

  .border-demo {
    width: 100px;
    height: 100px;
    padding: 4px;
    background: var(--preview-color);
    border-radius: 12px;
    margin: 0 auto 12px;
    animation: border-pulse 2s ease-in-out infinite;
  }

  .border-inner {
    width: 100%;
    height: 100%;
    background: var(--bg-card);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
  }

  @keyframes border-pulse {
    0%, 100% { box-shadow: 0 0 15px var(--preview-color); }
    50% { box-shadow: 0 0 30px var(--preview-color); }
  }

  .border-name {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--preview-color);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .price-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 213, 79, 0.05);
    border: 1px solid rgba(255, 213, 79, 0.2);
    border-radius: 10px;
  }

  .price-label {
    font-size: 10px;
    color: var(--text-dim);
    margin-bottom: 6px;
  }

  .price-value {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }

  .price-icon {
    font-size: 18px;
  }

  .price-amount {
    font-family: var(--font-mono);
    font-size: 28px;
    font-weight: bold;
    color: var(--accent-yellow);
    text-shadow: 0 0 15px var(--accent-yellow);
  }

  .price-unit {
    font-size: 11px;
    color: var(--text-dim);
  }

  .price-balance {
    font-size: 11px;
    color: var(--text-dim);
  }

  .balance-ok {
    color: var(--accent-green);
    font-weight: bold;
  }

  .balance-low {
    color: var(--accent-red);
    font-weight: bold;
  }

  .item-tag-badge {
    padding: 6px 12px;
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: bold;
    white-space: nowrap;
  }

  .shop-item-footer {
    padding: 16px 24px 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .owned-status,
  .not-affordable {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    margin-bottom: 12px;
    font-size: 12px;
  }

  .owned-status.access-granted {
    background: rgba(105, 240, 174, 0.1);
    color: var(--accent-green);
    border: 1px solid var(--accent-green);
  }

  .owned-status.equipped {
    background: rgba(105, 240, 174, 0.1);
    color: var(--accent-green);
    border: 1px solid var(--accent-green);
  }

  .owned-status.owned {
    background: rgba(0, 229, 255, 0.1);
    color: var(--accent-cyan);
    border: 1px solid var(--accent-cyan);
  }

  .not-affordable {
    background: rgba(255, 82, 82, 0.1);
    color: var(--accent-red);
    border: 1px solid var(--accent-red);
  }

  .status-icon {
    font-size: 16px;
  }

  .btn-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  :global(.shop-modal-content::-webkit-scrollbar) {
    width: 6px;
  }

  :global(.shop-modal-content::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(.shop-modal-content::-webkit-scrollbar-thumb) {
    background: var(--item-color);
    border-radius: 3px;
  }
</style>
