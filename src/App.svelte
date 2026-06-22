<script>
  import { onMount, onDestroy } from 'svelte'
  import { Storage } from './utils/storage.js'
  import { onHiddenEvent } from './utils/cardSystem.js'
  import { checkAllAchievements, triggerHiddenAchievement } from './utils/achievementSystem.js'
  import { onVisitorEvent } from './utils/mysteriousVisitorSystem.js'
  import { MYSTERIOUS_VISITORS } from './data/mysteriousVisitor.js'
  import DrawPage from './pages/DrawPage.svelte'
  import CollectionPage from './pages/CollectionPage.svelte'
  import CollectionMapPage from './pages/CollectionMapPage.svelte'
  import HistoryPage from './pages/HistoryPage.svelte'
  import ArchivePage from './pages/ArchivePage.svelte'
  import DailyFortunePage from './pages/DailyFortunePage.svelte'
  import DivinationPage from './pages/DivinationPage.svelte'
  import QuestionDrivenPage from './pages/QuestionDrivenPage.svelte'
  import AchievementsPage from './pages/AchievementsPage.svelte'
  import ReviewPage from './pages/ReviewPage.svelte'
  import WeeklyReportPage from './pages/WeeklyReportPage.svelte'
  import HiddenEventModal from './components/HiddenEventModal.svelte'
  import MysteriousVisitorModal from './components/MysteriousVisitorModal.svelte'
  import AchievementNotify from './components/AchievementNotify.svelte'

  let currentPage = 'question-driven'
  let historyInitialTab = 'divination'
  let navParams = {}
  let hiddenEvent = null
  let visitorModalOpen = false
  let glitchClass = ''

  const PAGES = [
    { id: 'question-driven', icon: '💬', label: '问题占卜' },
    { id: 'divination', icon: '🔮', label: '主题占卜' },
    { id: 'daily', icon: '🎐', label: '每日签' },
    { id: 'draw', icon: '🎴', label: '抽卡' },
    { id: 'weekly', icon: '📊', label: '周报' },
    { id: 'collection', icon: '📚', label: '收藏' },
    { id: 'collection-map', icon: '🗺️', label: '联动地图' },
    { id: 'achievements', icon: '🏆', label: '成就' },
    { id: 'review', icon: '📈', label: '回顾' },
    { id: 'history', icon: '📜', label: '历史' },
    { id: 'archive', icon: '💾', label: '存档' }
  ]

  let removeListener
  let removeNavListener
  let removeVisitorListener

  onMount(() => {
    checkAllAchievements()
    removeListener = onHiddenEvent((event) => {
      hiddenEvent = event
      glitchClass = 'screen-glitch'
      setTimeout(() => { glitchClass = '' }, 300)
    })
    removeVisitorListener = onVisitorEvent((eventData) => {
      visitorModalOpen = true
      glitchClass = 'screen-glitch'
      setTimeout(() => { glitchClass = '' }, 500)

      const visitorData = Storage.getMysteriousVisitor()
      const totalEncounters = visitorData.encounters.length
      if (totalEncounters === 0) {
        triggerHiddenAchievement('achievement_visitor_first_encounter')
      }

      const uniqueVisitorIds = new Set(visitorData.encounters.map(e => e.visitorId))
      uniqueVisitorIds.add(eventData.visitor.id)
      if (uniqueVisitorIds.size >= MYSTERIOUS_VISITORS.length) {
        triggerHiddenAchievement('achievement_visitor_all_types')
      }
    })
    removeNavListener = (e) => {
      const detail = e.detail
      if (!detail) return
      if (typeof detail === 'string') {
        if (PAGES.some(p => p.id === detail)) {
          historyInitialTab = 'divination'
          navParams = {}
          currentPage = detail
        }
      } else if (typeof detail === 'object') {
        if (PAGES.some(p => p.id === detail.page)) {
          historyInitialTab = detail.tab || 'divination'
          navParams = detail.params || {}
          currentPage = detail.page
        }
      }
    }
    window.addEventListener('navigate', removeNavListener)
  })

  onDestroy(() => {
    if (removeListener) removeListener()
    if (removeVisitorListener) removeVisitorListener()
    if (removeNavListener) window.removeEventListener('navigate', removeNavListener)
  })

  function closeHiddenEvent() {
    hiddenEvent = null
  }
</script>

<div id="app-container" class="{glitchClass}">
  <div class="page-container">
    {#if currentPage === 'question-driven'}
      <QuestionDrivenPage navParams={navParams} />
    {:else if currentPage === 'divination'}
      <DivinationPage />
    {:else if currentPage === 'daily'}
      <DailyFortunePage />
    {:else if currentPage === 'draw'}
      <DrawPage />
    {:else if currentPage === 'weekly'}
      <WeeklyReportPage />
    {:else if currentPage === 'collection'}
      <CollectionPage />
    {:else if currentPage === 'collection-map'}
      <CollectionMapPage />
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

  <nav class="navbar">
    {#each PAGES as page}
      <div
        class="nav-item {currentPage === page.id ? 'active' : ''}"
        on:click={() => {
          navParams = {}
          currentPage = page.id
        }}
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

<MysteriousVisitorModal isOpen={visitorModalOpen} />

<AchievementNotify />

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
