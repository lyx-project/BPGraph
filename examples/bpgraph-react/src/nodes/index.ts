import { NodeRegistry } from '@bpgraph/core'
import { Runtime } from '@bpgraph/core/engine'
import { IF } from './IF'
import { Switch } from './Switch'
import { Print } from './Print'
import { Concat } from './Concat'
import { OpenRouter, OpenRouterExecutor } from "./OpenRouter";

export function createRegistry() {
  return new NodeRegistry()
    .register('IF', IF)
    .register('Switch', Switch)
    .register('Print', Print)
    .register('Concat', Concat)
    .register('OpenRouter', OpenRouter)
}

export function createRuntime() {
  return new Runtime(createRegistry())
    .registerExecutor('OpenRouter', OpenRouterExecutor)
}