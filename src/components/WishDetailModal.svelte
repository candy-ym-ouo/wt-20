<script>
  import { onMount } from 'svelte'
  import {
    getWishById,
    formatDate,
    formatRelativeTime,
    addReviewToWish,
    WISH_STATUS
  } from '../utils/wishSystem.js'
  import CardDisplay from './CardDisplay.svelte'
  import { getCardById } from '../utils/cardSystem.js'

  export let wishId
  export let onClose

  let wish = null
  let activeTab = 'draws'
  let showReviewForm = false
  let newReview = {
    content: '',
    outcome: 'neutral',
    mood: 'neutral'
  }

  const OUTCOME_OPTIONS = [
    { id: 'good', label: '进展顺利', icon: '🌟', color: 'var(--accent-green)' },
    { id: 'neutral', label: '保持平稳', icon: '➖', color: 'var(--accent-yellow)' },
    { id: 'challenge', label: '遇到挑战', icon: '⚡', color: 'var(--accent-magenta)' },
    { id: 'setback', label: '有所退步', icon: '💔', color: 'var(--accent-red)' }
  ]

  const MOOD_OPTIONS = [
    { id: 'happy', label: '开心', icon: '😊' },
    { id: 'hopeful', label: '充满希望', icon: '✨' },
    { id: 'calm', label: '平静', icon: '😌' },
    { id: 'anxious', label: '焦虑', icon: '😰' },
    { id: 'frustrated', label: '沮丧', icon: '😤' },
    { id: 'neutral', label: '一般', icon: '😐' }
  ]

  onMount(() => {
    refresh()
  })

  function refresh() {
    wish = getWishById(wishId)
  }

  function handleAddReview(e) {
    e.preventDefault()
    if (!newReview.content.trim()) return

    addReviewToWish(wishId, newReview)
    newReview = {
      content: '',
      outcome: 'neutral',
      mood: 'neutral'
    }
    showReviewForm = false
    refresh()
  }

  function getOutcomeInfo(outcomeId) {
    return OUTCOME_OPTIONS.find(o => o.id === outcomeId) || OUTCOME_OPTIONS[1]
  }

  function getMoodInfo(moodId) {
    return MOOD_OPTIONS.find(m => m.id === moodId) || MOOD_OPTIONS[MOOD_OPTIONS.length - 1]
  }

  function getCardDisplay(draw) {
    if (draw.cardId) {
      const card = getCardById(draw.cardId)
      return card ? [{ card, isReversed: draw.isReversed }] : []
    }
    if (draw.cards) {
      return draw.cards.map(c => {
        const card = getCardById(c.cardId)
        return card ? { card, isReversed: c.isReversed, position: c.position } : null
      }).filter(Boolean)
    }
    return []
  }
</script>

