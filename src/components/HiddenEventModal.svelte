<script>
  export let event
  export let onClose

  function handleClose() {
    if (onClose) {
      onClose()
    } else {
      const overlay = document.querySelector('.modal-overlay')
      if (overlay) {
        overlay.style.animation = 'none'
        overlay.style.opacity = '0'
      }
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('close-hidden-event'))
      }, 200)
    }
  }
</script>

<div class="modal-overlay" on:click|self={handleClose}>
  <div class="modal-content">
    <div class="hidden-event">
      <h3 class="hidden-event-title">⚠ {event.title}</h3>
      <p class="hidden-event-desc">{event.description}</p>
      <div class="event-reward">
        <span class="mono glow-yellow">◆ 成就解锁</span>
      </div>
    </div>
    <div class="action-row">
      <button class="btn btn-block btn-primary" on:click={handleClose}>
        确认
      </button>
    </div>
  </div>
</div>
