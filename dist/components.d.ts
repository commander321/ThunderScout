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
    static counters: Counter[];
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
    update(): void;
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
    options: string[];
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
export declare class Checkbox extends Component {
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
export declare class TeamNum extends Component {
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
export declare class TextBox extends Component {
    key: string;
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
export declare class MatchNum extends Component {
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
export declare class MatchType extends Component {
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
export declare class AllianceStation extends Component {
    constructor();
    addEditorFeatures(): void;
    render(div: HTMLDivElement): void;
}
export declare class ResetButton extends Component {
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
    readonly checkbox: typeof Checkbox;
    readonly textbox: typeof TextBox;
    readonly layout: typeof Layout;
    readonly teamnum: typeof TeamNum;
    readonly matchnum: typeof MatchNum;
    readonly matchtype: typeof MatchType;
    readonly resetbutton: typeof ResetButton;
    readonly alliancestation: typeof AllianceStation;
};
export type ComponentType = keyof typeof componentRegistry;
/**
 * Creates a component from a specific type (from componentRegistry)
 */
export declare function createComponent(type: ComponentType): Component;
//# sourceMappingURL=components.d.ts.map