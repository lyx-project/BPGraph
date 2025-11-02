import { dia, mvc } from '@joint/core';
import { Graph } from '../../Graph';
type ArgsType = {
    paper: dia.Paper;
    graph: Graph;
};
export declare class ScrollerController extends mvc.Listener<[ArgsType]> {
    private _viewport;
    private _isDragging;
    private _lastClientX;
    private _lastClientY;
    private _spacePressed;
    private static ZOOM_SENSITIVITY;
    get isDragging(): boolean;
    get viewport(): {
        x: number;
        y: number;
        scale: number;
    };
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
    startListening(): void;
    private initPaperEvents;
    private onKeyDown;
    private onKeyUp;
    private onMouseDown;
    private onMouseMove;
    private onMouseUp;
    private onMouseWheel;
    private updatePaperTransform;
    private onSelectStart;
    stopListening(): void;
}
export {};
