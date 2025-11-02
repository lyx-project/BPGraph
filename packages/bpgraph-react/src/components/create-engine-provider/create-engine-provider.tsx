import React, { createContext, useContext } from 'react'
import { Engine, type Runtime, type NodeClassType, type ProcessOptions } from '@bpgraph/core/engine'

export type EngineProviderProps<NodeDefs extends Record<string, NodeClassType>> = {
  runtime: Runtime<NodeDefs>
  children: React.ReactNode
  options?: ProcessOptions
}

export function createEngineContext<NodeDefs extends Record<string, NodeClassType>>(
  runtime: Runtime<NodeDefs>,
  options?: ProcessOptions
) {
  const EngineContext = createContext<Engine<NodeDefs> | null>(null)

  function EngineProvider({ children }: { children: React.ReactNode }) {
    const graph = new Engine(runtime, options)
    return <EngineContext.Provider value={graph}>{children}</EngineContext.Provider>
  }

  function useEngine() {
    const ctx = useContext(EngineContext)
    if (!ctx) throw new Error('EngineContext not found')
    return ctx
  }

  return { EngineProvider, useEngine }
}
