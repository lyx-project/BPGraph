/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NodeClassType, NodeOptions } from '../Node'
import { NodeRegistry } from '../NodeRegistry'
import type { JsonGraph } from '../utils/serializer'
import { type VariableDef, VariableManager } from '../VariableManager'
import type { ExecContext } from './Engine'

export type ExecutorFn = (ctx: ExecContext) => Promise<any> | any
export type EventFn = (eventName: string, ...args: any[]) => { trigger?: boolean } | void

export interface IRuntime {
  /**
   * Registers a new executor function for a specific node type.
   * @param type The type of the node.
   * @param executor The executor function to register.
   * @returns The current Runtime instance.
   */
  registerExecutor: (type: string, executor: ExecutorFn) => IRuntime

  /**
   * Registers a new service.
   * @param name The name of the service.
   * @param factory A factory function to create the service instance.
   * @returns The current Runtime instance.
   */
  registerService: (name: string, factory: () => any) => IRuntime

  /**
   * Checks if an executor is registered for a specific node type.
   * @param type The type of the node.
   * @returns True if an executor is registered, false otherwise.
   */
  hasExecutor: (type: string) => boolean

  /**
   * Checks if a service is registered.
   * @param name The name of the service.
   * @returns True if the service is registered, false otherwise.
   */
  hasService: (name: string) => boolean

  /**
   * Retrieves the executor function for a specific node type.
   * @param type The type of the node.
   * @returns The executor function, or undefined if not found.
   */
  getExecutor: (type: string) => ExecutorFn | undefined

  /**
   * Retrieves a registered service.
   * @param name The name of the service.
   * @returns The service instance, or undefined if not found.
   */
  getService: (name: string) => any
}

export class Runtime<NodeDefs extends Record<string, NodeClassType>> implements IRuntime {
  public executors = new Map<string, ExecutorFn>()
  public services = new Map<string, any>()
  public variableManager = new VariableManager()
  static NodeInstance: typeof NodeInstance
  public nodeRegistry: NodeRegistry<NodeDefs>
  public nodeListeners = new Map<string, NodeInstanceType>()

  constructor(nodeRegistry: NodeRegistry<NodeDefs>) {
    this.nodeRegistry = nodeRegistry
  }

  /** @inheritdoc {@link IRuntime.getService} */
  public registerExecutor(type: string, executor: ExecutorFn) {
    this.executors.set(type, executor)
    return this
  }

  /** @inheritdoc {@link IRuntime.registerService} */
  public registerService(name: string, factory: () => any) {
    let instance = factory()
    if (typeof instance === 'object' && instance !== null) {
      instance = new WeakRef(instance)
    }
    this.services.set(name, instance)
    return this
  }

  /** @inheritdoc {@link IRuntime.hasExecutor} */
  hasExecutor(type: string): boolean {
    return this.executors.has(type)
  }

  /** @inheritdoc {@link IRuntime.getExecutor} */
  getExecutor(type: string) {
    if (!this.hasExecutor(type)) return undefined
    return this.executors.get(type)
  }

  /** @inheritdoc {@link IRuntime.hasService} */
  hasService(name: string): boolean {
    return this.services.has(name)
  }

  /** @inheritdoc {@link IRuntime.getService} */
  getService(name: string) {
    if (!this.hasService(name)) {
      throw new Error(`No service registered with name "${name}".`)
    }
    const ref = this.services.get(name)
    if (ref instanceof WeakRef) {
      const deref = ref.deref()
      if (deref === undefined) {
        this.services.delete(name)
        throw new Error(`Service "${name}" has been garbage collected.`)
      }
      return deref
    }
  }

  /** Creates a new instance of a node. */
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

    const nodeInstance = new Runtime.NodeInstance(NodeClass, options)

