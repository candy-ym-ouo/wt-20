<script>
  import { onMount, onDestroy } from 'svelte'
  import { showWorldLore, closeWorldLore } from '../utils/onboardingSystem.js'
  import { WORLD_LORE_SECTIONS } from '../data/onboarding.js'

  let showModal = false
  let activeSection = 0
  let activeChapter = 0

  const unsubscribe = showWorldLore.subscribe(value => {
    showModal = value
    if (value) {
      activeSection = 0
      activeChapter = 0
    }
  })

  onMount(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onDestroy(() => {
    unsubscribe()
    document.removeEventListener('keydown', handleKeydown)
  })

  function handleKeydown(e) {
    if (!showModal) return
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  function handleClose() {
    closeWorldLore()
  }

  function selectSection(index) {
    activeSection = index
    activeChapter = 0
  }

  function selectChapter(index) {
    activeChapter = index
  }

  function nextChapter() {
    const section = WORLD_LORE_SECTIONS[activeSection]
    if (activeChapter < section.chapters.length - 1) {
      activeChapter++
    } else if (activeSection < WORLD_LORE_SECTIONS.length - 1) {
      activeSection++
      activeChapter = 0
    }
  }

  function prevChapter() {
    if (activeChapter > 0) {
      activeChapter--
    } else if (activeSection > 0) {
      activeSection--
      const prevSection = WORLD_LORE_SECTIONS[activeSection]
      activeChapter = prevSection.chapters.length - 1
    }
  }

  $: currentSection = WORLD_LORE_SECTIONS[activeSection]
  $: currentChapter = currentSection?.chapters[activeChapter]
  $: totalChapters = WORLD_LORE_SECTIONS.reduce((sum, s) => sum + s.chapters.length, 0)
  $: currentChapterIndex = (() => {
    let count = 0
    for (let i = 0; i < activeSection; i++) {
      count += WORLD_LORE_SECTIONS[i].chapters.length
    }
    return count + activeChapter
  })()
  $: progressPercent = totalChapters > 0 ? Math.round(((currentChapterIndex + 1) / totalChapters) * 100) : 0
</script>

{#if showModal}
  <div class="modal-overlay" on:click|stopPropagation={handleClose}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="title-icon">📖</span>
          世界观档案
        </h2>
        <button class="close-btn" on:click={handleClose}>×</button>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: {progressPercent}%"></div>
        <span class="progress-text mono">{currentChapterIndex + 1} / {totalChapters}</span>
      </div>

      <div class="lore-container">
        <div class="section-nav">
          {#each WORLD_LORE_SECTIONS as section, i}
            <button
              class="section-tab {i === activeSection ? 'active' : ''}"
              on:click={() => selectSection(i)}
            >
              <span class="tab-icon">{section.icon}</span>
              <span class="tab-label">{section.title}</span>
            </button>
          {/each}
        </div>

        <div class="chapter-nav">
          {#each currentSection?.chapters || [] as chapter, i}
            <button
              class="chapter-dot {i === activeChapter ? 'active' : ''}"
              on:click={() => selectChapter(i)}
              title={chapter.title}
            >
              {i + 1}
            </button>
          {/each}
        </div>

        <div class="chapter-content">
          {#if currentChapter}
            <div class="chapter-header">
              <h3 class="chapter-title glow-cyan">
                {currentSection.icon} {currentChapter.title}
              </h3>
              <div class="chapter-badge">
                {currentSection.title} · 第 {activeChapter + 1} 章
              </div>
            </div>

            <div class="chapter-text">
              <p>{currentChapter.content}</p>
            </div>

            <div class="chapter-decoration">
              <div class="deco-line"></div>
              <span class="deco-icon">❖</span>
              <div class="deco-line"></div>
            </div>
          {/if}
        </div>

        <div class="nav-controls">
          <button
            class="nav-btn prev-btn"
            on:click={prevChapter}
            disabled={currentChapterIndex === 0}
          >
            ← 上一章
          </button>
          <button
            class="nav-btn next-btn"
            on:click={nextChapter}
            disabled={currentChapterIndex >= totalChapters - 1}
          >
            下一章 →
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(12px);
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
    border-radius: 20px;
    max-width: 600px;
    width: 92%;
    max-height: 85vh;
    overflow: hidden;
    border: 2px solid var(--accent-magenta);
    box-shadow: 0 0 80px rgba(224, 64, 251, 0.25), inset 0 0 60px rgba(0, 0, 0, 0.5);
    animation: scaleIn 0.4s ease;
    display: flex;
    flex-direction: column;
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), transparent);
  }

  .modal-title {
    font-size: 22px;
    font-weight: bold;
    color: #fff;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    text-shadow: 0 0 15px rgba(224, 64, 251, 0.5);
  }

  .title-icon {
    font-size: 28px;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  .close-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-dim);
    font-size: 28px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    transform: rotate(90deg);
  }

  .progress-bar {
    position: relative;
    height: 3px;
    background: rgba(255, 255, 255, 0.08);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-magenta), var(--accent-cyan));
    transition: width 0.4s ease;
    box-shadow: 0 0 8px var(--accent-magenta);
  }

  .progress-text {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    font-size: 10px;
    color: var(--text-dim);
    background: rgba(0, 0, 0, 0.5);
    padding: 2px 8px;
    border-radius: 10px;
  }

  .lore-container {
    padding: 20px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    flex: 1;
  }

  .section-nav {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .section-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: var(--text-dim);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
  }

  .section-tab:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-secondary);
  }

  .section-tab.active {
    background: linear-gradient(135deg, rgba(224, 64, 251, 0.2), rgba(0, 229, 255, 0.1));
    border-color: var(--accent-magenta);
    color: #fff;
    box-shadow: 0 0 15px rgba(224, 64, 251, 0.2);
  }

  .tab-icon {
    font-size: 18px;
  }

  .tab-label {
    font-weight: 500;
  }

  .chapter-nav {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .chapter-dot {
    width: 32px;
    height: 32px;
    border: 2px solid rgba(255, 255, 255, 0.15);
    background: rgba(0, 0, 0, 0.3);
    color: var(--text-dim);
    font-size: 12px;
    font-family: var(--font-mono);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;
  }

  .chapter-dot:hover {
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
  }

  .chapter-dot.active {
    background: var(--accent-cyan);
    border-color: var(--accent-cyan);
    color: #000;
    font-weight: bold;
    box-shadow: 0 0 12px var(--accent-cyan);
  }

  .chapter-content {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(0, 229, 255, 0.15);
    position: relative;
    overflow: hidden;
  }

  .chapter-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent-cyan), transparent);
  }

  .chapter-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .chapter-title {
    font-size: 20px;
    font-weight: bold;
    margin: 0 0 8px 0;
  }

  .chapter-badge {
    display: inline-block;
    padding: 4px 14px;
    font-size: 11px;
    color: var(--text-dim);
    background: rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    font-family: var(--font-mono);
    letter-spacing: 0.5px;
  }

  .chapter-text {
    font-size: 15px;
    line-height: 2;
    color: var(--text-secondary);
    text-align: justify;
  }

  .chapter-text p {
    margin: 0;
    text-indent: 2em;
  }

  .chapter-decoration {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
  }

  .deco-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  }

  .deco-icon {
    font-size: 14px;
    color: var(--accent-magenta);
    opacity: 0.6;
  }

  .nav-controls {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 4px;
  }

  .nav-btn {
    flex: 1;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .nav-btn:hover:not(:disabled) {
    background: rgba(0, 229, 255, 0.1);
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .next-btn:hover:not(:disabled) {
    background: rgba(224, 64, 251, 0.1);
    border-color: var(--accent-magenta);
    color: var(--accent-magenta);
  }

  .lore-container::-webkit-scrollbar {
    width: 5px;
  }

  .lore-container::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .lore-container::-webkit-scrollbar-thumb {
    background: rgba(224, 64, 251, 0.3);
    border-radius: 3px;
  }

  .lore-container::-webkit-scrollbar-thumb:hover {
    background: rgba(224, 64, 251, 0.5);
  }
</style>
