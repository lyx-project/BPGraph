import type { NodeClassType, NodeOptions } from '../Node';
import { NodeRegistry } from '../NodeRegistry';
import type { JsonGraph } from '../utils/serializer';
import { VariableManager } from '../VariableManager';
import type { ExecContext } from './Engine';
export type ExecutorFn = (ctx: ExecContext) => Promise<any> | any;
export type EventFn = (eventName: string, ...args: any[]) => {
    trigger?: boolean;
} | void;
export interface IRuntime {
    /**
     * Registers a new executor function for a specific node type.
     * @param type The type of the node.
     * @param executor The executor function to register.
     * @returns The current Runtime instance.
     */
    registerExecutor: (type: string, executor: ExecutorFn) => IRuntime;
    /**
     * Registers a new service.
     * @param name The name of the service.
     * @param factory A factory function to create the service instance.
     * @returns The current Runtime instance.
     */
    registerService: (name: string, factory: () => any) => IRuntime;
    /**
     * Checks if an executor is registered for a specific node type.
     * @param type The type of the node.
     * @returns True if an executor is registered, false otherwise.
     */
    hasExecutor: (type: string) => boolean;
    /**
     * Checks if a service is registered.
     * @param name The name of the service.
     * @returns True if the service is registered, false otherwise.
     */
    hasService: (name: string) => boolean;
    /**
     * Retrieves the executor function for a specific node type.
     * @param type The type of the node.
     * @returns The executor function, or undefined if not found.
     */
    getExecutor: (type: string) => ExecutorFn | undefined;
    /**
     * Retrieves a registered service.
     * @param name The name of the service.
     * @returns The service instance, or undefined if not found.
     */
    getService: (name: string) => any;
}
export declare class Runtime<NodeDefs extends Record<string, NodeClassType>> implements IRuntime {
    executors: Map<string, ExecutorFn>;
    services: Map<string, any>;
    variableManager: VariableManager;
    static NodeInstance: typeof NodeInstance;
    nodeRegistry: NodeRegistry<NodeDefs>;
    nodeListeners: Map<string, NodeInstance<typeof import("../Node").Node, PortPrototype>>;
    constructor(nodeRegistry: NodeRegistry<NodeDefs>);
    /** @inheritdoc {@link IRuntime.getService} */
    registerExecutor(type: string, executor: ExecutorFn): this;
    /** @inheritdoc {@link IRuntime.registerService} */
    registerService(name: string, factory: () => any): this;
    /** @inheritdoc {@link IRuntime.hasExecutor} */
    hasExecutor(type: string): boolean;
    /** @inheritdoc {@link IRuntime.getExecutor} */
    getExecutor(type: string): ExecutorFn | undefined;
    /** @inheritdoc {@link IRuntime.hasService} */
    hasService(name: string): boolean;
    /** @inheritdoc {@link IRuntime.getService} */
    getService(name: string): any;
    /** Creates a new instance of a node. */
    createNodeInstance<K extends keyof NodeDefs>(nodeType: K | NodeDefs[K], options?: NodeOptions<NodeDefs[K]>): NodeInstance<NodeDefs[K]>;
    /**
     * Executes a node in the graph.
     * @param node The node instance to execute.
     * @param ctx The execution context.
     */
    executeNode(node: NodeInstanceType, ctx: ExecContext): Promise<any>;
    /**
     * Checks if there is an executor available for the given node.
     * @param node The node instance to check.
     * @returns True if an executor is available, false otherwise.
     */
    hasExecutorForNode(node: NodeInstanceType): boolean;
    /**
     * Gets the executor function for a specific node.
     * @param node The node instance to get the executor for.
     * @returns The executor function, or undefined if not found.
     */
    getExecutorForNode(node: NodeInstanceType): ExecutorFn | undefined;
    fromJSON(json: JsonGraph | string): {
        nodes: NodeInstance<typeof import("../Node").Node, PortPrototype>[];
        links: import("../utils/serializer").JsonLink[];
        subgraphs: Record<string, {
            nodes: NodeInstanceType[];
            links: JsonGraph["links"];
        }>;
    };
    private deserializeNodes;
}
export type PortPrototype = {
    name: string;
    id: string;
    type: string;
};
declare class NodeInstance<T extends NodeClassType, Port extends PortPrototype = PortPrototype> {
    type: string;
    nodeType: string;
    onEvent?: EventFn;
    executor?: T['executor'] | string;
    data?: unknown;
    inputValues: Record<string, unknown>;
    outputValues: Record<string, unknown>;
    inputs: Port[];
    outputs: Port[];
    id: string;
    error: unknown;
    subgraphId?: string;
    constructor(NodeClass: T, options?: NodeOptions<T>);
    getInput(name: string): unknown;
    getOutput(name: string): unknown;
    setInput(name: string, value: unknown): void;
    setOutput(name: string, value: unknown): void;
}
export type NodeInstanceType = InstanceType<typeof Runtime.NodeInstance>;
export {};
