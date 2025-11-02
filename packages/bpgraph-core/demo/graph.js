import { Graph, NodeToolsView, NodeToolView } from '@bpgraph/core'
import { Engine } from '@bpgraph/core/engine'
import { createRegistry, createRuntime } from './nodes/index.js'

const container = document.getElementById('graph-container')
if (!container) throw new Error('Container not found')

const registry = createRegistry()
const graph = new Graph(registry, {
  // container,
  background: '#000000',
  gridSize: 10,
  drawGrid: {
    size: 10,
    color: 'rgba(255, 255, 255, 0.2)',
    thickness: 1,
  }
})

graph.setContainer(container)

window['graph'] = graph

graph.skipsUndoManager = true

const start1 = graph.addNode('start', {
  id: 'start1',
  position: { x: 100, y: 200 }
})

const start2 = graph.addNode('start', {
  id: 'start2',
  position: { x: 100, y: 600 }
})
const anode1 = graph.addNode('math.anode', {
  id: 'anode1',
  position: { x: 300, y: 50 },
  values: {
    input1: 'hello pin',
    input3: 'singapore'
  },
  data: { hello: 'anode1' },
})
const bnode1 = graph.addNode('bnode', {
  id: 'bnode1',
  position: { x: 600, y: 100 },
  style: {
    header: {
      background: 'blue'
    }
  }
})
const cnode1 = graph.addNode('cnode', {
  id: 'cnode1',
  position: { x: 600, y: 300 },
})
const dnode1 = graph.addNode('dnode', {
  id: 'dnode1',
  position: { x: 800, y: 100 },
})
const anode2 = graph.addNode('math.anode', {
  id: 'anode2',
  position: { x: 300, y: 330 },
  data: { hello: 'anode2' }
})
const anode3 = graph.addNode('math.anode', {
  id: 'anode3',
  position: { x: 300, y: 600 },
  data: { hello: 'anode3' }
})

const subgraphNode1 = graph.addNode('subgraph', {
  id: 'subgraph1',
  position: { x: 800, y: 300 },
  subgraphId: 'my-subgraph-001',
  title: 'Subgraph'
})

const subgraphNode2 = graph.addNode('subgraph', {
  id: 'subgraph2',
  position: { x: 800, y: 600 },
  subgraphId: 'my-subgraph-001',
  title: 'Subgraph'
})

// graph.addLink({
//   target: { id: start1.id, port: start1.getOutput('output1')?.id || ''},
//   source: { id: anode1.id, port: anode1.getInput('input0')?.id || ''}
// })
// graph.addLink({
//   target: { id: anode1.id, port: anode1.getOutput('output1')?.id || ''},
//   source: { id: bnode1.id, port: bnode1.getInput('input1')?.id || ''}
// })
// graph.addLink({
//   source: { id: anode1.id, port: anode1.getOutput('output2')?.id || ''},
//   target: { id: bnode1.id, port: bnode1.getInput('input2')?.id || ''}
// })
// graph.addLink({
//   source: { id: anode1.id, port: anode1.getOutput('output3')?.id || ''},
//   target: { id: bnode1.id, port: bnode1.getInput('input3')?.id || ''}
// })
// graph.addLink({
//   source: { id: anode1.id, port: anode1.getOutput('output4')?.id || ''},
//   target: { id: bnode1.id, port: bnode1.getInput('input1')?.id || ''}
// })
// graph.addLink({
//   source: { id: anode1.id, port: anode1.getOutput('output4')?.id || ''},
//   target: { id: cnode1.id, port: cnode1.getInput('input1')?.id || ''}
// })

// graph.addLink({
//   source: { id: start1.id, port: start1.getOutput('output1')?.id || ''},
//   target: { id: anode2.id, port: anode2.getInput('input0')?.id || ''}
// })

// graph.addLink({
//   source: { id: start2.id, port: start2.getOutput('output1')?.id || ''},
//   target: { id: anode3.id, port: anode3.getInput('input0')?.id || '' }
// })

// graph.addLink({
//   source: { id: anode1.id, port: anode1.getOutput('output2')?.id || '' },
//   target: { id: cnode1.id, port: cnode1.getInput('input2')?.id || '' }
// })
// graph.addLink({
//   source: { id: bnode1.id, port: bnode1.getOutput('output2')?.id || '' },
//   target: { id: dnode1.id, port: dnode1.getInput('input1')?.id || '' }
// })


// graph.addLink({
//   target: { id: start2.id, port: start2.getOutput('start')?.id || '' },
//   source: { id: anode3.id, port: anode3.getInput('input0')?.id || '' }
// })
// graph.addLink({
//   source: { id: anode3.id, port: anode3.getOutput('output1')?.id || '' },
//   target: { id: subgraphNode2.id, port: subgraphNode2.getInput('subgraph')?.id || '' }
// })

graph.enterSubgraph('my-subgraph-001')

const substart = graph.findNode('start-my-subgraph-001')
const subend = graph.findNode('end-my-subgraph-001')

if (subend) {
  subend.position = { x: 900, y: 200 }
}

const subNode1 = graph.addNode('bnode', {
  id: 'subnode1',
  position: { x: 600, y: 200 }
})


// graph.addLink({
//   source: { id: substart?.id || '', port: substart?.getOutput('start')?.id || '' },
//   target: { id: subNode1.id, port: subNode1.getInput('input1')?.id || '' }
// })

// graph.addLink({
//   source: { id: subNode1.id, port: subNode1.getOutput('output2')?.id || '' },
//   target: { id: subend?.id || '', port: subend?.getInput('end')?.id || '' }
// })

graph.skipsUndoManager = false

graph.exitSubgraph()

const runtime = createRuntime()
const engine = new Engine(runtime, { ctx: {} })
// runtime.registerService('logger', () => 'im logger service')
// await engine.process(graph.toJSON())
window['engine'] = engine