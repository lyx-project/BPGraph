import { type ExecutorFn, EventFn } from './engine/Runtime'
import { type Graph } from './Graph'
import { mergeDeep } from './utils'
import { ChangedEvent } from './ChangedEvent'
import { NodeToolsView } from './NodeToolsView'
import type { NodeStyle } from './NodeRegistry'

interface Port {
  name: string
  label?: string
  id?: string
  showPort?: boolean
}

export interface InputPort extends Port {
  type: keyof TypeMap
  showInput?: boolean
  options?: ((values: Record<string, unknown>) => { label: string; value: string }[] | Promise<{ label: string; value: string }[]>) | (readonly { label: string; value: string }[])
  _options?: readonly { label: string; value: string }[] // resolved options
}

export interface OutputPort extends Port {
  type: 'exec' | 'spacer' | 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any' | 'textarea'
}

type TypeMap = {
  string: string
  number: number
  boolean: boolean
  select: string
  array: unknown[]
  exec: never
  spacer: never
  any: unknown
  textarea: string
  object: Record<string, unknown>
}

export interface ExecutorArgs<T extends NodeClassType> {
  getInput: (name: T['definition']['inputs'][number]['name']) => unknown
  setOutput: (name: T['definition']['outputs'][number]['name'], value: unknown) => void
  next: () => void
  services: Record<string, unknown>
}

export type NodeClassType = typeof Node

export type InputsToValues<T extends { inputs: readonly { name: string; type: keyof TypeMap }[] }> =
  T['inputs'] extends readonly unknown[]
    ? { [K in T['inputs'][number] as K['name']]: TypeMap[K['type']] }
    : {}

export type NodeOptions<T extends NodeClassType> = {
  id?: string
  title?: string
  position?: { x: number; y: number }
  data?: unknown
  values?: Partial<InputsToValues<T['definition']>>
  style?: NodeStyle
  inputs?: InputPort[]
  outputs?: OutputPort[]
  subgraphId?: string // only for subgraph node
}

export abstract class Node {

  static definition: {
    inputs: readonly InputPort[]
    outputs: readonly OutputPort[]
    title?: string
    style?: NodeStyle
    type?: string // 'default' | 'subgraph'
  } = {
    inputs: [] as const,
    outputs: [] as const,
    title: '',
    style: {}
  } as const

  declare static id: string

  declare static executor?: ExecutorFn | string

  declare static readonly type: string

  declare static onEvent?: EventFn
}

export class NodeInstance<T extends NodeClassType> {
  declare public type: string
  declare public nodeType: string
  public _values: InputsToValues<T['definition']> = {} as InputsToValues<T['definition']>
  public definition: T['definition']
  public id: string = ''
  public data: unknown = null
  public subgraphId?: string // only for subgraph node
  _bbox: { x: number; y: number; width: number; height: number; left: number; top: number } | null = null
  public states: {
    position: { x: number, y: number }
    title?: string
    style?: NodeStyle
    inputs?: T['definition']['inputs']
    outputs?: T['definition']['outputs']
  } = {
    position: { x: 0, y: 0 },
  }
  public graph?: Graph
  public toolsView: NodeToolsView | null = null

  constructor(Cls: T, options?: NodeOptions<T>) {
    const { inputs, ...definition } = Cls.definition
    
    this.definition = { ...structuredClone(definition), inputs: inputs.map(input => {
      return { ...input }
    }) }

    this.states.position = options?.position ?? { x: 0, y: 0 }
    this.data = options?.data ?? null
    
    const type = this.definition.type || 'default'
    const nodeType = Cls.type

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

    if (options?.values) this._values = { ...options.values } as InputsToValues<T['definition']>
    if (options?.data) this.data = options.data
    if (options?.title) this.states.title = options.title
    if (options?.id) this.id = options.id
    if (options?.style) this.style = options.style
    if (options?.subgraphId) this.subgraphId = options.subgraphId
    if (options?.position) this.states.position = options.position

    if (options?.inputs) {
      this.states.inputs = options.inputs.map(input => {
        const obj: InputPort = {
          id: input.id,
          name: input.name,
          type: input.type,
        }
        if (input.label !== undefined) obj.label = input.label
        if (input.showInput !== undefined) obj.showInput = input.showInput
        if (input.showPort !== undefined) obj.showPort = input.showPort
        if (input.options) {
          obj.options = input.options ? input.options : undefined
          obj._options = Array.isArray(input.options) ? input.options : undefined
        }
        return obj 
      })
    }
    if (options?.outputs) {
      this.states.outputs = options.outputs.map(output => {
        const obj: OutputPort = {
          id: output.id,
          name: output.name,
          type: output.type as OutputPort['type'],
        }
        if (output.label) obj.label = output.label
        if (output.showPort) obj.showPort = output.showPort
        return obj
      })
    }

    this.inputs.forEach(input => {
      if (Array.isArray(input.options)) {
        input._options = input.options
      } else if (typeof input.options === 'function') {
        input._options = []
      }
    })

    if (!this.states.inputs) {
      for (const input of this.inputs) {
        const key = input.name as keyof InputsToValues<T['definition']>
        const val = options?.values?.[key]
        if (input.type === 'select') {
          if (val === undefined) {
            if (Array.isArray(input.options)) {
              const inputOptions = input.options || []
              this._values[key] = (inputOptions.length > 0 ? inputOptions[0].value : '') as
                InputsToValues<T['definition']>[keyof InputsToValues<T['definition']>]
              const oldvalue = { ...this._values }
              const newvalue = { [input.name]: this._values[key] }
              this.raiseChangedEvent('values', oldvalue, newvalue)
            }
          }
        } else if (val !== undefined) {
          this._values[key] = val
        }
      }
    }
  }

