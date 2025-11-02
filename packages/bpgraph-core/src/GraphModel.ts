import type { Graph, LinkInstanceType, NodeInstanceType } from './Graph'
import { EventEmitter } from './utils/EventEmitter'
import { ChangedEventType } from './ChangedEvent'
import type { Command } from './UndoManager'
import type { JsonGraph } from './utils/serializer'
import { type VariableDef, VariableManager } from './VariableManager'
import { Util } from './utils'

export class GraphModel {
  undoStack: Command[] = []
  redoStack: Command[] = []
  id: string
  nodes: NodeInstanceType[] = []
  links: LinkInstanceType[] = []
  viewport: { x: number, y: number, scale: number } = { x: 0, y: 0, scale: 1 }
  constructor(id: string = '', nodes: NodeInstanceType[] = [], links: LinkInstanceType[] = []) {
    this.id = id
    this.nodes = nodes
    this.links = links
  }
}

type BlueprintModelEventsPayload = {
  addNodes: [NodeInstanceType[]]
  removeNodes: [NodeInstanceType[]]
  addLinks: [LinkInstanceType[]]
  removeLinks: [LinkInstanceType[]]
}
export class BlueprintModel extends EventEmitter<BlueprintModelEventsPayload> {

  public variableManager = new VariableManager()
  public activeGraph: GraphModel
  private graphStack: GraphModel[]
  private graph: Graph | null = null
  private _isSettingGraph = false
  public root: GraphModel = new GraphModel('root')
  public subgraphs: Map<string, GraphModel> = new Map() // key is subgraphId

  constructor(root: GraphModel = new GraphModel(), subgraphs: Map<string, GraphModel> = new Map()) {
    super()
    this.subgraphs = subgraphs
    this.root = root
    this.activeGraph = root
    this.graphStack = [root]
  }

  public get isSettingGraph() {
    return this._isSettingGraph
  }

  public get subgraphStack() {
    return this.graphStack
  }

  public get currentModel() {
    return this.activeGraph
  }

  public get nodes() {
    return this.activeGraph.nodes
  }

  setGraph(graph: Graph | null) {
    if (this.graph === graph) return
    if (this.graph) {
      this.graph.off('viewport:change', this.onViewportChange)
    }
    this.graph = graph
    if (this.graph) {
      this.graph.on('viewport:change', this.onViewportChange)
      this.graph.undoManager.clear()
      this.graph.position = { x: this.activeGraph.viewport.x, y: this.activeGraph.viewport.y }
      this.graph.scale = this.activeGraph.viewport.scale
      if (!this.activeGraph.nodes.length) return
      this._isSettingGraph = true
      const oldskips = this.graph.skipsUndoManager
      this.graph.skipsUndoManager = false
      this.graph.startTransaction()
      this.graph.addNodes(this.activeGraph.nodes)
      try {
        this.activeGraph.links = this.graph.addLinks(this.activeGraph.links)
      } catch (error) {
        console.error('Error adding links to graph:', error)
      }
      this.graph.commitTransaction()
      this.graph.skipsUndoManager = oldskips
      this._isSettingGraph = false
    }
  }

  private onViewportChange = (viewport: { x: number, y: number, scale: number }) => {
    this.activeGraph.viewport = { x: viewport.x, y: viewport.y, scale: viewport.scale }
  }

  public enterSubgraph(subgraphId: string) {
    const sub = this.subgraphs.get(subgraphId)
    if (!sub) return
    if (!this.graph) return
    this._isSettingGraph = true
    const undoStack = this.graph.undoManager.undoStack
    const redoStack = this.graph.undoManager.redoStack
    this.activeGraph.undoStack = undoStack
    this.activeGraph.redoStack = redoStack
    this.graph.undoManager.clear()
    const oldnodes = this.graph.getNodes()
    const oldlinks = this.graph.getLinks()
    const oldskips = this.graph.skipsUndoManager
    this.graph.skipsUndoManager = true
    this.activeGraph = sub
    this.graph.position = { x: this.activeGraph.viewport.x, y: this.activeGraph.viewport.y }
    this.graph.scale = this.activeGraph.viewport.scale
    this.graph.removeNodes(oldnodes)
    this.graph.removeLinks(oldlinks)
    this.graph.addNodes(this.activeGraph.nodes)
    this.graph.addLinks(this.activeGraph.links)
    this.graph.undoManager.undoStack = this.activeGraph.undoStack
    this.graph.undoManager.redoStack = this.activeGraph.redoStack
    this.graph.skipsUndoManager = oldskips
    this.graphStack.push(sub)
    this._isSettingGraph = false
  }

