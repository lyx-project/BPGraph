import { NodeInstanceType, PortPrototype, Runtime } from './Runtime'
import { NodeClassType, NodeOptions } from '../Node'
import { JsonGraph, JsonLink } from '../utils/serializer'
import { EventEmitter } from '../utils/EventEmitter'

type GraphNode = {
  node: NodeInstanceType
  port: { name: string; type: string; id: string }
  prev: string[]
  next: string[]
  dataInputs: { 
    [key: string]: string
  }
  value?: unknown
}

export interface ProcessOptions {
  /**
   * Optional context object to be passed to each node during execution.
   */
  ctx?: unknown
}

type EngineEventPayloads = {
  [eventName: string]: [...args: unknown[]]
}

export class Engine<NodeDefs extends Record<string, NodeClassType>> extends EventEmitter<EngineEventPayloads> {

  private portConnectionValueMap = new Map<string, { node: NodeInstanceType; outputName: string }>()

  private errorNodes = new Set<string>()

  private entryPorts = new Set<string>()
  private subEntryPort = new Map<string, string>()
  private flowStackGraph = new Map<string, GraphNode>()
  private waitingGraph = new Map<string, GraphNode>()
  private readyGraph = new Map<string, GraphNode>()
  private subFlowStackGraph = new Map<string, Map<string, GraphNode>>()
  private subWaitingGraph = new Map<string, Map<string, GraphNode>>()
  private subReadyGraph = new Map<string, Map<string, GraphNode>>()

  public runtime: Runtime<NodeDefs>
  public options: ProcessOptions

  constructor(runtime: Runtime<NodeDefs>, options?: ProcessOptions) {
    super()
    this.runtime = runtime
    this.options = options || {
      ctx: {}
    }
  }

  /**
   * Executes a node in the graph.
   * @param node The node instance to execute.
   * @param ctx The execution context.
   */
  public async executeNode(node: NodeInstanceType, opt?: { ctx?: unknown; error?: unknown }) {
    const ctx = this.buildExecContext(node, opt)
    this.runtime.executeNode(node, ctx)
    return this
  }

  /**
   * Runs a node in the graph.
   * @param args The arguments to pass to the node.
   */
  public async runNode<K extends keyof NodeDefs>(
    nodeType: K | NodeDefs[K],
    options?: NodeOptions<NodeDefs[K]>,
    opt?: { ctx?: unknown; error?: unknown }
  ) {
    const instance = this.createNodeInstance(nodeType, options) as NodeInstanceType
    return this.executeNode(instance, opt)
  }

  /**
   * Creates a new node instance. {@link Runtime.createNodeInstance}
   * @param args The arguments to pass to createNodeInstance.
   * @returns The created node instance.
   */
  createNodeInstance(...args: Parameters<Runtime<NodeDefs>['createNodeInstance']>) {
    return this.runtime.createNodeInstance(...args)
  }

  /**
   * Processes a JSON graph.
   * @param json The JSON representation of the graph.
   */
  public fromJSON(json: JsonGraph | string) {
    this.portConnectionValueMap.clear()
    this.errorNodes.clear()
    if (typeof json === 'string') {
      json = JSON.parse(json) as JsonGraph
    }
    
    this.flowStackGraph.clear()
    this.waitingGraph.clear()
    this.readyGraph.clear()
    this.subFlowStackGraph.clear()
    this.subWaitingGraph.clear()
    this.subReadyGraph.clear()

    const { nodes, links, subgraphs } = this.runtime.fromJSON(json)

    const startNodes = this.findStartNodes(nodes)

    const subgraphIds = new Set<string>()
    for (const startNode of startNodes) {
      const { subgraphIds: generateSubgraphIds } = this.generateDependencies(startNode, nodes, links, this.flowStackGraph)
      generateSubgraphIds.forEach(id => subgraphIds.has(id) || subgraphIds.add(id))
      this.entryPorts.add(startNode.id + ':' + (startNode.outputs.find(o => o.type === 'exec')?.id || ''))
    }

    do {
        const subgraphId = subgraphIds.values().next().value!
        subgraphIds.delete(subgraphId)
        if (this.subFlowStackGraph.has(subgraphId)) continue
        const subgraph = subgraphs[subgraphId]
        if (!subgraph) continue
        this.subWaitingGraph.set(subgraphId, new Map())
        this.subReadyGraph.set(subgraphId, new Map())
        this.subWaitingGraph.set(subgraphId, new Map())
        const { nodes: subNodes, links: subLinks } = subgraph
        const subStartNode = this.findStartNodes(subNodes)[0]!
        this.subEntryPort.set(subgraphId, subStartNode.id + ':' + (subStartNode.outputs.find(o => o.type === 'exec')?.id || ''))
        const subFlowMap = new Map<string, GraphNode>()
        const { subgraphIds: generateSubgraphIds } = this.generateDependencies(subStartNode, subNodes, subLinks, subFlowMap)
        generateSubgraphIds.forEach(id => subgraphIds.has(id) || subgraphIds.add(id))
        this.subFlowStackGraph.set(subgraphId, subFlowMap)
    } while (subgraphIds.size > 0)
  }

