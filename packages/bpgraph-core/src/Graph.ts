import { GraphAdapter } from './adapters/GraphAdapter'
import { NodeRegistry } from './NodeRegistry'
import type { NodeOptions, NodeClassType, OutputPort } from './Node'
import { EventEmitter } from './utils/EventEmitter'
import { mergeDeep, Util } from './utils'
import { UndoManager } from './UndoManager'
import { ChangedEvent, ChangedEventType } from './ChangedEvent'
import type { JsonGraph } from './utils/serializer'
import { NodeInstance } from './Node'
import { BlueprintModel } from './GraphModel'

export interface GraphOptions {
  container?: HTMLElement,
  width?: number | string,
  height?: number | string,
  background?: string,
  gridSize?: number,
  drawGrid?: {
    size?: number,
    color?: string,
    thickness?: number
  }
}

export interface IGraph<NodeDefs extends Record<string, NodeClassType>> {
  /**
   * The registry of node definitions.
   */
  nodeRegistry: NodeRegistry<NodeDefs>

  /**
   * The current selected nodes and links in the graph.
   */
  selection: Set<NodeInstanceType | LinkInstanceType>

  /**
   * Adds a new node to the graph.
   * @param nodeType The node type string (registered name) or the registered node class to add.
   * @param options The options for adding the node.
   * @returns The instance of the added node.
   *
   * @example
   * ```
   * import { Graph, NodeRegistry, Node } from '@bpgraph/core'
   * class NodeA extends Node {}
   * const registry = new NodeRegistry()
   *  .register('nodeA', NodeA)
   * const graph = new Graph(registry, {
   *   el: document.createElement('div'),
   * })
   * const node1 = graph.addNode('nodeA')
   * const node2 = graph.addNode(NodeA)
   * const node3 = graph.createNodeInstance('nodeA')
   * graph.addNode(node3)
   * ```
   */
  addNode: <T extends keyof NodeDefs>(
    nodeType: T | NodeDefs[T] | NodeInstanceType,
    options?: NodeOptions<NodeDefs[T]>
  ) => NodeInstanceType

  /**
   * Adds a link to the graph.
   * @param link {@see LinkInstance} The link instance to add.
   * @returns The added link instance.
   */
  addLink: <T extends LinkInstance>(link: T) => T

  /**
   * Selects a node in the graph.
   * @param node The node instance to select.
   * @returns void
   */
  select: (node: NodeInstanceType) => void

  /**
   * Selects a collection of nodes and links in the graph.
   * @param items The collection of nodes and links to select.
   * @returns void
   * ```
   */
  selectCollection: (items: Array<NodeInstanceType | LinkInstanceType>) => void

  /**
   * Deletes the currently selected nodes and links from the graph.
   * @returns void
   */
  deleteSelection: () => void

  /**
   * Removes the specified node instances from the graph.
   * @param nodes The node instances to remove.
   */
  removeNodes(nodes: NodeInstanceType[]): void

  /**
   * Removes the specified link instances from the graph.
   * @param links The link instances to remove.
   */
  removeLinks(links: LinkInstance[]): void

  /**
   * Gets all nodes in the graph.
   * @returns An array of all node instances in the graph.
   */
  getNodes(): NodeInstanceType[]

  /**
   * Gets all links in the graph.
   * @returns An array of all link instances in the graph.
   */
  getLinks(): LinkInstance[]

  // Find a node by its ID.
  findNode(id: string): NodeInstanceType | undefined

  // Find a link by its ID.
  findLink(id: string): LinkInstanceType | undefined

  /**
   * Sets the container HTMLElement to render the graph into.
   * @param container The container HTMLElement to render the graph into.
   * @returns void
   * 
   * @example
   * ```
   * const container = document.getElementById('graph-container')
   * graph.setContainer(container)
   * ```
   */
  setContainer(container: HTMLElement): void

  /**
   * Zooms the graph in by a predefined step.
   */
  zoomIn(): void
  
  /**
   * Zooms the graph out by a predefined step.
   */
  zoomOut(): void

  /**
   * Zooms the graph to a specific scale.
   */
  zoom(value: number): void

  /**
   * Resets the zoom level to the default scale (1.0 or as configured).
   */
  resetZoom(): void

