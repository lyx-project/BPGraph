import { JointGraph } from './joint/JointGraph';
import { type GraphOptions, Graph, type NodeInstanceType, type LinkInstanceType } from '../Graph';
import type { NodeStyle, LinkStyle } from '../NodeRegistry';
import { BlueprintNode } from './joint/nodes/BlueprintNode';
import { EventEmitter } from '../utils/EventEmitter';
import type { dia } from '@joint/core';
interface IGraphAdapter {
    addNode(node: NodeInstanceType): void;
    addLink(link: LinkInstanceType): void;
    destroy(): void;
}
type AdpterEventPayload = {
    'node:click': [node: NodeInstanceType, evt: MouseEvent];
    'node:dblclick': [node: NodeInstanceType, evt: MouseEvent];
    'link:click': [link: LinkInstanceType, evt: MouseEvent];
    'link:dblclick': [link: LinkInstanceType, evt: MouseEvent];
    'blank:click': [evt: MouseEvent];
    'blank:dblclick': [evt: MouseEvent];
};
export declare class GraphAdapter extends EventEmitter<AdpterEventPayload> implements IGraphAdapter {
    joint: JointGraph;
    cellsMap: Map<string, {
        cell: NodeInstanceType | LinkInstanceType;
        jointCell: BlueprintNode | dia.Link;
    }>;
    selection: Set<NodeInstanceType | LinkInstanceType>;
    private keyboardManager?;
    graph: Graph;
    jointSelection: Set<BlueprintNode | dia.Link>;
    constructor(graph: Graph, options?: GraphOptions);
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
    initializeTools(): void;
    setContainer(container: HTMLElement): void;
    select(item: NodeInstanceType | LinkInstanceType | string): void;
    selectCollection(items: Array<NodeInstanceType | LinkInstanceType>): void;
    unselect(item: NodeInstanceType | LinkInstanceType | string): void;
    clearSelection(): void;
    addNode(instance: NodeInstanceType, style?: NodeStyle): void;
    addLink(link: LinkInstanceType, style?: LinkStyle): void;
    removeCells(nodes: Array<NodeInstanceType | LinkInstanceType>): void;
    destroy(): void;
    getLinks(): LinkInstanceType[];
    getNodes(): NodeInstanceType[];
    findNode(id: string): NodeInstanceType | undefined;
    findLink(id: string): LinkInstanceType | undefined;
    zoomIn(): void;
    zoomOut(): void;
    zoom(value: number): void;
    resetZoom(defaultScale?: number): void;
    clientToGraphPoint(clientX: number, clientY: number): import("@joint/core").g.Point;
    private initKeyboardShortcuts;
    private generatePortId;
    generateNodeId(): string;
    generateLinkId(): string;
    setOptions(options: Partial<GraphOptions>): void;
    private initGraphEvents;
    getElementBBox(elementView: dia.ElementView): {
        left: number;
        top: number;
        width: number;
        height: number;
        x: number;
        y: number;
    };
    selectionChanged(): void;
    clear(): void;
}
export {};
