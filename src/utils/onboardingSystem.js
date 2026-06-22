import { writable, derived } from 'svelte/store'
import { Storage } from './storage.js'
import { ONBOARDING_STEPS, TOTAL_ONBOARDING_STEPS } from '../data/onboarding.js'
import { drawSingleCard, saveDrawResult, onHiddenEvent } from './cardSystem.js'
import { checkStoryTriggers, setPendingChapter } from './storySystem.js'
import { checkAchievementsAfterAction } from './achievementSystem.js'

const onboardingStore = writable(null)
const showOnboardingStore = writable(false)
const showWorldLoreStore = writable(false)
const firstDrawResultStore = writable(null)
const isDrawingStore = writable(false)
const firstDrawHiddenEventStore = writable(null)

let initialized = false
const onboardingListeners = []
let removeHiddenEventListener = null

function init() {
  if (initialized) return
  initialized = true

  const onboarding = Storage.getOnboarding()
  onboardingStore.set(onboarding)

  if (onboarding.firstDrawHiddenEvent) {
    firstDrawHiddenEventStore.set(onboarding.firstDrawHiddenEvent)
  }

  if (!onboarding.completed && !onboarding.startedAt) {
    showOnboardingStore.set(true)
  }

  removeHiddenEventListener = onHiddenEvent((event) => {
    const current = Storage.getOnboarding()
    if (!current.firstDrawDone) {
      firstDrawHiddenEventStore.set(event)
      Storage.updateOnboarding({ firstDrawHiddenEvent: event })
      onboardingStore.set(Storage.getOnboarding())
      notifyListeners('firstDrawHiddenEvent', event)
    }
  })
}

export const onboardingState = {
  subscribe: (run) => {
    init()
    return onboardingStore.subscribe(run)
  }
}

export const showOnboarding = {
  subscribe: (run) => {
    init()
    return showOnboardingStore.subscribe(run)
  }
}

export const showWorldLore = {
  subscribe: (run) => {
    init()
    return showWorldLoreStore.subscribe(run)
  }
}

export const firstDrawResult = {
  subscribe: (run) => {
    init()
    return firstDrawResultStore.subscribe(run)
  }
}

export const isFirstDrawing = {
  subscribe: (run) => {
    init()
    return isDrawingStore.subscribe(run)
  }
}

export const firstDrawHiddenEvent = {
  subscribe: (run) => {
    init()
    return firstDrawHiddenEventStore.subscribe(run)
  }
}

export const onboardingProgress = derived(
  [onboardingState],
  ([$onboarding]) => {
    if (!$onboarding) return { currentStep: 0, totalSteps: TOTAL_ONBOARDING_STEPS, percent: 0 }

    const currentIndex = $onboarding.currentStep
    const percent = Math.round((currentIndex / TOTAL_ONBOARDING_STEPS) * 100)

    return {
      currentStep: currentIndex,
      totalSteps: TOTAL_ONBOARDING_STEPS,
      percent,
      currentStepData: ONBOARDING_STEPS[currentIndex] || null
    }
  }
)

export function startOnboarding() {
  init()
  const updated = Storage.updateOnboarding({
    startedAt: Date.now(),
    currentStep: 0
  })
  onboardingStore.set(updated)
  showOnboardingStore.set(true)
  notifyListeners('start', updated)
}

export function nextStep() {
  init()
  const current = Storage.getOnboarding()
  const nextStepIndex = current.currentStep + 1

  if (nextStepIndex >= TOTAL_ONBOARDING_STEPS) {
    completeOnboarding()
    return
  }

  const updated = Storage.updateOnboarding({
    currentStep: nextStepIndex
  })
  onboardingStore.set(updated)
  notifyListeners('stepChange', { from: current.currentStep, to: nextStepIndex })
}

export function prevStep() {
  init()
  const current = Storage.getOnboarding()
  const prevStepIndex = Math.max(0, current.currentStep - 1)

  if (prevStepIndex === current.currentStep) return

  const updated = Storage.updateOnboarding({
    currentStep: prevStepIndex
  })
  onboardingStore.set(updated)
}

export function goToStep(stepIndex) {
  init()
  if (stepIndex < 0 || stepIndex >= TOTAL_ONBOARDING_STEPS) return

  const updated = Storage.updateOnboarding({
    currentStep: stepIndex
  })
  onboardingStore.set(updated)
}

export function completeOnboarding() {
  init()
  const updated = Storage.completeOnboarding()
  onboardingStore.set(updated)
  showOnboardingStore.set(false)

  checkAchievementsAfterAction('draw')

  notifyListeners('complete', updated)
}

export function closeOnboarding() {
  init()
  showOnboardingStore.set(false)
}

export function openOnboarding() {
  init()
  showOnboardingStore.set(true)
}

export function openWorldLore() {
  init()
  const current = Storage.getOnboarding()
  if (!current.worldLoreViewed) {
    Storage.updateOnboarding({ worldLoreViewed: true })
    onboardingStore.set(Storage.getOnboarding())
  }
  showWorldLoreStore.set(true)
}

export function closeWorldLore() {
  init()
  showWorldLoreStore.set(false)
}

export async function performFirstDraw() {
  init()
  const current = Storage.getOnboarding()

  if (current.firstDrawDone) {
    const history = Storage.getDrawHistory()
    if (history.length > 0) {
      const firstRecord = history[history.length - 1]
      firstDrawResultStore.set(firstRecord)
    }
    return null
  }

  isDrawingStore.set(true)

  try {
    const result = drawSingleCard()

    saveDrawResult(result, 'single')

    Storage.updateOnboarding({
      firstDrawDone: true,
      currentStep: Math.max(current.currentStep, 3)
    })
    onboardingStore.set(Storage.getOnboarding())

    firstDrawResultStore.set(result)

    const storyTriggers = checkStoryTriggers([result])
    if (storyTriggers.length > 0) {
      setPendingChapter(storyTriggers[0])
    }

    checkAchievementsAfterAction('draw')

    notifyListeners('firstDraw', result)

    isDrawingStore.set(false)
    return result
  } catch (error) {
    console.error('First draw error:', error)
    isDrawingStore.set(false)
    return null
  }
}

export function resetOnboarding() {
  init()
  Storage.resetOnboarding()
  onboardingStore.set(Storage.getOnboarding())
  firstDrawResultStore.set(null)
  firstDrawHiddenEventStore.set(null)
  showOnboardingStore.set(true)
  notifyListeners('reset', {})
}

export function onOnboardingEvent(callback) {
  onboardingListeners.push(callback)
  return () => {
    const idx = onboardingListeners.indexOf(callback)
    if (idx > -1) onboardingListeners.splice(idx, 1)
  }
}

function notifyListeners(eventName, data) {
  onboardingListeners.forEach(cb => {
    try {
      cb({ event: eventName, data })
    } catch (e) {
      console.error('Onboarding listener error:', e)
    }
  })
}

export function shouldShowOnboarding() {
  const onboarding = Storage.getOnboarding()
  return !onboarding.completed
}

export function refreshOnboardingState() {
  init()
  const onboarding = Storage.getOnboarding()
  onboardingStore.set(onboarding)
}
