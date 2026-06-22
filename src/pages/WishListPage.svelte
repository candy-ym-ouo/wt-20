<script>
  import { onMount } from 'svelte'
  import {
    WISH_STATUS,
    WISH_CATEGORIES,
    getWishCategory,
    getWishStatusInfo,
    createWish,
    getWishList,
    getWishStats,
    formatDate,
    formatRelativeTime,
    deleteWish,
    completeWish,
    archiveWish,
    reactivateWish
  } from '../utils/wishSystem.js'
  import WishDetailModal from '../components/WishDetailModal.svelte'

  let activeFilter = 'all'
  let categoryFilter = 'all'
  let wishes = []
  let filteredWishes = []
  let stats = null
  let showAddForm = false
  let showDetailModal = false
  let selectedWishId = null
  let newWish = {
    title: '',
    description: '',
    category: 'other',
    targetDate: '',
    question: ''
  }

  const STATUS_FILTERS = [
    { id: 'all', label: '全部', icon: '📋' },
    { id: WISH_STATUS.ACTIVE, label: '进行中', icon: '🔮' },
    { id: WISH_STATUS.IN_PROGRESS, label: '追踪中', icon: '📊' },
    { id: WISH_STATUS.COMPLETED, label: '已达成', icon: '✨' },
    { id: WISH_STATUS.ARCHIVED, label: '已归档', icon: '📦' }
  ]

  onMount(() => {
    refresh()
  })

  function refresh() {
    wishes = getWishList().map(wish => ({
      ...wish,
      _category: getWishCategory(wish.category),
      _statusInfo: getWishStatusInfo(wish.status),
      _drawCount: (wish.linkedDraws || []).length,
      _reviewCount: (wish.reviews || []).length
    }))
    stats = getWishStats()
    applyFilters()
  }

  function applyFilters() {
    let result = [...wishes]
    
    if (activeFilter !== 'all') {
      result = result.filter(w => w.status === activeFilter)
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(w => w.category === categoryFilter)
    }
    
    filteredWishes = result
  }

  $: if (activeFilter || categoryFilter) {
    applyFilters()
  }

  function handleSubmitWish(e) {
    e.preventDefault()
    if (!newWish.title.trim()) return
    
    const wishData = {
      ...newWish,
      targetDate: newWish.targetDate ? new Date(newWish.targetDate).getTime() : null
    }
    
    createWish(wishData)
    
    newWish = {
      title: '',
      description: '',
      category: 'other',
      targetDate: '',
      question: ''
    }
    showAddForm = false
    refresh()
  }

  function openWishDetail(wishId) {
    selectedWishId = wishId
    showDetailModal = true
  }

  function closeDetail() {
    showDetailModal = false
    selectedWishId = null
    refresh()
  }

  function handleDelete(wishId, e) {
    e.stopPropagation()
    if (confirm('确定要删除这个愿望吗？所有关联的抽卡记录和复盘都将被清除。')) {
      deleteWish(wishId)
      refresh()
    }
  }

  function handleComplete(wishId, e) {
    e.stopPropagation()
    const finalNote = prompt('写下达成这个愿望的感悟（可选）：')
    if (finalNote !== null) {
      completeWish(wishId, finalNote || '')
      refresh()
    }
  }

  function handleArchive(wishId, e) {
    e.stopPropagation()
    archiveWish(wishId)
    refresh()
  }

  function handleReactivate(wishId, e) {
    e.stopPropagation()
    reactivateWish(wishId)
    refresh()
  }

  function getDaysRemaining(targetDate) {
    if (!targetDate) return null
    const now = Date.now()
    const diff = targetDate - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }
</script>

<h1 class="page-title">◆ 愿 望 清 单 ◆</h1>

