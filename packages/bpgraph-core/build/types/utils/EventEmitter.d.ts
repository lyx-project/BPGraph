type EventMap = Record<string, unknown[]>;
type EventHandler<T extends unknown[]> = (...payload: T) => void;
export declare class EventEmitter<Events extends EventMap> {
    private listeners;
    /**
     * Adds an event listener for the specified event.
     * @param event The event name.
     * @param handler The event handler.
     * @returns The EventEmitter instance.
     */
    on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): this;
    /**
     * Adds a one-time event listener for the specified event.
     * @param event The event name.
     * @param handler The event handler.
     * @returns The EventEmitter instance.
     */
    once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): this;
    /**
     * Removes an event listener for the specified event.
     * @param event The event name.
     * @param handler The event handler.
     * @returns The EventEmitter instance.
     */
    off<K extends keyof Events>(event: K, handler?: EventHandler<Events[K]>): this;
    /**
     * Emits an event with the specified payload.
     * @param event The event name.
     * @param payload The event payload.
     * @returns The EventEmitter instance.
     */
    emit<K extends keyof Events>(event: K, ...payload: Events[K]): this;
}
export {};