  public exitSubgraph() {
    if (this.graphStack.length > 1) {
      this._isSettingGraph = true
      if (!this.graph) return
      this.activeGraph.undoStack = this.graph.undoManager.undoStack
      this.graphStack.pop()
      const previousGraph = this.graphStack[this.graphStack.length - 1]
      if (!this.graph) return
      this.graph.undoManager.clear()

      const oldnodes = this.graph.getNodes()
      const oldlinks = this.graph.getLinks()
      
      this.activeGraph = previousGraph
      const oldskips = this.graph.skipsUndoManager
      this.graph.position = { x: this.activeGraph.viewport.x, y: this.activeGraph.viewport.y }
      this.graph.scale = this.activeGraph.viewport.scale
      this.graph.skipsUndoManager = true
      this.graph.removeNodes(oldnodes)
      this.graph.removeLinks(oldlinks)
      this.graph.addNodes(previousGraph.nodes)
      this.graph.addLinks(previousGraph.links)
      this.graph.undoManager.undoStack = this.activeGraph.undoStack
      this.graph.undoManager.redoStack = this.activeGraph.redoStack
      this.graph.skipsUndoManager = oldskips
      this._isSettingGraph = false
    }
  }

  public hasSubgraph(subgraphId: string) {
    return this.subgraphs.has(subgraphId)
  }

  public createSubgraph(subgraphId: string) {
    if (!this.subgraphs.has(subgraphId)) {
      const sub = new GraphModel(subgraphId)
      this.subgraphs.set(subgraphId, sub)
      const StartNodeClass = this.graph?.nodeRegistry.getStartNodeClass()
      const startNode = this.graph!.createNodeInstance(StartNodeClass as unknown as never) as NodeInstanceType
      const EndNodeClass = this.graph?.nodeRegistry.getEndNodeClass()
      const endNode = this.graph!.createNodeInstance(EndNodeClass as unknown as never) as NodeInstanceType
      startNode.id = 'start-' + subgraphId
      startNode.position = { x: 300, y: 300 }
      endNode.id = 'end-' + subgraphId
      endNode.position = { x: 600, y: 300 }
      startNode.outputs = [
        { id: 'exec', name: 'exec', type: 'exec', label: '' },
        { id: 'param', name: 'param', type: 'any', label: 'param' }
      ]
      endNode.inputs = [
        ...endNode.inputs,
        { id: 'result', name: 'result', type: 'any', label: 'result' }
      ]
      sub.nodes.push(startNode)
      sub.nodes.push(endNode)
      return sub
    }
  }

  public removeSubgraph(subgraphId: string) {
    this.subgraphs.delete(subgraphId)
  }

  public resetToRoot() {
    this.graphStack = [this.root]
    this.activeGraph = this.root
  }

  public findNode(id: string) {
    return this.activeGraph.nodes.find(node => node.id === id)
  }

  public findLink(id: string) {
    return this.activeGraph.links.find(link => link.id === id)
  }

  public getNodes() {
    return this.activeGraph.nodes
  }

  public getLinks() {
    return this.activeGraph.links
  }

  public addNodes(nodes: NodeInstanceType[]) {
    if (this.isSettingGraph) return
    if (nodes.length === 0) return
    if (!this.graph) return
    this.activeGraph.nodes.push(...nodes)
    for (const node of nodes) {
      if (node.definition.type === 'subgraph') {
        this.handleSubgraphNode(node)
      }
    }
    this.raiseChanged(ChangedEventType.Insert, 'nodes', nodes, null, nodes)
  }

