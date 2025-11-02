import { NodeRegistry, Node } from "@bpgraph/core"
import { Runtime } from '@bpgraph/core/engine'

const ANode = class extends Node {
  static definition = {
    inputs: /** @type {const} */ ([
      { name: 'input0', type: 'exec', label: 'exec' },
      { name: 'input1', type: 'string', label: 'in1' },
      { name: 'input2', type: 'number', label: 'in2' },
      { name: 'input3', type: 'select', label: 'city', options: [
        { label: 'New York', value: 'new_york' },
        { label: 'Singapore', value: 'singapore' },
        { label: 'China', value: 'china' }
      ] },
      { name: 'input4', type: 'boolean', label: 'enable' },
    ]),
    outputs: /** @type {const} */ ([
      { name: 'output1', type: 'exec', label: 'out1' },
      { name: 'output2', type: 'string', label: 'out2' },
      { name: 'output3', type: 'string', label: 'out3' },
      { name: 'output4', type: 'exec' }
    ]),
    title: 'My ANode'
  }

  static executor = 'aexec'
}

const BNode = class extends Node {
  static definition = {
    inputs: /** @type {const} */ ([
      { name: 'input1', type: 'exec' },
      { name: 'input2', type: 'string' },
      { name: 'input3', type: 'string' },
    ]),
    outputs: /** @type {const} */ ([
      { name: 'output1', type: 'spacer' },
      { name: '', type: 'any' },
      { name: 'output2', type: 'exec' }
    ]),
    title: 'My BNode',
    style: {
      header: {
      }
    }
  }

  static onEvent(eventName, { result }) {
    return { trigger: true }
  }

  static executor = 'bexec'
}

const CNode = class extends Node {
  static definition = {
    inputs: /** @type {const} */ ([
      { name: 'input1', type: 'exec' },
      { name: 'input2', type: 'any' }
    ]),
    outputs: /** @type {const} */ ([
      { name: 'output1', type: 'exec' },
      { name: 'output2', type: 'any' }
    ]),
    title: 'My CNode',
  }
}

const DNode = class extends Node {
  static definition = {
    inputs: /** @type {const} */ ([
      { name: 'input1', type: 'exec' },
      { name: 'input2', type: 'any' }
    ]),
    outputs: /** @type {const} */ ([
      { name: 'output1', type: 'string' },
      { name: 'output2', type: 'number' }
    ]),
    title: 'My DNode',
  }

  static executor = function ({ getInput, setOutput }) {
    console.log('Run dexecutor')
  }
}

export function createRegistry() {
  return new NodeRegistry()
    .register('math.anode', ANode)
    .register('bnode', BNode)
    .register('cnode', CNode)
    .register('dnode', DNode)
    // .register('subgraph', SubgraphNode)
}

export function createRuntime() {
  return new Runtime(createRegistry())
    .registerExecutor('aexec', async ({ ctx, data, setOutput, emitEvent, next }) => {
      // ctx.hello = 'anode1'
      setOutput('output2', '222')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // if (data.hello === 'anode1') {
      //   await new Promise((resolve) => setTimeout(resolve, 2000))
      // }
      // emitEvent('anodeEvent', { hello: 'event' })
      await next()
    })
    .registerExecutor('bexec', async ({ ctx, getInput, next }) => {
      console.log('Run bexecutor', getInput('input2'))
      // ctx.hello = 'bnode'
      // throw new Error('bnode error')
      await next()
    })
    .registerExecutor('cnode', async ({ ctx, next }) => {
      await next()
    })
}