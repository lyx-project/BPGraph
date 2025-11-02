import { createRuntime } from '@/nodes'
import { createEngineContext } from '@bpgraph/react'

const runtime = createRuntime()

export const { EngineProvider, useEngine } = createEngineContext(runtime)