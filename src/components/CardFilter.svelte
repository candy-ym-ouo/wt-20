<script>
  import { CARD_RARITY, RARITY_CONFIG, CATEGORY_CONFIG } from '../data/constants.js'
  import { STORYLINE_CONFIG, getAllKeywords } from '../utils/deckSystem.js'

  export let searchQuery = ''
  export let rarity = null
  export let category = null
  export let storyline = null
  export let selectedKeywords = []
  export let collectedOnly = false

  let showKeywordDropdown = false
  const allKeywords = getAllKeywords()

  $: filteredKeywords = allKeywords.filter(k =>
    k.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function toggleKeyword(keyword) {
    if (selectedKeywords.includes(keyword)) {
      selectedKeywords = selectedKeywords.filter(k => k !== keyword)
    } else {
      selectedKeywords = [...selectedKeywords, keyword]
    }
  }

  function clearFilters() {
    searchQuery = ''
    rarity = null
    category = null
    storyline = null
    selectedKeywords = []
    collectedOnly = false
  }

  function selectRarity(r) {
    rarity = rarity === r ? null : r
  }

  function selectStoryline(s) {
    storyline = storyline === s ? null : s
  }
</script>

<div class="filter-container">
  <div class="filter-section">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="搜索卡牌名称或关键词..."
      class="search-input"
    />
  </div>

  <div class="filter-section">
    <div class="filter-label">稀有度</div>
    <div class="filter-options">
      {#each Object.values(CARD_RARITY) as r}
        <button
          class="filter-btn rarity-btn {rarity === r ? 'active' : ''}"
          style="--filter-color: {RARITY_CONFIG[r].color}"
          on:click={() => selectRarity(r)}
        >
          {RARITY_CONFIG[r].label}
        </button>
      {/each}
    </div>
  </div>

  <div class="filter-section">
    <div class="filter-label">故事线</div>
    <div class="filter-options">
      {#each Object.values(STORYLINE_CONFIG) as s}
        <button
          class="filter-btn storyline-btn {storyline === s.id ? 'active' : ''}"
          style="--filter-color: {s.color}"
          on:click={() => selectStoryline(s.id)}
        >
          <span class="btn-icon">{s.icon}</span>
          {s.name}
        </button>
      {/each}
    </div>
  </div>

  <div class="filter-section">
    <div class="filter-label">关键词</div>
    <div class="selected-keywords">
      {#each selectedKeywords as kw}
        <span class="keyword-tag" on:click={() => toggleKeyword(kw)}>
          {kw} ×
        </span>
      {/each}
    </div>
    <div class="keyword-dropdown-trigger" on:click={() => showKeywordDropdown = !showKeywordDropdown}>
      {showKeywordDropdown ? '收起关键词 ▲' : '展开关键词 ▼'}
    </div>
    {#if showKeywordDropdown}
      <div class="keyword-dropdown">
        {#each filteredKeywords as kw}
          <span
            class="keyword-option {selectedKeywords.includes(kw) ? 'selected' : ''}"
            on:click={() => toggleKeyword(kw)}
          >
            {kw}
          </span>
        {/each}
      </div>
    {/if}
  </div>

  <div class="filter-section">
    <label class="checkbox-label">
      <input type="checkbox" bind:checked={collectedOnly} />
      <span>仅显示已收集</span>
    </label>
  </div>

  <button class="clear-btn" on:click={clearFilters}>
    清除所有筛选
  </button>
</div>

<style>
  .filter-container {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .filter-section {
    margin-bottom: 16px;
  }

  .filter-section:last-child {
    margin-bottom: 0;
  }

  .filter-label {
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 8px;
    font-family: var(--font-mono);
  }

  .search-input {
    width: 100%;
    padding: 10px 14px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-glow);
    border-radius: 6px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 13px;
    outline: none;
    transition: all 0.2s ease;
  }

  .search-input:focus {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
  }

  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-btn {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-glow);
    border-radius: 20px;
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .filter-btn:hover {
    border-color: var(--filter-color, var(--accent-cyan));
    color: var(--filter-color, var(--accent-cyan));
  }

  .filter-btn.active {
    background: var(--filter-color, var(--accent-cyan));
    border-color: var(--filter-color, var(--accent-cyan));
    color: #000;
    font-weight: bold;
  }

  .btn-icon {
    font-size: 14px;
  }

  .selected-keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }

  .keyword-tag {
    padding: 4px 10px;
    background: var(--accent-cyan);
    border-radius: 12px;
    font-size: 11px;
    color: #000;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .keyword-tag:hover {
    background: var(--accent-magenta);
  }

  .keyword-dropdown-trigger {
    font-size: 11px;
    color: var(--accent-cyan);
    cursor: pointer;
    font-family: var(--font-mono);
  }

  .keyword-dropdown-trigger:hover {
    color: var(--accent-magenta);
  }

  .keyword-dropdown {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
    max-height: 150px;
    overflow-y: auto;
    padding: 8px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
  }

  .keyword-option {
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    font-size: 11px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .keyword-option:hover {
    background: rgba(0, 229, 255, 0.2);
    color: var(--accent-cyan);
  }

  .keyword-option.selected {
    background: var(--accent-cyan);
    color: #000;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
  }

  .checkbox-label input {
    accent-color: var(--accent-cyan);
  }

  .clear-btn {
    width: 100%;
    padding: 8px;
    background: transparent;
    border: 1px dashed var(--border-glow);
    border-radius: 6px;
    color: var(--text-dim);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-mono);
  }

  .clear-btn:hover {
    border-color: var(--accent-magenta);
    color: var(--accent-magenta);
  }
</style>
