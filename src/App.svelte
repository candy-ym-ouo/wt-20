<script>
  import { onMount, onDestroy } from 'svelte'
  import { Storage } from './utils/storage.js'
  import { onHiddenEvent } from './utils/cardSystem.js'
  import { checkAllAchievements } from './utils/achievementSystem.js'
  import { checkAllSeasonTasks, recordHiddenEvent } from './utils/seasonSystem.js'
  import DrawPage from './pages/DrawPage.svelte'
  import CollectionPage from './pages/CollectionPage.svelte'
  import HistoryPage from './pages/HistoryPage.svelte'
  import ArchivePage from './pages/ArchivePage.svelte'
  import DailyFortunePage from './pages/DailyFortunePage.svelte'
  import DivinationPage from './pages/DivinationPage.svelte'
  import SpreadsPage from './pages/SpreadsPage.svelte'
  import AchievementsPage from './pages/AchievementsPage.svelte'
  import EncyclopediaPage from './pages/EncyclopediaPage.svelte'
  import ProfilePage from './pages/ProfilePage.svelte'
  import SeasonPage from './pages/SeasonPage.svelte'
  import HiddenEventModal from './components/HiddenEventModal.svelte'
  import AchievementNotify from './components/AchievementNotify.svelte'
  import SeasonNotify from './components/SeasonNotify.svelte'

  let currentPage = 'divination'
  let historyInitialTab = 'divination'
  let hiddenEvent = null
  let glitchClass = ''

  const PAGES = [
    { id: 'divination', icon: '🔮', label: '占卜' },
    { id: 'spreads', icon: '✚', label: '牌阵' },
    { id: 'daily', icon: '🎐', label: '每日签' },
    { id: 'draw', icon: '🎴', label: '抽卡' },
    { id: 'season', icon: '🌌', label: '赛季' },
    { id: 'encyclopedia', icon: '📖', label: '百科' },
    { id: 'collection', icon: '📚', label: '收藏' },
    { id: 'profile', icon: '📊', label: '档案' },
    { id: 'achievements', icon: '🏆', label: '成就' },
    { id: 'history', icon: '📜', label: '历史' },
    { id: 'archive', icon: '💾', label: '存档' }
  ]

  let removeListener
  let removeNavListener

  onMount(() => {
    checkAllAchievements()
    checkAllSeasonTasks()
    removeListener = onHiddenEvent((event) => {
      hiddenEvent = event
      glitchClass = 'screen-glitch'
      setTimeout(() => { glitchClass = '' }, 300)
      if (event?.achievementId) {
        recordHiddenEvent(event.achievementId)
      }
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
</script>

<div id="app-container" class="{glitchClass}">
  <div class="page-container">
    {#if currentPage === 'divination'}
      <DivinationPage />
    {:else if currentPage === 'spreads'}
      <SpreadsPage />
    {:else if currentPage === 'daily'}
      <DailyFortunePage />
    {:else if currentPage === 'draw'}
      <DrawPage />
    {:else if currentPage === 'season'}
      <SeasonPage />
    {:else if currentPage === 'encyclopedia'}
      <EncyclopediaPage />
    {:else if currentPage === 'collection'}
      <CollectionPage />
    {:else if currentPage === 'achievements'}
      <AchievementsPage />
    {:else if currentPage === 'history'}
      <HistoryPage initialTab={historyInitialTab} />
    {:else if currentPage === 'archive'}
      <ArchivePage />
    {:else if currentPage === 'profile'}
      <ProfilePage />
    {/if}
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
<SeasonNotify />

<style>
  #app-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 1;
  }
</style>
