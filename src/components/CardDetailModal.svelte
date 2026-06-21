<script>
  import CardDisplay from './CardDisplay.svelte'
  import { RARITY_CONFIG, CATEGORY_CONFIG } from '../data/constants.js'

  export let card
  export let collectionData
  export let onClose

  function formatDate(timestamp) {
    if (!timestamp) return '未知'
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
</script>

<div class="modal-overlay" on:click|self={onClose}>
  <div class="modal-content">
    <h2 class="modal-title">◆ 卡 牌 详 情 ◆</h2>

    <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px;">
      <CardDisplay card={card} size="large" />
    </div>

    <div class="section-title">基础信息</div>
    <div class="info-row">
      <span class="info-label mono">编号</span>
      <span class="info-value">#{String(card.number).padStart(2, '0')}</span>
    </div>
    <div class="info-row">
      <span class="info-label mono">名称</span>
      <span class="info-value">{card.name}</span>
    </div>
    <div class="info-row">
      <span class="info-label mono">类别</span>
      <span class="info-value">
        {CATEGORY_CONFIG[card.category].icon}
        {CATEGORY_CONFIG[card.category].label}
      </span>
    </div>
    <div class="info-row">
      <span class="info-label mono">稀有度</span>
      <span class="badge badge-{card.rarity}">
        {RARITY_CONFIG[card.rarity].label}
      </span>
    </div>

    <div class="section-title">收集数据</div>
    <div class="info-row">
      <span class="info-label mono">首次抽到次数</span>
      <span class="info-value">{formatDate(collectionData.firstDraw)}</span>
    </div>
    <div class="info-row">
      <span class="info-label mono">总抽取次数</span>
      <span class="info-value glow-cyan">{collectionData.drawCount} 次</span>
    </div>
    <div class="info-row">
      <span class="info-label mono">正位次数</span>
      <span class="info-value">{collectionData.uprightCount} 次</span>
    </div>
    <div class="info-row">
      <span class="info-label mono">逆位次数</span>
      <span class="info-value">{collectionData.reversedCount} 次</span>
    </div>

    <div class="section-title">关键词</div>
    <div class="keywords" style="margin-top: 8px;">
      {#each card.keywords as kw}
        <span class="keyword">{kw}</span>
      {/each}
    </div>

    <div class="section-title">正位解读</div>
    <div class="reading-block">
      <h3 class="reading-title">{card.upright.title}</h3>
      <p class="reading-text">{card.upright.meaning}</p>
      <div class="reading-advice">💡 {card.upright.advice}</div>
      <div class="reading-fortune">{card.upright.fortune}</div>
    </div>

    <div class="section-title">逆位解读</div>
    <div class="reading-block">
      <h3 class="reading-title">{card.reversed.title}</h3>
      <p class="reading-text">{card.reversed.meaning}</p>
      <div class="reading-advice">💡 {card.reversed.advice}</div>
      <div class="reading-fortune">{card.reversed.fortune}</div>
    </div>

    {#if card.hiddenEvent}
      <div class="section-title glow-yellow">隐藏事件</div>
      <div class="hidden-event">
        <div class="hidden-event-title">{card.hiddenEvent.title}</div>
        <div class="hidden-event-desc">{card.hiddenEvent.description}</div>
      </div>
    {/if}

    <div class="action-row">
      <button class="btn btn-block btn-primary" on:click={onClose}>
        关闭
      </button>
    </div>
  </div>
</div>

<style>
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .info-label {
    color: var(--text-dim);
    font-size: 12px;
  }
  .info-value {
    color: var(--text-primary);
    font-size: 13px;
  }
</style>
