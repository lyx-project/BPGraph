import type { Graph, NodeInstanceType, LinkInstanceType } from '../Graph';
import { BlueprintModel } from '../GraphModel';
import type { NodeStyle, LinkStyle } from '../NodeRegistry';
export interface JsonNode {
    position: {
        x: number;
        y: number;
    };
    title?: string;
    id: string;
    type: string;
    nodeType: string;
    data?: unknown;
    values: Record<string, unknown>;
    subgraphId?: string;
    inputs: {
        name: string;
        id: string;
        label?: string;
        type?: string;
        options?: {
            label: string;
            value: string;
        }[];
        showPort?: boolean;
        showInput?: boolean;
    }[];
    outputs: {
        name: string;
        id: string;
        label?: string;
        type?: string;
        showPort?: boolean;
    }[];
    style?: NodeStyle;
}
export interface JsonLink {
    id: string;
    source: {
        id: string;
        port: string;
    };
    target: {
        id: string;
        port: string;
    };
    style?: LinkStyle;
}
export interface JsonVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any';
    value: unknown;
}
export interface JsonGraph {
    nodes: JsonNode[];
    links: JsonLink[];
    variables: JsonVariable[];
    subgraphs: Record<string, {
        nodes: JsonNode[];
        links: JsonLink[];
        viewport: {
            x: number;
            y: number;
            zoom: number;
        };
    }>;
    viewport: {
        x: number;
        y: number;
        zoom: number;
    };
}
export declare function serializeNodes(nodes: NodeInstanceType[]): JsonNode[];
export declare function serializeLinks(links: {
    id?: string;
    source: {
        id: string;
        port: string;
    };
    target: {
        id: string;
        port: string;
    };
    style?: LinkStyle;
}[]): JsonLink[];
export declare function toJSON(model: BlueprintModel): JsonGraph;
export declare function deserializeNodes(graph: Graph, jsonNodes: JsonNode[]): NodeInstanceType[];
export declare function deserializeLinks(graph: Graph, jsonLinks: JsonLink[]): {
    id?: string;
    source: {
        id: string;
        port: string;
    };
    target: {
        id: string;
        port: string;
    };
    style?: LinkStyle;
}[];
export declare function fromJSON(graph: Graph, json: JsonGraph | string): {
    nodes: import("../Node").NodeInstance<typeof import("../Node").Node>[];
    links: {
        id?: string;
        source: {
            id: string;
            port: string;
        };
        target: {
            id: string;
            port: string;
        };
        style?: LinkStyle;
    }[];
    subgraphs: {
        [id: string]: {
            nodes: NodeInstanceType[];
            links: LinkInstanceType[];
            viewport: {
                x: number;
                y: number;
                zoom: number;
            };
        };
    };
    variables: JsonVariable[];
    viewport: {
        x: number;
        y: number;
        zoom: number;
    };
};
