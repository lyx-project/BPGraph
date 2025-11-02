import { JointGraph } from './joint/JointGraph'
import { type GraphOptions, Graph, type NodeInstanceType, type LinkInstanceType } from '../Graph'
import type { InputPort,  OutputPort } from '../Node'
import type { NodeStyle, LinkStyle } from '../NodeRegistry'
import { BlueprintNode } from './joint/nodes/BlueprintNode'
import { mvc } from '@joint/core'
import { EventEmitter } from '../utils/EventEmitter'
import type { dia } from '@joint/core'
import { mergeDeep } from '../utils'
import { KeyboardManager } from '../utils/KeyboardManager'
import { BlueprintNodeView } from './joint/nodes/BlueprintNodeView'

interface IGraphAdapter {
  addNode(node: NodeInstanceType): void
  addLink(link: LinkInstanceType): void
  destroy(): void
}

type AdpterEventPayload = {
  'node:click': [node: NodeInstanceType, evt: MouseEvent]
  'node:dblclick': [node: NodeInstanceType, evt: MouseEvent]
  'link:click': [link: LinkInstanceType, evt: MouseEvent]
  'link:dblclick': [link: LinkInstanceType, evt: MouseEvent]
  'blank:click': [evt: MouseEvent]
  'blank:dblclick': [evt: MouseEvent]
}

export class GraphAdapter extends EventEmitter<AdpterEventPayload> implements IGraphAdapter {
  public joint: JointGraph
  public cellsMap: Map<string, { cell: NodeInstanceType | LinkInstanceType, jointCell: BlueprintNode | dia.Link }> = new Map()
  public selection: Set<NodeInstanceType | LinkInstanceType> = new Set()
  private keyboardManager?: KeyboardManager
  public graph: Graph
  public jointSelection: Set<BlueprintNode | dia.Link> = new Set()

  constructor(graph: Graph, options?: GraphOptions) {
    super()
    this.graph = graph
    const jointPaperOptions = {
      el: options?.container,
      width: options?.width ?? '100%',
      height: options?.height ?? '100%',
      gridSize: options?.gridSize ?? 10,
      drawGridSize: options?.drawGrid?.size ?? 10,
      background: {
        color: options?.background ?? '#fff',
      },
      drawGrid: options?.drawGrid ? {
        color: options.drawGrid.color ?? '#bbb',
        thickness: options.drawGrid.thickness ?? 1
      } : false,
    } as dia.Paper.Options

    this.joint = new JointGraph(this, jointPaperOptions)

    this.initGraphEvents()
    this.initializeTools()
  }

  get scale() {
    return this.joint.scrollerController.scale
  }
  set scale(value: number) {
    this.joint.scrollerController.scale = value
  }
  get position() {
    return this.joint.scrollerController.position
  }
  set position(value: { x: number; y: number }) {
    this.joint.scrollerController.position = value
  }

  public initializeTools() {
    if (this.joint.paper.el) {
      if (this.keyboardManager) {
        this.keyboardManager.destroy()
      }
      this.keyboardManager = new KeyboardManager(this.joint.paper.el)
      this.initKeyboardShortcuts()
    }
  }

  public setContainer(container: HTMLElement) {
    this.joint.setContainer(container)
    this.initializeTools()
  }

  public select(item: NodeInstanceType | LinkInstanceType | string) {
    const id = typeof item === 'string' ? item : item.id || ''
    const cellObj = this.cellsMap.get(id)
    if (cellObj) {
      const instance = cellObj.cell
      if (!this.selection.has(instance)) {
        this.selection.add(instance)
      }
      if (!this.jointSelection.has(cellObj.jointCell)) {
        this.jointSelection.add(cellObj.jointCell)
      }
    }
    this.joint.groupCells([...this.jointSelection])
  }