  /**
   * Processes the input data through the graph.
   * @param input The input data to process through the graph.
   */
  public process(input: unknown) {
    this.waitingGraph.clear()
    this.readyGraph.clear()
    this.subWaitingGraph.forEach((_, key) => this.subWaitingGraph.set(key, new Map()))
    this.subReadyGraph.forEach((_, key) => this.subReadyGraph.set(key, new Map()))
    const ready = this.readyGraph
    for (const entryPort of this.entryPorts) {
      const entryPortGraphNode = this.flowStackGraph.get(entryPort)
      if (!entryPortGraphNode) continue
      const startNode = entryPortGraphNode.node
      if (startNode.outputs.length > 1) {
        startNode.setOutput(startNode.outputs[1].name, input)
      }
      ready.set(startNode.id, entryPortGraphNode)
      this.executeEntry(entryPort, undefined, input)
    }
  }

  public async executeSubgraph(graphNode: GraphNode, ready: Map<string, GraphNode>, error?: unknown) {
    const { node, dataInputs } = graphNode
    const subgraphId = node.subgraphId!
    const subEntryPort = this.subEntryPort.get(subgraphId)!
    const graph = this.subFlowStackGraph.get(subgraphId)!
    if (graph.has(subEntryPort)) {
      const subStartNodeGraph = graph.get(subEntryPort)!
      if (dataInputs) {
        for (const depPort of Object.values(dataInputs)) {
          const depNodeId = depPort.split(':')[0]
          const depNode = ready.get(depNodeId)?.node
          if (depNode) {
            const outputId = depPort.split(':')[1]
            const outputName = depNode.outputs.find(o => o.id === outputId)?.name || ''
            const subOutputName = subStartNodeGraph.node.outputs.find(o => o.type !== 'exec')?.name || ''
            if (depNode.getOutput(outputName) && subOutputName) {
              subStartNodeGraph.node.setOutput(subOutputName, depNode.getOutput(outputName))
            }
          }
        }
      }
      this.subReadyGraph.get(subgraphId)!.set(subStartNodeGraph.node.id, subStartNodeGraph)
      await this.executeEntry(subEntryPort, subgraphId, error)
      for (const outPort of graph.values()) {
        if (outPort.node.id === node.id && outPort.port.id.startsWith("out-")) {
          for (const next of outPort.next) {
            await this.executeEntry(next, subgraphId, error)
          }
        }
      }
    }
    const execPort = node.outputs.find(o => o.type === 'exec')
    if (!execPort) return
    const execPortId = node.id + ':' + execPort.id
    this.executeEntry(execPortId, '', error)
  }

  public async executeEntry(portId: string, subgraphId = '', error?: unknown) {
    const graph = subgraphId ? this.subFlowStackGraph.get(subgraphId)! : this.flowStackGraph
    const waiting = subgraphId ? this.subWaitingGraph.get(subgraphId)! : this.waitingGraph
    const ready = subgraphId ? this.subReadyGraph.get(subgraphId)! : this.readyGraph
    const graphNode = graph.get(portId)
    if (!graphNode) return

    const { node, port, dataInputs } = graphNode

    if (port.id.startsWith('in-')) {
      if (node.type === 'subgraph' && node.subgraphId) {
        await this.executeSubgraph(graphNode, ready, error)
        return
      } else if (node.type === 'end') {
        if (subgraphId) {
          const parentNode = this.getNodeBySubgraphId(subgraphId)
          for (const outPort of graph.values()) {
            if (outPort.node.id === parentNode.id && outPort.port.id.startsWith("out-")) {
              for (const next of outPort.next) {
                await this.executeEntry(next, '', error)
              }
            }
          }
        }
        return
      }

      // Checking input data dependencies
      if (dataInputs) {
        for (const depPort of Object.values(dataInputs)) {
          const depNodeId = depPort.split(':')[0]
          if (!ready.has(depNodeId)) {
            waiting.set(portId, graphNode)
            return
          }
        }
      }

      const next = async (nextExecs?: Array<string>) => {
        ready.set(node.id, graphNode)
        waiting.delete(portId)
        if (nextExecs && nextExecs.length > 0) {
          const execPorts = node.outputs.filter(o => o.type === 'exec' && nextExecs.includes(o.name))
          const tasks = execPorts.map(outPort => {
            const portId = node.id + ':' + outPort.id
            return this.executeEntry(portId, subgraphId, error)
          })
          await Promise.all(tasks)
        } else {
            const execPorts = node.outputs.filter(o => o.type === 'exec')
            const tasks = execPorts.map(outPort => {
              const portId = node.id + ':' + outPort.id
              return this.executeEntry(portId, subgraphId, error)
            })
            await Promise.all(tasks)
        }
      }
      
      try {
        this.prepareInputs(graphNode, ready)
        const opt = {
          ctx: this.options.ctx || {},
          error: error,
          next: next
        }
        const ctx = this.buildExecContext(node, opt)
        ctx.next = next
        await this.runtime.executeNode(node, ctx)
        ctx.next = () => {}
      } catch (err) {
        error = err as unknown as undefined
        console.error(`Node ${portId} execution failed`, err)
        this.errorNodes.add(node.id)
      }
    } else if (port.id.startsWith("out-")) {
      const tasks = graphNode.next.map(next => {
        return this.executeEntry(next, subgraphId, error)
      })
      await Promise.all(tasks)
    }
  }