  /**
   * Destroys the graph and cleans up resources.
   */
  destroy: () => void

  /**
   * Validates the connection between two ports.
   * @param sourceNode The source node instance.
   * @param sourcePort The source port.
   * @param targetNode The target node instance.
   * @param targetPort The target port.
   * @returns Whether the connection is valid.
   */
  validateConnection: (sourceNode: NodeInstanceType, sourcePort: OutputPort, targetNode: NodeInstanceType, targetPort: OutputPort) => boolean

  /**
   * Gets the link color when actively creating a connection by dragging on the canvas.
   * You can return a color string based on the current context or logic.
   * @returns The link color as a string.
   */
  getLinkColor(
    sourceNode: NodeInstanceType | null,
    targetNode: NodeInstanceType | null,
    sourcePort: OutputPort | null,
    targetPort: OutputPort | null
  ): string

  /**
   * creates a new node instance of the specified node type.
   * @param nodeType The node type string (registered name) or the registered node class to create.
   * @param options The options for creating the node instance.
   * @returns The instance of the created node.
   */
  createNodeInstance<K extends keyof NodeDefs>(
    nodeType: K | NodeDefs[K],
    options?: NodeOptions<NodeDefs[K]>
  ): NodeInstanceType

  /**
   * Clears the graph by removing all nodes, links, and variables.
   */
  clear(): void

  /**
   * Gets the current graph as a JSON object.
   */
  toJSON(): JsonGraph

  /**
   * Loads the graph from a JSON object or string.
   * @param json The JSON object or string to load the graph from.
   */
  fromJSON(json: JsonGraph | string): void
}

type GraphEventPayload = {
  'changed': [event: ChangedEvent]

  'node:click': [instance: NodeInstanceType, evt: MouseEvent]
  'node:dblclick': [instance: NodeInstanceType, evt: MouseEvent]
  'node:changed': [instance: NodeInstanceType, propertyName: string, oldvalue: unknown, newvalue: unknown]
  'node:dragstart': [instance: NodeInstanceType]
  'node:dragmove': [instance: NodeInstanceType]
  'node:dragend': [instance: NodeInstanceType]
  'node:mouseenter': [instance: NodeInstanceType, evt: MouseEvent]
  'node:mouseleave': [instance: NodeInstanceType, evt: MouseEvent]
  'node:removed': [instance: NodeInstanceType[], info: { type: 'removed' }]
  'node:created': [instance: NodeInstanceType[], info: { type: 'added' }]
  'node:mounted': [instance: NodeInstanceType]

  'link:click': [instance: LinkInstanceType, evt: MouseEvent]
  'link:dblclick': [instance: LinkInstanceType, evt: MouseEvent]
  'link:created': [instance: LinkInstanceType[], info: { type: 'added' }]
  'link:removed': [instance: LinkInstanceType[], info: { type: 'removed' }]
  
  'start:connecting': []

  'blank:dblclick': [evt: MouseEvent]
  'blank:click': [evt: MouseEvent]
  
  'selection:changed': [selection: Array<NodeInstanceType | LinkInstanceType>]
  
  'subgraph:enter': [subgraphId: string]
  'subgraph:exit': [subgraphId: string]
  
  'viewport:change': [viewport: { x: number, y: number, scale: number }]
  
}
export class Graph<NodeDefs extends Record<string, NodeClassType> = {}> extends EventEmitter<GraphEventPayload> implements IGraph<NodeDefs> {
  public undoManager = new UndoManager(this)
  public skipsUndoManager = false
  public container?: HTMLElement
  public _model!: BlueprintModel
  public nodeRegistry: NodeRegistry<NodeDefs>
  private _defaultScale = 1
  private adapter: GraphAdapter
  public options: GraphOptions
  
  static NodeInstance: typeof NodeInstance
  static LinkInstance: typeof LinkInstance
  
  private clipboard: {
    nodes: JsonGraph['nodes']
    links: JsonGraph['links']
  } = { nodes: [], links: [] }
  
