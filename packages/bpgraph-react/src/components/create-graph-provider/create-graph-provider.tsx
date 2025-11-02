import React, { createContext, useContext } from 'react'
import { Graph, type NodeRegistry, type GraphOptions, type NodeClassType } from '@bpgraph/core'

export function createGraphContext<NodeDefs extends Record<string, NodeClassType>>(
  registry: NodeRegistry<NodeDefs>,
  options?: GraphOptions
) {
  const GraphContext = createContext<Graph<NodeDefs> | null>(null)

  function GraphProvider({ children }: { children: React.ReactNode }) {
    const graph = new Graph(registry, options)
    return <GraphContext.Provider value={graph}>{children}</GraphContext.Provider>
  }

  function useGraph() {
    const ctx = useContext(GraphContext)
    if (!ctx) throw new Error('GraphContext not found')
    return ctx
  }

  return { GraphProvider, useGraph }
}
