type KeyboardShortcutHandler = (evt: KeyboardEvent) => void

function isMac() {
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform)
}

export class KeyboardManager {
  private shortcuts: Map<string, KeyboardShortcutHandler> = new Map()
  private enabled = true
  private container: HTMLElement

  constructor(container?: HTMLElement) {
    this.container = container || (document as unknown as HTMLElement)
    this.container.addEventListener('keydown', this.onKeyDown)
  }

  registerShortcut(combo: string, handler: KeyboardShortcutHandler) {
    const normalized = this.normalizeCombo(combo)
    this.shortcuts.set(normalized, handler)
  }

  unregisterShortcut(combo: string) {
    const normalized = this.normalizeCombo(combo)
    this.shortcuts.delete(normalized)
  }


  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }

  private normalizeCombo(combo: string) {
    if (combo.includes('mod')) {
      return combo.replace('mod', isMac() ? 'meta' : 'ctrl').toLowerCase()
    }
    return combo.toLowerCase()
  }

  private onKeyDown = (evt: KeyboardEvent) => {
    if (!this.enabled) return
    if (evt.target !== this.container) return
    const parts: string[] = []
    if (evt.ctrlKey) parts.push('ctrl')
    if (evt.metaKey) parts.push('meta')
    if (evt.altKey) parts.push('alt')
    if (evt.shiftKey) parts.push('shift')
    parts.push(evt.key.toLowerCase())
    const keyCombo = parts.join('+')
    const handler = this.shortcuts.get(keyCombo)
    if (handler) {
      evt.preventDefault()
      handler(evt)
    }
  }

  destroy() {
    this.container.removeEventListener('keydown', this.onKeyDown)
    this.shortcuts.clear()
  }
}