<script>
  import { onMount, onDestroy } from 'svelte'
  import { Storage } from './utils/storage.js'
  import { onHiddenEvent } from './utils/cardSystem.js'
  import { checkAllAchievements } from './utils/achievementSystem.js'
  import { openWorldLore, openOnboarding } from './utils/onboardingSystem.js'
  import DrawPage from './pages/DrawPage.svelte'
  import CollectionPage from './pages/CollectionPage.svelte'
  import HistoryPage from './pages/HistoryPage.svelte'
  import ArchivePage from './pages/ArchivePage.svelte'
  import DailyFortunePage from './pages/DailyFortunePage.svelte'
  import DivinationPage from './pages/DivinationPage.svelte'
  import AchievementsPage from './pages/AchievementsPage.svelte'
  import ReviewPage from './pages/ReviewPage.svelte'
  import HiddenEventModal from './components/HiddenEventModal.svelte'
  import AchievementNotify from './components/AchievementNotify.svelte'
  import OnboardingModal from './components/OnboardingModal.svelte'
  import WorldLoreModal from './components/WorldLoreModal.svelte'
  import StoryModal from './components/StoryModal.svelte'

  let currentPage = 'divination'
  let historyInitialTab = 'divination'
  let hiddenEvent = null
  let glitchClass = ''

  const PAGES = [
    { id: 'divination', icon: '🔮', label: '占卜' },
    { id: 'daily', icon: '🎐', label: '每日签' },
    { id: 'draw', icon: '🎴', label: '抽卡' },
    { id: 'collection', icon: '📚', label: '收藏' },
    { id: 'achievements', icon: '🏆', label: '成就' },
    { id: 'review', icon: '📊', label: '回顾' },
    { id: 'history', icon: '📜', label: '历史' },
    { id: 'archive', icon: '💾', label: '存档' }
  ]

  let removeListener
  let removeNavListener

  onMount(() => {
    checkAllAchievements()
    removeListener = onHiddenEvent((event) => {
      hiddenEvent = event
      glitchClass = 'screen-glitch'
      setTimeout(() => { glitchClass = '' }, 300)
    })
    removeNavListener = (e) => {
      const detail = e.detail
      if (!detail) return
      if (typeof detail === 'string') {
        if (PAGES.some(p => p.id === detail)) {
          historyInitialTab = 'divination'
          currentPage = detail
        }
      } else if (typeof detail === 'object') {
        if (PAGES.some(p => p.id === detail.page)) {
          historyInitialTab = detail.tab || 'divination'
          currentPage = detail.page
        }
      }
    }
    window.addEventListener('navigate', removeNavListener)
  })

  onDestroy(() => {
    if (removeListener) removeListener()
    if (removeNavListener) window.removeEventListener('navigate', removeNavListener)
  })

  function closeHiddenEvent() {
    hiddenEvent = null
  }

  function handleOpenWorldLore() {
    openWorldLore()
  }

  function handleOpenOnboarding() {
    openOnboarding()
  }
</script>

<div id="app-container" class="{glitchClass}">
  <div class="page-container">
    {#if currentPage === 'divination'}
      <DivinationPage />
    {:else if currentPage === 'daily'}
      <DailyFortunePage />
    {:else if currentPage === 'draw'}
      <DrawPage />
    {:else if currentPage === 'collection'}
      <CollectionPage />
    {:else if currentPage === 'achievements'}
      <AchievementsPage />
    {:else if currentPage === 'review'}
      <ReviewPage />
    {:else if currentPage === 'history'}
      <HistoryPage initialTab={historyInitialTab} />
    {:else if currentPage === 'archive'}
      <ArchivePage />
    {/if}
  </div>

  <div class="quick-actions">
    <button class="quick-action-btn lore-btn" on:click={handleOpenWorldLore} title="世界观">
      📖
    </button>
    <button class="quick-action-btn help-btn" on:click={handleOpenOnboarding} title="帮助">
      ❓
    </button>
  </div>

  <nav class="navbar">
    {#each PAGES as page}
      <div
        class="nav-item {currentPage === page.id ? 'active' : ''}"
        on:click={() => (currentPage = page.id)}
      >
        <span class="nav-icon">{page.icon}</span>
        <span>{page.label}</span>
      </div>
    {/each}
  </nav>
</div>

{#if hiddenEvent}
  <HiddenEventModal event={hiddenEvent} onClose={closeHiddenEvent} />
{/if}

<AchievementNotify />
<OnboardingModal />
<WorldLoreModal />
<StoryModal />

<style>
  #app-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 1;
  }

  .quick-actions {
    position: fixed;
    top: 16px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 100;
  }

  .quick-action-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--border-glow);
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .quick-action-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
    border-color: var(--accent-cyan);
  }

  .lore-btn:hover {
    box-shadow: 0 0 15px rgba(224, 64, 251, 0.4);
    border-color: var(--accent-magenta);
  }

  .help-btn:hover {
    box-shadow: 0 0 15px rgba(255, 193, 7, 0.4);
    border-color: var(--accent-yellow);
  }
</style>
