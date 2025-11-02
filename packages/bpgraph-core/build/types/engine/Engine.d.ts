import { NodeInstanceType, PortPrototype, Runtime } from './Runtime';
import { NodeClassType, NodeOptions } from '../Node';
import { JsonGraph } from '../utils/serializer';
import { EventEmitter } from '../utils/EventEmitter';
type GraphNode = {
    node: NodeInstanceType;
    port: {
        name: string;
        type: string;
        id: string;
    };
    prev: string[];
    next: string[];
    dataInputs: {
        [key: string]: string;
    };
    value?: unknown;
};
export interface ProcessOptions {
    /**
     * Optional context object to be passed to each node during execution.
     */
    ctx?: unknown;
}
type EngineEventPayloads = {
    [eventName: string]: [...args: unknown[]];
};
export declare class Engine<NodeDefs extends Record<string, NodeClassType>> extends EventEmitter<EngineEventPayloads> {
    private portConnectionValueMap;
    private errorNodes;
    private entryPorts;
    private subEntryPort;
    private flowStackGraph;
    private waitingGraph;
    private readyGraph;
    private subFlowStackGraph;
    private subWaitingGraph;
    private subReadyGraph;
    runtime: Runtime<NodeDefs>;
    options: ProcessOptions;
    constructor(runtime: Runtime<NodeDefs>, options?: ProcessOptions);
    /**
     * Executes a node in the graph.
     * @param node The node instance to execute.
     * @param ctx The execution context.
     */
    executeNode(node: NodeInstanceType, opt?: {
        ctx?: unknown;
        error?: unknown;
    }): Promise<this>;
    /**
     * Runs a node in the graph.
     * @param args The arguments to pass to the node.
     */
    runNode<K extends keyof NodeDefs>(nodeType: K | NodeDefs[K], options?: NodeOptions<NodeDefs[K]>, opt?: {
        ctx?: unknown;
        error?: unknown;
    }): Promise<this>;
    /**
     * Creates a new node instance. {@link Runtime.createNodeInstance}
     * @param args The arguments to pass to createNodeInstance.
     * @returns The created node instance.
     */
    createNodeInstance(...args: Parameters<Runtime<NodeDefs>['createNodeInstance']>): {
        type: string;
        nodeType: string;
        onEvent?: import("./Runtime").EventFn;
        executor?: string | NodeDefs[keyof NodeDefs]["executor"] | undefined;
        data?: unknown;
        inputValues: Record<string, unknown>;
        outputValues: Record<string, unknown>;
        inputs: PortPrototype[];
        outputs: PortPrototype[];
        id: string;
        error: unknown;
        subgraphId?: string;
        getInput(name: string): unknown;
        getOutput(name: string): unknown;
        setInput(name: string, value: unknown): void;
        setOutput(name: string, value: unknown): void;
    };
    /**
     * Processes a JSON graph.
     * @param json The JSON representation of the graph.
     */
    fromJSON(json: JsonGraph | string): void;
    /**
     * Processes the input data through the graph.
     * @param input The input data to process through the graph.
     */
    process(input: unknown): void;
    executeSubgraph(graphNode: GraphNode, ready: Map<string, GraphNode>, error?: unknown): Promise<void>;
    executeEntry(portId: string, subgraphId?: string, error?: unknown): Promise<void>;
    setOptions(options: ProcessOptions): void;
    setCtx(ctx: unknown): void;
    private getNodeBySubgraphId;
    private generateDependencies;
    emit(...args: Parameters<EventEmitter<EngineEventPayloads>['emit']>): this;
    handleNodeEvents(...args: unknown[]): void;
    /** Builds the execution context for a node. */
    private buildExecContext;
    private prepareInputs;
    private generateFlowStackGraph;
    private generateDataDependencies;
    findStartNodes(nodes: NodeInstanceType[]): {
        type: string;
        nodeType: string;
        onEvent?: import("./Runtime").EventFn;
        executor?: string | import("./Runtime").ExecutorFn | undefined;
        data?: unknown;
        inputValues: Record<string, unknown>;
        outputValues: Record<string, unknown>;
        inputs: PortPrototype[];
        outputs: PortPrototype[];
        id: string;
        error: unknown;
        subgraphId?: string;
        getInput(name: string): unknown;
        getOutput(name: string): unknown;
        setInput(name: string, value: unknown): void;
        setOutput(name: string, value: unknown): void;
    }[];
}
export type ExecContext = {
    getInput: <T = unknown>(name: string) => T | undefined;
    setOutput: (name: string, value: unknown) => void;
    emitEvent: (eventName: string, ...args: unknown[]) => void;
    next: (nextExecs?: Array<string>) => void;
    data?: unknown;
    services: {
        get: (name: string) => unknown;
    };
    ctx?: unknown;
    error?: unknown;
    inputs: PortPrototype[];
    outputs: PortPrototype[];
};
export {};
