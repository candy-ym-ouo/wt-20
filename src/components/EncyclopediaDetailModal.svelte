<script>
  import CardDisplay from './CardDisplay.svelte'
  import { RARITY_CONFIG, CATEGORY_CONFIG } from '../data/constants.js'
  import { CARDS } from '../data/cards.js'
  import { getEncyclopediaEntry, hasEncyclopediaEntry } from '../data/encyclopedia.js'

  export let card
  export let onClose

  let readingMode = 'upright'

  $: encyclopedia = getEncyclopediaEntry(card.id)
  $: hasFull = hasEncyclopediaEntry(card.id)
  $: relatedCardsData = encyclopedia?.keywordRelations || null

  const READING_SECTIONS = [
    { key: 'career', label: '事业', icon: '💼', color: '#00e5ff' },
    { key: 'love', label: '感情', icon: '💕', color: '#e040fb' },
    { key: 'wealth', label: '财运', icon: '💰', color: '#ffd54f' },
    { key: 'spiritual', label: '精神', icon: '✨', color: '#69f0ae' }
  ]

  function getCardById(id) {
    return CARDS.find(c => c.id === id)
  }

  function jumpToCard(cardId) {
    const target = getCardById(cardId)
    if (target) {
      card = target
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }
</script>

<div class="modal-overlay encyclopedia-overlay" on:click={handleOverlayClick}>
  <div class="modal-content encyclopedia-content">
    <div class="modal-header">
      <button class="close-btn" on:click={onClose} title="关闭">✕</button>
      <h2 class="modal-title">
        {#if hasFull}
          <span class="title-badge">📖 全解档案</span>
        {:else}
          <span class="title-badge preview">📄 基础预览</span>
        {/if}
        <span style="margin-top: 8px; display: block;">◆ {card.name} ◆</span>
      </h2>
    </div>

    <div class="encyclopedia-hero">
      <div class="hero-card">
        <CardDisplay card={card} size="large" />
      </div>
      <div class="hero-info">
        <div class="info-grid">
          <div class="info-cell">
            <div class="cell-label mono">编号</div>
            <div class="cell-value glow-cyan">#{String(card.number).padStart(2, '0')}</div>
          </div>
          <div class="info-cell">
            <div class="cell-label mono">类别</div>
            <div class="cell-value">
              <span style="color: {CATEGORY_CONFIG[card.category].color}">
                {CATEGORY_CONFIG[card.category].icon} {CATEGORY_CONFIG[card.category].label}
              </span>
            </div>
          </div>
          <div class="info-cell">
            <div class="cell-label mono">稀有度</div>
            <div class="cell-value">
              <span class="badge badge-{card.rarity}">{RARITY_CONFIG[card.rarity].label}</span>
            </div>
          </div>
          <div class="info-cell">
            <div class="cell-label mono">符号</div>
            <div class="cell-value" style="font-size: 28px;">{card.symbol}</div>
          </div>
        </div>
        <div class="keywords-block">
          <div class="block-label mono">核心关键词</div>
          <div class="keywords">
            {#each card.keywords as kw}
              <span class="keyword">{kw}</span>
            {/each}
          </div>
        </div>
      </div>
    </div>

    {#if hasFull && encyclopedia}

      <div class="section-wrap">
        <div class="section-title lore-title">
          <span class="section-icon">📜</span>
          背景设定 · Lore
        </div>
        <div class="lore-grid">
          <div class="lore-item origin">
            <div class="lore-label">
              <span>🌱</span> 起源档案
            </div>
            <div class="lore-text">{encyclopedia.lore.origin}</div>
          </div>
          <div class="lore-item myth">
            <div class="lore-label">
              <span>🏛️</span> 神话原型
            </div>
            <div class="lore-text">{encyclopedia.lore.mythology}</div>
          </div>
          <div class="lore-row">
            <div class="lore-item-mini">
              <div class="mini-label">🎭 集体原型</div>
              <div class="mini-value">{encyclopedia.lore.archetype}</div>
            </div>
            <div class="lore-item-mini">
              <div class="mini-label">🌿 关联元素</div>
              <div class="mini-value elements-list">
                {#each encyclopedia.lore.associatedElements as el}
                  <span class="element-tag">{el}</span>
                {/each}
              </div>
            </div>
          </div>
          <div class="lore-item season">
            <div class="lore-label">
              <span>🍃</span> 对应时节
            </div>
            <div class="lore-text">{encyclopedia.lore.season}</div>
          </div>
        </div>
      </div>

      {#if relatedCardsData}
        <div class="section-wrap">
          <div class="section-title network-title">
            <span class="section-icon">🕸️</span>
            关键词关系网 · Relation Network
          </div>

          <div class="network-canvas">
            <div class="network-center">
              <div class="center-card card-{card.rarity}">
                <div class="center-symbol">{card.symbol}</div>
                <div class="center-name">{card.name}</div>
              </div>
            </div>

            {#if relatedCardsData.synergistic?.length}
              <div class="relation-group group-synergistic">
                <div class="group-title">
                  <span class="group-dot"></span>
                  <span class="mono">SYNERGISTIC · 协同增强</span>
                </div>
                <div class="relation-list">
                  {#each relatedCardsData.synergistic as rel}
                    {@const relCard = getCardById(rel.card)}
                    {#if relCard}
                      <div class="relation-item synergistic" on:click={() => jumpToCard(rel.card)}>
                        <div class="rel-card-symbol" style="color: {RARITY_CONFIG[relCard.rarity].color}">
                          {relCard.symbol}
                        </div>
                        <div class="rel-info">
                          <div class="rel-name">{relCard.name}</div>
                          <div class="rel-desc">{rel.relation}</div>
                        </div>
                        <div class="rel-arrow">↔</div>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}

            {#if relatedCardsData.conflicting?.length}
              <div class="relation-group group-conflicting">
                <div class="group-title">
                  <span class="group-dot"></span>
                  <span class="mono">CONFLICTING · 冲突对立</span>
                </div>
                <div class="relation-list">
                  {#each relatedCardsData.conflicting as rel}
                    {@const relCard = getCardById(rel.card)}
                    {#if relCard}
                      <div class="relation-item conflicting" on:click={() => jumpToCard(rel.card)}>
                        <div class="rel-card-symbol" style="color: {RARITY_CONFIG[relCard.rarity].color}">
                          {relCard.symbol}
                        </div>
                        <div class="rel-info">
                          <div class="rel-name">{relCard.name}</div>
                          <div class="rel-desc">{rel.relation}</div>
                        </div>
                        <div class="rel-arrow">⇄</div>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}

            {#if relatedCardsData.transformational?.length}
              <div class="relation-group group-transformational">
                <div class="group-title">
                  <span class="group-dot"></span>
                  <span class="mono">TRANSFORMATIONAL · 转化升华</span>
                </div>
                <div class="relation-list">
                  {#each relatedCardsData.transformational as rel}
                    {@const relCard = getCardById(rel.card)}
                    {#if relCard}
                      <div class="relation-item transformational" on:click={() => jumpToCard(rel.card)}>
                        <div class="rel-card-symbol" style="color: {RARITY_CONFIG[relCard.rarity].color}">
                          {relCard.symbol}
                        </div>
                        <div class="rel-info">
                          <div class="rel-name">{relCard.name}</div>
                          <div class="rel-desc">{rel.relation}</div>
                        </div>
                        <div class="rel-arrow">⇱</div>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}
          </div>

          <div class="network-legend">
            <div class="legend-item">
              <span class="legend-dot synergistic"></span>
              <span class="mono">+协同</span>
              <span class="legend-tip">能量互补，共同强化</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot conflicting"></span>
              <span class="mono">-冲突</span>
              <span class="legend-tip">张力对立，需要调和</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot transformational"></span>
              <span class="mono">×转化</span>
              <span class="legend-tip">质变进化，境界提升</span>
            </div>
          </div>
        </div>
      {/if}

      <div class="section-wrap">
        <div class="section-title reading-title">
          <span class="section-icon">📝</span>
          正逆位长文解读 · Deep Reading
        </div>

        <div class="reading-mode-tabs">
          <div
            class="mode-tab upright {readingMode === 'upright' ? 'active' : ''}"
            on:click={() => (readingMode = 'upright')}
          >
            <span class="mode-icon">☯</span>
            <span class="mono">正 位</span>
            <span class="mode-sub">UPRIGHT</span>
          </div>
          <div
            class="mode-tab reversed {readingMode === 'reversed' ? 'active' : ''}"
            on:click={() => (readingMode = 'reversed')}
          >
            <span class="mode-icon">☯︎</span>
            <span class="mono">逆 位</span>
            <span class="mode-sub">REVERSED</span>
          </div>
        </div>

        <div class="reading-panels">
          {#if readingMode === 'upright'}
          <div class="reading-panel upright-panel">
            <div class="panel-header upright">
              <h3 class="panel-title">{card.upright.title}</h3>
              <div class="panel-fortune mono">{card.upright.fortune}</div>
            </div>
            <div class="panel-body">
              {#each READING_SECTIONS as sec}
                {@const content = encyclopedia.deepReading.upright[sec.key]}
                {#if content}
                  <div class="reading-section-card" style="--sec-color: {sec.color}">
                    <div class="sec-header">
                      <span class="sec-icon">{sec.icon}</span>
                      <span class="sec-label mono">{sec.label}</span>
                    </div>
                    <div class="sec-content">{content}</div>
                  </div>
                {/if}
              {/each}
              {#if encyclopedia.deepReading.upright.timing}
                <div class="timing-card upright">
                  <div class="timing-icon">⏰</div>
                  <div class="timing-label mono">时机信号 · TIMING</div>
                  <div class="timing-content">{encyclopedia.deepReading.upright.timing}</div>
                </div>
              {/if}
              <div class="quick-reading-block">
                <div class="quick-label mono">◆ 快速解读</div>
                <p class="quick-text">{card.upright.meaning}</p>
                <div class="reading-advice">💡 {card.upright.advice}</div>
              </div>
            </div>
          </div>
          {:else}
          <div class="reading-panel reversed-panel">
            <div class="panel-header reversed">
              <h3 class="panel-title">{card.reversed.title}</h3>
              <div class="panel-fortune mono">{card.reversed.fortune}</div>
            </div>
            <div class="panel-body">
              {#each READING_SECTIONS as sec}
                {@const content = encyclopedia.deepReading.reversed[sec.key]}
                {#if content}
                  <div class="reading-section-card reversed-card" style="--sec-color: {sec.color}">
                    <div class="sec-header">
                      <span class="sec-icon">{sec.icon}</span>
                      <span class="sec-label mono">{sec.label}</span>
                    </div>
                    <div class="sec-content">{content}</div>
                  </div>
                {/if}
              {/each}
              {#if encyclopedia.deepReading.reversed.warning}
                <div class="warning-card">
                  <div class="warning-icon">⚠️</div>
                  <div class="warning-label mono">警告信号 · WARNING</div>
                  <div class="warning-content">{encyclopedia.deepReading.reversed.warning}</div>
                </div>
              {/if}
              <div class="quick-reading-block reversed-block">
                <div class="quick-label mono">◆ 快速解读</div>
                <p class="quick-text">{card.reversed.meaning}</p>
                <div class="reading-advice reversed-advice">⚠️ {card.reversed.advice}</div>
              </div>
            </div>
          </div>
          {/if}
        </div>
      </div>

    {:else}
      <div class="not-available-card">
        <div class="na-icon">📝</div>
        <h3 class="na-title">完整百科内容编纂中</h3>
        <p class="na-desc">该卡牌的背景设定、关系网与深度解读档案正在构建中。</p>
        <p class="na-desc2">目前可查看基础正逆位信息：</p>

        <div class="basic-reading-wrap">
          <div class="basic-reading">
            <div class="basic-label glow-cyan">◆ 正位 · {card.upright.title}</div>
            <div class="basic-text">{card.upright.meaning}</div>
            <div class="reading-advice">💡 {card.upright.advice}</div>
          </div>
          <div class="basic-reading">
            <div class="basic-label glow-red">◆ 逆位 · {card.reversed.title}</div>
            <div class="basic-text">{card.reversed.meaning}</div>
            <div class="reading-advice reversed-advice">⚠️ {card.reversed.advice}</div>
          </div>
        </div>
      </div>
    {/if}

    {#if card.hiddenEvent}
      <div class="section-wrap">
        <div class="hidden-event">
          <div class="hidden-event-title">🎯 {card.hiddenEvent.title}</div>
          <div class="hidden-event-desc">{card.hiddenEvent.description}</div>
        </div>
      </div>
    {/if}

    <div class="action-row">
      <button class="btn btn-block" on:click={onClose}>
        关闭档案
      </button>
    </div>
  </div>
</div>

<style>
  .encyclopedia-overlay {
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(8px);
  }
  .encyclopedia-content {
    max-width: 720px;
    width: 100%;
    max-height: 92vh;
    padding: 0;
    background: linear-gradient(180deg, var(--bg-secondary) 0%, #0e0e24 100%);
    border: 1px solid var(--accent-magenta);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 50px rgba(224, 64, 251, 0.25);
  }
  .modal-header {
    position: relative;
    padding: 20px 24px 0;
    text-align: center;
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
    z-index: 5;
  }
  .close-btn:hover {
    color: var(--accent-red);
    border-color: var(--accent-red);
    transform: rotate(90deg);
  }
  .modal-title {
    font-size: 18px;
    letter-spacing: 3px;
  }
  .title-badge {
    display: inline-block;
    font-size: 10px;
    padding: 4px 12px;
    border-radius: 20px;
    background: rgba(0, 229, 255, 0.15);
    color: var(--accent-cyan);
    border: 1px solid var(--accent-cyan);
    letter-spacing: 1px;
  }
  .title-badge.preview {
    background: rgba(138, 138, 154, 0.2);
    color: var(--text-dim);
    border-color: var(--text-dim);
  }

  .encyclopedia-hero {
    display: flex;
    gap: 20px;
    padding: 20px 24px;
    align-items: stretch;
  }
  .hero-card {
    flex-shrink: 0;
  }
  .hero-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .info-cell {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 6px;
    padding: 8px 10px;
  }
  .cell-label {
    font-size: 10px;
    color: var(--text-dim);
    margin-bottom: 4px;
    letter-spacing: 1px;
  }
  .cell-value {
    font-size: 13px;
    color: var(--text-primary);
  }
  .keywords-block .block-label {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 6px;
  }
  .keywords-block .keywords {
    justify-content: flex-start;
  }

  .section-wrap {
    padding: 0 24px;
    margin-bottom: 20px;
  }
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 15px;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 14px;
    letter-spacing: 1.5px;
    font-weight: 600;
  }
  .section-icon {
    font-size: 20px;
  }
  .lore-title {
    background: linear-gradient(90deg, rgba(105, 240, 174, 0.1), transparent);
    color: var(--accent-green);
    border-left: 3px solid var(--accent-green);
  }
  .network-title {
    background: linear-gradient(90deg, rgba(224, 64, 251, 0.1), transparent);
    color: var(--accent-magenta);
    border-left: 3px solid var(--accent-magenta);
  }
  .reading-title {
    background: linear-gradient(90deg, rgba(0, 229, 255, 0.1), transparent);
    color: var(--accent-cyan);
    border-left: 3px solid var(--accent-cyan);
  }

  .lore-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .lore-item {
    background: var(--bg-card);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px;
    padding: 14px;
    position: relative;
    overflow: hidden;
  }
  .lore-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
  }
  .lore-item.origin::before { background: var(--accent-green); }
  .lore-item.myth::before { background: var(--accent-magenta); }
  .lore-item.season::before { background: var(--accent-yellow); }
  .lore-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }
  .lore-text {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.8;
  }
  .lore-row {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 12px;
  }
  .lore-item-mini {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 8px;
    padding: 12px;
  }
  .mini-label {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    margin-bottom: 6px;
    letter-spacing: 0.5px;
  }
  .mini-value {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.6;
  }
  .elements-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .element-tag {
    padding: 2px 8px;
    background: rgba(105, 240, 174, 0.1);
    color: var(--accent-green);
    border: 1px solid rgba(105, 240, 174, 0.3);
    border-radius: 4px;
    font-size: 11px;
    font-family: var(--font-mono);
  }

  .network-canvas {
    position: relative;
    background:
      radial-gradient(circle at 50% 30%, rgba(0, 229, 255, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 20% 70%, rgba(224, 64, 251, 0.05) 0%, transparent 40%),
      var(--bg-card);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .network-center {
    display: flex;
    justify-content: center;
    margin-bottom: 18px;
  }
  .center-card {
    width: 110px;
    text-align: center;
    padding: 16px 10px;
    border-radius: 12px;
    background: linear-gradient(145deg, var(--bg-secondary), var(--bg-card));
    border: 2px solid var(--border-glow);
    box-shadow: 0 0 30px rgba(0, 229, 255, 0.2);
    animation: glow-pulse 3s ease-in-out infinite;
  }
  .center-symbol {
    font-size: 40px;
    margin-bottom: 6px;
    filter: drop-shadow(0 0 10px currentColor);
  }
  .center-name {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-primary);
  }
  .relation-group {
    margin-bottom: 14px;
  }
  .group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    margin-bottom: 8px;
    padding-left: 8px;
    border-left: 2px solid;
  }
  .group-synergistic .group-title {
    color: var(--accent-green);
    border-color: var(--accent-green);
  }
  .group-conflicting .group-title {
    color: var(--accent-red);
    border-color: var(--accent-red);
  }
  .group-transformational .group-title {
    color: var(--accent-yellow);
    border-color: var(--accent-yellow);
  }
  .group-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .group-synergistic .group-dot { background: var(--accent-green); box-shadow: 0 0 8px var(--accent-green); }
  .group-conflicting .group-dot { background: var(--accent-red); box-shadow: 0 0 8px var(--accent-red); }
  .group-transformational .group-dot { background: var(--accent-yellow); box-shadow: 0 0 8px var(--accent-yellow); }

  .relation-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .relation-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(255,255,255,0.02);
    border-radius: 8px;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: all 0.2s;
  }
  .relation-item:hover {
    background: rgba(255,255,255,0.05);
    transform: translateX(3px);
  }
  .relation-item.synergistic { border-left-color: var(--accent-green); }
  .relation-item.conflicting { border-left-color: var(--accent-red); }
  .relation-item.transformational { border-left-color: var(--accent-yellow); }
  .rel-card-symbol {
    font-size: 26px;
    width: 36px;
    text-align: center;
    flex-shrink: 0;
  }
  .rel-info {
    flex: 1;
    min-width: 0;
  }
  .rel-name {
    font-size: 13px;
    color: var(--text-primary);
    margin-bottom: 2px;
    font-weight: 500;
  }
  .rel-desc {
    font-size: 11px;
    color: var(--text-secondary);
    line-height: 1.5;
  }
  .rel-arrow {
    font-size: 16px;
    opacity: 0.5;
    flex-shrink: 0;
  }
  .relation-item.synergistic .rel-arrow { color: var(--accent-green); opacity: 0.8; }
  .relation-item.conflicting .rel-arrow { color: var(--accent-red); opacity: 0.8; }
  .relation-item.transformational .rel-arrow { color: var(--accent-yellow); opacity: 0.8; }

  .network-legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
    padding: 10px;
    background: rgba(255,255,255,0.02);
    border-radius: 8px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-dim);
  }
  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .legend-dot.synergistic { background: var(--accent-green); }
  .legend-dot.conflicting { background: var(--accent-red); }
  .legend-dot.transformational { background: var(--accent-yellow); }
  .legend-tip {
    font-size: 10px;
    opacity: 0.7;
    margin-left: 2px;
  }

  .reading-mode-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
  }
  .mode-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.25s;
    border: 1px solid transparent;
    position: relative;
  }
  .mode-tab.upright {
    background: rgba(0, 229, 255, 0.08);
    border-color: rgba(0, 229, 255, 0.3);
    color: var(--accent-cyan);
  }
  .mode-tab.upright.active {
    background: rgba(0, 229, 255, 0.18);
    border-color: var(--accent-cyan);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
  }
  .mode-tab.reversed {
    background: rgba(255, 82, 82, 0.06);
    border-color: rgba(255, 82, 82, 0.25);
    color: var(--accent-red);
    opacity: 0.7;
  }
  .mode-tab.reversed.active {
    background: rgba(255, 82, 82, 0.15);
    border-color: var(--accent-red);
    opacity: 1;
    box-shadow: 0 0 20px rgba(255, 82, 82, 0.2);
  }
  .mode-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }
  .mode-tab.upright .mode-icon {
    transform: rotate(0deg);
  }
  .mode-tab.reversed .mode-icon {
    transform: rotate(180deg);
  }
  .mode-sub {
    font-size: 9px;
    opacity: 0.6;
    margin-top: 2px;
    letter-spacing: 1px;
  }

  .reading-panels {
    overflow: hidden;
  }
  .reading-panel {
    animation: fade-in 0.3s ease;
  }
  .panel-header {
    padding: 14px 16px;
    border-radius: 10px;
    margin-bottom: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .panel-header.upright {
    background: linear-gradient(90deg, rgba(0, 229, 255, 0.15), rgba(224, 64, 251, 0.08));
    border: 1px solid rgba(0, 229, 255, 0.25);
  }
  .panel-header.reversed {
    background: linear-gradient(90deg, rgba(255, 82, 82, 0.12), rgba(255, 193, 7, 0.08));
    border: 1px solid rgba(255, 82, 82, 0.25);
  }
  .panel-title {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--text-primary);
    letter-spacing: 0.5px;
  }
  .panel-fortune {
    font-size: 11px;
    color: var(--accent-yellow);
  }

  .panel-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .reading-section-card {
    background: var(--bg-card);
    border: 1px solid rgba(255,255,255,0.05);
    border-left: 3px solid var(--sec-color);
    border-radius: 8px;
    padding: 12px 14px;
    transition: all 0.2s;
  }
  .reading-section-card:hover {
    background: rgba(255,255,255,0.03);
    box-shadow: 0 2px 12px color-mix(in srgb, var(--sec-color) 10%, transparent);
  }
  .sec-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }
  .sec-icon {
    font-size: 16px;
  }
  .sec-label {
    font-size: 11px;
    color: var(--sec-color);
    letter-spacing: 2px;
  }
  .sec-content {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.85;
  }
  .timing-card {
    background: linear-gradient(135deg, rgba(105, 240, 174, 0.1), rgba(0, 229, 255, 0.1));
    border: 1px solid rgba(105, 240, 174, 0.3);
    border-radius: 10px;
    padding: 14px;
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 12px;
    align-items: center;
  }
  .timing-icon {
    font-size: 32px;
    grid-row: span 2;
  }
  .timing-label {
    font-size: 10px;
    color: var(--accent-green);
    letter-spacing: 1px;
    margin-bottom: 4px;
  }
  .timing-content {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.6;
  }
  .warning-card {
    background: linear-gradient(135deg, rgba(255, 82, 82, 0.1), rgba(255, 193, 7, 0.1));
    border: 1px solid rgba(255, 82, 82, 0.3);
    border-radius: 10px;
    padding: 14px;
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 12px;
    align-items: center;
    animation: glow-pulse 2.5s ease-in-out infinite;
  }
  .warning-icon {
    font-size: 32px;
    grid-row: span 2;
  }
  .warning-label {
    font-size: 10px;
    color: var(--accent-red);
    letter-spacing: 1px;
    margin-bottom: 4px;
  }
  .warning-content {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.6;
  }
  .quick-reading-block {
    background: rgba(0, 229, 255, 0.04);
    border: 1px solid rgba(0, 229, 255, 0.15);
    border-radius: 10px;
    padding: 14px;
    margin-top: 4px;
  }
  .quick-reading-block.reversed-block {
    background: rgba(255, 82, 82, 0.04);
    border-color: rgba(255, 82, 82, 0.15);
  }
  .quick-label {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 8px;
    letter-spacing: 1px;
  }
  .quick-text {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.8;
    margin-bottom: 10px;
  }

  .not-available-card {
    padding: 30px 24px;
    text-align: center;
  }
  .na-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
  .na-title {
    font-family: var(--font-mono);
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  .na-desc {
    font-size: 13px;
    color: var(--text-dim);
    margin-bottom: 4px;
  }
  .na-desc2 {
    font-size: 12px;
    color: var(--text-dim);
    margin: 16px 0 12px;
  }
  .basic-reading-wrap {
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: left;
  }
  .basic-reading {
    background: var(--bg-card);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 8px;
    padding: 14px;
  }
  .basic-label {
    font-size: 12px;
    margin-bottom: 8px;
    font-family: var(--font-mono);
  }
  .basic-text {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.7;
    margin-bottom: 10px;
  }

  .action-row {
    padding: 0 24px 24px;
    margin-top: 4px;
  }

  :global(.encyclopedia-content) {
    overflow-y: auto;
  }
  :global(.encyclopedia-content::-webkit-scrollbar) {
    width: 6px;
  }
  :global(.encyclopedia-content::-webkit-scrollbar-track) {
    background: transparent;
  }
  :global(.encyclopedia-content::-webkit-scrollbar-thumb) {
    background: var(--accent-magenta);
    border-radius: 3px;
  }
</style>
