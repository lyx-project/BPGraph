import { dia, V} from '@joint/core'
import { BlueprintNode } from './BlueprintNode'

export class BlueprintNodeView extends dia.ElementView {
  private highlightedPorts = new Set<string>()
  private dropdownElMap = new Map<string, HTMLDivElement>()
  private currentlyOpenDropdown: string | null = null
  initialize(...args: Parameters<dia.ElementView['initialize']>) {
    this.paper?.el.addEventListener('click', this.hideDropdown)
    super.initialize(...args)
    this.listenTo(this.model, 'change:title', this.refreshTitle)
    this.listenTo(this.model, 'change:inputs change:outputs', this.applyPortHighlights)
  }

  onRender() {
    this.paper?.el.removeEventListener('click', this.otherClick)
    this.paper?.el.addEventListener('click', this.otherClick)
    const inputs = (this.model as BlueprintNode).get('inputs') || []
    inputs.forEach((input) => {
      const inputEl = this.findPortNode(input.id!, 'field') as HTMLInputElement
      if (!inputEl) return
      if (input.type === 'boolean') {
        inputEl.addEventListener('click', this.updateFieldValue(input.type))
      } else if (input.type === 'select') {
        this.createDropdown(input.id as string, input.name, input._options)
        inputEl.addEventListener('focus', this.showDropdown)
        inputEl.addEventListener('input', this.filterDropdown)

      } else if (input.type === 'number') {
        inputEl.addEventListener('input', this.validateNumber(false))
        inputEl.addEventListener('blur', this.validateNumber(true))
        const upArrow = this.findPortNode(input.id!, 'upArrow') as HTMLInputElement
        const downArrow = this.findPortNode(input.id!, 'downArrow') as HTMLInputElement

        upArrow?.addEventListener('click', () => {
          const fieldEl = this.findPortNode(input.id!, 'field') as HTMLInputElement
          fieldEl.value = String(Number(fieldEl.value || 0) + 1)
          fieldEl.dispatchEvent(new Event('blur'))
        })
        downArrow?.addEventListener('click', () => {
          const fieldEl = this.findPortNode(input.id!, 'field') as HTMLInputElement
          fieldEl.value = String(Number(fieldEl.value || 0) - 1)
          fieldEl.dispatchEvent(new Event('blur'))
        })
        inputEl.addEventListener('input', this.updateFieldValue(input.type))
      } else if (input.type === 'string') {
        inputEl.addEventListener('input', this.updateFieldValue(input.type))
      }
    })

    const plus = this.findNode('switch-plus-rect')
    if (plus) {
      plus.addEventListener('click', (evt: Event) => {
        evt.stopPropagation()
        this.model.graph.trigger('node:switch:add-case', this.model)
      })
    }
  }

