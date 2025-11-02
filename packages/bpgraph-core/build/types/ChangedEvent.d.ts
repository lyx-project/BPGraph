import { Graph } from "./Graph";
export declare const ChangedEventType: {
    readonly Property: 1;
    readonly Insert: 2;
    readonly Delete: 3;
};
export type ChangedEventType = (typeof ChangedEventType)[keyof typeof ChangedEventType];
export declare class ChangedEvent {
    static Property: 1;
    static Insert: 2;
    static Delete: 3;
    private _change;
    private _graph;
    private _propertyName;
    private _oldValue?;
    private _newValue?;
    private _object?;
    get change(): ChangedEventType;
    set change(value: ChangedEventType);
    get graph(): Graph;
    set graph(value: Graph);
    get propertyName(): string;
    set propertyName(value: string);
    get oldValue(): unknown;
    set oldValue(value: unknown);
    get newValue(): unknown;
    set newValue(value: unknown);
    get object(): unknown;
    set object(value: unknown);
    constructor();
}
