import { fromJSON, toJSON, serializeNodes, serializeLinks, deserializeNodes, deserializeLinks } from './serializer';
export declare function mergeDeep<T extends Record<string, unknown>, U extends Record<string, unknown>>(target: T, source: U): T & U;
export declare const Util: {
    mergeDeep: typeof mergeDeep;
    toJSON: typeof toJSON;
    fromJSON: typeof fromJSON;
    serializeLinks: typeof serializeLinks;
    serializeNodes: typeof serializeNodes;
    deserializeLinks: typeof deserializeLinks;
    deserializeNodes: typeof deserializeNodes;
};