  public selectCollection(items: Array<NodeInstanceType | LinkInstanceType>) {
    this.selection.clear()
    this.jointSelection.clear()
    items.forEach(item => {
      const cellObj = this.cellsMap.get(item.id || '')
      if (cellObj) {
        const instance = cellObj.cell
        if (!this.selection.has(instance)) {
          this.selection.add(instance)
        }
        if (!this.jointSelection.has(cellObj.jointCell)) {
          this.jointSelection.add(cellObj.jointCell)
        }
      }
    })
    this.joint.groupCells([...this.jointSelection])
  }

  public unselect(item: NodeInstanceType | LinkInstanceType | string) {
    const id = typeof item === 'string' ? item : item.id || ''
    const cellObj = this.cellsMap.get(id)
    if (cellObj) {
      const instance = cellObj.cell
      if (this.selection.has(instance)) {
        this.selection.delete(instance)
      }
      if (this.jointSelection.has(cellObj.jointCell)) {
        this.jointSelection.delete(cellObj.jointCell)
      }
    }
    this.joint.groupCells([...this.jointSelection])
  }

  public clearSelection() {
    this.selection.clear()
    this.jointSelection.clear()
    this.joint.clearGroups()
  }

  public addNode(instance: NodeInstanceType, style?: NodeStyle) {
    instance.id = instance.id || this.generateNodeId()
    for (const input of instance.inputs || []) {
      input.id = this.generatePortId(instance.inputs, 'in', input.id)
    }
    for (const output of instance.outputs || []) {
      output.id = this.generatePortId(instance.outputs, 'out', output.id)
    }

    const jointNode = this.joint.addNode(instance, style)

    instance._bbox = this.getElementBBox(this.joint.paper.findViewByModel(jointNode) as dia.ElementView)

    this.cellsMap.set(instance.id, { cell: instance, jointCell: jointNode })
  }

  public addLink(link: LinkInstanceType, style?: LinkStyle) {
    link.id = link.id || this.generateLinkId()
    const jointLink = this.joint.addLink(link, style)
    this.cellsMap.set(link.id as string, { cell: link, jointCell: jointLink })
  }

  public removeCells(nodes: Array<NodeInstanceType | LinkInstanceType>) {
    const removeCells: Array<BlueprintNode | dia.Link> = []
    nodes.forEach(node => {
      const cellObj = this.cellsMap.get(node.id || '')
      if (cellObj) {
        removeCells.push(cellObj.jointCell)
        this.cellsMap.delete(node.id || '')
        this.selection.delete(node)
        this.jointSelection.delete(cellObj.jointCell)
      }
    })
    this.joint.removeCells(removeCells)

    this.selectionChanged()
  }

  public destroy() {
    this.keyboardManager?.destroy()
    this.joint.destroy()
    this.joint = null as unknown as JointGraph
  }

  public getLinks(): LinkInstanceType[] {
    const links: LinkInstanceType[] = []
    this.cellsMap.forEach(({ cell }) => {
      if (cell instanceof Graph.LinkInstance) {
        links.push(cell)
      }
    })
    return links
  }

  public getNodes(): NodeInstanceType[] {
    const nodes: NodeInstanceType[] = []
    this.cellsMap.forEach(({ cell }) => {
      if (cell instanceof Graph.NodeInstance) {
        nodes.push(cell)
      }
    })
    return nodes
  }

  public findNode(id: string): NodeInstanceType | undefined {
    const cellObj = this.cellsMap.get(id)
    if (cellObj && cellObj.cell instanceof Graph.NodeInstance) {
      return cellObj.cell
    }
    return undefined
  }

  public findLink(id: string): LinkInstanceType | undefined {
    const cellObj = this.cellsMap.get(id)
    if (cellObj && cellObj.cell instanceof Graph.LinkInstance) {
      return cellObj.cell
    }
    return undefined
  }

  public zoomIn() {
    this.joint.scrollerController.scale += 0.1
  }

  public zoomOut() {
    this.joint.scrollerController.scale -= 0.1
  }

