import { ChangedEvent } from './ChangedEvent';
import type { NodeInstanceType, LinkInstanceType } from './Graph';
import { Graph } from './Graph';
export interface Command {
    undo: () => void;
    redo: () => void;
}
export declare class AddNodeCommand implements Command {
    private graph;
    private nodes;
    constructor(graph: Graph, nodes: NodeInstanceType[]);
    undo(): void;
    redo(): void;
}
export declare class RemoveNodeCommand implements Command {
    private graph;
    private nodes;
    constructor(graph: Graph, nodes: NodeInstanceType[]);
    undo(): void;
    redo(): void;
}
export declare class AddLinkCommand implements Command {
    graph: Graph;
    links: LinkInstanceType[];
    constructor(graph: Graph, links: LinkInstanceType[]);
    undo(): void;
    redo(): void;
}
export declare class RemoveLinkCommand implements Command {
    graph: Graph;
    links: LinkInstanceType[];
    constructor(graph: Graph, links: LinkInstanceType[]);
    undo(): void;
    redo(): void;
}
export declare class PropertyChangeCommand implements Command {
    node: NodeInstanceType;
    property: string;
    from: unknown;
    to: unknown;
    constructor(node: NodeInstanceType, property: string, from: unknown, to: unknown);
    undo(): void;
    redo(): void;
}
export declare class UndoManager {
    undoStack: Command[];
    redoStack: Command[];
    private transactionStack;
    private _isUndoingRedoing;
    private graph;
    constructor(graph: Graph);
    get isUndoingRedoing(): boolean;
    record(command: Command): void;
    /**
     * Start a transaction to group multiple commands into one.
     */
    startTransaction(): void;
    /**
     * Commit the current transaction.
     */
    commitTransaction(): void;
    commit(callback: () => void): void;
    createCommand(type: 'addNodes' | 'removeNodes' | 'addLinks' | 'removeLinks' | 'propertyChange', propertyName: string, target: unknown, oldvalue?: unknown, newvalue?: unknown): Command;
    handleChanged(e: ChangedEvent): void;
    undo(): void;
    canUndo(): boolean;
    redo(): void;
    canRedo(): boolean;
    clear(): void;
}
