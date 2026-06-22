<script>
  import { onMount, onDestroy } from 'svelte'
  import { Storage } from '../utils/storage.js'
  import { drawDailyFortune, saveDailyFortuneResult, getCardById } from '../utils/cardSystem.js'
  import { getConsecutiveReward, getNextReward, CONSECUTIVE_REWARDS } from '../data/constants.js'
  import CardDisplay from '../components/CardDisplay.svelte'
  import ResultModal from '../components/ResultModal.svelte'
  import ThemePackSelector from '../components/ThemePackSelector.svelte'
  import { getCurrentPackId, getCurrentPack, onPackChanged } from '../utils/themePackSystem.js'
  import { getThemePack } from '../data/themePacks.js'

  let fortune = Storage.getDailyFortune()
  let hasDrawnToday = Storage.hasDrawnToday()
  let todayCard = null
  let isDrawing = false
  let showResult = false
  let drawResults = null
  let cardRevealed = false
  let currentPackId = getCurrentPackId()
  let removePackListener

  function refresh() {
    fortune = Storage.getDailyFortune()
    hasDrawnToday = Storage.hasDrawnToday()
    currentPackId = getCurrentPackId()
    if (hasDrawnToday && fortune.todayCard) {
      const card = getCardById(fortune.todayCard.cardId)
      if (card) {
        todayCard = {
          card,
          isReversed: fortune.todayCard.isReversed,
          reading: fortune.todayCard.isReversed ? card.reversed : card.upright,
          packId: fortune.todayCard.packId
        }
      }
    }
  }

  function handlePackChanged() {
    refresh()
  }

  function getTodayDateStr() {
    const now = new Date()
    return now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  async function handleDrawDaily() {
    if (hasDrawnToday || isDrawing) return

    isDrawing = true
    cardRevealed = false

    const consecutiveDays = fortune.consecutiveDays > 0
      ? (fortune.lastConsecutiveDate === new Date(Date.now() - 86400000).toDateString()
        ? fortune.consecutiveDays + 1
        : 1)
      : 1

    const result = drawDailyFortune(consecutiveDays, currentPackId)
    drawResults = [result]

    setTimeout(() => {
      cardRevealed = true
    }, 800)

    setTimeout(() => {
      saveDailyFortuneResult(result)
      refresh()
      isDrawing = false
      showResult = true
    }, 1500)
  }

  function closeResult() {
    showResult = false
  }

  function viewInHistory() {
    const event = new CustomEvent('navigate', { detail: { page: 'history', tab: 'daily' } })
    window.dispatchEvent(event)
  }

  const currentReward = () => getConsecutiveReward(fortune.consecutiveDays || 1)
  const nextReward = () => getNextReward(fortune.consecutiveDays || 0)
  const progressToNext = () => {
    const next = nextReward()
    if (!next) return 100
    const current = fortune.consecutiveDays || 0
    const prevDays = CONSECUTIVE_REWARDS.filter(r => r.days <= current).pop()?.days || 0
    const progress = ((current - prevDays) / (next.days - prevDays)) * 100
    return Math.min(100, Math.max(0, progress))
  }

  $: currentPack = getThemePack(currentPackId)
  $: todayCardPack = todayCard?.packId ? getThemePack(todayCard.packId) : null

  onMount(() => {
    refresh()
    removePackListener = onPackChanged(handlePackChanged)
  })

  onDestroy(() => {
    if (removePackListener) {
      removePackListener()
    }
  })
</script>

<h1 class="page-title">◆ 每 日 命 运 签 ◆</h1>

<div class="pack-selector-wrapper">
  <ThemePackSelector compact={true} />
</div>

<div class="date-badge mono">
  🌐 {getTodayDateStr()}
</div>

{#if todayCardPack}
  <div class="pack-info-badge" style="background: {todayCardPack.color + '22'}; border-color: {todayCardPack.color}">
    <span class="pack-icon">{todayCardPack.icon}</span>
    <span>今日签来自「{todayCardPack.name}」</span>
  </div>
{/if}

<div class="streak-card">
  <div class="streak-header">
    <div class="streak-icon" style="color: {currentReward().color}">
      {currentReward().icon}
    </div>
    <div class="streak-info">
      <div class="streak-days">
        <span class="streak-number glow-cyan">{fortune.consecutiveDays || 0}</span>
        <span class="streak-unit">天连续签到</span>
      </div>
      <div class="streak-level" style="color: {currentReward().color}">
        {currentReward().label}
      </div>
    </div>
  </div>

  <div class="streak-bonus">
    <span class="mono" style="color: var(--accent-yellow)">✨ 奖励：</span>
    <span>{currentReward().bonus}</span>
  </div>

  {#if nextReward()}
    <div class="next-reward">
      <div class="next-reward-header mono">
        <span>{nextReward().icon} 下一等级：{nextReward().label}</span>
        <span class="glow-magenta">还需 {nextReward().days - (fortune.consecutiveDays || 0)} 天</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progressToNext()}%"></div>
      </div>
      <div class="next-reward-bonus">
        🎁 {nextReward().bonus}
      </div>
    </div>
  {/if}
</div>

<div class="rewards-timeline">
  <div class="timeline-title mono glow-magenta">◆ 签 到 奖 励 ◆</div>
  <div class="timeline-list">
    {#each CONSECUTIVE_REWARDS as reward}
      {#if reward.days <= (fortune.consecutiveDays || 0)}
        <div class="timeline-item unlocked" style="--reward-color: {reward.color}">
          <div class="timeline-icon">{reward.icon}</div>
          <div class="timeline-info">
            <div class="timeline-label">{reward.label}</div>
            <div class="timeline-days mono">第 {reward.days} 天 ✓</div>
          </div>
        </div>
      {:else}
        <div class="timeline-item locked">
          <div class="timeline-icon">🔒</div>
          <div class="timeline-info">
            <div class="timeline-label">{reward.label}</div>
            <div class="timeline-days mono">第 {reward.days} 天</div>
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>

{#if !hasDrawnToday}
  <div class="draw-section">
    <div class="daily-card-wrapper">
      <div class="daily-card-back {isDrawing ? 'flipping' : ''}">
        <div class="card-back-inner">
          <div class="card-back-symbol">🔮</div>
          <div class="card-back-text mono">命运数据流</div>
          <div class="card-back-pattern"></div>
        </div>
      </div>
    </div>

    <button
      class="btn btn-primary btn-block btn-daily"
      on:click={handleDrawDaily}
      disabled={isDrawing}
    >
      {#if isDrawing}
        ⏳ 正在连接命运数据流...
      {:else}
        🎴 抽取今日命运签
      {/if}
    </button>

    <p class="daily-hint mono">
      每日限抽一次，签文揭示今日运势走向
    </p>
  </div>
{:else if todayCard}
  <div class="drawn-section">
    <div class="drawn-card-display">
      <CardDisplay card={todayCard.card} isReversed={todayCard.isReversed} size="medium" />
      <div class="drawn-label mono glow-yellow">今日命运签 · 已抽取</div>
    </div>

    <div class="daily-reading-block">
      <div class="keywords">
        {#each todayCard.card.keywords as kw}
          <span class="keyword">{kw}</span>
        {/each}
      </div>

      <h3 class="reading-title">{todayCard.reading.title}</h3>
      <p class="reading-text">{todayCard.reading.meaning}</p>
      <div class="reading-advice">
        💡 {todayCard.reading.advice}
      </div>
      <div class="reading-fortune">{todayCard.reading.fortune}</div>
    </div>

    <div class="daily-actions">
      <button class="btn btn-block" on:click={viewInHistory}>
        📜 查看历史签文
      </button>
    </div>
  </div>
{/if}

{#if showResult && drawResults}
  <ResultModal
    results={drawResults}
    spreadType="single"
    onClose={closeResult}
    onDrawAgain={closeResult}
  />
{/if}

<style>
  .date-badge {
    text-align: center;
    padding: 10px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    color: var(--accent-cyan);
    font-size: 13px;
    margin-bottom: 16px;
    letter-spacing: 1px;
  }

  .streak-card {
    background: var(--bg-card);
    border: 1px solid var(--accent-magenta);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
    box-shadow: 0 0 20px rgba(224, 64, 251, 0.2);
  }

  .streak-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }

  .streak-icon {
    font-size: 48px;
    filter: drop-shadow(0 0 10px currentColor);
    animation: float 3s ease-in-out infinite;
  }

  .streak-info {
    flex: 1;
  }

  .streak-days {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .streak-number {
    font-family: var(--font-mono);
    font-size: 36px;
    font-weight: bold;
    line-height: 1;
  }

  .streak-unit {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .streak-level {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 1px;
    margin-top: 4px;
  }

  .streak-bonus {
    background: rgba(255, 213, 79, 0.08);
    border-left: 3px solid var(--accent-yellow);
    padding: 8px 12px;
    border-radius: 0 4px 4px 0;
    font-size: 13px;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .next-reward {
    background: rgba(0, 229, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
  }

  .next-reward-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    margin-bottom: 8px;
    color: var(--text-secondary);
  }

  .progress-bar {
    height: 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta));
    border-radius: 4px;
    transition: width 0.5s ease;
    box-shadow: 0 0 10px var(--accent-cyan);
  }

  .next-reward-bonus {
    font-size: 12px;
    color: var(--accent-magenta);
    font-family: var(--font-mono);
  }

  .rewards-timeline {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .timeline-title {
    text-align: center;
    font-size: 14px;
    margin-bottom: 16px;
    letter-spacing: 2px;
  }

  .timeline-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .timeline-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid transparent;
    transition: all 0.3s ease;
  }

  .timeline-item.unlocked {
    border-color: var(--reward-color);
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.05), transparent);
  }

  .timeline-item.locked {
    opacity: 0.5;
  }

  .timeline-icon {
    font-size: 24px;
    width: 36px;
    text-align: center;
  }

  .timeline-info {
    flex: 1;
  }

  .timeline-label {
    font-size: 13px;
    color: var(--text-primary);
  }

  .timeline-days {
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 2px;
  }

  .timeline-item.unlocked .timeline-days {
    color: var(--accent-green);
  }

  .draw-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
  }

  .daily-card-wrapper {
    perspective: 1000px;
    margin-bottom: 24px;
  }

  .daily-card-back {
    width: 160px;
    height: 260px;
    border-radius: 12px;
    background: linear-gradient(145deg, var(--bg-card), var(--bg-secondary));
    border: 2px solid var(--accent-magenta);
    box-shadow: 0 0 30px rgba(224, 64, 251, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .daily-card-back.flipping {
    animation: card-flip 1.5s ease-in-out;
  }

  @keyframes card-flip {
    0% { transform: rotateY(0) scale(1); }
    50% { transform: rotateY(90deg) scale(1.1); }
    100% { transform: rotateY(0) scale(1); }
  }

  .card-back-inner {
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .card-back-symbol {
    font-size: 64px;
    filter: drop-shadow(0 0 15px var(--accent-magenta));
    animation: glow-pulse 2s ease-in-out infinite;
    margin-bottom: 12px;
  }

  .card-back-text {
    font-size: 12px;
    color: var(--accent-magenta);
    letter-spacing: 2px;
  }

  .card-back-pattern {
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(224, 64, 251, 0.05) 10px,
        rgba(224, 64, 251, 0.05) 20px
      );
  }

  .btn-daily {
    max-width: 280px;
    font-size: 16px;
    padding: 16px 32px;
  }

  .daily-hint {
    text-align: center;
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 16px;
    letter-spacing: 1px;
  }

  .drawn-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .drawn-card-display {
    text-align: center;
    margin-bottom: 20px;
  }

  .drawn-label {
    margin-top: 12px;
    font-size: 12px;
    letter-spacing: 2px;
    animation: glow-pulse 2s ease-in-out infinite;
  }

  .daily-reading-block {
    width: 100%;
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .daily-actions {
    width: 100%;
    display: flex;
    gap: 12px;
  }

  .daily-actions .btn {
    flex: 1;
  }

  .pack-selector-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }

  .pack-info-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid;
    font-size: 13px;
    font-family: var(--font-mono);
    margin-bottom: 16px;
    text-align: center;
  }

  .pack-icon {
    font-size: 18px;
  }
</style>
