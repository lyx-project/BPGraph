
type EventMap = Record<string,  unknown[]>
type EventHandler<T extends unknown[]> = (...payload: T) => void

export class EventEmitter<Events extends EventMap> {
  private listeners: {
    [K in keyof Events]?: Set<EventHandler<Events[K]>>
  } = {}

  /**
   * Adds an event listener for the specified event.
   * @param event The event name.
   * @param handler The event handler.
   * @returns The EventEmitter instance.
   */
  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): this {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set()
    }
    this.listeners[event]!.add(handler)
    return this
  }

  /**
   * Adds a one-time event listener for the specified event.
   * @param event The event name.
   * @param handler The event handler.
   * @returns The EventEmitter instance.
   */
  once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): this {
    const wrapper: EventHandler<Events[K]> = (...payload) => {
      this.off(event, wrapper)
      handler(...payload)
    }
    return this.on(event, wrapper)
  }

  /**
   * Removes an event listener for the specified event.
   * @param event The event name.
   * @param handler The event handler.
   * @returns The EventEmitter instance.
   */
  off<K extends keyof Events>(event: K, handler?: EventHandler<Events[K]>): this {
    if (!this.listeners[event]) return this
    if (handler) {
      this.listeners[event]!.delete(handler)
    } else {
      delete this.listeners[event]
    }
    return this
  }

  /**
   * Emits an event with the specified payload.
   * @param event The event name.
   * @param payload The event payload.
   * @returns The EventEmitter instance.
   */
  emit<K extends keyof Events>(event: K, ...payload: Events[K]): this {
    if (!this.listeners[event]) return this
    for (const handler of this.listeners[event]!) {
      handler(...payload)
    }
    return this
  }
}