  otherClick = (evt: MouseEvent) => {
    const target = evt.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.getAttribute('role') === 'option') {
      return
    }
    if (this.currentlyOpenDropdown) {
      this.hideDropdown()
    }
  }

  createDropdown(inputId: string, inputName: string, options?: readonly { label: string; value: string }[]) {
    const style = (this.model as BlueprintNode).get('style') || {}
    const dropdownStyle = style.ports?.input?.editor?.dropdown || {}
    this.dropdownElMap.delete(inputName)
    if (!options || options.length === 0) return
    const dropdownElement = document.createElement('div')
    dropdownElement.addEventListener('wheel', (evt) => {
      evt.stopPropagation()
      evt.preventDefault()
    })
    dropdownElement.classList.add('bpgraph-node-dropdown')
    dropdownElement.style.cssText = `
      background: ${dropdownStyle.background || '#222'};
      border: 1px solid ${dropdownStyle.borderColor || 'rgba(120, 130, 140, 0.3)'};
      color: ${dropdownStyle.color || '#fff'};
      border-radius: ${dropdownStyle.borderRadius || 4}px;
      z-index: 9999;
      font-size: 12px;
      max-height: 200px;
      overflow: auto;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      position: absolute;
    `
    options.forEach(option => {
      const optionEl = document.createElement('div')
      optionEl.classList.add('bpgraph-node-dropdown-option')
      optionEl.setAttribute('style', `
            padding: 2px 4px;
            cursor: pointer;
          `)
      optionEl.setAttribute('data-value', option.value)
      optionEl.textContent = option.label
      optionEl.addEventListener('click', (evt: MouseEvent) => {
        evt.preventDefault()
        evt.stopPropagation()
        this.setInputValue(inputName, (evt.target as HTMLElement).dataset.value)
        this.findPortNode(inputId)
        this.hideDropdown()
        const fieldEl = this.findPortNode(inputId, 'field') as HTMLInputElement
        if (fieldEl) fieldEl.value = (evt.target as HTMLElement).textContent || ''
        fieldEl.title = String(fieldEl.value)
      })
      dropdownElement.appendChild(optionEl)
    })
    this.dropdownElMap.set(inputName, dropdownElement)
  }

  updateOptions(inputId: string, inputName: string, options: readonly { label: string; value: string }[]) {
    const dropdownElement = this.dropdownElMap.get(inputName)
    if (!dropdownElement) return
    dropdownElement.innerHTML = ''
    options.forEach(option => {
      const optionEl = document.createElement('div')
      optionEl.classList.add('bpgraph-node-dropdown-option')
      optionEl.setAttribute('style', `
            padding: 2px 4px;
            cursor: pointer;
          `)
      optionEl.setAttribute('data-value', option.value)
      optionEl.textContent = option.label
      optionEl.addEventListener('click', (evt: MouseEvent) => {
        evt.preventDefault()
        evt.stopPropagation()
        this.setInputValue(inputName, (evt.target as HTMLElement).dataset.value)
        this.findPortNode(inputId)
        this.hideDropdown()
        const fieldEl = this.findPortNode(inputId, 'field') as HTMLInputElement
        if (fieldEl) fieldEl.value = (evt.target as HTMLElement).textContent || ''
        fieldEl.title = String(fieldEl.value)
      })
      dropdownElement.appendChild(optionEl)
    })
  }

  showDropdown = (evt: Event) => {
    if (this.currentlyOpenDropdown) {
      this.hideDropdown()
    }
    const fieldEl = evt.target as HTMLInputElement
    const portName = fieldEl.getAttribute('name')
    if (!portName) return
    const dropdownEl = this.dropdownElMap.get(portName)
    if (!dropdownEl) return
    const rect = fieldEl.getBoundingClientRect()
    dropdownEl.style.minWidth = `${rect.width}px`
    dropdownEl.style.top = `${rect.bottom + 4}px`
    dropdownEl.style.left = `${rect.left}px`
    this.currentlyOpenDropdown = portName
    this.paper?.el.appendChild(dropdownEl)
  }

  hideDropdown = () => {
    const portName = this.currentlyOpenDropdown as string
    if (document.activeElement && document.activeElement.getAttribute('name') === portName) {
      return
    }
    const dropdownEl = this.dropdownElMap.get(portName || '')
    this.currentlyOpenDropdown = null
    if (!dropdownEl) return
    this.paper?.el.removeChild(dropdownEl)
  }

  filterDropdown = (evt: Event) => {
    const fieldEl = evt.target as HTMLInputElement
    const portName = fieldEl.getAttribute('name')
    if (!portName) return
    const dropdownEl = this.dropdownElMap.get(portName)
    if (!dropdownEl) return
    const filter = fieldEl.value.toLowerCase()
    const pattern = filter.split('').map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*')
    const regex = new RegExp(pattern, 'i')
    Array.from(dropdownEl.children).forEach(child => {
      const optionEl = child as HTMLDivElement
      const label = optionEl.textContent || ''
      if (regex.test(label)) {
        optionEl.style.display = 'block'
      } else {
        optionEl.style.display = 'none'
      }
    })
  }

  renderMarkup() {
    super.renderMarkup()
    const baseTitle = this.findNode('base-node-title') as SVGGElement
    if (baseTitle) renderTitle(baseTitle, this.model as BlueprintNode)
    return this
  }

  validateNumber(endInput = false) {
    return (evt: Event) => {
      const fieldEl = evt.target as HTMLInputElement
      const value = fieldEl.value
      if (endInput) {
        if (value) {
          const parsedValue = Number(fieldEl.value)
          if (isNaN(parsedValue)) {
            fieldEl.style.borderColor = 'red'
          } else {
            const style = (this.model as BlueprintNode).get('style') || {}
            const boxStyle = style.ports?.input?.editor?.box || {}
            fieldEl.style.borderColor = boxStyle.borderColor || ''
          }
        }
      } else {
        if (value) {
          const filtered = value.replace(/[^\d.-]/g, '')
          if (filtered !== value) {
            fieldEl.value = filtered
          }
        }
      }
    }
  }

  updateFieldValue(type: string) {
    return (evt: Event) => {
      const fieldEl = evt.target as HTMLInputElement
      const values = this.model.get('values') || {}
      const portName = fieldEl.getAttribute('name')
      if (!portName) return
      let value: unknown = fieldEl.value
      if (type === 'number') {
        value = fieldEl.value ? Number(fieldEl.value) : NaN
      } else if (type === 'boolean') {
        value = !values[portName]
      }
      fieldEl.title = String(value)
      this.setInputValue(portName, value)
    }
  }

  setInputValue(inputName: string, value: unknown) {
    this.model.set('values', {
      ...this.model.get('values'),
      [inputName]: value
    })
    this.model.graph.trigger('node:values:changed', this, inputName, value)
  }

  applyPortHighlights() {
    requestAnimationFrame(() => {
      setTimeout(() => {
        this._applyPortHighlights()
      }, 0)
    })
  }

  _applyPortHighlights() {
    const ports = (this.model as BlueprintNode).getPorts()
    const portIds = ports.map(port => port.id)
    const toRemove = [] as string[]
    for (const portId of this.highlightedPorts) {
      if (!portIds.includes(portId)) {
        toRemove.push(portId)
        continue
      }
      this.highlightPort(portId)
    }

    for (const portId of toRemove) {
      this.highlightedPorts.delete(portId)
      this.unhighlightPort(portId)
    }
  }

  refreshTitle() {
    const baseTitle = this.findNode('base-node-title') as SVGGElement
    if (baseTitle) {
      const title = this.model.get('title') || ''
      const text = baseTitle.querySelector('text') as SVGTextElement
      if (text) {
        text.textContent = title
      }
    }
  }

  refreshDomValue(name: string, step = 0) {
    const values = this.model.get('values') || {}
    const inputs = (this.model as BlueprintNode).get('inputs') || []
    const input = inputs.find(i => i.name === name)
    if (!input) return
    const inputEl = this.findPortNode(input.id!, 'field') as HTMLInputElement
    if (step < 10) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.refreshDomValue(name, step + 1)
        }, 0)
      })
    }
    if (!inputEl) return
    let value = values[input.name]
    switch (input.type) {
      case 'string':
        if (typeof value !== 'string') return
        break
      case 'number':
        if (typeof value !== 'number') return
        value = isNaN(value) ? inputEl.value : String(value)
        break
      case 'boolean':
        if (inputEl instanceof SVGElement) {
          const polyline = inputEl.parentNode?.children[1] as SVGPolylineElement | undefined
          if (!polyline) return
          polyline.setAttribute('visibility', value ? 'visible' : 'hidden')
          return
        }
        return
      case 'select':
        if (typeof value !== 'string') return
        value = input._options?.find(option => option.value === value)?.label || ''
        break
    }
    if (inputEl.value !== value) {
      inputEl.value = value
      inputEl.title = String(value)
    }
  }

  highlightPort(portId: string, retry = 0) {
    if (!this.highlightedPorts.has(portId)) this.highlightedPorts.add(portId)
    const portNode = this.findPortNode(portId, 'portBody')
    if (portNode) {
      const style = (this.model as BlueprintNode).get('style') || {}
      const portStyle = (portId.startsWith('in-') ? style.ports?.input : style.ports?.output) || {}
      const fill = portStyle.port?.highlightFill || 'rgba(255, 255, 255, 0.8)'
      const stroke = portStyle.port?.highlightStroke || 'rgba(255, 255, 255, 1)'
      const strokeWidth = portStyle.port?.highlightStrokeWidth ?? 1
      portNode.setAttribute('fill', fill)
      portNode.setAttribute('stroke', stroke)
      portNode.setAttribute('stroke-width', String(strokeWidth))
    } else if (retry < 10) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.highlightPort(portId, retry + 1)
        }, 0)
      })
    }
  }

  unhighlightPort(portId: string) {
    const portNode = this.findPortNode(portId, 'portBody')
    if (portNode) {
      const style = (this.model as BlueprintNode).get('style') || {}
      const portStyle = (portId.startsWith('in-') ? style.ports?.input : style.ports?.output) || {}
      const fill = portStyle.port?.fill || 'rgba(255, 255, 255, 0.5)'
      const stroke = portStyle.port?.stroke || 'rgba(255, 255, 255, 0.8)'
      const strokeWidth = portStyle.port?.strokeWidth ?? 1
      portNode.setAttribute('fill', fill)
      portNode.setAttribute('stroke', stroke)
      portNode.setAttribute('stroke-width', String(strokeWidth))
    }
  }
}

