import { Node } from '@bpgraph/core'
import type { ExecutorFn } from '@bpgraph/core/engine'

export class Concat extends Node {
  static definition = {
    type: 'default',
    title: 'Concat',
    inputs: [
      { name: 'exec', type: 'exec' },
      { name: 'string1', type: 'string' },
      { name: 'string2', type: 'string' },
    ] as const,
    outputs: [
      { name: 'exec', type: 'exec' },
      { name: 'result', type: 'string' },
    ] as const,
    style: {
      header: { background: '#1e40af', color: '#fff' }
    }
  }

  static executor: ExecutorFn = ({ getInput, setOutput, next }) => {
    const string1 = getInput('string1') as string
    const string2 = getInput('string2') as string
    const result = string1 + string2
    setOutput('result', result)
    next(['exec'])
  }
}