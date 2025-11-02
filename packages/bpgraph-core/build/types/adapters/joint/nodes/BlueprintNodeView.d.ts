import { dia } from '@joint/core';
export declare class BlueprintNodeView extends dia.ElementView {
    private highlightedPorts;
    private dropdownElMap;
    private currentlyOpenDropdown;
    initialize(...args: Parameters<dia.ElementView['initialize']>): void;
    onRender(): void;
    otherClick: (evt: MouseEvent) => void;
    createDropdown(inputId: string, inputName: string, options?: readonly {
        label: string;
        value: string;
    }[]): void;
    updateOptions(inputId: string, inputName: string, options: readonly {
        label: string;
        value: string;
    }[]): void;
    showDropdown: (evt: Event) => void;
    hideDropdown: () => void;
    filterDropdown: (evt: Event) => void;
    renderMarkup(): this;
    validateNumber(endInput?: boolean): (evt: Event) => void;
    updateFieldValue(type: string): (evt: Event) => void;
    setInputValue(inputName: string, value: unknown): void;
    applyPortHighlights(): void;
    _applyPortHighlights(): void;
    refreshTitle(): void;
    refreshDomValue(name: string, step?: number): void;
    highlightPort(portId: string, retry?: number): void;
    unhighlightPort(portId: string): void;
}