  constructor(registry: NodeRegistry<NodeDefs>, options?: GraphOptions) {
    super()
    this.options = options || {}
    this.nodeRegistry = registry
    this.container = options?.container
    if (this.container) {
      this.container.setAttribute('tabindex', '0')
      this.container.style.outline = 'none'
      this.container.focus()
    }
    this.adapter = new GraphAdapter(this as unknown as Graph<{}>, options)
    this.model = new BlueprintModel()
    this.initialize()
  }

  // Get the current selected nodes and links in the graph
  get selection() {
    return this.adapter.selection || new Set()
  }

  // Get the current zoom level of the viewport
  get scale() {
    return this.adapter.scale || 1
  }
  // Set the current zoom level of the viewport
  set scale(value: number) {
    if (this.adapter) this.adapter.scale = value
  }

  // Get the current position of the viewport
  get position() {
    return this.adapter.position || { x: 0, y: 0 }
  }
  // Set the current position of the viewport
  set position(value: { x: number, y: number }) {
    if (this.adapter) this.adapter.position = value
  }

  // Get or set the default zoom scale
  get defaultScale() {
    return this._defaultScale
  }
  set defaultScale(value: number) {
    this._defaultScale = value
  }

  get model() {
    return this._model
  }
  set model(value: BlueprintModel) {
    this.clear()
    this._model = value
    value.setGraph(this as unknown as Graph<{}>)
  }

  protected initialize() {
    this.initAdapterEvents()
  }

  /** @inheritdoc {@link IGraph.addNode} */
  public addNode<T extends keyof NodeDefs>(
    nodeType: T | NodeDefs[T] | NodeInstanceType,
    options?: NodeOptions<NodeDefs[T]>
  ): NodeInstance<NodeDefs[T]> {
    const nodeInstance = nodeType instanceof NodeInstance ?
      nodeType as NodeInstance<NodeDefs[T]> :
      this.createNodeInstance(nodeType, options)

    const style = mergeDeep(mergeDeep(
      (this.nodeRegistry.nodeStyle) as Record<string, unknown>,
      (nodeInstance.definition.style ?? {}) as Record<string, unknown>
    ), (nodeInstance.style ?? {}) as Record<string, unknown>)
    // nodeInstance.setGraph(this as unknown as Graph<{}>)
    this._validateNodes([nodeInstance])
    this.adapter.addNode(nodeInstance, style)
    nodeInstance.setGraph(this as unknown as Graph<{}>)
    this.model.addNodes([nodeInstance])
    return nodeInstance
  }

  /** @inheritdoc {@link IGraph.addLink} */
  public addLink<T extends LinkInstance>(link: T): LinkInstance & T {
    const linkInstance = link instanceof LinkInstance ? link : this.createLinkInstance(link)
    const style = mergeDeep(
      (this.nodeRegistry.linkStyle) as Record<string, unknown>,
      linkInstance.style ?? {} as Record<string, unknown>
    )
    if (this._validateLinkConnection(linkInstance)) {
      this.adapter.addLink(linkInstance, style)
      this.model.addLinks([linkInstance])
    }
    return linkInstance
  }

  /** Adds multiple nodes to the graph. */
  public addNodes(nodes: NodeInstanceType[]): NodeInstanceType[] {
    this._validateNodes(nodes)
    nodes.forEach(node => {
      const style = mergeDeep(mergeDeep(
        (this.nodeRegistry.nodeStyle) as Record<string, unknown>,
        (node.definition.style ?? {}) as Record<string, unknown>
      ), (node.style || {}) as Record<string, unknown>)
      this.adapter.addNode(node, style)
      node.setGraph(this as unknown as Graph<{}>)
    })
    this.model.addNodes(nodes)
    return nodes
  }

  /** Adds multiple links to the graph. */
  public addLinks(links: LinkInstanceType[]): LinkInstanceType[] {
    const errors: Error[] = []
    links = links.filter(link => {
      try {
        return this._validateLinkConnection(link)
      } catch (error: unknown) {
        errors.push(error as Error)
        return false
      }
    })
    links.forEach(link => {
      const style = mergeDeep(
        (this.nodeRegistry.linkStyle) as Record<string, unknown>,
        link.style ?? {} as Record<string, unknown>
      )
      this.adapter.addLink(link, style)
    })
    this.model.addLinks(links)
    if (errors.length > 0) {
      throw new Error(`Some links could not be added:\n${errors.map(e => (e).message).join('\n')}`)
    }
    return links
  }

