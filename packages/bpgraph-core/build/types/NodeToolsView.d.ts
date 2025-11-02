import type { NodeInstanceType } from './Graph';
import { EventEmitter } from './utils/EventEmitter';
export declare class NodeToolsView {
    node?: NodeInstanceType;
    element: HTMLElement;
    tools: NodeToolView[];
    constructor(tools: NodeToolView[]);
    remove(): void;
    configure(node: NodeInstanceType): void;
    onDragMove: () => void;
    update(): void;
    isMounted(): boolean;
    mount(): void;
    unmount(): void;
    updatePosition(): void;
    show(): void;
    hide(): void;
}
type NodeToolViewEventsPayload = {
    position: [number, number];
};
export declare abstract class NodeToolView extends EventEmitter<NodeToolViewEventsPayload> {
    element: HTMLElement;
    node?: NodeInstanceType;
    parentView?: NodeToolsView;
    constructor();
    configure(node: NodeInstanceType, parent: NodeToolsView): void;
    show(): void;
    hide(): void;
    remove(): void;
}
export {};