  public setOptions(options: ProcessOptions) {
    this.options = options || {}
  }

  public setCtx(ctx: unknown) {
    this.options.ctx = ctx
  }

  private getNodeBySubgraphId(subgraphId: string) {
    for (const graphNode of this.flowStackGraph.values()) {
      if (graphNode.node.type === 'subgraph' && graphNode.node.subgraphId === subgraphId) {
        return graphNode.node
      }
    }
    throw new Error(`Cannot find subgraph node for subgraphId: ${subgraphId}`)
  }

  private generateDependencies(start: NodeInstanceType, nodes: NodeInstanceType[], links: JsonLink[], flowMap: Map<string, GraphNode>) {
    flowMap = flowMap || new Map()
    const nodePortsMap = new Map<string, { node: NodeInstanceType; port: PortPrototype,
      nexts: {
        node: NodeInstanceType; port: PortPrototype
      }[]
      prevs: {
        node: NodeInstanceType; port: PortPrototype
      }[]
    }>()

    for (const node of nodes) {
      for (const input of node.inputs) {
        nodePortsMap.set(node.id + ':' + input.id, { node, port: input, nexts: [], prevs: [] })
      }
      for (const output of node.outputs) {
        nodePortsMap.set(node.id + ':' + output.id, { node, port: output, nexts: [], prevs: [] })
      }
    }

    for (const link of links) {
      const source = link.source.port.startsWith('out-') ? link.source : link.target
      const target = link.source.port.startsWith('out-') ? link.target : link.source
      const sourceItem = nodePortsMap.get(source.id + ':' + source.port)!
      const targetItem = nodePortsMap.get(target.id + ':' + target.port)!
      sourceItem.nexts.push({ node: targetItem.node, port: targetItem.port })
      targetItem.prevs.push({ node: sourceItem.node, port: sourceItem.port })
    }
    const subgraphIds = new Set<string>()
    const dfs = (node: NodeInstanceType) => {
      node.inputs.forEach(input => {
        if (input.type === 'exec') return
        const key = node.id + ':' + input.id
        const item = nodePortsMap.get(key)!
        if (item.prevs.length > 0) {
          item.prevs.forEach(n => {
            this.generateDataDependencies(n.node, node, n.port, input, flowMap)
          })
        }
      })

      const nextNodes = new Set<NodeInstanceType>()
      node.outputs.forEach(output => {
        if (output.type !== 'exec') return
        const key = node.id + ':' + output.id
        const item = nodePortsMap.get(key)!
        if (item.nexts.length > 0) {
          item.nexts.forEach(n => {
            this.generateFlowStackGraph(node, n.node, output, n.port, flowMap)
            if (n.node.type === 'subgraph' && n.node.subgraphId) {
              subgraphIds.add(n.node.subgraphId)
            }
            if (!nextNodes.has(n.node)) {
              nextNodes.add(n.node)
            }
          })
        }
      })
      for (const nextNode of nextNodes) {
        dfs(nextNode)
      }
    }
    dfs(start)
    return { flowMap, subgraphIds }
  }

  public emit(...args: Parameters<EventEmitter<EngineEventPayloads>['emit']>) {
    super.emit(...args)
    this.handleNodeEvents(...args)
    return this
  }

  public handleNodeEvents(...args: unknown[]) {
    const eventName = args[0] as string
    const payloads = args.slice(1)
    this.runtime.nodeListeners.forEach(async (node, nodeId) => {
      const subgraphId = node.subgraphId
      const onEvent = node.onEvent
      if (onEvent) {
        const graph = subgraphId ? this.subFlowStackGraph.get(subgraphId) : this.flowStackGraph
        if (!graph) return
        const ctx = this.buildExecContext(node, {
          error: node.error,
          ctx: this.options.ctx || {},
        })
        const resposes = onEvent(eventName, ...payloads, ctx)
        if (resposes && resposes.trigger) {
          const tasks = []
          for (const inPort of graph.values()) {
            if (inPort.node.id === nodeId && inPort.port.id.startsWith("in-")) {
              const prev = inPort.prev
              const portId = inPort.node.id + ':' + inPort.port.id
              for (const prevId of prev) {
                const prevPort = graph.get(prevId)!
                const error = prevPort.node.error
                tasks.push(this.executeEntry(portId, subgraphId, error))
              }
            }
          }
          await Promise.all(tasks)
        }
      }
    })
  }

