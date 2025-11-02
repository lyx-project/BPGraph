import { dia, mvc } from '@joint/core';
import { GraphAdapter } from '../GraphAdapter';
type ArgsType = {
    paper: dia.Paper;
    adapter: GraphAdapter;
    className?: string;
};
export declare class GroupEffectController extends mvc.Listener<[ArgsType]> {
    private rect?;
    private cells;
    private nodes;
    private dragStartPoint?;
    private dragStartClientPoint?;
    private cellsStartPositions;
    private rectStartPos?;
    private moveNodes;
    startListening(): void;
    private onScale;
    private onTranslate;
    private onElementPointerDown;
    private onElementPointerMove;
    private onElementPointerUp;
    groupCells(cells: Array<dia.Element | dia.Link>): void;
    ungroupCells(cells: Array<dia.Element | dia.Link>): void;
    clearGroups(): void;
    private updateCellsHighlight;
    private drawGroupEffect;
    private updateGroupEffect;
    private clearGroupEffect;
    private calculateBoundingBox;
}
export {};
