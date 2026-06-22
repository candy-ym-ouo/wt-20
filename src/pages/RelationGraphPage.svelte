<script>
  import { onMount } from 'svelte'
  import {
    buildRelationGraph,
    getCardRelations,
    getCooccurrenceStats,
    detectHiddenCombos,
    getCategoryRelations,
    RELATION_TYPES,
    RELATION_CONFIG
  } from '../utils/relationSystem.js'
  import { CATEGORY_CONFIG, RARITY_CONFIG, CARD_CATEGORY, CARD_RARITY } from '../data/constants.js'
  import { CARDS } from '../data/cards.js'
  import RelationGraphCanvas from '../components/RelationGraphCanvas.svelte'
  import EncyclopediaDetailModal from '../components/EncyclopediaDetailModal.svelte'

  let graph = { nodes: [], edges: [], nodeMap: {} }
  let selectedCardId = null
  let selectedCardInfo = null
  let activeTab = 'graph'
  let filterCategory = 'all'
  let minWeight = 1
  let searchQuery = ''
  let combos = []
  let cooccurStats = { topPairs: [], totalPairs: 0, totalDraws: 0 }
  let categoryRelations = {}
  let openEncyclopediaCard = null

  let visibleRelations = {
    [RELATION_TYPES.SYNERGISTIC]: true,
    [RELATION_TYPES.CONFLICTING]: true,
    [RELATION_TYPES.TRANSFORMATIONAL]: true,
    [RELATION_TYPES.COOCCURRENCE]: true,
    [RELATION_TYPES.THEMATIC]: true
  }

  const TABS = [
    { id: 'graph', label: '关系图谱', icon: '🕸️' },
    { id: 'card-relations', label: '卡牌关联', icon: '🔗' },
    { id: 'cooccurrence', label: '共现频次', icon: '📊' },
    { id: 'hidden-combos', label: '隐藏组合', icon: '🔮' },
    { id: 'category', label: '类别关系', icon: '🏷️' }
  ]

  const CATEGORY_TABS = [
    { id: 'all', label: '全部类别', icon: '📋' },
    ...Object.values(CARD_CATEGORY).map(cat => ({
      id: cat,
      label: CATEGORY_CONFIG[cat].label,
      icon: CATEGORY_CONFIG[cat].icon
    }))
  ]

  $: cardRelationStats = {
    synergistic: graph.edges.filter(e => e.type === RELATION_TYPES.SYNERGISTIC).length,
    conflicting: graph.edges.filter(e => e.type === RELATION_TYPES.CONFLICTING).length,
    transformational: graph.edges.filter(e => e.type === RELATION_TYPES.TRANSFORMATIONAL).length,
    cooccurrence: graph.edges.filter(e => e.type === RELATION_TYPES.COOCCURRENCE).length,
    thematic: graph.edges.filter(e => e.type === RELATION_TYPES.THEMATIC).length,
    total: graph.edges.length,
    nodeCount: graph.nodes.length
  }

  $: searchResults = searchQuery
    ? CARDS.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 8)
    : []

  onMount(() => {
    refreshData()
  })

  function refreshData() {
    graph = buildRelationGraph()
    combos = detectHiddenCombos()
    cooccurStats = getCooccurrenceStats()
    categoryRelations = getCategoryRelations()
  }

  function onSelectCard(e) {
    const cardId = e.detail.cardId
    selectedCardId = cardId
    selectedCardInfo = getCardRelations(cardId)
    activeTab = 'card-relations'
  }

  function pickCard(card) {
    selectedCardId = card.id
    selectedCardInfo = getCardRelations(card.id)
    searchQuery = ''
  }

  function clearSelection() {
    selectedCardId = null
    selectedCardInfo = null
  }

  function openEncyclopedia(card) {
    openEncyclopediaCard = card
  }

  function closeEncyclopedia() {
    openEncyclopediaCard = null
  }

  function toggleRelation(type) {
    visibleRelations = { ...visibleRelations, [type]: !visibleRelations[type] }
  }

  function goToCardInGraph(cardId) {
    selectedCardId = cardId
    selectedCardInfo = getCardRelations(cardId)
    activeTab = 'graph'
  }

  function getRarityColor(rarity) {
    return RARITY_CONFIG[rarity]?.color || '#8a8a9a'
  }
</script>

<h1 class="page-title">◆ 卡 牌 关 系 谱 ◆</h1>