    if (NodeClass.onEvent) {
      nodeInstance.onEvent = NodeClass.onEvent
      nodeInstance.id = nodeInstance.id ?? `node_${Math.random().toString(36).slice(2, 11)}`
      this.nodeListeners.set(nodeInstance.id, nodeInstance)
    }
    return nodeInstance
  }

  /**
   * Executes a node in the graph.
   * @param node The node instance to execute.
   * @param ctx The execution context.
   */
  public async executeNode(node: NodeInstanceType, ctx: ExecContext): Promise<any> {
    const executor = this.getExecutorForNode(node)
    if (!executor) throw new Error(`No executor for ${node.nodeType}`)
    try {
      await executor(ctx)
      node.error = undefined
    } catch (err) {
      node.error = err
      throw err
    }
    return this
  }

  /**
   * Checks if there is an executor available for the given node.
   * @param node The node instance to check.
   * @returns True if an executor is available, false otherwise.
   */
  public hasExecutorForNode(node: NodeInstanceType): boolean {
    if (typeof node.executor === 'function') return true
    return this.hasExecutor(node.executor ?? '') || this.hasExecutor(node.nodeType)
  }

  /**
   * Gets the executor function for a specific node.
   * @param node The node instance to get the executor for.
   * @returns The executor function, or undefined if not found.
   */
  public getExecutorForNode(node: NodeInstanceType): ExecutorFn | undefined {
    if (typeof node.executor === 'function') return node.executor
    return this.getExecutor(node.executor ?? '') ?? this.getExecutor(node.nodeType)
  }

  public fromJSON(json: JsonGraph | string) {
    if (typeof json === 'string') {
      json = JSON.parse(json) as JsonGraph
    }
    const nodes = this.deserializeNodes(json.nodes)
    const links = json.links
    const variables = json.variables
    const jsonSubgraphs = json.subgraphs || []

    const subgraphs: Record<string, { nodes: NodeInstanceType[]; links: JsonGraph['links'] }> = {}

    for (const [subgraphId, subgraph] of Object.entries(jsonSubgraphs)) {
      const subgraphNodes = this.deserializeNodes(subgraph.nodes, subgraphId)
      const subgraphLinks = subgraph.links
      subgraphs[subgraphId] = { nodes: subgraphNodes, links: subgraphLinks }
    }

    this.variableManager.clear()
    for (const variable of variables) {
      this.variableManager.setVariable({
        name: variable.name,
        type: variable.type,
        value: variable.value
      } as VariableDef)
    }
    return { nodes, links, subgraphs }
  }

  private deserializeNodes(jsonNodes: JsonGraph['nodes'], subgraphId?: string): NodeInstanceType[] {
    const nodes: NodeInstanceType[] = []
    for (const jsonNode of jsonNodes) {
      const node = this.createNodeInstance(jsonNode.nodeType as unknown as never, {
        id: jsonNode.id,
        data: jsonNode.data,
        values: jsonNode.values as any,
        subgraphId: jsonNode.subgraphId ?? subgraphId,
        inputs: jsonNode.inputs.some(input => input.type) ? jsonNode.inputs.map(i => ({
          type: i.type as keyof typeof i.type,
          name: i.name,
          id: i.id
        })) : undefined,
        outputs: jsonNode.outputs.some(output => output.type) ? jsonNode.outputs.map(o => ({
          type: o.type as keyof typeof o.type,
          name: o.name,
          id: o.id
        })) : undefined,
      }) as NodeInstanceType

      if (!jsonNode.inputs.some(input => input.type)) {
        for (const jsonInput of jsonNode.inputs) {
          const input = node.inputs.find(i => i.name === jsonInput.name)
          if (!input) continue
          input.id = jsonInput.id
        }
      }

      if (!jsonNode.outputs.some(output => output.type)) {
        for (const jsonOutput of jsonNode.outputs) {
          const output = node.outputs.find(i => i.name === jsonOutput.name)
          if (!output) continue
          output.id = jsonOutput.id
        }
      }
      nodes.push(node)
    }
    return nodes
  }
}

export type PortPrototype = { name: string; id: string; type: string }

