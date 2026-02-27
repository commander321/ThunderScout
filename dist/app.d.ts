import * as components from "./components.js";
export declare function renderPreview(): void;
/**
 * Closes the designer and activates runtime mode
 */
export declare function closeDesigner(): void;
/**
 * Opens the designer from runtime mode
 */
export declare function openDesigner(): void;
/**
 * Save the current configuration and download it as a JSON file
 */
export declare function save(): void;
/**
 * Adds the listener to the close design mode button
 */
export declare function setupCloseButton(): void;
export declare function setupEditButton(): void;
export declare function setupSaveButton(): void;
/**
 * Creates a component (and all it's children) from a JSON string. Used for loading from files.
 */
export declare function loadComponent(data: any): components.Component;
export declare function setupLoadButton(): void;
export declare function isRuntimeMode(): boolean;
//# sourceMappingURL=app.d.ts.map