  /** Builds the execution context for a node. */
  private buildExecContext(node: NodeInstanceType, opt: { ctx?: unknown; error?: unknown } = {}): ExecContext {
    const weakRef = new WeakRef(node)
    const inputs = node.inputs.filter(i => i.type !== 'exec' && i.type !== 'spacer')
    const outputs = node.outputs.filter(o => o.type !== 'exec' && o.type !== 'spacer')
    return {
      getInput: <T = unknown>(name: string) => {
        const node = weakRef.deref()
        if (!node) throw new Error('Node instance has been garbage collected.')
        return node.getInput(name) as T
      },
      setOutput: (name: string, value: unknown) => {
        const node = weakRef.deref()
        if (!node) throw new Error('Node instance has been garbage collected.')
        node.setOutput(name, value)
      },
      services: {
        get: (serviceName: string) => this.runtime.getService(serviceName)
      },
      emitEvent: (eventName: string, ...args: unknown[]) => {
        this.emit(eventName, ...args)
      },
      next: () => {},
      data: node.data,
      ctx: opt.ctx,
      error: opt.error,
      inputs,
      outputs
    }
  }

  private prepareInputs(graphNode: GraphNode, ready: Map<string, GraphNode>) {
    const { dataInputs, node } = graphNode
    if (dataInputs) {
      for (const [inputKey, depPort] of Object.entries(dataInputs)) {
        const depNodeId = depPort.split(':')[0]
        const depNode = ready.get(depNodeId)?.node
        if (depNode) {
          const inputId = inputKey
          const inputName = node.inputs.find(i => i.id === inputId)?.name || ''
          const outputId = depPort.split(':')[1]
          const outputName = depNode.outputs.find(o => o.id === outputId)?.name || ''
          if (depNode.getOutput(outputName)) node.setInput(inputName, depNode.getOutput(outputName))
        }
      }
    }
  }

  private generateFlowStackGraph(
    source: NodeInstanceType,
    target: NodeInstanceType,
    sourcePort: PortPrototype,
    targetPort: PortPrototype,
    flowMap: Map<string, GraphNode> = new Map())
  {
    const sourceKey = source.id + ':' + sourcePort.id
    const targetKey = target.id + ':' + targetPort.id
    if (!flowMap.has(sourceKey)) {
      flowMap.set(sourceKey, {
        node: source,
        port: { name: sourcePort.name, type: sourcePort.type, id: sourcePort.id || '' },
        next: [targetKey],
        prev: [],
        dataInputs: {},
      })
    } else {
      const sourceFlowItem = flowMap.get(sourceKey)!
      sourceFlowItem.next.push(targetKey)
    }
    if (!flowMap.has(targetKey)) {
      flowMap.set(targetKey, {
        node: target,
        port: { name: targetPort.name, type: targetPort.type, id: targetPort.id || '' },
        prev: [sourceKey],
        next: [],
        dataInputs: {},
      })
    } else {
      const targetFlowItem = flowMap.get(targetKey)!
      targetFlowItem.prev.push(sourceKey)
    }
  }

  private generateDataDependencies(
    source: NodeInstanceType,
    target: NodeInstanceType,
    sourcePort: PortPrototype,
    targetPort: PortPrototype,
    flowMap: Map<string, GraphNode> = new Map())
  {
    const sourceKey = source.id + ':' + sourcePort.id
    const targetPorts = target.inputs.filter(i => i.type === 'exec').map(i => i.id)
    for (const port of targetPorts) {
      const key = target.id + ':' + port
      const item = flowMap.get(key)
      if (item) {
        item.dataInputs[targetPort.id] = sourceKey
      }
    }
  }

  public findStartNodes(nodes: NodeInstanceType[]) {
    return nodes.filter(node => {
      return node.type === 'start'
    })
  }
}

export type ExecContext = {
  getInput: <T = unknown>(name: string) => T | undefined
  setOutput: (name: string, value: unknown) => void
  emitEvent: (eventName: string, ...args: unknown[]) => void
  next: (nextExecs?: Array<string>) => void
  data?: unknown
  services: { get: (name: string) => unknown }
  ctx?: unknown
  error?: unknown
  inputs: PortPrototype[]
  outputs: PortPrototype[]
}