  /** @inheritdoc {@link IGraph.select} */
  public select(item: NodeInstanceType | LinkInstance) {
    this.adapter.select(item)
  }

  /** @inheritdoc {@link IGraph.selectCollection} */
  public selectCollection(items: Array<NodeInstanceType | LinkInstance>) {
    this.adapter.selectCollection(items)
  }

  public clearSelection() {
    this.adapter.clearSelection()
  }

  /** @inheritdoc {@link IGraph.destroy} */
  public destroy() {
    this.clear()
    if (this.adapter) this.adapter.destroy()
  }

  /** @inheritdoc {@link IGraph.setContainer} */
  public setContainer(container: HTMLElement) {
    container.setAttribute('tabindex', '0')
    container.style.outline = 'none'
    container.focus()
    this.container = container
    if (this.adapter) this.adapter.setContainer(container)
  }

  /** @inheritdoc {@link IGraph.deleteSelection} */
  public deleteSelection() {
    const deleteCells = Array.from(this.selection)
    const deleteNodes = deleteCells.filter(c => c instanceof Graph.NodeInstance) as NodeInstanceType[]
    const deleteLinks = deleteCells.filter(c => c instanceof Graph.LinkInstance) as LinkInstanceType[]


    const oldskips = this.skipsUndoManager
    if (!oldskips) this.startTransaction()
    this.removeNodes(deleteNodes)
    this.removeLinks(deleteLinks)
    if (!oldskips) this.commitTransaction()
  }

  /** @inheritdoc {@link IGraph.removeNodes} */
  public removeNodes(nodes: NodeInstanceType[]) {
    if (this.model.currentModel.id !== this.model.root.id) {
      nodes = nodes.filter(n => {
        if ((n.type === 'start' || n.type === 'end') && !this.model.isSettingGraph) {
          return false
        }
        return true
      })
    }
    if (this.adapter) this.adapter.removeCells(nodes)
    this.model.removeNodes(nodes)
  }

  /** @inheritdoc {@link IGraph.removeLinks} */
  public removeLinks(links: LinkInstance[]) {
    if (this.adapter) this.adapter.removeCells(links)
    this.model.removeLinks(links)
  }

  public copySelection() {
    this.copyCells([...this.selection])
  }

  public copyCells(cells: Array<NodeInstanceType | LinkInstanceType>) {
    const nodes = cells.filter(c => c instanceof Graph.NodeInstance)
    const links = cells.filter(c => c instanceof Graph.LinkInstance)
      .filter(l => {
        return nodes.find(n => n.id === l.source.id) && nodes.find(n => n.id === l.target.id)
      })
    const serializedNodes = Util.serializeNodes(nodes)
    const serializedLinks = Util.serializeLinks(links)
    this.clipboard.nodes = serializedNodes
    this.clipboard.links = serializedLinks
  }

  public pasteClipboard() {
    if (this.clipboard.nodes.length === 0) return
    if (!this.adapter) return
    const oldnodeIdMap = new Map<string, string>()
    const nodes = Util.deserializeNodes(this as unknown as Graph<{}>, this.clipboard.nodes.map(n => {
      const oldId = n.id
      const newId = this.adapter!.generateNodeId()
      oldnodeIdMap.set(oldId, newId)
      n.position = { x: n.position.x + 20, y: n.position.y + 20 }
      return {
        ...n,
        id: newId,
      }
    }))
    const links = Util.deserializeLinks(this as unknown as Graph<{}>, this.clipboard.links.map(l => {
      l.id = this.adapter!.generateLinkId()
      const newSourceId = oldnodeIdMap.get(l.source.id)!
      const newTargetId = oldnodeIdMap.get(l.target.id)!
      return {
        id: l.id,
        source: {
          id: newSourceId,
          port: l.source.port
        },
        target: {
          id: newTargetId,
          port: l.target.port
        }
      }
    }))

    this.clearSelection()
    this.startTransaction()
    this.addNodes(nodes)
    this.addLinks(links)
    this.selectCollection([...nodes, ...links])
    this.commitTransaction()
  }