<div class="graph-intro">
  <div class="intro-text">
    <span class="intro-icon">🕸️</span>
    <div>
      <h3 class="intro-title mono">赛博宇宙卡牌神经网络</h3>
      <p class="intro-desc">
        可视化呈现 {cardRelationStats.nodeCount} 张卡牌之间的
        <span class="glow-cyan mono">{cardRelationStats.total}</span> 条关联路径。
        探索主题关联、共现规律与隐藏组合，洞察命运背后的深层联结。
      </p>
    </div>
  </div>
  <button class="btn refresh-btn" on:click={refreshData}>
    <span>↻</span> 刷新分析
  </button>
</div>

<div class="stats-bar">
  <div class="stat-chip" style="--c: #69f0ae;">
    <span class="stat-icon">✓</span>
    <span class="stat-label">协同</span>
    <span class="stat-value mono">{cardRelationStats.synergistic}</span>
  </div>
  <div class="stat-chip" style="--c: #ff5252;">
    <span class="stat-icon">⚡</span>
    <span class="stat-label">冲突</span>
    <span class="stat-value mono">{cardRelationStats.conflicting}</span>
  </div>
  <div class="stat-chip" style="--c: #ba68c8;">
    <span class="stat-icon">∞</span>
    <span class="stat-label">转化</span>
    <span class="stat-value mono">{cardRelationStats.transformational}</span>
  </div>
  <div class="stat-chip" style="--c: #4fc3f7;">
    <span class="stat-icon">↔</span>
    <span class="stat-label">共现</span>
    <span class="stat-value mono">{cardRelationStats.cooccurrence}</span>
  </div>
  <div class="stat-chip" style="--c: #ffd54f;">
    <span class="stat-icon">≋</span>
    <span class="stat-label">主题</span>
    <span class="stat-value mono">{cardRelationStats.thematic}</span>
  </div>
  <div class="stat-chip stat-combo" style="--c: #e040fb;">
    <span class="stat-icon">🔮</span>
    <span class="stat-label">隐藏组合</span>
    <span class="stat-value mono">{combos.filter(c => c.unlocked).length}/{combos.length}</span>
  </div>
</div>

