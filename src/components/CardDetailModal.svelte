<script>
  import CardDisplay from './CardDisplay.svelte'
  import { RARITY_CONFIG, CATEGORY_CONFIG } from '../data/constants.js'
  import { getCardRelations, RELATION_CONFIG, RELATION_TYPES } from '../utils/relationSystem.js'

  export let card
  export let collectionData
  export let onClose

  $: cardRelations = getCardRelations(card.id)
  $: hasThematicRelations = cardRelations.relations.thematic.length > 0
  $: hasCooccurrence = cardRelations.relations.cooccurrence.length > 0
  $: hasAnyRelation = cardRelations.edgeCount > 0

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

  function goToRelationGraph() {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'relation-graph' } }))
    onClose()
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

    {#if hasAnyRelation}
      <div class="section-title" style="color: var(--accent-magenta);">
        🕸️ 主题关联 · 共现频次
      </div>

      {#if hasThematicRelations}
        <div class="relation-sub-section">
          <div class="relation-sub-label" style="color: {RELATION_CONFIG[RELATION_TYPES.THEMATIC].color};">
            ≋ 主题关联
          </div>
          <div class="relation-tags">
            {#each cardRelations.relations.thematic as item}
              <span class="relation-tag thematic" title="{item.description}">
                {item.card.symbol} {item.card.name}
                <span class="tag-weight">{item.weight.toFixed(1)}</span>
              </span>
            {/each}
          </div>
        </div>
      {/if}

      {#if hasCooccurrence}
        <div class="relation-sub-section">
          <div class="relation-sub-label" style="color: {RELATION_CONFIG[RELATION_TYPES.COOCCURRENCE].color};">
            ↔ 共现频次
          </div>
          <div class="relation-tags">
            {#each cardRelations.relations.cooccurrence as item}
              <span class="relation-tag cooccur" title="{item.description}">
                {item.card.symbol} {item.card.name}
                <span class="tag-weight">{item.description}</span>
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <div class="relation-summary">
        <span class="mono" style="color: var(--text-dim); font-size: 11px;">
          共 {cardRelations.edgeCount} 条关联路径
        </span>
        <button class="btn-link" on:click={goToRelationGraph}>
          🕸️ 查看完整关系图谱 →
        </button>
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

  .relation-sub-section {
    margin-bottom: 12px;
  }
  .relation-sub-label {
    font-size: 12px;
    font-family: var(--font-mono);
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }
  .relation-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .relation-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 16px;
    font-size: 11px;
    color: var(--text-primary);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .relation-tag.thematic {
    background: rgba(255, 213, 79, 0.08);
    border-color: rgba(255, 213, 79, 0.3);
  }
  .relation-tag.cooccur {
    background: rgba(79, 195, 247, 0.08);
    border-color: rgba(79, 195, 247, 0.3);
  }
  .tag-weight {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-dim);
    padding: 1px 5px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 8px;
  }
  .relation-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    margin-top: 8px;
  }
  .btn-link {
    background: transparent;
    border: none;
    color: var(--accent-magenta);
    font-size: 12px;
    cursor: pointer;
    font-family: var(--font-mono);
    transition: color 0.2s;
  }
  .btn-link:hover {
    color: var(--accent-cyan);
  }
</style>
