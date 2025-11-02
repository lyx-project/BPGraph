import { builtinNodes, EndNode, type BuiltinNodeType } from './builtin/nodes'
import type { NodeClassType } from './Node'
import { mergeDeep } from './utils'

const defaultNodeStyle: NodeStyle = {
  background: 'rgba(41, 44, 47, 1)',
  borderRadius: 6,
  highlightStroke: 'blue',
  highlightStrokeWidth: 1,
  header: {
    height: 24,
    fontSize: 14,
    background: 'rgba(60, 63, 67, 1)',
    color: '#fff',
    textAlign: 'left',
    title: { x: 0, y: 0 }
  },
  ports: {
    layout: {
      rowHeight: 24,
      gap: 10,
      top: 0,
      bottom: 0
    },
    input: {
      port: {
        fill: 'rgba(41, 44, 47, 1)',
        stroke: 'rgba(255, 255, 255, 0.5)'
      },
      label: { fontSize: 12, color: '#fff' },
      editor: {
        box: {
          background: 'rgba(30, 33, 36, 0.8)',
          borderColor: 'rgba(120, 130, 140, 0.3)',
          borderRadius: 4,
          color: 'rgba(255, 255, 255, 0.9)',
          width: 80
        },
        dropdown: {
          background: '#222',
          borderColor: '#444',
          borderRadius: 4,
          color: 'rgba(255, 255, 255)'
        }
      }
    },
    output: {
      port: {
        fill: 'rgba(41, 44, 47, 1)',
        stroke: 'rgba(255, 255, 255, 0.5)'
      },
      label: { fontSize: 12, color: '#fff' },
    }
  }
}

const defaultLinkStyle: LinkStyle = {
  stroke: 'rgba(255, 255, 255, 0.5)',
  strokeWidth: 1,
  highlightStroke: 'blue',
  byPortType: {
    string: ['red', 'yellow', 'blue'],
    number: ['#81C784'],
    boolean: ['#FFD54F']
  },
}

export class NodeRegistry<NodeDefs extends Record<string, unknown> = BuiltinNodeType> {
  registry: NodeDefs = builtinNodes as unknown as NodeDefs
  nodeStyle: NodeStyle
  linkStyle: LinkStyle

  constructor(nodeStyle: NodeStyle = {}, linkStyle: LinkStyle = {}) {
    this.nodeStyle = mergeDeep(
      defaultNodeStyle as Record<string, unknown>,
      (nodeStyle || {}) as Record<string, unknown>
    )

    this.linkStyle = mergeDeep(
      defaultLinkStyle as Record<string, unknown>,
      (linkStyle || {}) as Record<string, unknown>
    )
  }

  register<K extends string, V extends NodeClassType>(
    nodeType: K,
    NodeClass: V
  ): NodeRegistry<NodeDefs & { [P in K]: V }> {

    const inputNameSet = new Set<string>()
    for (const input of NodeClass.definition.inputs) {
      if (inputNameSet.has(input.name)) {
        // throw new Error(`Input name "${input.name}" is duplicated.`)
        throw new Error(`Input name "${input.name}" is duplicated in node type "${nodeType}".`)
      }
      inputNameSet.add(input.name)
    }
    const outputNameSet = new Set<string>()
    for (const output of NodeClass.definition.outputs) {
      if (outputNameSet.has(output.name)) {
        // throw new Error(`Output name "${output.name}" is duplicated.`)
        throw new Error(`Output name "${output.name}" is duplicated in node type "${nodeType}".`)
      }
      outputNameSet.add(output.name)
    }

    ;(this.registry as Record<string, unknown>)[nodeType] = NodeClass

    const desc = Object.getOwnPropertyDescriptor(NodeClass, 'type')
    if (!desc || desc.configurable) {
        Object.defineProperty(NodeClass, 'type', {
        get() {
          return nodeType
        },
        configurable: false,
        enumerable: true
      })
    }
    return this as unknown as NodeRegistry<NodeDefs & { [P in K]: V }>
  }

  get<T extends keyof NodeDefs>(nodeType: T): NodeDefs[T] {
    if (nodeType === 'end') return EndNode as unknown as NodeDefs[T]
    if (!(nodeType in this.registry)) {
      throw new Error(`Node type "${String(nodeType)}" is not registered.`)
    }
    return this.registry[nodeType] as NodeDefs[T] extends NodeClassType ? NodeDefs[T] : never
  }

  getNodeTypes(): (keyof NodeDefs)[] {
    return Object.keys(this.registry) as (keyof NodeDefs)[]
  }

  getNodeClasses(): NodeDefs[keyof NodeDefs][] {
    return Object.values(this.registry) as NodeDefs[keyof NodeDefs][]
  }

  isRegistered<T extends keyof NodeDefs>(nodeType: T | NodeDefs[T]): boolean {
    if (nodeType === EndNode || nodeType === 'end') return true
    if (typeof nodeType === 'string') {
      return nodeType in this.registry
    }

    return Object.keys(this.registry).some((key) => this.registry[key as keyof NodeDefs] === nodeType)
  }

  getStartNodeClass(): NodeClassType {
    return builtinNodes['start']
  }

  getEndNodeClass(): NodeClassType {
    return EndNode
  }
}

export interface NodeStyle {
  background?: string
  borderRadius?: number
  highlightStroke?: string
  highlightStrokeWidth?: number
  header?: {
    textAlign?: 'left' | 'center' | 'right'
    background?: string
    color?: string
    height?: number
    fontSize?: number
    title?: {
      x?: number
      y?: number
    }
  }
  ports?: {
    layout?: {
      rowHeight?: number
      gap?: number
      top?: number
      bottom?: number
    }
    input?: {
      port?: {
        fill?: string
        stroke?: string
        strokeWidth?: number
        highlightFill?: string
        highlightStroke?: string
        highlightStrokeWidth?: number
      }
      label?: {
        fontSize?: number
        color?: string
      }
      editor?: {
        box?: {
          background?: string
          borderColor?: string
          borderRadius?: number
          fontSize?: number
          color?: string
          width?: number
        },
        dropdown?: {
          background?: string
          borderColor?: string
          borderRadius?: number
          color?: string
        }
      }
    }
    output?: {
      port?: {
        fill?: string
        stroke?: string
        strokeWidth?: number
        highlightFill?: string
        highlightStroke?: string
        highlightStrokeWidth?: number
      }
      label?: {
        fontSize?: number
        color?: string
      }
    }
  }
}

export interface LinkStyle {
  stroke?: string
  strokeWidth?: number
  highlightStroke?: string
  highlightStrokeWidth?: number
  byPortType?: {
    [portType: string]: string[]
  }
}
