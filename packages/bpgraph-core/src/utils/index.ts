import { fromJSON, toJSON, serializeNodes, serializeLinks, deserializeNodes, deserializeLinks } from './serializer'
export function mergeDeep<T extends Record<string, unknown>, U extends Record<string, unknown>>(target: T, source: U): T & U {
  const output: Record<string, unknown> = { ...target }
  for (const key in source) {
    if  (Array.isArray(source[key])) {
      output[key] = [...source[key]]
    } else if (
      typeof source[key] === 'object' &&
      source[key] !== null
    ) {
      output[key] = mergeDeep(
        (target[key] ?? {}) as Record<string, unknown>,
        source[key] as Record<string, unknown>
      )
    } else {
      output[key] = source[key]
    }
  }
  return output as T & U
}

export const Util = {
  mergeDeep,
  toJSON: toJSON,
  fromJSON: fromJSON,
  serializeLinks,
  serializeNodes,
  deserializeLinks,
  deserializeNodes,
}