import { dia } from '@joint/core';
import { BlueprintNode } from './nodes/BlueprintNode';
import { BlueprintNodeView } from './nodes/BlueprintNodeView';
import { ScrollerController } from './ScrollerController';
import { SelectionController } from './SelectionController';
import { GroupEffectController } from './GroupEffectController';
import type { GraphAdapter } from '..//GraphAdapter';
import type { NodeInstanceType } from '../../Graph';
import type { NodeStyle, LinkStyle } from '../../NodeRegistry';
import type { LinkInstanceType } from '../../Graph';
export declare const custom: {
    readonly BlueprintNode: typeof BlueprintNode;
    readonly BlueprintNodeView: typeof BlueprintNodeView;
};
interface IJointGraph {
}
export declare class JointGraph implements IJointGraph {
    graph: dia.Graph;
    paper: dia.Paper;
    scrollerController: ScrollerController;
    selectionController: SelectionController;
    groupEffectController: GroupEffectController;
    adapter: GraphAdapter;
    constructor(adapter: GraphAdapter, options: dia.Paper.Options);
    initialize(): void;
    initializeControllers(): void;
    addNode(instance: NodeInstanceType, style?: NodeStyle): BlueprintNode;
    setContainer(container: HTMLElement): void;
    addLink(link: LinkInstanceType, style?: LinkStyle): dia.Link<dia.Link.Attributes, dia.ModelSetOptions>;
    removeCells(cells: dia.Cell[]): void;
    findNode(id: string): BlueprintNode;
    highlightCells(cells: dia.Cell[]): void;
    unhighlightCells(cells: dia.Cell[]): void;
    groupCells(cells: Array<dia.Element | dia.Link>): void;
    ungroupCells(cells: Array<dia.Element | dia.Link>): void;
    clearGroups(): void;
    clearHighlights(): void;
    destroy(): void;
    clear(): void;
    private onKeyDown;
    private onKeyUp;
}
export {};
