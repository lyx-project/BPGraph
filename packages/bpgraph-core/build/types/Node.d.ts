import { type ExecutorFn, EventFn } from './engine/Runtime';
import { type Graph } from './Graph';
import { NodeToolsView } from './NodeToolsView';
import type { NodeStyle } from './NodeRegistry';
interface Port {
    name: string;
    label?: string;
    id?: string;
    showPort?: boolean;
}
export interface InputPort extends Port {
    type: keyof TypeMap;
    showInput?: boolean;
    options?: ((values: Record<string, unknown>) => {
        label: string;
        value: string;
    }[] | Promise<{
        label: string;
        value: string;
    }[]>) | (readonly {
        label: string;
        value: string;
    }[]);
    _options?: readonly {
        label: string;
        value: string;
    }[];
}
export interface OutputPort extends Port {
    type: 'exec' | 'spacer' | 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any' | 'textarea';
}
type TypeMap = {
    string: string;
    number: number;
    boolean: boolean;
    select: string;
    array: unknown[];
    exec: never;
    spacer: never;
    any: unknown;
    textarea: string;
    object: Record<string, unknown>;
};
export interface ExecutorArgs<T extends NodeClassType> {
    getInput: (name: T['definition']['inputs'][number]['name']) => unknown;
    setOutput: (name: T['definition']['outputs'][number]['name'], value: unknown) => void;
    next: () => void;
    services: Record<string, unknown>;
}
export type NodeClassType = typeof Node;
export type InputsToValues<T extends {
    inputs: readonly {
        name: string;
        type: keyof TypeMap;
    }[];
}> = T['inputs'] extends readonly unknown[] ? {
    [K in T['inputs'][number] as K['name']]: TypeMap[K['type']];
} : {};
export type NodeOptions<T extends NodeClassType> = {
    id?: string;
    title?: string;
    position?: {
        x: number;
        y: number;
    };
    data?: unknown;
    values?: Partial<InputsToValues<T['definition']>>;
    style?: NodeStyle;
    inputs?: InputPort[];
    outputs?: OutputPort[];
    subgraphId?: string;
};
export declare abstract class Node {
    static definition: {
        inputs: readonly InputPort[];
        outputs: readonly OutputPort[];
        title?: string;
        style?: NodeStyle;
        type?: string;
    };
    static id: string;
    static executor?: ExecutorFn | string;
    static readonly type: string;
    static onEvent?: EventFn;
}
export declare class NodeInstance<T extends NodeClassType> {
    type: string;
    nodeType: string;
    _values: InputsToValues<T['definition']>;
    definition: T['definition'];
    id: string;
    data: unknown;
    subgraphId?: string;
    _bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
        left: number;
        top: number;
    } | null;
    states: {
        position: {
            x: number;
            y: number;
        };
        title?: string;
        style?: NodeStyle;
        inputs?: T['definition']['inputs'];
        outputs?: T['definition']['outputs'];
    };
    graph?: Graph;
    toolsView: NodeToolsView | null;
    constructor(Cls: T, options?: NodeOptions<T>);
    get bbox(): {
        x: number;
        y: number;
        width: number;
        height: number;
        left: number;
        top: number;
    } | null;
    get position(): {
        x: number;
        y: number;
    };
    set position(value: {
        x: number;
        y: number;
    });
    get title(): string;
    set title(value: string);
    get values(): Partial<InputsToValues<T["definition"]>>;
    set values(values: Partial<InputsToValues<T['definition']>>);
    get inputs(): T["definition"]["inputs"];
    set inputs(inputs: T['definition']['inputs']);
    get outputs(): T["definition"]["outputs"];
    set outputs(outputs: T['definition']['outputs']);
    get style(): NodeStyle;
    set style(style: NodeStyle);
    showTools(): void;
    hideTools(): void;
    addTools(toolsView: NodeToolsView): void;
    removeTools(): void;
    getInput(name: T['definition']['inputs'][number]['name']): InputPort | undefined;
    getOutput(name: T['definition']['outputs'][number]['name']): OutputPort | undefined;
    setGraph(graph: Graph): void;
    toString(): string;
    private checkValues;
    private raiseChangedEvent;
}
export {};
