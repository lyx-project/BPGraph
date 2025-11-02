import { Node } from '../../Node';
declare class StartNode extends Node {
    static definition: {
        inputs: readonly [];
        outputs: readonly [{
            readonly name: "start";
            readonly type: "exec";
        }, {
            readonly name: "result";
            readonly type: "any";
        }];
        style: {
            header: {
                background: string;
                color: string;
            };
        };
        title: string;
        type: string;
    };
    static readonly type = "start";
}
export declare class EndNode extends Node {
    static definition: {
        inputs: readonly [{
            readonly name: "end";
            readonly type: "exec";
        }];
        outputs: readonly [];
        style: {
            header: {
                background: string;
                color: string;
            };
        };
        title: string;
        type: string;
    };
    static readonly type = "end";
}
declare class SubgraphNode extends Node {
    static definition: {
        inputs: readonly [{
            readonly name: "subgraph";
            readonly type: "exec";
        }, {
            readonly name: "input";
            readonly type: "any";
            readonly label: "";
        }];
        outputs: readonly [{
            readonly name: "subgraph";
            readonly type: "exec";
        }, {
            readonly name: "input";
            readonly type: "any";
            readonly label: "Result";
        }];
        style: {
            header: {
                background: string;
                color: string;
            };
        };
        title: string;
        type: string;
    };
    static readonly type = "subgraph";
}
export declare const builtinNodes: {
    start: typeof StartNode;
    subgraph: typeof SubgraphNode;
};
export type BuiltinNodeType = typeof builtinNodes;
export {};
