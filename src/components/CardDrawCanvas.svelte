<script>
  import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte'
  import { Application, Container, Graphics, Text } from 'pixi.js'
  import { RARITY_CONFIG, CATEGORY_CONFIG } from '../data/constants.js'

  export let isAnimating = false

  const dispatch = createEventDispatcher()

  let containerEl
  let app = null
  let deckContainer = null
  let cards = []
  let particles = []
  let animationFrame = null
  let initialized = false

  const CARD_WIDTH = 120
  const CARD_HEIGHT = 180

  onMount(async () => {
    await tick()
    await new Promise(r => setTimeout(r, 100))
    try {
      await initPixi()
    } catch (e) {
      console.error('PixiJS init failed:', e)
    }
  })

  onDestroy(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame)
    if (app) {
      try {
        app.destroy(true)
      } catch (e) {}
      app = null
    }
  })

  async function initPixi() {
    if (!containerEl || initialized) return

    const rect = containerEl.getBoundingClientRect()
    const width = Math.max(rect.width || 350, 300)
    const height = Math.max(rect.height || 350, 300)

    app = new Application()
    await app.init({
      width,
      height,
      background: { alpha: 0 },
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      preference: 'webgl'
    })

    if (app.canvas && app.canvas.style) {
      app.canvas.style.width = '100%'
      app.canvas.style.height = '100%'
    }
    containerEl.appendChild(app.canvas)

    deckContainer = new Container()
    app.stage.addChild(deckContainer)

    createDeck(width, height)
    createParticleField(width, height)

    initialized = true
    animate()
  }

  function createDeck(width, height) {
    if (!deckContainer) return
    cards.forEach(c => {
      if (c.parent) deckContainer.removeChild(c)
    })
    cards = []

    const centerX = width / 2
    const centerY = height / 2
    const deckCount = 5

    for (let i = 0; i < deckCount; i++) {
      const card = createCardBack(centerX + (i - Math.floor(deckCount / 2)) * 4, centerY - i * 2)
      cards.push(card)
      deckContainer.addChild(card)
    }
  }

  function createCardBack(x, y) {
    const container = new Container()
    container.x = x
    container.y = y

    try {
      const bg = new Graphics()
      bg.roundRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT, 8)
      bg.fill(0x1a1a3a)
      bg.stroke({ color: 0x00e5ff, width: 2, alpha: 0.6 })
      container.addChild(bg)

      const pattern = new Graphics()
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 7; j++) {
          const px = -CARD_WIDTH / 2 + 15 + i * 22
          const py = -CARD_HEIGHT / 2 + 20 + j * 22
          pattern.circle(px, py, 2)
          pattern.fill({ color: 0x00e5ff, alpha: 0.3 })
        }
      }
      container.addChild(pattern)

      const borderInner = new Graphics()
      borderInner.roundRect(-CARD_WIDTH / 2 + 8, -CARD_HEIGHT / 2 + 8, CARD_WIDTH - 16, CARD_HEIGHT - 16, 4)
      borderInner.stroke({ color: 0xe040fb, width: 1, alpha: 0.4 })
      container.addChild(borderInner)

      const centerSymbol = new Text({
        text: '◆',
        style: {
          fontFamily: 'Courier New',
          fontSize: 36,
          fill: 0x00e5ff,
          align: 'center'
        }
      })
      centerSymbol.anchor.set(0.5)
      centerSymbol.alpha = 0.5
      container.addChild(centerSymbol)

      const topText = new Text({
        text: 'CYBER',
        style: {
          fontFamily: 'Courier New',
          fontSize: 10,
          fill: 0x00e5ff,
          align: 'center'
        }
      })
      topText.anchor.set(0.5, 0)
      topText.y = -CARD_HEIGHT / 2 + 12
      topText.alpha = 0.6
      container.addChild(topText)

      const botText = new Text({
        text: 'DIVINATION',
        style: {
          fontFamily: 'Courier New',
          fontSize: 9,
          fill: 0xe040fb,
          align: 'center'
        }
      })
      botText.anchor.set(0.5, 1)
      botText.y = CARD_HEIGHT / 2 - 12
      botText.alpha = 0.6
      container.addChild(botText)
    } catch (e) {
      console.error('createCardBack error:', e)
    }

    return container
  }

  function createCardFront(result, x, y) {
    const { card, isReversed } = result
    const rarity = RARITY_CONFIG[card.rarity]
    const category = CATEGORY_CONFIG[card.category]
    const rarityColor = parseInt(rarity.color.replace('#', ''), 16)

    const container = new Container()
    container.x = x
    container.y = y

    try {
      const bg = new Graphics()
      bg.roundRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT, 8)
      bg.fill(0x12122a)
      bg.stroke({ color: rarityColor, width: 2.5 })
      container.addChild(bg)

      const numberText = new Text({
        text: String(card.number).padStart(2, '0'),
        style: {
          fontFamily: 'Courier New',
          fontSize: 12,
          fill: rarityColor
        }
      })
      numberText.anchor.set(0, 0)
      numberText.x = -CARD_WIDTH / 2 + 10
      numberText.y = -CARD_HEIGHT / 2 + 8
      container.addChild(numberText)

      const catText = new Text({
        text: category.icon,
        style: {
          fontFamily: 'Courier New',
          fontSize: 14
        }
      })
      catText.anchor.set(1, 0)
      catText.x = CARD_WIDTH / 2 - 10
      catText.y = -CARD_HEIGHT / 2 + 6
      container.addChild(catText)

      const symbolText = new Text({
        text: card.symbol,
        style: {
          fontFamily: 'Courier New',
          fontSize: 52
        }
      })
      symbolText.anchor.set(0.5)
      symbolText.y = -10
      container.addChild(symbolText)

      const nameText = new Text({
        text: card.name,
        style: {
          fontFamily: 'Courier New',
          fontSize: 12,
          fill: rarityColor,
          align: 'center',
          wordWrap: true,
          wordWrapWidth: CARD_WIDTH - 20
        }
      })
      nameText.anchor.set(0.5, 0)
      nameText.y = 30
      container.addChild(nameText)

      const rarityText = new Text({
        text: rarity.label,
        style: {
          fontFamily: 'Courier New',
          fontSize: 9,
          fill: rarityColor,
          align: 'center'
        }
      })
      rarityText.anchor.set(0.5, 1)
      rarityText.y = CARD_HEIGHT / 2 - 10
      container.addChild(rarityText)

      if (isReversed) {
        container.rotation = Math.PI
      }
    } catch (e) {
      console.error('createCardFront error:', e)
    }

    return container
  }

  function createParticleField(width, height) {
    if (!app) return
    particles.forEach(p => {
      if (p.parent) p.parent.removeChild(p)
    })
    particles = []

    for (let i = 0; i < 20; i++) {
      try {
        const particle = new Graphics()
        const size = Math.random() * 2 + 1
        particle.circle(0, 0, size)
        particle.fill({
          color: Math.random() > 0.5 ? 0x00e5ff : 0xe040fb,
          alpha: Math.random() * 0.5 + 0.1
        })
        particle.x = Math.random() * width
        particle.y = Math.random() * height
        particle.vy = -(Math.random() * 0.5 + 0.2)
        particle.vx = (Math.random() - 0.5) * 0.3
        particles.push(particle)
        app.stage.addChild(particle)
      } catch (e) {}
    }
  }

  function animate() {
    if (!app) return

    try {
      const h = app.renderer.height || 350
      const w = app.renderer.width || 350

      particles.forEach(p => {
        p.y += p.vy
        p.x += p.vx
        if (p.y < -10) {
          p.y = h + 10
          p.x = Math.random() * w
        }
        const alpha = (Math.sin(Date.now() / 1000 + p.x) + 1) / 2 * 0.4 + 0.1
        p.alpha = alpha
      })

      if (cards.length > 0 && !isAnimating) {
        const time = Date.now() / 1000
        cards.forEach((card, i) => {
          card.alpha = 0.85 + Math.sin(time + i * 0.5) * 0.15
        })
      }
    } catch (e) {}

    animationFrame = requestAnimationFrame(animate)
  }

  export async function playDrawAnimation(results) {
    if (!app || !deckContainer || !initialized) {
      isAnimating = false
      dispatch('animationComplete')
      return
    }

    isAnimating = true
    const width = app.renderer.width
    const height = app.renderer.height

    cards.forEach(c => {
      if (c.parent) deckContainer.removeChild(c)
    })
    cards = []

    const backCard = createCardBack(width / 2, height / 2)
    deckContainer.addChild(backCard)

    const shuffleFrames = 15
    for (let f = 0; f < shuffleFrames; f++) {
      backCard.rotation = (Math.random() - 0.5) * 0.3
      backCard.scale.set(0.95 + Math.random() * 0.1)
      backCard.x = width / 2 + (Math.random() - 0.5) * 10
      await new Promise(r => setTimeout(r, 40))
    }

    backCard.rotation = 0
    backCard.scale.set(1)
    backCard.x = width / 2
    backCard.y = height / 2

    const expandFrames = 12
    for (let f = 0; f < expandFrames; f++) {
      const progress = f / expandFrames
      backCard.scale.set(1 + progress * 0.5)
      backCard.alpha = 1 - progress * 0.5
      await new Promise(r => setTimeout(r, 35))
    }

    if (backCard.parent) deckContainer.removeChild(backCard)

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const targetX = results.length === 1
        ? width / 2
        : width / 2 + (i - (results.length - 1) / 2) * (CARD_WIDTH + 20)

      const frontCard = createCardFront(result, width / 2, -CARD_HEIGHT)
      deckContainer.addChild(frontCard)

      const dropFrames = 18
      for (let f = 0; f < dropFrames; f++) {
        const t = f / dropFrames
        const eased = 1 - Math.pow(1 - t, 3)
        frontCard.y = -CARD_HEIGHT + (height / 2 + CARD_HEIGHT) * eased
        frontCard.rotation = (1 - eased) * 0.5
        await new Promise(r => setTimeout(r, 25))
      }

      frontCard.y = height / 2
      frontCard.rotation = 0

      const slideFrames = 10
      for (let f = 0; f < slideFrames; f++) {
        const t = f / slideFrames
        frontCard.x = width / 2 + (targetX - width / 2) * t
        await new Promise(r => setTimeout(r, 25))
      }

      if (result.card.rarity === 'epic' || result.card.rarity === 'legendary') {
        try {
          const rarity = RARITY_CONFIG[result.card.rarity]
          const glow = new Graphics()
          glow.roundRect(-CARD_WIDTH / 2 - 5, -CARD_HEIGHT / 2 - 5, CARD_WIDTH + 10, CARD_HEIGHT + 10, 10)
          glow.stroke({ color: parseInt(rarity.color.replace('#', ''), 16), width: 3, alpha: 0.8 })
          frontCard.addChildAt(glow, 0)

          for (let g = 0; g < 2; g++) {
            glow.alpha = 0.3 + g * 0.3
            await new Promise(r => setTimeout(r, 200))
            glow.alpha = 0.8 - g * 0.3
            await new Promise(r => setTimeout(r, 200))
          }
        } catch (e) {}
      }

      if (i < results.length - 1) {
        await new Promise(r => setTimeout(r, 150))
      }
    }

    isAnimating = false
    dispatch('animationComplete')
  }

  export function reset() {
    if (!app || !deckContainer || !initialized) return
    const width = app.renderer.width
    const height = app.renderer.height

    cards.forEach(c => {
      if (c.parent) c.parent.removeChild(c)
    })
    cards = []

    createDeck(width, height)
  }
</script>

<div class="canvas-container" bind:this={containerEl}></div>