function renderTitle(g: SVGGElement, model: BlueprintNode) {
  const title = model.get('title') || ''
  const size = model.size()
  const attrs = model.get('attrs') || {}
  const rx = attrs['base-node-body']?.rx ?? 4
  const ry = attrs['base-node-body']?.ry ?? 4
  const style = model.get('style') || {}
  const titleHeight = style.header?.height ?? 24
  const titleFontSize = style.header?.fontSize ?? 12
  const titleTop = style.header?.title?.y ?? 0
  const titleLeft = style.header?.title?.x ?? 0
  const textAlign = style.header?.textAlign ?? 'left'
  const titlePath = V('path', {
    d: `
      M0,${titleHeight}
      L0,${ry}
      Q0,0 ${rx},0
      L${size.width - rx},0
      Q${size.width},0 ${size.width},${ry}
      L${size.width},${titleHeight}
      Z
    `,
    fill: style.header?.background ?? '#373C44',
  }).node as SVGPathElement
  const textAnchor = textAlign === 'left' ? 'start' : textAlign === 'right' ? 'end' : 'middle'
  let startX = 0
  switch (textAlign) {
    case 'left':
      startX = 10
      break
    case 'right':
      startX = size.width - 10
      break
    case 'center':
      startX = size.width / 2
      break
  }
  const text = V('text', {
    x: startX + titleLeft,
    y: titleHeight / 2 + titleFontSize / 2 - 3 + titleTop,
    fill: '#fff',
    fontSize: titleFontSize,
    textAnchor
  }).node as SVGTextElement
  text.textContent = title
  g.appendChild(titlePath)
  g.appendChild(text)
}

