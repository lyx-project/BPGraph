import { dia, mvc } from '@joint/core';
type ArgsType = {
    paper: dia.Paper;
    className?: string;
    onSelected: (cells: Array<dia.Element | dia.Link>) => void;
};
export declare class SelectionController extends mvc.Listener<[ArgsType]> {
    private rect?;
    private startPoint?;
    private pointerDownTime;
    private hasMovedEnough;
    private static MIN_MOVE_DISTANCE;
    private static MIN_PRESS_DURATION;
    startListening(): void;
    private onPointerDown;
    private onPointerMove;
    private onPointerUp;
}
export {};