  /** @inheritdoc {@link IGraph.getLinks} */
  public getLinks(): LinkInstance[] {
    return this.model.getLinks()
  }

  /** @inheritdoc {@link IGraph.getNodes} */
  public getNodes(): NodeInstanceType[] {
    return this.model.getNodes()
  }

  /** @inheritdoc {@link IGraph.findLink} */
  public findNode(id: string): NodeInstanceType | undefined {
    return this.model.findNode(id)
  }

  /** @inheritdoc {@link IGraph.findLink} */
  public findLink(id: string): LinkInstanceType | undefined {
    return this.model.findLink(id)
  }

  /** @inheritdoc {@link IGraph.zoomIn} */
  public zoomIn() {
    if (this.adapter) this.adapter.zoomIn()
  }

  /** @inheritdoc {@link IGraph.zoomOut} */
  public zoomOut() {
    if (this.adapter) this.adapter.zoomOut()
  }

  /** @inheritdoc {@link IGraph.zoom} */
  public zoom(value: number) {
    if (this.adapter) this.adapter.zoom(value)
  }

  /** @inheritdoc {@link IGraph.resetZoom} */
  public resetZoom() {
    if (this.adapter) this.adapter.resetZoom(this.defaultScale)
  }

  /** @inheritdoc {@link IGraph.createNodeInstance} */
  public createNodeInstance<K extends keyof NodeDefs>(
    nodeType: K | NodeDefs[K],
    options?: NodeOptions<NodeDefs[K]>
  ): NodeInstance<NodeDefs[K]> {
    if (!this.nodeRegistry.isRegistered(nodeType)) {
      if (typeof nodeType === 'string') {
        throw new Error(`Node type "${nodeType}" is not registered.`)
      } else if (nodeType.constructor && 'name' in nodeType.constructor) {
        throw new Error(`Node type "${nodeType.constructor.name}" is not registered.`)
      }
    }
    let NodeClass: NodeDefs[K]
    if (typeof nodeType === 'string') {
      NodeClass = this.nodeRegistry.get(nodeType as K)
    } else {
      NodeClass = nodeType as NodeDefs[K]
    }

    return new Graph.NodeInstance(NodeClass, options)
  }

  /** @inheritdoc {@link IGraph.createLinkInstance} */
  public createLinkInstance<T extends LinkInstance>(link: T): LinkInstance & T {
    const linkInstance = new LinkInstance(link.source, link.target)
    return Object.assign(linkInstance, link)
  }

  /** @inheritdoc {@link IGraph.getLinkColor} */
  public getLinkColor(
    _sourceNode: NodeInstanceType,
    _targetNode: NodeInstanceType,
    sourcePort: OutputPort,
    targetPort: OutputPort): string
  {
    const defaultLinkStyle = this.nodeRegistry.linkStyle
    if (defaultLinkStyle.byPortType) {
      const color = getLinkColor(defaultLinkStyle.byPortType, sourcePort, targetPort)
      if (color) return color
    }
    return defaultLinkStyle.stroke || 'rgba(255,255,255,0.5)'
  }

  public enterSubgraph(subgraphId: string) {
    this.model.enterSubgraph(subgraphId)
    this.emit('subgraph:enter', subgraphId)
  }

  public exitSubgraph() {
    const subgraphId = this.model.activeGraph.id
    if (subgraphId === this.model.root.id) return
    this.model.exitSubgraph()
    this.emit('subgraph:exit', subgraphId)
  }

  public clientToGraphPoint(clientX: number, clientY: number) {
    if (!this.adapter) return { x: clientX, y: clientY }
    return this.adapter.clientToGraphPoint(clientX, clientY)
  }

  /** @inheritdoc {@link IGraph.startTransaction} */
  public startTransaction() {
    this.undoManager.startTransaction()
  }

  /** @inheritdoc {@link IGraph.commitTransaction} */
  public commitTransaction() {
    this.undoManager.commitTransaction()
  }

  /** @inheritdoc {@link IGraph.commit} */
  public commit(...args: Parameters<UndoManager['commit']>) {
    this.undoManager.commit(...args)
  }

