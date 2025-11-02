import { createRegistry } from '@/nodes'
import { createGraphContext } from '@bpgraph/react'

const registry = createRegistry()

const graphOptions = {
  background:'#000000',
  gridSize: 10,
  drawGrid: {
    size: 10,
    color: 'rgba(255, 255, 255, 0.2)',
    thickness: 1,
  },
}

export const { GraphProvider, useGraph } = createGraphContext(registry, graphOptions)