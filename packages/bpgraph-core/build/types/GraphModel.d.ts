import type { Graph, LinkInstanceType, NodeInstanceType } from './Graph';
import { EventEmitter } from './utils/EventEmitter';
import { ChangedEventType } from './ChangedEvent';
import type { Command } from './UndoManager';
import type { JsonGraph } from './utils/serializer';
import { VariableManager } from './VariableManager';
export declare class GraphModel {
    undoStack: Command[];
    redoStack: Command[];
    id: string;
    nodes: NodeInstanceType[];
    links: LinkInstanceType[];
    viewport: {
        x: number;
        y: number;
        scale: number;
    };
    constructor(id?: string, nodes?: NodeInstanceType[], links?: LinkInstanceType[]);
}
type BlueprintModelEventsPayload = {
    addNodes: [NodeInstanceType[]];
    removeNodes: [NodeInstanceType[]];
    addLinks: [LinkInstanceType[]];
    removeLinks: [LinkInstanceType[]];
};
export declare class BlueprintModel extends EventEmitter<BlueprintModelEventsPayload> {
    variableManager: VariableManager;
    activeGraph: GraphModel;
    private graphStack;
    private graph;
    private _isSettingGraph;
    root: GraphModel;
    subgraphs: Map<string, GraphModel>;
    constructor(root?: GraphModel, subgraphs?: Map<string, GraphModel>);
    get isSettingGraph(): boolean;
    get subgraphStack(): GraphModel[];
    get currentModel(): GraphModel;
    get nodes(): import("./Node").NodeInstance<typeof import("./Node").Node>[];
    setGraph(graph: Graph | null): void;
    private onViewportChange;
    enterSubgraph(subgraphId: string): void;
    exitSubgraph(): void;
    hasSubgraph(subgraphId: string): boolean;
    createSubgraph(subgraphId: string): GraphModel | undefined;
    removeSubgraph(subgraphId: string): void;
    resetToRoot(): void;
    findNode(id: string): import("./Node").NodeInstance<typeof import("./Node").Node> | undefined;
    findLink(id: string): {
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
        toString(): string;
    } | undefined;
    getNodes(): import("./Node").NodeInstance<typeof import("./Node").Node>[];
    getLinks(): {
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
        toString(): string;
    }[];
    addNodes(nodes: NodeInstanceType[]): void;
    removeNodes(nodes: NodeInstanceType[]): void;
    addLinks(links: LinkInstanceType[]): void;
    removeLinks(links: LinkInstanceType[]): void;
    getAllNodes(): import("./Node").NodeInstance<typeof import("./Node").Node>[];
    getAllLinks(): {
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
        toString(): string;
    }[];
    clear(): void;
    toJSON(): JsonGraph;
    static fromJSON(graph: Graph, json: JsonGraph | string): BlueprintModel;
    raiseChanged(change: ChangedEventType, propertyName: string, object: unknown, oldValue: unknown, newValue: unknown): void;
    private generateSubgraphId;
    private handleSubgraphNode;
}
export {};
