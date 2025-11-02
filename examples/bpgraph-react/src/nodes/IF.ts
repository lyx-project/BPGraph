import { Node } from '@bpgraph/core'
import type { ExecutorFn } from '@bpgraph/core/engine'

export class IF extends Node {
  static definition = {
    type: 'default',
    title: 'IF',
    inputs: [
      { name: 'exec', type: 'exec' },
      { name: 'condition', showInput: false, type: 'string', label: '' },
    ] as const,
    outputs: [
      { name: 'true', type: 'exec', label: 'True' },
      { name: 'condition', type: 'string', label: 'Condition' },
      { name: 'false', type: 'exec', label: 'False' },
    ] as const,
    style: {
      header: { background: '#047857', color: '#fff' },
      ports: {
        input: {
          editor: {
            box: { width: 80 }
          }
        }
      }
    }
  }

  static executor: ExecutorFn = ({ getInput, next, setOutput }) => {
    const condition = getInput<string>('condition') || ''
    setOutput('condition', condition)
    if (condition) {
      return next(['true'])
    } else {
      return next(['false'])
    }
  }
}