  public removeNodes(nodes: NodeInstanceType[]) {
    if (this.isSettingGraph) return
    if (nodes.length === 0) return
    if (!this.graph) return
    const doRemoveLinks: LinkInstanceType[] = []
    const links = this.getLinks()
    const removeSubgraphIds: string[] = []
    nodes.forEach(node => {
      links.forEach(link => {
        if (link.source.id === node.id || link.target.id === node.id) {
          doRemoveLinks.push(link)
        }
      })
      if (node.subgraphId && this.hasSubgraph(node.subgraphId)) {
        removeSubgraphIds.push(node.subgraphId)
      }
    })
    const allNodes = this.getAllNodes()
    const remainingNodes = allNodes.filter(n => !nodes.includes(n))

    if (removeSubgraphIds.length > 0) {
      for (const remainingNode of remainingNodes) {
        if (remainingNode.subgraphId && removeSubgraphIds.includes(remainingNode.subgraphId)) {
          const index = removeSubgraphIds.indexOf(remainingNode.subgraphId)
          if (index > -1) {
            removeSubgraphIds.splice(index, 1)
          }
        }
      }
      removeSubgraphIds.forEach((id) => this.removeSubgraph(id))
    }
    this.activeGraph.nodes = this.activeGraph.nodes.filter(n => !nodes.includes(n))
    if (!this.graph) return
    this.graph.startTransaction()
    if (doRemoveLinks.length > 0) {
      this.graph.removeLinks(doRemoveLinks)
    }
    this.graph.commitTransaction()
    this.raiseChanged(ChangedEventType.Delete, 'nodes', nodes, nodes, null)
  }

  public addLinks(links: LinkInstanceType[]) {
    if (this.isSettingGraph) return
    if (links.length === 0) return
    if (!this.graph) return
    this.activeGraph.links.push(...links)
    this.raiseChanged(ChangedEventType.Insert, 'links', links, null, links)
  }
  
  public removeLinks(links: LinkInstanceType[]) {
    if (this.isSettingGraph) return
    if (links.length === 0) return
    if (!this.graph) return
    this.activeGraph.links = this.activeGraph.links.filter(l => !links.includes(l))
    this.raiseChanged(ChangedEventType.Delete, 'links', links, links, null)
  }

  getAllNodes() {
    const allNodes: NodeInstanceType[] = []
    allNodes.push(...this.root.nodes)
    for (const subgraph of this.subgraphs.values()) {
      allNodes.push(...subgraph.nodes)
    }
    return allNodes
  }

  getAllLinks() {
    const allLinks: LinkInstanceType[] = []
    allLinks.push(...this.root.links)
    for (const subgraph of this.subgraphs.values()) {
      allLinks.push(...subgraph.links)
    }
    return allLinks
  }

  public clear() {
    if (this.isSettingGraph) return
    if (this.activeGraph.id !== this.root.id) this.activeGraph = this.root
    this.root.nodes = []
    this.root.links = []
    this.subgraphs.clear()
  }

  public toJSON() {
    return Util.toJSON(this)
  }

  public static fromJSON(graph: Graph, json: JsonGraph | string): BlueprintModel {
    const model = new BlueprintModel()
    if (typeof json === 'string') {
      json = JSON.parse(json)
    }
    const { subgraphs, nodes, links, variables, viewport } = Util.fromJSON(graph as Graph, json)
    model.root.nodes = nodes
    model.root.links = links
    model.root.viewport = { x: viewport.x, y: viewport.y, scale: viewport.zoom }
    for (const variable of variables) {
      model.variableManager.setVariable({
        name: variable.name,
        type: variable.type,
        value: variable.value
      } as VariableDef)
    }
    for (const subgraphId in subgraphs) {
      const subgraphData = subgraphs[subgraphId]
      const subgraphModel = new GraphModel(subgraphId, subgraphData.nodes, subgraphData.links)
      subgraphModel.viewport = { x: subgraphData.viewport.x, y: subgraphData.viewport.y, scale: subgraphData.viewport.zoom }
      model.subgraphs.set(subgraphId, subgraphModel)
    }
    return model
  }

  public raiseChanged(change: ChangedEventType, propertyName: string, object: unknown, oldValue: unknown, newValue: unknown) {
    if (!this.graph) return
    this.graph.raiseChangedEvent(change, propertyName, object, oldValue, newValue)
  }

  private generateSubgraphId(): string {
    const id = 'sg_' + Math.random().toString(36).slice(2, 11)
    if (this.subgraphs.has(id)) {
      return this.generateSubgraphId()
    }
    return id
  }

  private handleSubgraphNode(node: NodeInstanceType) {
    node.subgraphId = node.subgraphId || this.generateSubgraphId()
    const subgraphId = node.subgraphId
    if (!this.hasSubgraph(subgraphId)) {
      this.createSubgraph(subgraphId)
    }
  }
}
