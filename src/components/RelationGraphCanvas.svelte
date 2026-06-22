<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import {
    RELATION_CONFIG,
    RELATION_TYPES
  } from '../utils/relationSystem.js'
  import { CATEGORY_CONFIG, RARITY_CONFIG } from '../data/constants.js'

  export let graph
  export let selectedCardId = null
  export let visibleRelations = {
    [RELATION_TYPES.SYNERGISTIC]: true,
    [RELATION_TYPES.CONFLICTING]: true,
    [RELATION_TYPES.TRANSFORMATIONAL]: true,
    [RELATION_TYPES.COOCCURRENCE]: true,
    [RELATION_TYPES.THEMATIC]: true
  }
  export let filterCategory = 'all'
  export let minWeight = 1

  const dispatch = createEventDispatcher()

  let svgEl
  let viewBox = { x: 0, y: 0, w: 1000, h: 1000 }
  let isDragging = false
  let dragNode = null
  let dragStart = { x: 0, y: 0, nx: 0, ny: 0 }
  let isPanning = false
  let panStart = { x: 0, y: 0, vx: 0, vy: 0 }
  let scale = 1
  let animationId = null
  let hoveredCardId = null
  let hoveredEdgeId = null

  $: filteredNodes = graph.nodes.filter(n =>
    filterCategory === 'all' || n.category === filterCategory
  )
  $: filteredNodeIds = new Set(filteredNodes.map(n => n.id))
  $: filteredEdges = graph.edges.filter(e => {
    if (!visibleRelations[e.type]) return false
    if (e.weight < minWeight) return false
    if (!filteredNodeIds.has(e.source) || !filteredNodeIds.has(e.target)) return false
    if (selectedCardId && e.source !== selectedCardId && e.target !== selectedCardId) return false
    return true
  })
  $: highlightedNodeIds = computeHighlighted()
  $: highlightedEdgeIds = computeHighlightedEdges()

  function computeHighlighted() {
    const set = new Set()
    if (hoveredCardId) {
      set.add(hoveredCardId)
      filteredEdges.forEach(e => {
        if (e.source === hoveredCardId) set.add(e.target)
        if (e.target === hoveredCardId) set.add(e.source)
      })
    }
    if (selectedCardId) {
      set.add(selectedCardId)
      filteredEdges.forEach(e => {
        if (e.source === selectedCardId) set.add(e.target)
        if (e.target === selectedCardId) set.add(e.source)
      })
    }
    return set
  }

  function computeHighlightedEdges() {
    const set = new Set()
    if (hoveredCardId || selectedCardId) {
      const id = hoveredCardId || selectedCardId
      filteredEdges.forEach(e => {
        if (e.source === id || e.target === id) set.add(e.id)
      })
    }
    if (hoveredEdgeId) {
      set.add(hoveredEdgeId)
    }
    return set
  }

  function getNodeColor(node) {
    if (node.rarity && RARITY_CONFIG[node.rarity]) {
      return RARITY_CONFIG[node.rarity].color
    }
    if (node.category && CATEGORY_CONFIG[node.category]) {
      return CATEGORY_CONFIG[node.category].color
    }
    return '#8a8a9a'
  }

  function getNodeGlow(node) {
    if (node.rarity && RARITY_CONFIG[node.rarity]) {
      return RARITY_CONFIG[node.rarity].glow
    }
    return 'rgba(0, 229, 255, 0.3)'
  }

  function getNodeRadius(node) {
    const base = 22
    const degreeBonus = Math.min(node.degree * 0.8, 10)
    const rarityBonus = node.rarity === 'legendary' ? 6 : node.rarity === 'epic' ? 4 : node.rarity === 'rare' ? 2 : 0
    return base + degreeBonus + rarityBonus
  }

  function screenToSvg(clientX, clientY) {
    const rect = svgEl.getBoundingClientRect()
    const x = (clientX - rect.left) / rect.width * viewBox.w + viewBox.x
    const y = (clientY - rect.top) / rect.height * viewBox.h + viewBox.y
    return { x, y }
  }

  function onMouseDown(e) {
    const pt = screenToSvg(e.clientX, e.clientY)
    let hit = null
    for (let i = filteredNodes.length - 1; i >= 0; i--) {
      const n = filteredNodes[i]
      const dx = n.x - pt.x
      const dy = n.y - pt.y
      const r = getNodeRadius(n) + 5
      if (dx * dx + dy * dy <= r * r) {
        hit = n
        break
      }
    }
    if (hit) {
      isDragging = true
      dragNode = hit
      dragStart = { x: e.clientX, y: e.clientY, nx: hit.x, ny: hit.y }
    } else {
      isPanning = true
      panStart = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y }
    }
  }

  function onMouseMove(e) {
    const pt = screenToSvg(e.clientX, e.clientY)
    if (isDragging && dragNode) {
      const rect = svgEl.getBoundingClientRect()
      const dx = (e.clientX - dragStart.x) / rect.width * viewBox.w
      const dy = (e.clientY - dragStart.y) / rect.height * viewBox.h
      dragNode.x = Math.max(50, Math.min(950, dragStart.nx + dx))
      dragNode.y = Math.max(50, Math.min(950, dragStart.ny + dy))
      graph = { ...graph }
    } else if (isPanning) {
      const rect = svgEl.getBoundingClientRect()
      const dx = (e.clientX - panStart.x) / rect.width * viewBox.w
      const dy = (e.clientY - panStart.y) / rect.height * viewBox.h
      viewBox.x = panStart.vx - dx
      viewBox.y = panStart.vy - dy
    } else {
      let found = null
      for (let i = filteredNodes.length - 1; i >= 0; i--) {
        const n = filteredNodes[i]
        const dx = n.x - pt.x
        const dy = n.y - pt.y
        const r = getNodeRadius(n) + 5
        if (dx * dx + dy * dy <= r * r) {
          found = n.id
          break
        }
      }
      hoveredCardId = found
    }
  }

  function onMouseUp(e) {
    if (isDragging && dragNode) {
      const pt = screenToSvg(e.clientX, e.clientY)
      const dx = dragNode.x - pt.x
      const dy = dragNode.y - pt.y
      if (dx * dx + dy * dy < 100) {
        dispatch('selectCard', { cardId: dragNode.id })
      }
    }
    isDragging = false
    dragNode = null
    isPanning = false
  }

  function onWheel(e) {
    e.preventDefault()
    const rect = svgEl.getBoundingClientRect()
    const pt = screenToSvg(e.clientX, e.clientY)
    const factor = e.deltaY > 0 ? 1.1 : 0.9
    const newW = viewBox.w * factor
    const newH = viewBox.h * factor
    viewBox.x = pt.x - (pt.x - viewBox.x) * factor
    viewBox.y = pt.y - (pt.y - viewBox.y) * factor
    viewBox.w = newW
    viewBox.h = newH
    viewBox.w = Math.max(400, Math.min(3000, viewBox.w))
    viewBox.h = Math.max(400, Math.min(3000, viewBox.h))
  }

  function onNodeClick(node) {
    dispatch('selectCard', { cardId: node.id })
  }

  function resetView() {
    viewBox = { x: 0, y: 0, w: 1000, h: 1000 }
  }

  onMount(() => {
    if (svgEl) {
      svgEl.addEventListener('wheel', onWheel, { passive: false })
    }
  })

  onDestroy(() => {
    if (svgEl) {
      svgEl.removeEventListener('wheel', onWheel)
    }
    if (animationId) cancelAnimationFrame(animationId)
  })

  export { resetView }