  get bbox() {
    return this._bbox
  }

  // Get current position
  get position() {
    return this.states.position
  }
  // Set position and trigger change event
  set position(value: { x: number, y: number }) {
    if (typeof value !== 'object' || value === null || isNaN(value.x) || isNaN(value.y)) {
      throw new Error('Position must be an object with numeric x and y properties.')
    }
    if (this.states.position.x === value.x && this.states.position.y === value.y) {
      return
    }
    const oldvalue = { ...this.states.position }
    this.states.position = value
    const newvalue = { ...this.states.position }
    this.raiseChangedEvent('position', oldvalue, newvalue)
  }

  // Get and set title with change event
  get title() {
    return this.states.title ?? this.definition.title ?? ''
  }
  // Set title and trigger change event
  set title(value: string) {
    const oldvalue = this.states.title
    if (oldvalue === value) return
    this.states.title = value
    this.raiseChangedEvent('title', oldvalue, value)
  }

  // Get and set values with change event
  get values() {
    return this._values
  }
  set values(values: Partial<InputsToValues<T['definition']>>) {
    this.checkValues(values)
    const oldvalue = { ...this._values }
    this._values = { ...this._values, ...values }
    this.raiseChangedEvent('values', oldvalue, values)
  }

  // Get and set inputs with change event
  get inputs() {
    return (this.states.inputs || this.definition.inputs) as T['definition']['inputs']
  }
  set inputs(inputs: T['definition']['inputs']) {
    const nameSet = new Set<string>()
    for (const input of inputs) {
      if (nameSet.has(input.name)) {
        throw new Error(`Input name "${input.name}" is duplicated.`)
      }
      nameSet.add(input.name)
    }
    const oldvalue = [...(this.inputs || [])]
    this.states.inputs = inputs
    this.raiseChangedEvent('inputs', oldvalue, this.inputs)
  }

  // Get and set outputs with change event
  get outputs() {
    return (this.states.outputs || this.definition.outputs) as T['definition']['outputs']
  }
  set outputs(outputs: T['definition']['outputs']) {
    const nameSet = new Set<string>()
    for (const output of outputs) {
      if (nameSet.has(output.name)) {
        throw new Error(`Output name "${output.name}" is duplicated.`)
      }
      nameSet.add(output.name)
    }
    const oldvalue = [...(this.outputs || [])]
    this.states.outputs = outputs
    this.raiseChangedEvent('outputs', oldvalue, this.outputs)
  }

  // Get and set style with change event
  get style() {
    return (this.states.style || this.definition.style) as NodeStyle
  }
  set style(style: NodeStyle) {
    const oldvalue = { ...(this.states.style || {}) }
    this.states.style = mergeDeep(
      (this.states.style ?? {}) as Record<string, unknown>,
      style as Record<string, unknown>
    )
    this.raiseChangedEvent('style', oldvalue, this.states.style)
  }

  public showTools() {
    this.toolsView?.show()
  }

  public hideTools() {
    this.toolsView?.hide()
  }

  public addTools(toolsView: NodeToolsView) {
    this.toolsView = toolsView
    this.toolsView.configure(this)
  }

  public removeTools() {
    this.toolsView?.remove()
    this.toolsView = null
  }

  // Get an input port by name
  public getInput(name: T['definition']['inputs'][number]['name']) {
    return this.definition.inputs.find(input => input.name === name)
  }

  // Get an output port by name
  public getOutput(name: T['definition']['outputs'][number]['name']) {
    return this.definition.outputs.find(output => output.name === name)
  }

  public setGraph(graph: Graph) {
    this.graph = graph
    this.graph.emit('node:mounted', this)
  }

  public toString() {
    return `Node#${this.id}(${this.nodeType})`
  }

  private checkValues(values: Partial<InputsToValues<T['definition']>>): boolean {
    for (const key in values) {
      const input = this.inputs.find(i => i.name === key)
      if (!input) {
        throw new Error(`Input "${key}" not found in node definition.`)
      }
      const value = values[key as keyof InputsToValues<T['definition']>]
      switch (input.type) {
        case 'string':
          if (typeof value !== 'string') {
            throw new Error(`Input "${key}" must be a string.`)
          }
          break
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            throw new Error(`Input "${key}" must be a number.`)
          }
          break
        case 'boolean':
          if (typeof value !== 'boolean') {
            throw new Error(`Input "${key}" must be a boolean.`)
          }
          break
        case 'array':
          if (!Array.isArray(value)) {
            throw new Error(`Input "${key}" must be an array.`)
          }
          break
        case 'object':
          if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            throw new Error(`Input "${key}" must be an object.`)
          }
          break
        case 'select':
          if (typeof value !== 'string') {
            throw new Error(`Input "${key}" must be a string.`)
          }
          break
        case 'textarea':
          if (typeof value !== 'string') {
            throw new Error(`Input "${key}" must be a string.`)
          }
          break
        default:
          console.warn(`Unknown input type "${input.type}" for input "${key}".`)
          return false
      }
    }
    return true
  }

  private raiseChangedEvent(
    propertyName: 'position' | 'title' | 'style' | 'values' | 'inputs' | 'outputs',
    oldvalue?: unknown,
    newvalue?: unknown
  ) {
    const graph = this.graph
    
    if (!graph) return

    graph.emit('node:changed', this, propertyName, oldvalue, newvalue)
    
    graph.raiseChangedEvent(ChangedEvent.Property, propertyName, this, oldvalue, newvalue)
  }
}
