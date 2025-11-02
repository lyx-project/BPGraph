import type { NodeInstanceType } from './Graph'
import { EventEmitter } from './utils/EventEmitter'
export class NodeToolsView {
  node?: NodeInstanceType
  element: HTMLElement
  tools: NodeToolView[]
  constructor(tools: NodeToolView[]) {
    this.tools = tools
    this.element = document.createElement('div')
    this.element.classList.add('bpgraph-node-tools-view')
    this.element.style.position = 'absolute'
    this.element.style.top = '0'
    this.element.style.left = '0'
    this.element.style.pointerEvents = 'none'
  }

  remove() {
    this.unmount()
    this.node = undefined
    this.tools.forEach(tool => tool.remove())
  }

  configure(node: NodeInstanceType) {
    this.node = node
    this.mount()
    this.tools.forEach(tool => tool.configure(node, this))
    this.updatePosition()
    node.graph?.on('node:dragmove', this.onDragMove)
  }

  onDragMove = () => {
    this.updatePosition()
  }

  update() {
    this.updatePosition()
  }
  
  isMounted() {
    return this.element.parentElement !== null
  }

  mount() {
    if (!this.node) return
    if (this.isMounted()) return
    if (!this.node.graph) return
    if (!this.node.graph.container) return
    this.node.graph.container.appendChild(this.element)
  }

  unmount() {
    if (this.isMounted()) {
      this.element.remove()
      this.node?.graph?.off('node:dragmove', this.onDragMove)
    }
  }

  updatePosition() {
    if (!this.node) return
    if (!this.node.graph) return
    if (!this.node.graph.container) return
    const bbox = this.node.bbox
    if (!bbox) return

    this.element.style.transform = `translate(${bbox.x}px, ${bbox.y}px)`
  }

  public show() {
    if (!this.isMounted()) {
      this.mount()
    }
    this.tools.forEach(tool => tool.show())
  }

  public hide() {
    this.unmount()
    this.tools.forEach(tool => tool.hide())
  }
}

type NodeToolViewEventsPayload = {
  position: [number, number]
}
export abstract class NodeToolView extends EventEmitter<NodeToolViewEventsPayload> {
  element: HTMLElement = document.createElement('div')
  node?: NodeInstanceType
  parentView?: NodeToolsView
  constructor() {
    super()
    this.element.classList.add('bpgraph-node-tool-view')
  }
  configure(node: NodeInstanceType, parent: NodeToolsView) {
    this.node = node
    this.parentView = parent
    this.parentView.element.appendChild(this.element)
  }
  show() {}
  hide() {}
  remove() {}
}