  public zoom(value: number) {
    this.joint.scrollerController.scale = value
  }

  public resetZoom(defaultScale = 1) {
    this.joint.scrollerController.scale = defaultScale
    this.joint.scrollerController.position = { x: 0, y: 0 }
  }

  public clientToGraphPoint(clientX: number, clientY: number) {
    return this.joint.paper.clientToLocalPoint(clientX, clientY)
  }

  private initKeyboardShortcuts() {
    if (!this.keyboardManager) return
    this.keyboardManager.registerShortcut('delete', () => {
      this.graph.deleteSelection()
    })
    this.keyboardManager.registerShortcut('backspace', () => {
      this.graph.deleteSelection()
    })
    this.keyboardManager.registerShortcut('mod+z', () => {
      this.graph.undoManager.undo()
    })
    this.keyboardManager.registerShortcut('mod+y', () => {
      this.graph.undoManager.redo()
    })
    this.keyboardManager.registerShortcut('mod+shift+z', () => {
      this.graph.undoManager.redo()
    })
    this.keyboardManager.registerShortcut('mod+a', (e) => {
      e.preventDefault()
      this.clearSelection()
      const allNodes = this.getNodes()
      const allLinks = this.getLinks()
      this.selectCollection([...allNodes, ...allLinks])
      this.selectionChanged()
    })
    this.keyboardManager.registerShortcut('mod+c', (e) => {
      if (e.target !== this.graph.container) return
      e.preventDefault()
      this.graph.copySelection()
    })
    this.keyboardManager.registerShortcut('mod+v', (e) => {
      if (e.target !== this.graph.container) return
      e.preventDefault()
      this.graph.pasteClipboard()
    })
  }

  private generatePortId<T extends OutputPort | InputPort>(list: readonly T[], prefix: string, defaultId: string = ''): string {
    if (defaultId) {
      if (!defaultId.startsWith(prefix + '-')) defaultId = prefix + '-' + defaultId
      return defaultId
    }
    const id = `${prefix}-${Math.random().toString(36).slice(2, 11)}`
    if (list.some(port => port.id === id)) {
      return this.generatePortId(list, prefix)
    }
    return id
  }

  public generateNodeId(): string {
    const id = 'node-' + Math.random().toString(36).slice(2, 11)
    if (this.cellsMap.has(id)) {
      return this.generateNodeId()
    }
    return id
  }

  public generateLinkId(): string {
    const id = 'link-' + Math.random().toString(36).slice(2, 11)
    if (this.cellsMap.has(id)) {
      return this.generateLinkId()
    }
    return id
  }

  public setOptions(options: Partial<GraphOptions>) {
    if (options.width) this.joint.paper.options.width = options.width
    if (options.height) this.joint.paper.options.height = options.height
    if (options.gridSize !== undefined) this.joint.paper.options.gridSize = options.gridSize
    if (options.background) this.joint.paper.options.background = { color: options.background }
    if (options.drawGrid) {
      this.joint.paper.options.drawGridSize = options.drawGrid.size ?? 10
      this.joint.paper.options.drawGrid = {
        color: options.drawGrid.color ?? '#bbb',
        thickness: options.drawGrid.thickness ?? 1
      }
    }
  }