  /** @inheritdoc {@link IGraph.validateConnection} */
  public validateConnection(_sourceNode: NodeInstanceType, sourcePort: OutputPort, _targetNode: NodeInstanceType, targetPort: OutputPort): boolean {
    const sourceType = sourcePort.type
    const targetType = targetPort.type
    switch (sourceType) {
      case 'exec':
        if (targetType !== 'exec') return false
        break
      case 'number':
        if (targetType !== 'number' && targetType !== 'any') return false
        break
      case 'boolean':
        if (targetType !== 'boolean' && targetType !== 'any') return false
        break
      case 'array':
        if (targetType !== 'array' && targetType !== 'any') return false
        break
      case 'object':
        if (targetType !== 'object' && targetType !== 'any') return false
        break
      case 'spacer':
        return false
      case 'any':
        if (targetType === 'exec') return false
        break
      case 'string':
        if (targetType !== 'string' && targetType !== 'any' && targetType !== 'textarea') return false
        break
      case 'textarea':
        if (targetType !== 'textarea' && targetType !== 'string' && targetType !== 'any') return false
        break
    }
    return true
  }

  public raiseChangedEvent(change: ChangedEventType, propertyName: string, object: unknown, oldValue: unknown, newValue: unknown) {
    const e = new ChangedEvent()
    e.change = change
    e.graph = this as unknown as Graph<{}>
    e.propertyName = propertyName
    e.oldValue = oldValue
    e.newValue = newValue
    e.object = object
    this.callChangedListeners(e)
  }

  public setOptions(options: Partial<GraphOptions> = {}) {
    this.options = mergeDeep(
      this.options as Record<string, unknown>,
      options
    )
    if (this.adapter) this.adapter.setOptions(this.options)
    if (options.container) this.setContainer(options.container)
  }

  public toString(details: number = 0) {
    let name = '';
    if (this.container && this.container.id) name = this.container.id
    let str = `Graph "${name ? '' + name : ''}"`
    if (details > 0) {
      const nodes = this.getNodes()
      const links = this.getLinks()
      const total = nodes.length + links.length
      str += '\n ' + total + ': '
      str += nodes.length + ' Nodes '
      str += links.length + ' Links'

      for (const node of nodes) {
        str += '\n   ' + 'Node#' + node.id + `(${node.nodeType})`
      }

      for (const link of links) {
        str += '\n   ' + 'Link#' + link.id + `(${link.source.id} ${link.target.id})` + ` ${link.source.port} ${link.target.port}`
      }
    }
    return str
  }

  /** @inheritdoc {@link IGraph.toJSON} */
  public toJSON() {
    return this.model.toJSON()
  }

  /** @inheritdoc {@link IGraph.fromJSON} */
  public fromJSON(json: JsonGraph | string) {
    this.model.setGraph(null)
    this.model = BlueprintModel.fromJSON(this as unknown as Graph<{}>, json)
    return this.model
  }

  /** @inheritdoc {@link IGraph.clear} */
  public clear() {
    if (this.model) this.model.clear()
    if (this.adapter) this.adapter.clear()
    this.undoManager.clear()
  }

  private initAdapterEvents() {
    this.adapter.on('node:click', (instance, evt) => {
      this.emit('node:click', instance, evt)
    })
    this.adapter.on('node:dblclick', (instance, evt) => {
      this.emit('node:dblclick', instance, evt)
    })
    this.adapter.on('blank:click', (evt) => {
      this.emit('blank:click', evt)
    })
    this.adapter.on('blank:dblclick', (evt) => {
      this.emit('blank:dblclick', evt)
    })
    this.adapter.on('link:click', (instance, evt) => {
      this.emit('link:click', instance, evt)
    })
    this.adapter.on('link:dblclick', (instance, evt) => {
      this.emit('link:dblclick', instance, evt)
    })
  }

  private callChangedListeners(e: ChangedEvent) {
    if (!this.skipsUndoManager) {
      this.undoManager.handleChanged(e);
    }
    this.emit('changed', e)
  }

