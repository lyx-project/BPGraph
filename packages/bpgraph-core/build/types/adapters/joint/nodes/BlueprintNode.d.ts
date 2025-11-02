import { dia } from '@joint/core';
import type { InputPort, OutputPort } from '../../../Node';
import type { NodeStyle } from '../../../NodeRegistry';
export interface BlueprintNodeAttributes extends dia.Element.Attributes {
    title?: string;
    inputs?: readonly InputPort[];
    outputs?: readonly OutputPort[];
    style?: NodeStyle;
    values?: Record<string, unknown>;
}
export declare class BlueprintNode extends dia.Element<BlueprintNodeAttributes> {
    constructor(attributes?: BlueprintNodeAttributes, options?: {});
    initialize(...args: Parameters<dia.Element['initialize']>): void;
    title(value: string): void;
    setStyle(style: NodeStyle): void;
    setValues(values: Record<string, unknown>): void;
    buildPortItems(opt?: {}): void;
    buildPortItem(port: InputPort | OutputPort, group: 'in' | 'out'): dia.Element.Port;
    renderFormWrap(input: InputPort): string;
    updateSizeByContent(): void;
}