  private initGraphEvents() {
    this.graph.on('node:mounted', (node) => {
      node.inputs.forEach(async input => {
        if (input.type !== 'select') return
        const jointCell = this.cellsMap.get(node.id || '')?.jointCell
        if (!jointCell) return
        const elementView = this.joint.paper.findViewByModel(jointCell) as BlueprintNodeView
        if (typeof input.options === 'function') {
          const options = await input.options(node.values)
          if (options === input._options || !Array.isArray(options)) return
          input._options = options
          jointCell.get('inputs').find((i: InputPort) => i.name === input.name)._options = input._options
          elementView.updateOptions(input.id || '', input.name, input._options || [])
          if (!node.values[input.name]) node.values[input.name] = input._options?.[0]?.value
          elementView.refreshDomValue(input.name)
        }
      })
    })
    // Node changed
    this.graph.on('node:changed', (node, change, oldvalue, newvalue) => {
      const pair = this.cellsMap.get(node.id)
      if (!pair) return
      const { jointCell } = pair
      if (!jointCell) return
      switch (change) {
        case 'position':
          jointCell.position(node.position.x, node.position.y)
          node._bbox = this.getElementBBox(this.joint.paper.findViewByModel(jointCell) as dia.ElementView)
          break
        case 'title':
          (jointCell as BlueprintNode).title(node.title)
          break
        case 'style':
          (jointCell as BlueprintNode).setStyle(
            mergeDeep(
              ((jointCell as BlueprintNode).get('style') ?? {}) as Record<string, unknown>,
              (node.style ?? {}) as Record<string, unknown>
            ) as NodeStyle
          )
          break
        case 'values':
          (jointCell as BlueprintNode).setValues(node.values);
          {
            const elementView = this.joint.paper.findViewByModel(jointCell) as BlueprintNodeView
            for (const name of Object.keys(newvalue || {})) {
              elementView.refreshDomValue(name)
              node.inputs.forEach(async input => {
                if (input.type !== 'select') return
                if (input.name === name) {
                  return
                }
                if (typeof input.options === 'function') {
                  const options = await input.options(node.values)
                  if (options === input._options || !Array.isArray(options)) return
                  input._options = options
                  jointCell.get('inputs').find((i: InputPort) => i.name === input.name)._options = input._options
                  elementView.updateOptions(input.id || '', input.name, input._options || [])
                  node.values = { [input.name]: input._options?.[0]?.value }
                }
              })
            }
          }
          break
        case 'inputs':
          (jointCell as BlueprintNode).set('inputs', node.inputs)
          break
        case 'outputs':
          (jointCell as BlueprintNode).set('outputs', node.outputs)
          break
      }
    })

    const listener = new mvc.Listener()

    listener.listenTo(this.joint.graph, 'node:switch:add-case', (jointNode: BlueprintNode) => {
      const instance = this.cellsMap.get(jointNode.id as string)?.cell as NodeInstanceType
      if (!instance) return
      const caseCount = instance.inputs.filter(input => input.name.startsWith('case_')).length
      instance.inputs = [...instance.inputs, {
        name: `case_${caseCount + 1}_value`,
        type: 'string',
        id: this.generatePortId(instance.inputs, 'in')
      }]
      instance.outputs = [...instance.outputs, {
        name: `case_${caseCount + 1}`,
        type: 'exec',
        id: this.generatePortId(instance.outputs, 'out')
      }]
    })

    listener.listenTo(this.joint.graph, 'node:values:changed', (elementView, name, value) => {
      const instance = this.cellsMap.get(elementView.model.id as string)?.cell as NodeInstanceType
      instance.values = { [name]: value }
    })

    // Element click
    listener.listenTo(this.joint.paper, 'element:pointerclick', (elementView, evt) => {
      const jointNode = elementView.model as BlueprintNode
      const instance = this.cellsMap.get(jointNode.id as string)?.cell as NodeInstanceType
      if (!instance) return
      this.emit('node:click', instance, evt)
      if (!evt.shiftKey && this.selection.has(instance) && this.selection.size === 1) {
        return
      }
      if (evt.shiftKey && this.selection.has(instance)) {
        this.unselect(instance)
        this.selectionChanged()
        return
      }
      if (!evt.shiftKey) {
        this.clearSelection()
      }
      this.select(instance)
      this.selectionChanged()
    })

    // Element double click
    listener.listenTo(this.joint.paper, 'element:pointerdblclick', (elementView, evt) => {
      const jointNode = elementView.model as BlueprintNode
      const instance = this.cellsMap.get(jointNode.id as string)?.cell as NodeInstanceType
      if (!instance) return
      this.emit('node:dblclick', instance, evt)
      if (instance.subgraphId && this.graph.model.hasSubgraph(instance.subgraphId)) {
        this.graph.enterSubgraph(instance.subgraphId)
      }
    })

    // Blank click
    listener.listenTo(this.joint.paper, 'blank:pointerclick', (evt: MouseEvent) => {
      this.emit('blank:click', evt)
      if (!evt.shiftKey) {
        if (this.selection.size > 0) {
          this.clearSelection()
          this.selectionChanged()
        }
      }
    })

    // Blank double click
    listener.listenTo(this.joint.paper, 'blank:pointerdblclick', (evt: MouseEvent) => {
      this.emit('blank:dblclick', evt)
    })

    // Link click
    listener.listenTo(this.joint.paper, 'link:pointerclick', (linkView, evt: MouseEvent) => {
      const jointLink = linkView.model as dia.Link
      const instance = this.cellsMap.get(jointLink.id as string)?.cell as LinkInstanceType
      if (!instance) return
      this.emit('link:click', instance, evt)
      if (!evt.shiftKey && this.selection.has(instance) && this.selection.size === 1) {
        return
      }
      if (evt.shiftKey && this.selection.has(instance)) {
        this.unselect(instance)
        this.selectionChanged()
        return
      }
      if (!evt.shiftKey) {
        this.clearSelection()
      }
      this.select(instance)
      this.selectionChanged()
    })

    // Link double click
    listener.listenTo(this.joint.paper, 'link:pointerdblclick', (linkView, evt: MouseEvent) => {
      const jointLink = linkView.model as dia.Link
      const instance = this.cellsMap.get(jointLink.id as string)?.cell as LinkInstanceType
      if (!instance) return
      this.emit('link:dblclick', instance, evt)
    })

    // Link connected
    listener.listenTo(this.joint.paper, 'link:connect', (linkView) => {
      const source = linkView.model.get('source')
      const target = linkView.model.get('target')
      const linkInstance = this.graph.createLinkInstance({
        id: linkView.model.id,
        source: { id: source.id as string, port: source.port as string },
        target: { id: target.id as string, port: target.port as string }
      })
      this.cellsMap.set(linkInstance.id as string, { cell: linkInstance, jointCell: linkView.model as dia.Link })

      const sourceObj = this.cellsMap.get(source.id as string)
      const targetObj = this.cellsMap.get(target.id as string)

      const sourceJointNode = sourceObj?.jointCell as BlueprintNode
      const targetJointNode = targetObj?.jointCell as BlueprintNode
      if (!sourceJointNode || !targetJointNode) return

      const sourceNode = sourceObj?.cell as NodeInstanceType
      const targetNode = targetObj?.cell as NodeInstanceType
      const sourcePortId = source.port as string
      const targetPortId = target.port as string
      const sourcePort = sourcePortId.startsWith('in-') ?
        sourceNode.inputs?.find(port => port.id === sourcePortId) :
        sourceNode.outputs?.find(port => port.id === sourcePortId)
      const targetPort = targetPortId.startsWith('out-') ?
        targetNode.outputs?.find(port => port.id === targetPortId) :
        targetNode.inputs?.find(port => port.id === targetPortId)

      linkView.model.attr('line/stroke', this.graph.getLinkColor(
        sourceNode as NodeInstanceType,
        targetNode as NodeInstanceType,
        sourcePort as OutputPort,
        targetPort as OutputPort
      ))

      linkInstance.style = mergeDeep(linkInstance.style ?? {}, {
        stroke: linkView.model.attr('line/stroke'),
        strokeWidth: linkView.model.attr('line/strokeWidth')
      }) as LinkStyle

      this.graph.startTransaction()
      this.graph.model.addLinks([linkInstance])
      this.graph.commitTransaction()
    })
    
    // Selection changed
    listener.listenTo(this.joint.paper, 'selection:changed', (cells: Array<BlueprintNode | dia.Link>) => {
      this.clearSelection()
      this.selectCollection(cells.map(cell => {
        const instance = this.cellsMap.get(cell.id as string)?.cell
        return instance
      }).filter(i => !!i) as Array<NodeInstanceType | LinkInstanceType>)
      this.selectionChanged()
    })

    
    // Node drag and drop
    // let dragStart: { x: number, y: number } | null = null
    // listener.listenTo(this.joint.paper, 'element:pointerdown', (elementView) => {
    //   dragStart = { ...elementView.model.position() }
    //   this.graph.trigger('node:dragstart', this.cellsMap.get(elementView.model.id as string)?.cell as NodeInstanceType)
    // })
    // listener.listenTo(this.joint.paper, 'element:pointermove', (elementView) => {
    //   const node = this.cellsMap.get(elementView.model.id as string)?.cell as NodeInstanceType
    //   if (!node) return
    //   node._bbox = this.getElementBBox(elementView)
    //   this.graph.trigger('node:dragmove', node)
    // })
    // listener.listenTo(this.joint.paper, 'element:pointerup', (elementView) => {
    //   if (!dragStart) return
    //   const dragEnd = elementView.model.position()
    //   if (dragEnd.x !== dragStart.x || dragEnd.y !== dragStart.y) {
    //     dragStart = null
    //     const node = this.cellsMap.get(elementView.model.id as string)?.cell as NodeInstanceType
    //     if (!node) return
    //     this.graph.startTransaction()
    //     node.position = { x: dragEnd.x, y: dragEnd.y }
    //     this.graph.commitTransaction()
    //     node._bbox = this.getElementBBox(elementView)
    //     this.graph.trigger('node:dragend', node)
    //   }
    // })

    // Node mouse enter / leave
    const hovered = new Set<string>()
    this.joint.paper.on('cell:mouseover', (cellView, evt) => {
      if (!(cellView.model instanceof BlueprintNode)) return
      const id = cellView.model.id as string
      if (!hovered.has(id)) {
        hovered.add(id)
        this.graph.emit('node:mouseenter', this.cellsMap.get(id)?.cell as NodeInstanceType, evt as unknown as MouseEvent)
      }
    })
    this.joint.paper.on('cell:mouseout', (cellView, evt) => {
      const id = cellView.model.id as string
      const mouseEvt = evt as unknown as MouseEvent
      if (hovered.has(id) && !cellView.el.contains(mouseEvt.relatedTarget as Node)) {
        hovered.delete(id)
        this.graph.emit('node:mouseleave', this.cellsMap.get(id)?.cell as NodeInstanceType, mouseEvt)
      }
    })

    let lastRightClickTime = 0
    listener.listenTo(this.joint.paper, 'blank:contextmenu', (evt: MouseEvent) => {
      const now = Date.now()
      if (now - lastRightClickTime < 400) {
        this.graph.exitSubgraph()
        lastRightClickTime = 0
      } else {
        lastRightClickTime = now
      }
      evt.preventDefault()
    })
  }

  getElementBBox(elementView: dia.ElementView) {
    const pos = elementView.model.position()
    const size = elementView.model.size()
    const scale = this.joint.scrollerController.scale
    const pan = this.joint.scrollerController.position
    const paperEl = this.joint.paper.el as HTMLElement
    const rect = paperEl.getBoundingClientRect()

    const left = rect.left + (pos.x * scale) + pan.x
    const top = rect.top + (pos.y * scale) + pan.y
    const width = size.width * scale
    const height = size.height * scale

    return { left, top, width, height, x: left, y: top }
  }
  
  selectionChanged() {
    this.graph.emit('selection:changed', Array.from(this.selection))
    this.joint.groupCells(Array.from(this.jointSelection))
  }

  clear() {
    this.cellsMap.clear()
    this.selection.clear()
    this.jointSelection.clear()
    this.joint.clear()
  }
}
