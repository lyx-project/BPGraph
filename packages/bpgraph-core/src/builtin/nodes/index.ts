import { Node } from '../../Node'

class StartNode extends Node {
  static definition = {
    inputs: [] as const,
    outputs: [
      { name: 'start', type: 'exec' },
      { name: 'result', type: 'any' }
    ] as const,
    style: {
      header: { background: '#4CAF50', color: '#FFFFFF' }
    },
    title: 'Start',
    type: 'start'
  }

  static readonly type = 'start'
}
export class EndNode extends Node {
  static definition = {
    inputs: [
      { name: 'end', type: 'exec' }
    ] as const,
    outputs: [] as const,
    style: {
      header: { background: '#F44336', color: '#FFFFFF' }
    },
    title: 'End',
    type: 'end'
  }

  static readonly type = 'end'
}

class SubgraphNode extends Node {
  static definition = {
    inputs: [
      { name: 'subgraph', type: 'exec' },
      { name: 'input', type: 'any', label: '' }
    ] as const,
    outputs: [
      { name: 'subgraph', type: 'exec' },
      { name: 'input', type: 'any', label: 'Result' }
    ] as const,
    style: {
      header: { background: '#2196F3', color: '#FFFFFF' }
    },
    title: 'Subgraph',
    type: 'subgraph'
  }

  static readonly type = 'subgraph'
}

Object.defineProperty(StartNode, 'type', {
  writable: false,
  configurable: false
})

Object.defineProperty(EndNode, 'type', {
  writable: false,
  configurable: false
})

Object.defineProperty(SubgraphNode, 'type', {
  writable: false,
  configurable: false
})

export const builtinNodes = {
  [StartNode.type]: StartNode,
  [SubgraphNode.type]: SubgraphNode
}

export type BuiltinNodeType = typeof builtinNodes
