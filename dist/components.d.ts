export declare abstract class Component {
    id: string;
    type: string;
    style: Record<string, any>;
    children: Component[];
    eventType: string;
    constructor(type: string);
    /**
     * Creates the editor for the component
     */
    abstract addEditorFeatures(): void;
    /**
     * Renders the component for either editor mode or runtime mode
     */
    abstract render(div: HTMLDivElement): void;
}
export declare class Root extends Component {
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
export declare class Label extends Component {
    text: string;
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
export declare class Counter extends Component {
    text: string;
    value: number;
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
export declare class Button extends Component {
    text: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
export declare class Section extends Component {
    thickness: number;
    color: string;
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
export declare class Dropdown extends Component {
    text: string;
    options: string[];
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
export declare class Layout extends Component {
    direction: string;
    text: string;
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
/**
 * All types of components
 */
export declare const componentRegistry: {
    readonly root: typeof Root;
    readonly label: typeof Label;
    readonly counter: typeof Counter;
    readonly button: typeof Button;
    readonly section: typeof Section;
    readonly dropdown: typeof Dropdown;
    readonly layout: typeof Layout;
};
export type ComponentType = keyof typeof componentRegistry;
/**
 * Creates a component from a specific type (from componentRegistry)
 */
export declare function createComponent(type: ComponentType): Component;
//# sourceMappingURL=components.d.ts.map