{#if wish}
  <div class="modal-overlay" on:click|self={onClose}>
    <div class="modal-content wish-modal">
      <div class="modal-header">
        <div class="wish-header-info">
          <div class="wish-category" style="color: {wish._category.color}">
            <span class="wish-category-icon">{wish._category.icon}</span>
            <span class="wish-category-name">{wish._category.name}</span>
          </div>
          <div class="wish-status" style="color: {wish._statusInfo.color}">
            {wish._statusInfo.icon} {wish._statusInfo.label}
          </div>
        </div>
        <button class="close-btn" on:click={onClose}>✕</button>
      </div>

      <div class="wish-detail-title">{wish.title}</div>

      {#if wish.description}
        <div class="wish-detail-description">{wish.description}</div>
      {/if}

      {#if wish.question}
        <div class="wish-detail-question">
          <span class="question-icon">💭</span>
          <span>{wish.question}</span>
        </div>
      {/if}

      {#if wish.targetDate || wish.completedAt}
        <div class="wish-detail-dates">
          {#if wish.targetDate}
            <div class="date-item">
              <span class="date-icon">🎯</span>
              <span>目标日期：{formatDate(wish.targetDate)}</span>
            </div>
          {/if}
          {#if wish.completedAt}
            <div class="date-item">
              <span class="date-icon">✨</span>
              <span>达成日期：{formatDate(wish.completedAt)}</span>
            </div>
          {/if}
          <div class="date-item">
            <span class="date-icon">📅</span>
            <span>创建日期：{formatDate(wish.createdAt)}</span>
          </div>
        </div>
      {/if}

      {#if wish.finalNote}
        <div class="wish-final-note">
          <div class="final-note-title">✨ 达成感悟</div>
          <div class="final-note-content">{wish.finalNote}</div>
        </div>
      {/if}

      <div class="detail-tabs">
        <div
          class="detail-tab {activeTab === 'draws' ? 'active' : ''}"
          on:click={() => activeTab = 'draws'}
        >
          🎴 关联抽卡 ({wish._linkedCards.length})
        </div>
        <div
          class="detail-tab {activeTab === 'reviews' ? 'active' : ''}"
          on:click={() => activeTab = 'reviews'}
        >
          📝 复盘记录 ({(wish.reviews || []).length})
        </div>
      </div>

      {#if activeTab === 'draws'}
        <div class="tab-content">
          {#if wish._linkedCards.length === 0}
            <div class="empty-state-small">
              <div class="empty-icon">🎴</div>
              <div class="empty-text">暂无关联的抽卡记录</div>
              <div class="empty-hint">在抽卡结果中可以关联到这个愿望</div>
            </div>
          {:else}
            <div class="linked-draws-list">
              {#each wish._linkedCards as draw, drawIndex}
                <div class="linked-draw-item">
                  <div class="draw-header">
                    <div class="draw-time mono">{formatRelativeTime(draw.linkedAt)}</div>
                    {#if draw.question}
                      <div class="draw-question-small">💭 {draw.question}</div>
                    {/if}
                  </div>
                  
                  <div class="draw-cards">
                    {#each getCardDisplay(draw) as cardDisplay, cardIndex}
                      <div class="draw-card-item">
                        {#if cardDisplay.position}
                          <div class="card-position">{cardDisplay.position}</div>
                        {/if}
                        <CardDisplay
                          card={cardDisplay.card}
                          isReversed={cardDisplay.isReversed}
                          size="tiny"
                        />
                        <div class="card-orientation mono">
                          {cardDisplay.isReversed ? '逆位' : '正位'}
                        </div>
                      </div>
                    {/each}
                  </div>

                  {#if draw.meaning}
                    <div class="draw-meaning">
                      <div class="meaning-label">牌意：</div>
                      <div class="meaning-text">{draw.meaning}</div>
                    </div>
                  {/if}

                  {#if draw.advice}
                    <div class="draw-advice">
                      <div class="advice-label">建议：</div>
                      <div class="advice-text">{draw.advice}</div>
                    </div>
                  {/if}

                  {#if draw.fortune}
                    <div class="draw-fortune">
                      <span class="fortune-label">运势：</span>
                      <span class="fortune-value">{draw.fortune}</span>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      {#if activeTab === 'reviews'}
        <div class="tab-content">
          {#if wish.status !== WISH_STATUS.ARCHIVED}
            <div class="review-form-section">
              {#if !showReviewForm}
                <button class="btn btn-secondary btn-block" on:click={() => showReviewForm = true}>
                  📝 添加复盘记录
                </button>
              {:else}
                <div class="review-form">
                  <div class="form-title">📝 记录复盘</div>
                  
                  <form on:submit={handleAddReview}>
                    <div class="form-group">
                      <label class="form-label">进展情况</label>
                      <div class="option-grid">
                        {#each OUTCOME_OPTIONS as opt}
                          <div
                            class="option-item {newReview.outcome === opt.id ? 'active' : ''}"
                            style="--opt-color: {opt.color};"
                            on:click={() => newReview.outcome = opt.id}
                          >
                            <span class="option-icon">{opt.icon}</span>
                            <span class="option-label">{opt.label}</span>
                          </div>
                        {/each}
                      </div>
                    </div>

                    <div class="form-group">
                      <label class="form-label">当前心情</label>
                      <div class="option-grid mood-grid">
                        {#each MOOD_OPTIONS as opt}
                          <div
                            class="option-item {newReview.mood === opt.id ? 'active' : ''}"
                            on:click={() => newReview.mood = opt.id}
                          >
                            <span class="option-icon">{opt.icon}</span>
                            <span class="option-label">{opt.label}</span>
                          </div>
                        {/each}
                      </div>
                    </div>

                    <div class="form-group">
                      <label class="form-label">复盘内容 *</label>
                      <textarea
                        class="textarea"
                        bind:value={newReview.content}
                        placeholder="记录这段时间的进展、感悟、以及根据卡牌建议采取的行动..."
                        rows={4}
                        maxlength={1000}
                      />
                    </div>

                    <div class="form-actions">
                      <button
                        type="button"
                        class="btn btn-secondary"
                        on:click={() => showReviewForm = false}
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        class="btn btn-primary"
                        disabled={!newReview.content.trim()}
                      >
                        💾 保存复盘
                      </button>
                    </div>
                  </form>
                </div>
              {/if}
            </div>
          {/if}

          {#if (wish.reviews || []).length === 0}
            <div class="empty-state-small">
              <div class="empty-icon">📝</div>
              <div class="empty-text">暂无复盘记录</div>
              <div class="empty-hint">定期复盘可以帮助你更好地追踪愿望进展</div>
            </div>
          {:else}
            <div class="reviews-list">
              {#each wish.reviews as review}
                {@const outcomeInfo = getOutcomeInfo(review.outcome)}
                {@const moodInfo = getMoodInfo(review.mood)}
                <div class="review-item">
                  <div class="review-header">
                    <div class="review-meta">
                      <span
                        class="review-outcome"
                        style="color: {outcomeInfo.color}"
                        title={outcomeInfo.label}
                      >
                        {outcomeInfo.icon}
                      </span>
                      <span
                        class="review-mood"
                        title={moodInfo.label}
                      >
                        {moodInfo.icon}
                      </span>
                      <span class="review-time mono">{formatRelativeTime(review.createdAt)}</span>
                    </div>
                  </div>
                  <div class="review-content">{review.content}</div>
                  <div class="review-date mono">{formatDate(review.createdAt)}</div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .wish-modal {
    max-width: 600px;
    max-height: 85vh;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .wish-header-info {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .wish-category {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-family: var(--font-mono);
  }

  .wish-category-icon {
    font-size: 18px;
  }

  .wish-status {
    font-size: 11px;
    font-family: var(--font-mono);
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-dim);
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    color: var(--accent-red);
    background: rgba(255, 82, 82, 0.1);
  }

  .wish-detail-title {
    font-size: 22px;
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 10px;
    line-height: 1.4;
  }

  .wish-detail-description {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 12px;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: 8px;
    border-left: 3px solid var(--accent-cyan);
  }

  .wish-detail-question {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
    background: rgba(224, 64, 251, 0.08);
    border-left: 3px solid var(--accent-magenta);
    border-radius: 0 8px 8px 0;
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--text-secondary);
    font-style: italic;
  }

  .question-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .wish-detail-dates {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 16px;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .date-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .date-icon {
    font-size: 14px;
  }

  .wish-final-note {
    background: linear-gradient(135deg, rgba(105, 240, 174, 0.1), rgba(255, 213, 79, 0.1));
    border: 1px solid rgba(105, 240, 174, 0.3);
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 16px;
  }

  .final-note-title {
    font-size: 13px;
    font-weight: bold;
    color: var(--accent-green);
    margin-bottom: 8px;
    font-family: var(--font-mono);
  }

  .final-note-content {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
    font-style: italic;
  }

  .detail-tabs {
    display: flex;
    gap: 0;
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 4px;
    margin-bottom: 16px;
  }

  .detail-tab {
    flex: 1;
    padding: 8px 12px;
    text-align: center;
    font-size: 12px;
    color: var(--text-dim);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .detail-tab:hover {
    color: var(--text-secondary);
  }

  .detail-tab.active {
    color: var(--accent-cyan);
    background: rgba(0, 229, 255, 0.1);
  }

  .tab-content {
    overflow-y: auto;
    max-height: 45vh;
    padding-right: 4px;
  }

  .tab-content::-webkit-scrollbar {
    width: 4px;
  }

  .tab-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .tab-content::-webkit-scrollbar-thumb {
    background: var(--border-glow);
    border-radius: 2px;
  }

  .empty-state-small {
    text-align: center;
    padding: 30px 20px;
    color: var(--text-dim);
  }

  .empty-icon {
    font-size: 40px;
    margin-bottom: 8px;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 13px;
    margin-bottom: 4px;
  }

  .empty-hint {
    font-size: 11px;
    color: var(--text-dim);
  }

  .linked-draws-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .linked-draw-item {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 12px;
  }

  .draw-header {
    margin-bottom: 10px;
  }

  .draw-time {
    font-size: 10px;
    color: var(--text-dim);
    margin-bottom: 4px;
  }

  .draw-question-small {
    font-size: 11px;
    color: var(--text-secondary);
    font-style: italic;
  }

  .draw-cards {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  .draw-card-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .card-position {
    font-size: 10px;
    color: var(--accent-cyan);
    font-family: var(--font-mono);
  }

  .card-orientation {
    font-size: 9px;
    color: var(--text-dim);
  }

  .draw-meaning,
  .draw-advice {
    margin-bottom: 6px;
    font-size: 11px;
    line-height: 1.5;
  }

  .meaning-label,
  .advice-label {
    color: var(--accent-cyan);
    font-weight: bold;
    font-family: var(--font-mono);
  }

  .meaning-text,
  .advice-text {
    color: var(--text-secondary);
  }

  .draw-fortune {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: rgba(255, 213, 79, 0.1);
    border-radius: 12px;
    font-size: 11px;
  }

  .fortune-label {
    color: var(--accent-yellow);
    font-family: var(--font-mono);
    font-weight: bold;
  }

  .fortune-value {
    color: var(--text-secondary);
  }

  .review-form-section {
    margin-bottom: 16px;
  }

  .review-form {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 14px;
  }

  .form-title {
    font-size: 14px;
    font-weight: bold;
    color: var(--accent-magenta);
    margin-bottom: 12px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .form-label {
    display: block;
    font-size: 11px;
    color: var(--text-secondary);
    margin-bottom: 6px;
    font-family: var(--font-mono);
  }

  .option-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }

  .mood-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .option-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .option-item:hover {
    border-color: var(--opt-color, var(--accent-cyan));
    transform: translateY(-2px);
  }

  .option-item.active {
    background: color-mix(in srgb, var(--opt-color, var(--accent-cyan)) 15%, transparent);
    border-color: var(--opt-color, var(--accent-cyan));
    box-shadow: 0 0 10px color-mix(in srgb, var(--opt-color, var(--accent-cyan)) 30%, transparent);
  }

  .option-icon {
    font-size: 18px;
  }

  .option-label {
    font-size: 10px;
    color: var(--text-secondary);
  }

  .textarea {
    width: 100%;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 13px;
    font-family: var(--font-body);
    resize: vertical;
    transition: all 0.2s;
  }

  .textarea:focus {
    outline: none;
    border-color: var(--accent-cyan);
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
  }

  .form-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 12px;
  }

  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .review-item {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 10px;
    padding: 12px;
  }

  .review-header {
    margin-bottom: 8px;
  }

  .review-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .review-outcome,
  .review-mood {
    font-size: 14px;
  }

  .review-time {
    font-size: 10px;
    color: var(--text-dim);
    margin-left: auto;
  }

  .review-content {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 6px;
  }

  .review-date {
    font-size: 9px;
    color: var(--text-dim);
    text-align: right;
  }
</style>
