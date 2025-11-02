import { type BuiltinNodeType } from './builtin/nodes';
import type { NodeClassType } from './Node';
export declare class NodeRegistry<NodeDefs extends Record<string, unknown> = BuiltinNodeType> {
    registry: NodeDefs;
    nodeStyle: NodeStyle;
    linkStyle: LinkStyle;
    constructor(nodeStyle?: NodeStyle, linkStyle?: LinkStyle);
    register<K extends string, V extends NodeClassType>(nodeType: K, NodeClass: V): NodeRegistry<NodeDefs & {
        [P in K]: V;
    }>;
    get<T extends keyof NodeDefs>(nodeType: T): NodeDefs[T];
    getNodeTypes(): (keyof NodeDefs)[];
    getNodeClasses(): NodeDefs[keyof NodeDefs][];
    isRegistered<T extends keyof NodeDefs>(nodeType: T | NodeDefs[T]): boolean;
    getStartNodeClass(): NodeClassType;
    getEndNodeClass(): NodeClassType;
}
export interface NodeStyle {
    background?: string;
    borderRadius?: number;
    highlightStroke?: string;
    highlightStrokeWidth?: number;
    header?: {
        textAlign?: 'left' | 'center' | 'right';
        background?: string;
        color?: string;
        height?: number;
        fontSize?: number;
        title?: {
            x?: number;
            y?: number;
        };
    };
    ports?: {
        layout?: {
            rowHeight?: number;
            gap?: number;
            top?: number;
            bottom?: number;
        };
        input?: {
            port?: {
                fill?: string;
                stroke?: string;
                strokeWidth?: number;
                highlightFill?: string;
                highlightStroke?: string;
                highlightStrokeWidth?: number;
            };
            label?: {
                fontSize?: number;
                color?: string;
            };
            editor?: {
                box?: {
                    background?: string;
                    borderColor?: string;
                    borderRadius?: number;
                    fontSize?: number;
                    color?: string;
                    width?: number;
                };
                dropdown?: {
                    background?: string;
                    borderColor?: string;
                    borderRadius?: number;
                    color?: string;
                };
            };
        };
        output?: {
            port?: {
                fill?: string;
                stroke?: string;
                strokeWidth?: number;
                highlightFill?: string;
                highlightStroke?: string;
                highlightStrokeWidth?: number;
            };
            label?: {
                fontSize?: number;
                color?: string;
            };
        };
    };
}
export interface LinkStyle {
    stroke?: string;
    strokeWidth?: number;
    highlightStroke?: string;
    highlightStrokeWidth?: number;
    byPortType?: {
        [portType: string]: string[];
    };
}
