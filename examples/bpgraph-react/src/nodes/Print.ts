import { Node } from '@bpgraph/core'
import type { ExecutorFn } from '@bpgraph/core/engine'

export class Print extends Node {
  static definition = {
    type: 'default',
    title: 'Print',
    inputs: [
      { name: 'exec', type: 'exec' },
      { name: 'message', type: 'string' },
    ] as const,
    outputs: [
      { name: 'done', type: 'exec' },
    ] as const,
    style: {
      header: { background: '#374151', color: '#fff' },
    }
  }

  static executor: ExecutorFn = ({ getInput, next }) => {
    const message = getInput('message') as string
    console.log(message)
    next(['done'])
  }
}