  private _validateLinkConnection(link: LinkInstance) {
    const sourceNode = this.findNode(link.source.id)
    const targetNode = this.findNode(link.target.id)
    if (!sourceNode) {
      throw new Error(`Source node with id "${link.source.id}" not found.`)
    }
    if (!targetNode) {
      throw new Error(`Target node with id "${link.target.id}" not found.`)
    }
    if (sourceNode.id === targetNode.id) {
      throw new Error(`Cannot connect a node to itself: "${sourceNode.id}".`)
    }
    const sourcePortId = link.source.port!
    const targetPortId = link.target.port!
    if (!sourcePortId || !targetPortId) throw new Error(`Both source port and target port must be specified in the link.`)
    if (sourcePortId.startsWith('in-') && targetPortId.startsWith('in-')) throw new Error(`Cannot connect two input ports: "${sourcePortId}" and "${targetPortId}".`)
    if (sourcePortId.startsWith('out-') && targetPortId.startsWith('out-')) throw new Error(`Cannot connect two output ports: "${sourcePortId}" and "${targetPortId}".`)
    const sourcePort = sourcePortId.startsWith('out-') ?
      sourceNode.outputs.find(port => port.id === sourcePortId) :
      sourceNode.inputs.find(port => port.id === sourcePortId)
    if (!sourcePort) throw new Error(`Source port "${link.source.port}" not found in node "${sourceNode}".`)
    const targetPort = targetPortId.startsWith('in-') ?
      targetNode.inputs.find(port => port.id === targetPortId) :
      targetNode.outputs.find(port => port.id === targetPortId)
    if (!targetPort)  throw new Error(`Target port "${link.target.port}" not found in node "${targetNode}".`)
    if (!this.validateConnection(sourceNode, sourcePort as OutputPort, targetNode, targetPort as OutputPort)) {
      throw new Error(
        `Port type mismatch: cannot connect ${sourceNode} [${sourcePort.name}:${sourcePort.type}] to ${targetNode} [${targetPort.name}:${targetPort.type}].`
      )
    }
    return true
  }

  private _validateNodes(nodes: NodeInstanceType[]) {
    if (this.model.subgraphStack.length > 1) {
      if (nodes.some(n => n.type === 'start') && this.getNodes().some(n => n.type === 'start')) {
        throw new Error('A subgraph cannot contain another start node.')
      }
    }
    return true
  }
}

class LinkInstance {
  style?: { stroke?: string, strokeWidth?: number }
  id?: string
  source: { id: string, port: string }
  target: { id: string, port: string }
  constructor(source: { id: string, port: string }, target: { id: string, port: string }) {
    this.source = source
    this.target = target
  }
  public toString() {
    return `Link#${this.id}(${this.source.id} ${this.target.id}) ${this.source.port} ${this.target.port}`
  }
}

Graph.NodeInstance = NodeInstance
Graph.LinkInstance = LinkInstance

export type NodeInstanceType = InstanceType<typeof Graph.NodeInstance>
export type LinkInstanceType = InstanceType<typeof Graph.LinkInstance>

const getLinkColor = (() => {
  const cachedColors = {} as Record<string, string>
  const currentColorIndexMap = {} as Record<string, number>
  return (colors: {[key: string]: string[]}, sourcePort: OutputPort, targetPort: OutputPort) => {
    const source = (sourcePort.id || '').startsWith('out-') ? sourcePort : targetPort
    const target = (targetPort.id || '').startsWith('in-') ? targetPort : sourcePort
    if (!Array.isArray(colors[source.type]) || !Array.isArray(colors[target.type])) return
    const sourceId = source.id || ''
    const targetId = target.id || ''

    const cachedColor = cachedColors[sourceId + targetId]
    if (cachedColor) return cachedColor

    const sourceCachedColor = cachedColors[sourceId]
    const targetCachedColor = cachedColors[targetId]

    if (sourceCachedColor) {
      cachedColors[sourceId + targetId] = sourceCachedColor
      return sourceCachedColor
    }
    
    if (targetCachedColor) {
      cachedColors[sourceId + targetId] = targetCachedColor
      return targetCachedColor
    }

    currentColorIndexMap[source.type] = currentColorIndexMap[source.type] || 0
    const color = colors[source.type][currentColorIndexMap[source.type]]
    cachedColors[sourceId] = color
    cachedColors[targetId] = color
    currentColorIndexMap[source.type] = (currentColorIndexMap[source.type] + 1) % colors[source.type].length
    return color
  }
})()