class NodeInstance<T extends NodeClassType, Port extends PortPrototype = PortPrototype> {
  declare public type: string
  declare public nodeType: string
  declare public onEvent?: EventFn
  public executor?: T['executor'] | string
  public data?: unknown
  public inputValues: Record<string, unknown> = {}
  public outputValues: Record<string, unknown> = {}
  public inputs: Port[] = []
  public outputs: Port[] = []
  public id: string = ''
  public error: unknown = undefined
  public subgraphId?: string

  constructor(NodeClass: T, options?: NodeOptions<T>) {
    this.executor = NodeClass.executor

    const type = NodeClass.definition.type || 'default'
    const nodeType = NodeClass.type

    const typeDesc = Object.getOwnPropertyDescriptor(this, 'type')
    if (!typeDesc || typeDesc.configurable) {
      Object.defineProperty(this, 'type', {
        get() {
          return type
        },
        configurable: false,
        enumerable: true
      })
    }

    const nodeTypeDesc = Object.getOwnPropertyDescriptor(this, 'nodeType')
    if (!nodeTypeDesc || nodeTypeDesc.configurable) {
        Object.defineProperty(this, 'nodeType', {
        get() {
          return nodeType
        },
        configurable: false,
        enumerable: true
      })
    }
    
    this.inputs = options?.inputs as Port[] ?? structuredClone(NodeClass.definition.inputs.map(input => ({
      id: input.id || '',
      name: input.name,
      type: input.type
    }))) as Port[]
    this.outputs =  options?.outputs as Port[] ?? structuredClone(NodeClass.definition.outputs.map(output => ({
      id: output.id || '',
      name: output.name,
      type: output.type
    }))) as Port[]
    if (options?.data) this.data = options.data
    if (options?.values) this.inputValues = { ...options.values }
    if (options?.id) this.id = options.id
    if (options?.subgraphId) this.subgraphId = options.subgraphId
  }

  getInput(name: string) {
    if (!this.inputs.find(input => input.name === name)) {
      throw new Error(`Input "${name}" not found in node "${this.nodeType}".`)
    }
    return this.inputValues[name]
  }

  getOutput(name: string) {
    if (!this.outputs.find(output => output.name === name)) {
      throw new Error(`Output "${name}" not found in node "${this.nodeType}".`)
    }
    return this.outputValues[name]
  }

  setInput(name: string, value: unknown) {
    const input = this.inputs.find(input => input.name === name)
    if (!input) {
      throw new Error(`Input "${name}" not found in node "${this.nodeType}".`)
    }
    checkInputOrOutputType(input.type, value, `${this.nodeType}.${name}`, true)
    this.inputValues[name] = value
  }

  setOutput(name: string, value: unknown) {
    const output = this.outputs.find(output => output.name === name)
    if (!output) {
      throw new Error(`Output "${name}" not found in node "${this.nodeType}".`)
    }
    checkInputOrOutputType(output.type, value, `${this.nodeType}.${name}`, false)
    this.outputValues[name] = value
  }
}

Runtime.NodeInstance = NodeInstance

function checkInputOrOutputType(type: string, value: unknown, name: string, isInput: boolean) {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        throw new TypeError(`${isInput ? 'Input' : 'Output'} "${name}" expects a string value.`)
      }
      break
    case 'number':
      if (typeof value !== 'number') {
        throw new TypeError(`${isInput ? 'Input' : 'Output'} "${name}" expects a number value.`)
      }
      break
    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new TypeError(`${isInput ? 'Input' : 'Output'} "${name}" expects a boolean value.`)
      }
      break
    case 'array':
      if (!Array.isArray(value)) {
        throw new TypeError(`${isInput ? 'Input' : 'Output'} "${name}" expects an array value.`)
      }
      break
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value) || value === null) {
        throw new TypeError(`${isInput ? 'Input' : 'Output'} "${name}" expects an object value.`)
      }
      break
    case 'any':
      // Accept any type
      break
    default:
      throw new TypeError(`Unknown ${isInput ? 'input' : 'output'} type for "${name}".`)
  }
}

export type NodeInstanceType = InstanceType<typeof Runtime.NodeInstance>
