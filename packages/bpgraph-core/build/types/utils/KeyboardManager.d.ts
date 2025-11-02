type KeyboardShortcutHandler = (evt: KeyboardEvent) => void;
export declare class KeyboardManager {
    private shortcuts;
    private enabled;
    private container;
    constructor(container?: HTMLElement);
    registerShortcut(combo: string, handler: KeyboardShortcutHandler): void;
    unregisterShortcut(combo: string): void;
    enable(): void;
    disable(): void;
    private normalizeCombo;
    private onKeyDown;
    destroy(): void;
}
export {};