<div class="tab-bar">
  {#each TABS as tab}
    <button
      class="tab-btn {activeTab === tab.id ? 'active' : ''}"
      on:click={() => (activeTab = tab.id)}
    >
      <span class="tab-icon">{tab.icon}</span>
      <span>{tab.label}</span>
    </button>
  {/each}
</div>

{#if activeTab === 'graph'}
  <div class="graph-section">
    <div class="controls-panel">
      <div class="control-group">
        <div class="control-label mono">类别筛选</div>
        <div class="category-chips">
          {#each CATEGORY_TABS as cat}
            <button
              class="cat-chip {filterCategory === cat.id ? 'active' : ''}"
              style="--cc: {cat.id !== 'all' ? CATEGORY_CONFIG[cat.id]?.color : 'var(--accent-cyan)'};"
              on:click={() => (filterCategory = cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="control-group">
        <div class="control-label mono">关系类型显示</div>
        <div class="relation-toggles">
          {#each Object.entries(RELATION_CONFIG) as [type, config]}
            <button
              class="rel-toggle {visibleRelations[type] ? 'on' : ''}"
              style="--rc: {config.color};"
              on:click={() => toggleRelation(type)}
            >
              <span class="rel-icon">{config.icon}</span>
              <span>{config.label}</span>
              <span class="rel-count">{graph.edges.filter(e => e.type === type).length}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="control-group">
        <div class="control-label mono">关联强度 ≥ {minWeight}</div>
        <input
          type="range"
          min="1" max="4" step="0.5"
          bind:value={minWeight}
          class="weight-slider"
        />
      </div>

      <div class="control-group">
        <div class="control-label mono">卡牌搜索</div>
        <div class="search-wrap">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="搜索卡牌名称或关键词..."
            class="search-input"
          />
          {#if searchResults.length}
            <div class="search-dropdown">
              {#each searchResults as card}
                <div class="search-item" on:click={() => pickCard(card)}>
                  <span class="search-sym">{card.symbol}</span>
                  <span class="search-name">{card.name}</span>
                  <span class="search-rarity" style="color: {getRarityColor(card.rarity)};">
                    [{RARITY_CONFIG[card.rarity].label}]
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      {#if selectedCardInfo}
        <div class="selection-panel">
          <div class="selection-header">
            <div>
              <span class="sel-sym">{selectedCardInfo.card.symbol}</span>
              <span class="sel-name" style="color: {getRarityColor(selectedCardInfo.card.rarity)};">
                {selectedCardInfo.card.name}
              </span>
            </div>
            <button class="clear-btn" on:click={clearSelection}>✕</button>
          </div>
          <div class="sel-stats">
            <div>关联数量：<span class="mono glow-cyan">{selectedCardInfo.edgeCount}</span></div>
            <button class="encyc-link" on:click={() => openEncyclopedia(selectedCardInfo.card)}>📖 查看百科</button>
          </div>
        </div>
      {/if}

      <div class="legend-box">
        <div class="legend-title mono">图例说明</div>
        {#each Object.values(CATEGORY_CONFIG) as cfg}
          <div class="legend-row">
            <span class="legend-dot" style="background:{cfg.color};"></span>
            <span>{cfg.icon} {cfg.label}</span>
          </div>
        {/each}
        <div class="legend-sub mono">节点大小 = 关联度 + 稀有度</div>
      </div>
    </div>

    <div class="canvas-wrap">
      <RelationGraphCanvas
        bind:graph
        bind:selectedCardId
        {visibleRelations}
        {filterCategory}
        {minWeight}
        on:selectCard={onSelectCard}
      />
    </div>
  </div>

{:else if activeTab === 'card-relations'}
  <div class="relations-section">
    <div class="picker-section">
      <div class="picker-label mono">选择卡牌查看详细关联：</div>
      <div class="picker-grid">
        {#each CARDS as card}
          <button
            class="pick-card {selectedCardId === card.id ? 'selected' : ''}"
            style="--cc: {getRarityColor(card.rarity)};"
            on:click={() => pickCard(card)}
          >
            <span class="pick-sym">{card.symbol}</span>
            <span class="pick-name">{card.name}</span>
          </button>
        {/each}
      </div>
    </div>

    {#if selectedCardInfo}
      <div class="detail-relations">
        <div class="detail-header">
          <div>
            <span class="detail-sym">{selectedCardInfo.card.symbol}</span>
            <span class="detail-name" style="color: {getRarityColor(selectedCardInfo.card.rarity)};">
              {selectedCardInfo.card.name}
            </span>
            <span class="detail-num mono">#{String(selectedCardInfo.card.number).padStart(2, '0')}</span>
          </div>
          <div class="detail-actions">
            <button class="btn sm" on:click={() => goToCardInGraph(selectedCardInfo.card.id)}>🕸️ 在图谱中定位</button>
            <button class="btn sm" on:click={() => openEncyclopedia(selectedCardInfo.card)}>📖 百科详情</button>
          </div>
        </div>

        <div class="keywords-row">
          {#each selectedCardInfo.card.keywords as kw}
            <span class="kw-tag">#{kw}</span>
          {/each}
        </div>

        {#each [
          { key: 'synergistic', label: '协同关系', color: '#69f0ae', desc: '搭配使用能产生积极效果' },
          { key: 'conflicting', label: '冲突关系', color: '#ff5252', desc: '存在张力或矛盾' },
          { key: 'transformational', label: '转化关系', color: '#ba68c8', desc: '能引发深刻的转变' },
          { key: 'cooccurrence', label: '共现关系', color: '#4fc3f7', desc: '历史中经常一起出现' },
          { key: 'thematic', label: '主题关联', color: '#ffd54f', desc: '共享相似的主题关键词' }
        ] as section}
          {#if selectedCardInfo.relations[section.key]?.length}
            <div class="rel-block">
              <div class="rel-block-head" style="--rc: {section.color};">
                <span class="rel-block-title">{section.label}</span>
                <span class="rel-block-desc">{section.desc} · {selectedCardInfo.relations[section.key].length}张</span>
              </div>
              <div class="rel-card-grid">
                {#each selectedCardInfo.relations[section.key] as item}
                  <div
                    class="rel-card"
                    style="--cc: {getRarityColor(item.card.rarity)};"
                    on:click={() => pickCard(item.card)}
                  >
                    <div class="rel-card-head">
                      <span class="rel-card-sym">{item.card.symbol}</span>
                      <div>
                        <div class="rel-card-name">{item.card.name}</div>
                        <div class="rel-card-meta mono" style="color: {CATEGORY_CONFIG[item.card.category]?.color};">
                          {CATEGORY_CONFIG[item.card.category]?.icon} {CATEGORY_CONFIG[item.card.category]?.label}
                        </div>
                      </div>
                      <div class="rel-weight mono" title="关联强度">⚡{item.weight.toFixed(1)}</div>
                    </div>
                    {#if item.description}
                      <div class="rel-card-desc">{item.description}</div>
                    {/if}
                    <div class="rel-card-actions">
                      <button class="mini-btn" on:click|stopPropagation={() => goToCardInGraph(item.card.id)}>图谱</button>
                      <button class="mini-btn" on:click|stopPropagation={() => openEncyclopedia(item.card)}>百科</button>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>

{:else if activeTab === 'cooccurrence'}
  <div class="cooc-section">
    <div class="cooc-header">
      <div>
        <h3 class="mono">历史共现频次统计</h3>
        <p class="cooc-desc">
          基于 <span class="mono glow-cyan">{cooccurStats.totalDraws}</span> 次历史抽取记录，
          检测到 <span class="mono glow-magenta">{cooccurStats.totalPairs}</span> 组卡牌配对。
          高频共现的卡牌可能存在特殊的命运联结。
        </p>
      </div>
    </div>

    {#if cooccurStats.topPairs.length}
      <div class="cooc-list">
        {#each cooccurStats.topPairs as pair, idx}
          <div class="cooc-item">
            <div class="cooc-rank mono">#{idx + 1}</div>
            <div class="cooc-cards">
              <button
                class="cooc-card"
                style="--cc: {getRarityColor(pair.cardA.rarity)};"
                on:click={() => pickCard(pair.cardA)}
              >
                <span class="cc-sym">{pair.cardA.symbol}</span>
                <span class="cc-name">{pair.cardA.name}</span>
              </button>
              <span class="cooc-plus">+</span>
              <button
                class="cooc-card"
                style="--cc: {getRarityColor(pair.cardB.rarity)};"
                on:click={() => pickCard(pair.cardB)}
              >
                <span class="cc-sym">{pair.cardB.symbol}</span>
                <span class="cc-name">{pair.cardB.name}</span>
              </button>
            </div>
            <div class="cooc-stats">
              <div class="cooc-stat">
                <div class="cs-label mono">共现次数</div>
                <div class="cs-value glow-cyan mono">{pair.count}</div>
              </div>
              <div class="cooc-stat">
                <div class="cs-label mono">关联度</div>
                <div class="cs-value glow-magenta mono">{(pair.jaccard * 100).toFixed(0)}%</div>
              </div>
              <div class="cooc-stat">
                <div class="cs-label mono">显著度</div>
                <div class="cs-value glow-yellow mono">{(pair.significance * 100).toFixed(0)}</div>
              </div>
            </div>
            <div class="cooc-bar">
              <div
                class="cooc-bar-fill"
                style="width: {Math.min(pair.count * 12, 100)}%;"
              ></div>
            </div>
            <div class="cooc-actions">
              <button class="mini-btn" on:click={() => goToCardInGraph(pair.cardA.id)}>查看A</button>
              <button class="mini-btn" on:click={() => goToCardInGraph(pair.cardB.id)}>查看B</button>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <div class="empty-title mono">尚无足够数据</div>
        <div class="empty-desc">
          进行更多次三牌阵或多牌阵抽取后，共现数据将在此显示。
          命运的联结需要足够的样本才能显现。
        </div>
      </div>
    {/if}
  </div>

{:else if activeTab === 'hidden-combos'}
  <div class="combos-section">
    <div class="combos-header">
      <h3 class="mono">隐藏组合触发提示</h3>
      <p class="combos-desc">
        基于卡牌关联网络与你的收藏记录，系统检测到
        <span class="mono glow-magenta">{combos.length}</span> 组潜在的特殊组合。
        解锁它们以发现命运的深层奥秘。
      </p>
    </div>

    <div class="combo-progress-bar">
      <div class="combo-progress-fill" style="width: {(combos.filter(c => c.unlocked).length / combos.length * 100) || 0}%;"></div>
      <div class="combo-progress-text mono">
        已解锁 {combos.filter(c => c.unlocked).length} / {combos.length}
      </div>
    </div>

    {#if combos.length}
      <div class="combo-grid">
        {#each combos as combo}
          <div
            class="combo-card {combo.unlocked ? 'unlocked' : 'locked'}"
            style="--tc: {RELATION_CONFIG[combo.type]?.color || '#888'};"
          >
            <div class="combo-badge">
              <span>{RELATION_CONFIG[combo.type]?.icon}</span>
              <span class="mono">{RELATION_CONFIG[combo.type]?.label}</span>
            </div>
            <div class="combo-title mono">{combo.title}</div>
            <div class="combo-cards">
              {#each combo.cards as card}
                <div
                  class="combo-slot {combo.unlocked ? 'active' : ''}"
                  style="--cc: {combo.unlocked ? getRarityColor(card.rarity) : 'var(--text-dim)'};"
                  on:click={() => combo.unlocked && pickCard(card)}
                >
                  <span class="cs-sym">{card.symbol}</span>
                  <span class="cs-name">{card.name}</span>
                </div>
              {/each}
            </div>
            <div class="combo-desc">{combo.description}</div>
            <div class="combo-hint-box">
              <span class="hint-icon">💡</span>
              <span class="hint-text">{combo.hint}</span>
            </div>
            {#if !combo.unlocked}
              <div class="combo-progress">
                <div class="combo-prog-fill" style="width: {(combo.progress || 0.5) * 100}%;"></div>
                <div class="combo-prog-label mono">解锁进度 {Math.round((combo.progress || 0.5) * 100)}%</div>
              </div>
            {/if}
            {#if combo.unlocked && combo.cards.length}
              <div class="combo-actions">
                <button class="mini-btn" on:click={() => goToCardInGraph(combo.cards[0].id)}>查看图谱</button>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-icon">🔮</div>
        <div class="empty-title mono">暂无隐藏组合</div>
        <div class="empty-desc">
          抽取更多卡牌，解锁更多组合。命运的奥秘正在等待被发现。
        </div>
      </div>
    {/if}
  </div>

{:else if activeTab === 'category'}
  <div class="category-section">
    <h3 class="mono cat-sec-title">五大类别相互关系矩阵</h3>
    <p class="cat-sec-desc">
      分析所有卡牌关联数据，统计类别间的协同与冲突倾向。
      了解不同派系卡牌之间的亲和度与排斥性。
    </p>

    <div class="cat-matrix-wrap">
      <table class="cat-matrix">
        <thead>
          <tr>
            <th class="matrix-corner mono">类别 × 类别</th>
            {#each Object.values(CATEGORY_CONFIG) as cfg}
              <th style="color: {cfg.color};">
                <span class="m-icon">{cfg.icon}</span>
                <span>{cfg.label}</span>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each Object.entries(categoryRelations) as [rowId, row]}
            <tr>
              <th style="color: {row.color};">
                <span class="m-icon">{row.icon}</span>
                <span>{row.label}</span>
              </th>
              {#each Object.keys(CATEGORY_CONFIG) as colId}
                {@const syn = row.synergies[colId] || 0}
                {@const con = row.conflicts[colId] || 0}
                {@const total = syn + con}
                <td class="matrix-cell {rowId === colId ? 'diag' : ''}">
                  {#if rowId === colId}
                    <span class="self-tag mono">— 内部 —</span>
                  {:else if total > 0}
                    <div class="cell-stats">
                      {#if syn > 0}
                        <span class="cell-syn mono" title="协同">✓ {syn}</span>
                      {/if}
                      {#if con > 0}
                        <span class="cell-con mono" title="冲突">⚡ {con}</span>
                      {/if}
                    </div>
                    <div class="cell-bar">
                      {#if syn > 0}
                        <div class="bar-syn" style="width: {(syn / total) * 100}%;"></div>
                      {/if}
                      {#if con > 0}
                        <div class="bar-con" style="width: {(con / total) * 100}%;"></div>
                      {/if}
                    </div>
                  {:else}
                    <span class="no-rel mono">—</span>
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="cat-insights">
      <div class="insight-block">
        <h4 class="mono insight-head" style="color: #69f0ae;">📈 最强协同配对</h4>
        {#each getTopSynergies(categoryRelations) as item, idx}
          <div class="insight-row">
            <span class="insight-rank">#{idx + 1}</span>
            <span style="color: {item.aColor};">{item.aIcon}{item.aLabel}</span>
            <span class="insight-arrow">↔</span>
            <span style="color: {item.bColor};">{item.bIcon}{item.bLabel}</span>
            <span class="insight-val mono glow-cyan">{item.count}条</span>
          </div>
        {/each}
      </div>
      <div class="insight-block">
        <h4 class="mono insight-head" style="color: #ff5252;">⚡ 最强冲突配对</h4>
        {#each getTopConflicts(categoryRelations) as item, idx}
          <div class="insight-row">
            <span class="insight-rank">#{idx + 1}</span>
            <span style="color: {item.aColor};">{item.aIcon}{item.aLabel}</span>
            <span class="insight-arrow">⚡</span>
            <span style="color: {item.bColor};">{item.bIcon}{item.bLabel}</span>
            <span class="insight-val mono glow-red">{item.count}条</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

{#if openEncyclopediaCard}
  <EncyclopediaDetailModal card={openEncyclopediaCard} onClose={closeEncyclopedia} />
{/if}

<script context="module">
  function getTopSynergies(relations) {
    const items = []
    const ids = Object.keys(relations)
    for (let i = 0; i < ids.length; i++) {
      for (let j = i; j < ids.length; j++) {
        const a = relations[ids[i]]
        const b = relations[ids[j]]
        const count = (a.synergies[ids[j]] || 0) + (b.synergies[ids[i]] || 0)
        if (count > 0) {
          items.push({
            aLabel: a.label, aIcon: a.icon, aColor: a.color,
            bLabel: b.label, bIcon: b.icon, bColor: b.color,
            count
          })
        }
      }
    }
    return items.sort((x, y) => y.count - x.count).slice(0, 5)
  }

  function getTopConflicts(relations) {
    const items = []
    const ids = Object.keys(relations)
    for (let i = 0; i < ids.length; i++) {
      for (let j = i; j < ids.length; j++) {
        const a = relations[ids[i]]
        const b = relations[ids[j]]
        const count = (a.conflicts[ids[j]] || 0) + (b.conflicts[ids[i]] || 0)
        if (count > 0) {
          items.push({
            aLabel: a.label, aIcon: a.icon, aColor: a.color,
            bLabel: b.label, bIcon: b.icon, bColor: b.color,
            count
          })
        }
      }
    }
    return items.sort((x, y) => y.count - x.count).slice(0, 5)
  }
</script>

<style>
  .graph-intro {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.06), rgba(224, 64, 251, 0.06));
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    margin-bottom: 16px;
  }

  .intro-text {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
  }

  .intro-icon {
    font-size: 36px;
    filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.5));
  }

  .intro-title {
    font-size: 18px;
    color: var(--accent-cyan);
    margin-bottom: 4px;
  }

  .intro-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .refresh-btn {
    padding: 8px 16px;
    font-size: 12px;
    white-space: nowrap;
  }

  .stats-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .stat-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(10, 10, 26, 0.6);
    border: 1px solid var(--c);
    border-radius: 20px;
    font-size: 12px;
    color: var(--c);
    transition: all 0.2s;
  }

  .stat-chip:hover {
    background: color-mix(in srgb, var(--c) 10%, transparent);
  }

  .stat-icon { font-size: 13px; }
  .stat-label { color: var(--text-secondary); }
  .stat-value {
    font-weight: 600;
    color: var(--c);
    margin-left: 2px;
  }

  .tab-bar {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    padding: 4px;
    background: rgba(10, 10, 26, 0.6);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    overflow-x: auto;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: transparent;
    border: none;
    color: var(--text-dim);
    font-size: 13px;
    font-family: var(--font-mono);
    cursor: pointer;
    border-radius: 8px;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.04);
  }

  .tab-btn.active {
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(224, 64, 251, 0.15));
    color: var(--text-primary);
    box-shadow: inset 0 0 0 1px var(--border-glow);
  }

  .graph-section {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 16px;
    min-height: 600px;
  }

  .controls-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background: rgba(10, 10, 26, 0.5);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    max-height: 700px;
    overflow-y: auto;
  }

  .control-label {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  .category-chips, .relation-toggles {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .cat-chip, .rel-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cat-chip.active {
    border-color: var(--cc);
    background: color-mix(in srgb, var(--cc) 8%, transparent);
    color: var(--cc);
  }

  .rel-toggle.on {
    border-color: var(--rc);
    background: color-mix(in srgb, var(--rc) 8%, transparent);
    color: var(--rc);
  }

  .rel-toggle .rel-count {
    margin-left: auto;
    font-size: 10px;
    opacity: 0.7;
  }

  .weight-slider {
    width: 100%;
    accent-color: var(--accent-cyan);
  }

  .search-wrap {
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-glow);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
    font-family: var(--font-body);
  }

  .search-input::placeholder {
    color: var(--text-dim);
  }

  .search-input:focus {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 0 2px rgba(0, 229, 255, 0.15);
  }

  .search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 6px;
    overflow: hidden;
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
  }

  .search-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .search-item:hover {
    background: rgba(0, 229, 255, 0.08);
  }

  .selection-panel {
    padding: 12px;
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(224, 64, 251, 0.08));
    border: 1px solid var(--accent-cyan);
    border-radius: 8px;
  }

  .selection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .sel-sym { font-size: 20px; margin-right: 8px; }
  .sel-name { font-weight: 600; font-size: 14px; }

  .clear-btn {
    width: 24px; height: 24px;
    display: flex; align-items: center; justify-content: center;
    background: transparent;
    border: 1px solid var(--text-dim);
    border-radius: 50%;
    color: var(--text-dim);
    cursor: pointer;
    font-size: 12px;
  }

  .sel-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .encyc-link {
    background: transparent;
    border: none;
    color: var(--accent-cyan);
    cursor: pointer;
    font-size: 12px;
  }

  .legend-box {
    padding: 12px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    border: 1px dashed var(--border-glow);
  }

  .legend-title {
    font-size: 10px;
    color: var(--text-dim);
    margin-bottom: 10px;
  }

  .legend-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .legend-sub {
    font-size: 10px;
    color: var(--text-dim);
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px dashed rgba(255, 255, 255, 0.08);
  }

  .canvas-wrap {
    min-height: 600px;
  }

  .relations-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .picker-section {
    padding: 16px;
    background: rgba(10, 10, 26, 0.5);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
  }

  .picker-label {
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 12px;
  }

  .picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
    padding: 4px;
  }

  .pick-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 6px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .pick-card:hover {
    background: color-mix(in srgb, var(--cc) 6%, transparent);
  }

  .pick-card.selected {
    border-color: var(--cc);
    background: color-mix(in srgb, var(--cc) 12%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--cc) 25%, transparent);
  }

  .pick-sym { font-size: 20px; }
  .pick-name {
    font-size: 11px;
    color: var(--text-primary);
    text-align: center;
    line-height: 1.3;
  }

  .detail-relations {
    padding: 20px;
    background: rgba(10, 10, 26, 0.5);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-glow);
    margin-bottom: 16px;
  }

  .detail-sym {
    font-size: 32px;
    margin-right: 12px;
    vertical-align: middle;
  }

  .detail-name {
    font-size: 22px;
    font-weight: 600;
    vertical-align: middle;
    margin-right: 12px;
  }

  .detail-num {
    font-size: 13px;
    color: var(--text-dim);
  }

  .detail-actions {
    display: flex;
    gap: 8px;
  }

  .btn.sm {
    padding: 8px 14px;
    font-size: 11px;
  }

  .keywords-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 20px;
  }

  .kw-tag {
    padding: 4px 10px;
    background: rgba(224, 64, 251, 0.08);
    border: 1px solid rgba(224, 64, 251, 0.3);
    border-radius: 12px;
    font-size: 11px;
    color: var(--accent-magenta);
    font-family: var(--font-mono);
  }

  .rel-block {
    margin-bottom: 24px;
  }

  .rel-block-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: color-mix(in srgb, var(--rc) 6%, transparent);
    border-left: 3px solid var(--rc);
    border-radius: 0 6px 6px 0;
    margin-bottom: 12px;
  }

  .rel-block-title {
    color: var(--rc);
    font-weight: 600;
    font-size: 14px;
  }

  .rel-block-desc {
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .rel-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 10px;
  }

  .rel-card {
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .rel-card:hover {
    border-color: var(--cc);
    background: color-mix(in srgb, var(--cc) 6%, transparent);
  }

  .rel-card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .rel-card-sym { font-size: 24px; }
  .rel-card-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .rel-card-meta { font-size: 10px; }
  .rel-weight {
    margin-left: auto;
    font-size: 11px;
    color: var(--accent-yellow);
    padding: 2px 8px;
    background: rgba(255, 213, 79, 0.08);
    border-radius: 10px;
  }

  .rel-card-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
    padding: 8px 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    margin-bottom: 10px;
  }

  .rel-card-actions {
    display: flex;
    gap: 6px;
  }

  .mini-btn {
    flex: 1;
    padding: 5px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-glow);
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 11px;
    font-family: var(--font-mono);
    cursor: pointer;
    transition: all 0.15s;
  }

  .mini-btn:hover {
    background: rgba(0, 229, 255, 0.1);
    color: var(--accent-cyan);
    border-color: var(--accent-cyan);
  }

  .cooc-section, .combos-section, .category-section {
    padding: 20px;
    background: rgba(10, 10, 26, 0.5);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
  }

  .cooc-header h3, .combos-header h3, .cat-sec-title {
    font-size: 18px;
    color: var(--accent-cyan);
    margin-bottom: 8px;
  }

  .cooc-desc, .combos-desc, .cat-sec-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .cooc-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cooc-item {
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    display: grid;
    grid-template-columns: 60px 1fr auto auto;
    gap: 16px;
    align-items: center;
  }

  .cooc-rank {
    font-size: 22px;
    font-weight: 700;
    color: var(--accent-magenta);
    text-align: center;
  }

  .cooc-cards {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .cooc-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--cc);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cooc-card:hover {
    background: color-mix(in srgb, var(--cc) 10%, transparent);
  }

  .cc-sym { font-size: 18px; }
  .cc-name { font-size: 13px; color: var(--text-primary); }

  .cooc-plus {
    color: var(--text-dim);
    font-size: 18px;
  }

  .cooc-stats {
    display: flex;
    gap: 20px;
  }

  .cooc-stat { text-align: center; }
  .cs-label { font-size: 10px; color: var(--text-dim); margin-bottom: 2px; }
  .cs-value { font-size: 16px; font-weight: 600; }

  .glow-red { color: var(--accent-red); text-shadow: 0 0 8px rgba(255, 82, 82, 0.4); }
  .glow-yellow { color: var(--accent-yellow); text-shadow: 0 0 8px rgba(255, 213, 79, 0.4); }

  .cooc-bar {
    grid-column: 2 / -1;
    height: 4px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 4px;
  }

  .cooc-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta));
    transition: width 0.3s;
  }

  .cooc-actions {
    display: flex;
    gap: 6px;
    flex-direction: column;
  }

  .combo-progress-bar {
    position: relative;
    height: 32px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-glow);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 20px;
  }

  .combo-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta));
    transition: width 0.3s;
    opacity: 0.5;
  }

  .combo-progress-text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--text-primary);
  }

  .combo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
  }

  .combo-card {
    padding: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
    border: 1px solid color-mix(in srgb, var(--tc) 30%, transparent);
    border-radius: 12px;
    position: relative;
    transition: all 0.3s;
  }

  .combo-card.unlocked {
    background: linear-gradient(135deg, color-mix(in srgb, var(--tc) 5%, transparent), rgba(255, 255, 255, 0.02));
  }

  .combo-card.locked {
    opacity: 0.85;
    filter: saturate(0.7);
  }

  .combo-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    background: color-mix(in srgb, var(--tc) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--tc) 50%, transparent);
    color: var(--tc);
    border-radius: 10px;
    font-size: 10px;
    margin-bottom: 10px;
  }

  .combo-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 14px;
  }

  .combo-cards {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
  }

  .combo-slot {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px dashed color-mix(in srgb, var(--cc) 50%, transparent);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .combo-slot.active {
    border-style: solid;
    background: color-mix(in srgb, var(--cc) 10%, transparent);
  }

  .cs-sym { font-size: 24px; margin-bottom: 4px; }
  .cs-name {
    font-size: 11px;
    color: var(--text-primary);
    text-align: center;
    line-height: 1.3;
  }

  .combo-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
    padding: 10px;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 6px;
    margin-bottom: 10px;
  }

  .combo-hint-box {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 8px 10px;
    background: rgba(255, 213, 79, 0.06);
    border-left: 2px solid var(--accent-yellow);
    border-radius: 0 4px 4px 0;
    margin-bottom: 12px;
  }

  .hint-icon { font-size: 13px; }
  .hint-text { font-size: 11px; color: var(--accent-yellow); line-height: 1.5; }

  .combo-progress {
    position: relative;
    height: 22px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 11px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .combo-prog-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta));
    opacity: 0.6;
    transition: width 0.3s;
  }

  .combo-prog-label {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: var(--text-primary);
  }

  .combo-actions {
    text-align: right;
  }

  .cat-matrix-wrap {
    overflow-x: auto;
    margin-bottom: 24px;
  }

  .cat-matrix {
    width: 100%;
    border-collapse: separate;
    border-spacing: 2px;
    min-width: 500px;
  }

  .cat-matrix th, .cat-matrix td {
    padding: 12px 10px;
    text-align: center;
    font-size: 12px;
  }

  .cat-matrix th {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
  }

  .matrix-corner {
    color: var(--text-dim) !important;
    font-size: 11px !important;
  }

  .matrix-cell {
    background: rgba(255, 255, 255, 0.025);
    border-radius: 6px;
    min-width: 100px;
  }

  .matrix-cell.diag {
    background: rgba(0, 229, 255, 0.04);
  }

  .m-icon { margin-right: 4px; }

  .cell-stats {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .cell-syn {
    color: #69f0ae;
    font-size: 11px;
  }

  .cell-con {
    color: #ff5252;
    font-size: 11px;
  }

  .cell-bar {
    display: flex;
    height: 3px;
    border-radius: 2px;
    overflow: hidden;
  }

  .bar-syn {
    background: #69f0ae;
  }

  .bar-con {
    background: #ff5252;
  }

  .self-tag {
    color: var(--accent-cyan);
    font-size: 11px;
    opacity: 0.7;
  }

  .no-rel {
    color: var(--text-dim);
    opacity: 0.5;
  }

  .cat-insights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }

  .insight-block {
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
  }

  .insight-head {
    font-size: 14px;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .insight-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    margin-bottom: 6px;
    font-size: 12px;
  }

  .insight-rank {
    font-weight: 700;
    color: var(--text-dim);
    min-width: 26px;
  }

  .insight-arrow {
    color: var(--text-dim);
  }

  .insight-val {
    margin-left: auto;
    font-weight: 600;
  }

  .empty-state {
    padding: 60px 20px;
    text-align: center;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
  }

  .empty-title {
    font-size: 18px;
    color: var(--text-dim);
    margin-bottom: 8px;
  }

  .empty-desc {
    font-size: 13px;
    color: var(--text-dim);
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.6;
  }

  @media (max-width: 900px) {
    .graph-section {
      grid-template-columns: 1fr;
    }
    .controls-panel {
      max-height: none;
    }
    .cooc-item {
      grid-template-columns: 1fr;
    }
    .cooc-actions {
      flex-direction: row;
    }
  }
</style>
