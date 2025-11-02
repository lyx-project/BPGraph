import { NodeRegistry } from './NodeRegistry';
import type { NodeOptions, NodeClassType, OutputPort } from './Node';
import { EventEmitter } from './utils/EventEmitter';
import { UndoManager } from './UndoManager';
import { ChangedEvent, ChangedEventType } from './ChangedEvent';
import type { JsonGraph } from './utils/serializer';
import { NodeInstance } from './Node';
import { BlueprintModel } from './GraphModel';
export interface GraphOptions {
    container?: HTMLElement;
    width?: number | string;
    height?: number | string;
    background?: string;
    gridSize?: number;
    drawGrid?: {
        size?: number;
        color?: string;
        thickness?: number;
    };
}
export interface IGraph<NodeDefs extends Record<string, NodeClassType>> {
    /**
     * The registry of node definitions.
     */
    nodeRegistry: NodeRegistry<NodeDefs>;
    /**
     * The current selected nodes and links in the graph.
     */
    selection: Set<NodeInstanceType | LinkInstanceType>;
    /**
     * Adds a new node to the graph.
     * @param nodeType The node type string (registered name) or the registered node class to add.
     * @param options The options for adding the node.
     * @returns The instance of the added node.
     *
     * @example
     * ```
     * import { Graph, NodeRegistry, Node } from '@bpgraph/core'
     * class NodeA extends Node {}
     * const registry = new NodeRegistry()
     *  .register('nodeA', NodeA)
     * const graph = new Graph(registry, {
     *   el: document.createElement('div'),
     * })
     * const node1 = graph.addNode('nodeA')
     * const node2 = graph.addNode(NodeA)
     * const node3 = graph.createNodeInstance('nodeA')
     * graph.addNode(node3)
     * ```
     */
    addNode: <T extends keyof NodeDefs>(nodeType: T | NodeDefs[T] | NodeInstanceType, options?: NodeOptions<NodeDefs[T]>) => NodeInstanceType;
    /**
     * Adds a link to the graph.
     * @param link {@see LinkInstance} The link instance to add.
     * @returns The added link instance.
     */
    addLink: <T extends LinkInstance>(link: T) => T;
    /**
     * Selects a node in the graph.
     * @param node The node instance to select.
     * @returns void
     */
    select: (node: NodeInstanceType) => void;
    /**
     * Selects a collection of nodes and links in the graph.
     * @param items The collection of nodes and links to select.
     * @returns void
     * ```
     */
    selectCollection: (items: Array<NodeInstanceType | LinkInstanceType>) => void;
    /**
     * Deletes the currently selected nodes and links from the graph.
     * @returns void
     */
    deleteSelection: () => void;
    /**
     * Removes the specified node instances from the graph.
     * @param nodes The node instances to remove.
     */
    removeNodes(nodes: NodeInstanceType[]): void;
    /**
     * Removes the specified link instances from the graph.
     * @param links The link instances to remove.
     */
    removeLinks(links: LinkInstance[]): void;
    /**
     * Gets all nodes in the graph.
     * @returns An array of all node instances in the graph.
     */
    getNodes(): NodeInstanceType[];
    /**
     * Gets all links in the graph.
     * @returns An array of all link instances in the graph.
     */
    getLinks(): LinkInstance[];
    findNode(id: string): NodeInstanceType | undefined;
    findLink(id: string): LinkInstanceType | undefined;
    /**
     * Sets the container HTMLElement to render the graph into.
     * @param container The container HTMLElement to render the graph into.
     * @returns void
     *
     * @example
     * ```
     * const container = document.getElementById('graph-container')
     * graph.setContainer(container)
     * ```
     */
    setContainer(container: HTMLElement): void;
    /**
     * Zooms the graph in by a predefined step.
     */
    zoomIn(): void;
    /**
     * Zooms the graph out by a predefined step.
     */
    zoomOut(): void;
    /**
     * Zooms the graph to a specific scale.
     */
    zoom(value: number): void;
    /**
     * Resets the zoom level to the default scale (1.0 or as configured).
     */
    resetZoom(): void;
    /**
     * Destroys the graph and cleans up resources.
     */
    destroy: () => void;
    /**
     * Validates the connection between two ports.
     * @param sourceNode The source node instance.
     * @param sourcePort The source port.
     * @param targetNode The target node instance.
     * @param targetPort The target port.
     * @returns Whether the connection is valid.
     */
    validateConnection: (sourceNode: NodeInstanceType, sourcePort: OutputPort, targetNode: NodeInstanceType, targetPort: OutputPort) => boolean;
    /**
     * Gets the link color when actively creating a connection by dragging on the canvas.
     * You can return a color string based on the current context or logic.
     * @returns The link color as a string.
     */
    getLinkColor(sourceNode: NodeInstanceType | null, targetNode: NodeInstanceType | null, sourcePort: OutputPort | null, targetPort: OutputPort | null): string;
    /**
     * creates a new node instance of the specified node type.
     * @param nodeType The node type string (registered name) or the registered node class to create.
     * @param options The options for creating the node instance.
     * @returns The instance of the created node.
     */
    createNodeInstance<K extends keyof NodeDefs>(nodeType: K | NodeDefs[K], options?: NodeOptions<NodeDefs[K]>): NodeInstanceType;
    /**
     * Clears the graph by removing all nodes, links, and variables.
     */
    clear(): void;
    /**
     * Gets the current graph as a JSON object.
     */
    toJSON(): JsonGraph;
    /**
     * Loads the graph from a JSON object or string.
     * @param json The JSON object or string to load the graph from.
     */
    fromJSON(json: JsonGraph | string): void;
}
type GraphEventPayload = {
    'changed': [event: ChangedEvent];
    'node:click': [instance: NodeInstanceType, evt: MouseEvent];
    'node:dblclick': [instance: NodeInstanceType, evt: MouseEvent];
    'node:changed': [instance: NodeInstanceType, propertyName: string, oldvalue: unknown, newvalue: unknown];
    'node:dragstart': [instance: NodeInstanceType];
    'node:dragmove': [instance: NodeInstanceType];
    'node:dragend': [instance: NodeInstanceType];
    'node:mouseenter': [instance: NodeInstanceType, evt: MouseEvent];
    'node:mouseleave': [instance: NodeInstanceType, evt: MouseEvent];
    'node:removed': [instance: NodeInstanceType[], info: {
        type: 'removed';
    }];
    'node:created': [instance: NodeInstanceType[], info: {
        type: 'added';
    }];
    'node:mounted': [instance: NodeInstanceType];
    'link:click': [instance: LinkInstanceType, evt: MouseEvent];
    'link:dblclick': [instance: LinkInstanceType, evt: MouseEvent];
    'link:created': [instance: LinkInstanceType[], info: {
        type: 'added';
    }];
    'link:removed': [instance: LinkInstanceType[], info: {
        type: 'removed';
    }];
    'start:connecting': [];
    'blank:dblclick': [evt: MouseEvent];
    'blank:click': [evt: MouseEvent];
    'selection:changed': [selection: Array<NodeInstanceType | LinkInstanceType>];
    'subgraph:enter': [subgraphId: string];
    'subgraph:exit': [subgraphId: string];
    'viewport:change': [viewport: {
        x: number;
        y: number;
        scale: number;
    }];
};
export declare class Graph<NodeDefs extends Record<string, NodeClassType> = {}> extends EventEmitter<GraphEventPayload> implements IGraph<NodeDefs> {
    undoManager: UndoManager;
    skipsUndoManager: boolean;
    container?: HTMLElement;
    _model: BlueprintModel;
    nodeRegistry: NodeRegistry<NodeDefs>;
    private _defaultScale;
    private adapter;
    options: GraphOptions;
    static NodeInstance: typeof NodeInstance;
    static LinkInstance: typeof LinkInstance;
    private clipboard;
    constructor(registry: NodeRegistry<NodeDefs>, options?: GraphOptions);
    get selection(): Set<NodeInstance<typeof import("./Node").Node> | LinkInstance>;
    get scale(): number;
    set scale(value: number);
    get position(): {
        x: number;
        y: number;
    };
    set position(value: {
        x: number;
        y: number;
    });
    get defaultScale(): number;
    set defaultScale(value: number);
    get model(): BlueprintModel;
    set model(value: BlueprintModel);
    protected initialize(): void;
    /** @inheritdoc {@link IGraph.addNode} */
    addNode<T extends keyof NodeDefs>(nodeType: T | NodeDefs[T] | NodeInstanceType, options?: NodeOptions<NodeDefs[T]>): NodeInstance<NodeDefs[T]>;
    /** @inheritdoc {@link IGraph.addLink} */
    addLink<T extends LinkInstance>(link: T): LinkInstance & T;
    /** Adds multiple nodes to the graph. */
    addNodes(nodes: NodeInstanceType[]): NodeInstanceType[];
    /** Adds multiple links to the graph. */
    addLinks(links: LinkInstanceType[]): LinkInstanceType[];
    /** @inheritdoc {@link IGraph.select} */
    select(item: NodeInstanceType | LinkInstance): void;
    /** @inheritdoc {@link IGraph.selectCollection} */
    selectCollection(items: Array<NodeInstanceType | LinkInstance>): void;
    clearSelection(): void;
    /** @inheritdoc {@link IGraph.destroy} */
    destroy(): void;
    /** @inheritdoc {@link IGraph.setContainer} */
    setContainer(container: HTMLElement): void;
    /** @inheritdoc {@link IGraph.deleteSelection} */
    deleteSelection(): void;
    /** @inheritdoc {@link IGraph.removeNodes} */
    removeNodes(nodes: NodeInstanceType[]): void;
    /** @inheritdoc {@link IGraph.removeLinks} */
    removeLinks(links: LinkInstance[]): void;
    copySelection(): void;
    copyCells(cells: Array<NodeInstanceType | LinkInstanceType>): void;
    pasteClipboard(): void;
    /** @inheritdoc {@link IGraph.getLinks} */
    getLinks(): LinkInstance[];
    /** @inheritdoc {@link IGraph.getNodes} */
    getNodes(): NodeInstanceType[];
    /** @inheritdoc {@link IGraph.findLink} */
    findNode(id: string): NodeInstanceType | undefined;
    /** @inheritdoc {@link IGraph.findLink} */
    findLink(id: string): LinkInstanceType | undefined;
    /** @inheritdoc {@link IGraph.zoomIn} */
    zoomIn(): void;
    /** @inheritdoc {@link IGraph.zoomOut} */
    zoomOut(): void;
    /** @inheritdoc {@link IGraph.zoom} */
    zoom(value: number): void;
    /** @inheritdoc {@link IGraph.resetZoom} */
    resetZoom(): void;
    /** @inheritdoc {@link IGraph.createNodeInstance} */
    createNodeInstance<K extends keyof NodeDefs>(nodeType: K | NodeDefs[K], options?: NodeOptions<NodeDefs[K]>): NodeInstance<NodeDefs[K]>;
    /** @inheritdoc {@link IGraph.createLinkInstance} */
    createLinkInstance<T extends LinkInstance>(link: T): LinkInstance & T;
    /** @inheritdoc {@link IGraph.getLinkColor} */
    getLinkColor(_sourceNode: NodeInstanceType, _targetNode: NodeInstanceType, sourcePort: OutputPort, targetPort: OutputPort): string;
    enterSubgraph(subgraphId: string): void;
    exitSubgraph(): void;
    clientToGraphPoint(clientX: number, clientY: number): import("@joint/core").g.Point | {
        x: number;
        y: number;
    };
    /** @inheritdoc {@link IGraph.startTransaction} */
    startTransaction(): void;
    /** @inheritdoc {@link IGraph.commitTransaction} */
    commitTransaction(): void;
    /** @inheritdoc {@link IGraph.commit} */
    commit(...args: Parameters<UndoManager['commit']>): void;
    /** @inheritdoc {@link IGraph.validateConnection} */
    validateConnection(_sourceNode: NodeInstanceType, sourcePort: OutputPort, _targetNode: NodeInstanceType, targetPort: OutputPort): boolean;
    raiseChangedEvent(change: ChangedEventType, propertyName: string, object: unknown, oldValue: unknown, newValue: unknown): void;
    setOptions(options?: Partial<GraphOptions>): void;
    toString(details?: number): string;
    /** @inheritdoc {@link IGraph.toJSON} */
    toJSON(): JsonGraph;
    /** @inheritdoc {@link IGraph.fromJSON} */
    fromJSON(json: JsonGraph | string): BlueprintModel;
    /** @inheritdoc {@link IGraph.clear} */
    clear(): void;
    private initAdapterEvents;
    private callChangedListeners;
    private _validateLinkConnection;
    private _validateNodes;
}
declare class LinkInstance {
    style?: {
        stroke?: string;
        strokeWidth?: number;
    };
    id?: string;
    source: {
        id: string;
        port: string;
    };
    target: {
        id: string;
        port: string;
    };
    constructor(source: {
        id: string;
        port: string;
    }, target: {
        id: string;
        port: string;
    });
    toString(): string;
}
export type NodeInstanceType = InstanceType<typeof Graph.NodeInstance>;
export type LinkInstanceType = InstanceType<typeof Graph.LinkInstance>;
export {};