{#if stats}
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">{stats.total}</div>
      <div class="stat-label">总愿望数</div>
    </div>
    <div class="stat-card">
      <div class="stat-value glow-cyan">{stats.active + stats.inProgress}</div>
      <div class="stat-label">进行中</div>
    </div>
    <div class="stat-card">
      <div class="stat-value glow-green">{stats.completed}</div>
      <div class="stat-label">已达成</div>
    </div>
    <div class="stat-card">
      <div class="stat-value glow-magenta">{stats.totalLinkedDraws}</div>
      <div class="stat-label">关联抽卡</div>
    </div>
  </div>
{/if}

<div class="action-bar">
  <button class="btn btn-primary" on:click={() => showAddForm = !showAddForm}>
    {showAddForm ? '✕ 取消' : '✨ 新愿望'}
  </button>
  
  <div class="filter-group">
    <select class="select" bind:value={categoryFilter}>
      <option value="all">全部分类</option>
      {#each WISH_CATEGORIES as cat}
        <option value={cat.id}>{cat.icon} {cat.name}</option>
      {/each}
    </select>
  </div>
</div>

{#if showAddForm}
  <div class="add-form-container">
    <div class="form-card">
      <div class="form-title">
        <span class="form-icon">✨</span>
        <span>记录新的愿望</span>
      </div>
      
      <form on:submit={handleSubmitWish}>
        <div class="form-group">
          <label class="form-label">愿望标题 *</label>
          <input
            type="text"
            class="input"
            bind:value={newWish.title}
            placeholder="例如：找到理想的工作"
            maxlength={50}
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">分类</label>
          <div class="category-grid">
            {#each WISH_CATEGORIES as cat}
              <div
                class="category-item {newWish.category === cat.id ? 'active' : ''}"
                style="--cat-color: {cat.color};"
                on:click={() => newWish.category = cat.id}
              >
                <span class="category-icon">{cat.icon}</span>
                <span class="category-name">{cat.name}</span>
              </div>
            {/each}
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">详细描述</label>
          <textarea
            class="textarea"
            bind:value={newWish.description}
            placeholder="描述这个愿望的具体内容、背景和期望..."
            rows={3}
            maxlength={500}
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">想要占卜的问题</label>
          <input
            type="text"
            class="input"
            bind:value={newWish.question}
            placeholder="例如：我应该如何规划接下来的求职道路？"
            maxlength={100}
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">目标日期（可选）</label>
          <input
            type="date"
            class="input"
            bind:value={newWish.targetDate}
          />
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" on:click={() => showAddForm = false}>
            取消
          </button>
          <button type="submit" class="btn btn-primary" disabled={!newWish.title.trim()}>
            💾 保存愿望
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<div class="status-tabs">
  {#each STATUS_FILTERS as filter}
    <div
      class="status-tab {activeFilter === filter.id ? 'active' : ''}"
      on:click={() => activeFilter = filter.id}
    >
      <span>{filter.icon}</span>
      <span>{filter.label}</span>
      {#if filter.id !== 'all'}
        <span class="tab-count">{stats ? stats[filter.id === WISH_STATUS.ACTIVE ? 'active' : filter.id === WISH_STATUS.IN_PROGRESS ? 'inProgress' : filter.id] : 0}</span>
      {/if}
    </div>
  {/each}
</div>

{#if filteredWishes.length === 0}
  <div class="empty-state">
    <div class="empty-state-icon">🌟</div>
    <div class="empty-state-text">
      {wishes.length === 0 ? '还没有愿望记录' : '没有符合条件的愿望'}<br/>
      {#if wishes.length === 0}
        <button
          class="btn btn-primary"
          style="margin-top: 16px; font-size: 12px;"
          on:click={() => showAddForm = true}
        >
          ✨ 添加第一个愿望
        </button>
      {/if}
    </div>
  </div>
{:else}
  <div class="wish-list">
    {#each filteredWishes as wish}
      {@const daysRemaining = getDaysRemaining(wish.targetDate)}
      <div
        class="wish-card"
        style="--wish-color: {wish._category.color};"
        on:click={() => openWishDetail(wish.id)}
      >
        <div class="wish-header">
          <div class="wish-category" style="color: var(--wish-color)">
            <span class="wish-category-icon">{wish._category.icon}</span>
            <span class="wish-category-name">{wish._category.name}</span>
          </div>
          <div class="wish-status" style="color: {wish._statusInfo.color}">
            {wish._statusInfo.icon} {wish._statusInfo.label}
          </div>
        </div>
        
        <div class="wish-title">{wish.title}</div>
        
        {#if wish.description}
          <div class="wish-description">{wish.description}</div>
        {/if}
        
        {#if wish.question}
          <div class="wish-question">
            <span class="question-icon">💭</span>
            <span>{wish.question}</span>
          </div>
        {/if}
        
        <div class="wish-meta">
          <div class="meta-item">
            <span class="meta-icon">🎴</span>
            <span>{wish._drawCount} 次抽卡</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">📝</span>
            <span>{wish._reviewCount} 次复盘</span>
          </div>
          {#if wish.targetDate}
            <div class="meta-item {daysRemaining !== null && daysRemaining < 0 ? 'overdue' : ''}">
              <span class="meta-icon">📅</span>
              <span>
                {#if daysRemaining !== null && daysRemaining < 0}
                  已过期 {Math.abs(daysRemaining)} 天
                {:else if daysRemaining === 0}
                  今天截止
                {:else if daysRemaining !== null && daysRemaining <= 7}
                  还剩 {daysRemaining} 天
                {:else}
                  {formatDate(wish.targetDate)}
                {/if}
              </span>
            </div>
          {/if}
        </div>
        
        <div class="wish-footer">
          <div class="wish-time mono">{formatRelativeTime(wish.createdAt)}</div>
          <div class="wish-actions">
            {#if wish.status === WISH_STATUS.COMPLETED}
              <button
                class="action-btn"
                on:click|stopPropagation={(e) => handleReactivate(wish.id, e)}
                title="重新激活"
              >
                🔄
              </button>
            {:else if wish.status !== WISH_STATUS.ARCHIVED}
              <button
                class="action-btn complete-btn"
                on:click|stopPropagation={(e) => handleComplete(wish.id, e)}
                title="标记达成"
              >
                ✅
              </button>
            {/if}
            {#if wish.status === WISH_STATUS.ARCHIVED}
              <button
                class="action-btn"
                on:click|stopPropagation={(e) => handleReactivate(wish.id, e)}
                title="恢复"
              >
                🔄
              </button>
            {:else}
              <button
                class="action-btn"
                on:click|stopPropagation={(e) => handleArchive(wish.id, e)}
                title="归档"
              >
                📦
              </button>
            {/if}
            <button
              class="action-btn delete-btn"
              on:click|stopPropagation={(e) => handleDelete(wish.id, e)}
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}

{#if showDetailModal && selectedWishId}
  <WishDetailModal
    wishId={selectedWishId}
    onClose={closeDetail}
  />
{/if}

<style>
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .filter-group {
    display: flex;
    gap: 8px;
  }
  
  .select {
    padding: 8px 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 12px;
    cursor: pointer;
  }
  
  .add-form-container {
    margin-bottom: 20px;
    animation: slide-down 0.3s ease;
  }
  
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .form-card {
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.08), rgba(0, 229, 255, 0.08));
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 20px;
  }
  
  .form-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: bold;
    color: var(--accent-magenta);
    margin-bottom: 16px;
  }
  
  .form-icon {
    font-size: 24px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-label {
    display: block;
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 6px;
    font-family: var(--font-mono);
  }
  
  .input,
  .textarea {
    width: 100%;
    padding: 10px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 13px;
    transition: all 0.2s;
    font-family: var(--font-body);
  }
  
  .input:focus,
  .textarea:focus {
    outline: none;
    border-color: var(--accent-cyan);
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
  }
  
  .textarea {
    resize: vertical;
  }
  
  .category-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  .category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 8px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .category-item:hover {
    border-color: var(--cat-color);
    transform: translateY(-2px);
  }
  
  .category-item.active {
    background: color-mix(in srgb, var(--cat-color) 15%, transparent);
    border-color: var(--cat-color);
    box-shadow: 0 0 12px color-mix(in srgb, var(--cat-color) 30%, transparent);
  }
  
  .category-icon {
    font-size: 20px;
  }
  
  .category-name {
    font-size: 11px;
    color: var(--text-secondary);
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
  }
  
  .status-tabs {
    display: flex;
    gap: 0;
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 4px;
    margin-bottom: 16px;
    overflow-x: auto;
  }
  
  .status-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--text-dim);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  
  .status-tab:hover {
    color: var(--text-secondary);
    background: rgba(0, 0, 0, 0.2);
  }
  
  .status-tab.active {
    color: var(--accent-cyan);
    background: rgba(0, 229, 255, 0.1);
  }
  
  .tab-count {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-family: var(--font-mono);
  }
  
  .wish-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .wish-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  
  .wish-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--wish-color);
    box-shadow: 0 0 10px var(--wish-color);
  }
  
  .wish-card:hover {
    border-color: var(--wish-color);
    transform: translateX(4px);
    box-shadow: 0 0 20px color-mix(in srgb, var(--wish-color) 20%, transparent);
  }
  
  .wish-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .wish-category {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-family: var(--font-mono);
  }
  
  .wish-category-icon {
    font-size: 16px;
  }
  
  .wish-status {
    font-size: 11px;
    font-family: var(--font-mono);
  }
  
  .wish-title {
    font-size: 15px;
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 6px;
    line-height: 1.4;
  }
  
  .wish-description {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 8px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .wish-question {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(224, 64, 251, 0.08);
    border-left: 2px solid var(--accent-magenta);
    border-radius: 0 6px 6px 0;
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--text-secondary);
    font-style: italic;
  }
  
  .question-icon {
    font-size: 14px;
    flex-shrink: 0;
  }
  
  .wish-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 10px;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--text-dim);
  }
  
  .meta-item.overdue {
    color: var(--accent-red);
  }
  
  .meta-icon {
    font-size: 12px;
  }
  
  .wish-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px dashed var(--border-glow);
  }
  
  .wish-time {
    font-size: 10px;
    color: var(--text-dim);
  }
  
  .wish-actions {
    display: flex;
    gap: 6px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }
  
  .action-btn:hover {
    transform: scale(1.1);
    border-color: var(--accent-cyan);
  }
  
  .action-btn.complete-btn:hover {
    border-color: var(--accent-green);
    background: rgba(105, 240, 174, 0.1);
  }
  
  .action-btn.delete-btn:hover {
    border-color: var(--accent-red);
    background: rgba(255, 82, 82, 0.1);
  }
  
  .glow-cyan {
    color: var(--accent-cyan);
    text-shadow: 0 0 10px var(--accent-cyan);
  }
  
  .glow-green {
    color: var(--accent-green);
    text-shadow: 0 0 10px var(--accent-green);
  }
</style>