</script>

<div class="graph-wrapper">
  <svg
    bind:this={svgEl}
    class="graph-svg"
    viewBox="{viewBox.x} {viewBox.y} {viewBox.w} {viewBox.h}"
    on:mousedown={onMouseDown}
    on:mousemove={onMouseMove}
    on:mouseup={onMouseUp}
    on:mouseleave={() => { isDragging = false; isPanning = false; hoveredCardId = null }}
  >
    <defs>
      <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="edge-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <radialGradient id="bg-gradient">
        <stop offset="0%" stop-color="#1a1a3a" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#0a0a1a" stop-opacity="0" />
      </radialGradient>
    </defs>

    <circle cx="500" cy="500" r="480" fill="url(#bg-gradient)" />

    <g class="edges">
      {#each filteredEdges as edge (edge.id)}
        {@const a = graph.nodeMap[edge.source]}
        {@const b = graph.nodeMap[edge.target]}
        {@const config = RELATION_CONFIG[edge.type] || { color: '#888' }}
        {@const isHighlighted = highlightedEdgeIds.has(edge.id)}
        {@const isDimmed = (hoveredCardId || selectedCardId) && !isHighlighted}
        {#if a && b}
          <line
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={config.color}
            stroke-width={isHighlighted ? Math.max(1, edge.weight * 0.8 + 0.5) : Math.max(0.5, edge.weight * 0.4)}
            stroke-opacity={isDimmed ? 0.05 : isHighlighted ? 0.95 : 0.35}
            stroke-dasharray={edge.type === RELATION_TYPES.CONFLICTING ? '8 4' : edge.type === RELATION_TYPES.THEMATIC ? '3 6' : undefined}
            filter={isHighlighted ? 'url(#edge-glow)' : undefined}
            on:mouseenter={() => { hoveredEdgeId = edge.id }}
            on:mouseleave={() => { hoveredEdgeId = null }}
            style="cursor: pointer;"
          />
        {/if}
      {/each}
    </g>

    <g class="nodes">
      {#each filteredNodes as node (node.id)}
        {@const r = getNodeRadius(node)}
        {@const color = getNodeColor(node)}
        {@const isSelected = node.id === selectedCardId}
        {@const isHovered = node.id === hoveredCardId}
        {@const isHighlighted = highlightedNodeIds.has(node.id)}
        {@const isDimmed = (hoveredCardId || selectedCardId) && !isHighlighted}
        <g
          transform="translate({node.x}, {node.y})"
          style="cursor: pointer;"
          on:click={() => onNodeClick(node)}
          on:mouseenter={() => { hoveredCardId = node.id }}
          on:mouseleave={() => { hoveredCardId = null }}
          class="node-group"
        >
          <circle
            r={r + 4}
            fill="none"
            stroke={color}
            stroke-width={isSelected ? 3 : isHovered ? 2 : 0.5}
            stroke-opacity={isDimmed ? 0.1 : isSelected || isHovered ? 1 : 0.4}
            filter={isSelected || isHovered ? 'url(#node-glow)' : undefined}
          />
          <circle
            r={r}
            fill="var(--bg-card)"
            stroke={color}
            stroke-width={1.5}
            opacity={isDimmed ? 0.35 : 1}
            filter={isHighlighted && !isSelected ? 'url(#node-glow)' : undefined}
          />
          <circle
            r={r - 4}
            fill={color}
            fill-opacity={isSelected ? 0.35 : isHovered ? 0.2 : 0.1}
          />
          <text
            text-anchor="middle"
            dominant-baseline="central"
            font-size={Math.max(16, r * 0.7)}
            opacity={isDimmed ? 0.5 : 1}
          >{node.symbol}</text>
          <text
            y={r + 14}
            text-anchor="middle"
            font-size="10"
            fill="var(--text-primary)"
            opacity={isDimmed ? 0.3 : isHovered || isSelected ? 1 : 0.7}
            font-family="var(--font-mono)"
          >{node.name}</text>
        </g>
      {/each}
    </g>
  </svg>

  <div class="graph-hint">
    <span>拖动节点 · 滚轮缩放 · 拖拽空白平移 · 点击选中</span>
    <button class="reset-btn" on:click={resetView}>重置视图</button>
  </div>
</div>

<style>
  .graph-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 500px;
    background:
      radial-gradient(ellipse at center, rgba(0, 229, 255, 0.04) 0%, transparent 70%);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    overflow: hidden;
  }

  .graph-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .node-group {
    transition: opacity 0.15s ease;
  }

  .graph-hint {
    position: absolute;
    bottom: 12px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    background: rgba(10, 10, 26, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    pointer-events: none;
  }

  .reset-btn {
    pointer-events: auto;
    background: transparent;
    border: 1px solid var(--accent-cyan);
    color: var(--accent-cyan);
    padding: 4px 12px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: rgba(0, 229, 255, 0.15);
  }
</style>
