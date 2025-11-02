export type VariableDef = {
    name: string;
    type: 'string';
    value: string;
} | {
    name: string;
    type: 'number';
    value: number;
} | {
    name: string;
    type: 'boolean';
    value: boolean;
} | {
    name: string;
    type: 'array';
    value: unknown[];
} | {
    name: string;
    type: 'object';
    value: Record<string, unknown>;
} | {
    name: string;
    type: 'any';
    value: unknown;
};
export declare class VariableManager {
    private variables;
    setVariable(variable: VariableDef): this;
    setVariableValue(name: string, value: VariableDef['value']): this;
    getVariable(name: string): VariableDef | undefined;
    getVariableValue<T>(name: string): T | undefined;
    deleteVariable(name: string): this;
    getAllVariables(): VariableDef[];
    clear(): this;
}
