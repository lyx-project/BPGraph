import { Node } from '@bpgraph/core'
import type { ExecutorFn } from '@bpgraph/core/engine'

export class Switch extends Node {
  static definition = {
    type: 'switch',
    title: 'Switch',
    inputs: [
      { name: 'exec', type: 'exec' },
      { name: 'condition', type: 'string', label: 'Condition', showInput: false },
      { name: 'case_1_value', type: 'string' },
    ] as const,
    outputs: [
      { name: 'default', type: 'exec', label: 'Default' },
      { name: 'condition', type: 'string', label: 'Condition' },
      { name: 'case_1', type: 'exec' },
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

  static executor: ExecutorFn = ({ getInput, setOutput, next, inputs }) => {
    const condition = getInput('condition') as string || ''
    let outputKey = ''
    setOutput('condition', condition)
    for (const input of inputs) {
      if (input.name.startsWith('case_')) {
        const caseKey = input.name
        const caseValue = getInput(caseKey)
        if (condition === caseValue) {
          outputKey = caseKey.replace('_value', '')
        }
      }
    }
    if (outputKey) {
      next([outputKey])
    } else {
      next(['default'])
    }
  }
}