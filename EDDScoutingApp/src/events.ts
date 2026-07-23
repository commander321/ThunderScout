import * as components from "./components.js";
import * as matchdata from "./matchdata.js"
import * as matchevents from "./matchevents.js";
import * as app from "./app.js";
import * as editor from"./editor.js";
import * as style from "./style.js";

export class Event {
    trigger: EventTrigger;
    actions: EventAction[];

    constructor(trigger: EventTrigger) {
        this.trigger = trigger;
        this.actions = [];
    }

    /**
     * Runs the event when it is triggered
     */
    run(): void {
        if (!app.isRuntimeMode()) return;
        for (const action of this.actions) {
            action.onTrigger();
        }
    }
}

export abstract class EventAction {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Code that runs when the event is triggered
     */
    abstract onTrigger(): void;

    /**
     * Adds the properties to the properties div
     */
    abstract addProperties(div: HTMLDivElement): void;
}

/**
 * Ways an event can be triggered
 */
export const EventTrigger = {
    COMPONENT_CLICK: "On component click",
    COMPONENT_HOVER: "On component hover",
    OTHER_EVENT: "Triggered by another event",
} as const;

export type EventTrigger = typeof EventTrigger[keyof typeof EventTrigger];



//=======================
// Event Actions
//=======================

/**
 * Records a match event of a specific type/group
 */
export class ActionRecordMatchEvent extends EventAction {
    matchEventType: string;
    matchEventGroup: string;

    constructor() {
        super("Add match event");
        this.matchEventType = "";
        this.matchEventGroup = "";        
    }

    onTrigger(): void {
        matchdata.getCurrentMatch().addEvent(new matchevents.MatchEvent(this.matchEventType, this.matchEventGroup));
        console.log(matchdata.getCurrentMatch().matchEvents);
        components.updateCounters(this.matchEventType);
    }

    addProperties(div: HTMLDivElement): void {
        let typeDiv = document.createElement("div");
        typeDiv.innerHTML = "Match Event:"
        let typeInput = document.createElement("input");
        typeInput.type = "text";
        typeInput.value = this.matchEventType || "";
        typeInput.onchange = (e) => {
            e.stopPropagation();
            this.matchEventType = typeInput.value || "";
            app.renderPreview();
        }
        typeDiv.appendChild(typeInput);

        let groupDiv = document.createElement("div");
        groupDiv.innerHTML = "Match Event Group:"
        let groupInput = document.createElement("input");
        groupInput.type = "text";
        groupInput.value = this.matchEventGroup || "";
        groupInput.onchange = (e) => {
            e.stopPropagation();
            this.matchEventGroup = groupInput.value || "";
            app.renderPreview();
        }
        groupDiv.appendChild(groupInput);

        div.appendChild(typeDiv);
        div.appendChild(groupDiv);
    }
}

/**
 * Triggers another event
 */
export class ActionTriggerEvent extends EventAction {
    event: Event | undefined;

    constructor() {
        super("Trigger an event");
    }

    onTrigger(): void {
        if (!this.event) return;
        if (this.event.trigger == EventTrigger.OTHER_EVENT) this.event.run();
    }

    addProperties(div: HTMLDivElement): void {

    }
}

/**
 * Change the style of a component
 */
export class ActionStyleChange extends EventAction {

    component: components.Component | undefined;
    element: HTMLElement | undefined;
    styles: Record<string, any>;

    constructor() {
        super("Change component style");

        this.styles = {};
    }

    onTrigger(): void {
        if (!this.element || !this.component) return;
        for (const styleType of this.component.styleTypes) {
            if (!(styleType.style in this.styles)) continue;
            styleType.applyToNode(this.element, this.styles);
        }
    }

    addProperties(div: HTMLDivElement): void {
        let content = document.createElement("div");
        content.style.overflowY = "auto";
        content.style.height = "100%";

        let idDiv = document.createElement("div");
        idDiv.innerHTML = "Component:"
        let idInput = document.createElement("input");
        idInput.type = "text";
        idInput.value = this.component?.id || "";
        idInput.classList.add("editor-event-action-properties-input");
        idDiv.appendChild(idInput);
        content.appendChild(idDiv);

        let hr = document.createElement("hr");
        content.appendChild(hr);

        //add all styles
        if (!this.component) return;
        for (const styleType of this.component.styleTypes) {
            if (style.actionPropertiesExclude.includes(styleType)) continue;

            let styleDiv = document.createElement("div");
            styleDiv.innerHTML = styleType.displayName;
            styleDiv.style.display = "flex";

            if (styleType.options) {
                //dropdowns
                let select = document.createElement("select");
                select.style.width = "30%";
                select.style.marginLeft = "10%";
                styleType.options.forEach(opt => {
                    let option = document.createElement("option");
                    option.value = opt;
                    option.textContent = opt;
                    select.appendChild(option);
                });
                select.value = this.styles[styleType.style] || styleType.defaultValue;
                select.onchange = () => {
                    this.styles[styleType.style] = select.value;
                }

                styleDiv.appendChild(select);
            } else if (style.pixelPercentTypes.includes(styleType)) {
                //pixel and percent inputs like width and height
                let div = document.createElement("div");
                div.classList.add("editor-width-height");
                div.style.width = "30%";
                div.style.marginLeft = "10%";
            
                let numberInput = document.createElement("input");
                numberInput.classList.add("editor-width-height-input");
                numberInput.type = "number";
                numberInput.min = "0";
                numberInput.max = "9999";
                numberInput.style.width = "60%";
                numberInput.value = this.styles[styleType.style] || styleType.defaultValue;
                numberInput.onchange = () => {
                    this.styles[styleType.style] = numberInput.value;
                    app.renderPreview();
                }
            
                let divider = document.createElement("div");
                divider.classList.add("textbox-editor-divider");
            
                let typeDropdown = document.createElement("select");
                typeDropdown.classList.add("editor-width-height-input");
                typeDropdown.style.fontSize = "14px";
                typeDropdown.style.width = "40%";
                typeDropdown.value = this.styles[styleType.style + "Type"] || "px";
                let px = document.createElement("option");
                px.value = "px";
                px.textContent = "px";
                typeDropdown.appendChild(px);
                let percent = document.createElement("option");
                percent.value = "%";
                percent.textContent = "%";
                typeDropdown.appendChild(percent);
                typeDropdown.onchange = () => {
                    this.styles[styleType.style + "Type"] = typeDropdown.value;
                    app.renderPreview();
                }
            
                div.appendChild(numberInput);
                div.appendChild(divider);
                div.appendChild(typeDropdown);
            
                styleDiv.appendChild(div);
            } else {
                //normal inputs
                let input = document.createElement("input");
                input.type = styleType.inputType;
                input.style.width = "30%";
                input.style.marginLeft = "10%";
                input.value = this.styles[styleType.style] || styleType.defaultValue;
                input.onchange = () => {
                    this.styles[styleType.style] = input.value;
                }
                styleDiv.appendChild(input);
            }

            content.appendChild(styleDiv);
        }

        div.appendChild(content);
    }
}

//add this later
export class ActionTextChange extends EventAction {

    component: components.Component | undefined;
    element: HTMLElement | undefined;
    styles: Record<string, any>;
    text: string;

    constructor() {
        super("Change component text");
        this.styles = {};
        this.text = "";

        if (!this.element || !this.component) return;
    }

    onTrigger(): void {

    }

    addProperties(div: HTMLDivElement): void {
        let content = document.createElement("div");
        content.style.overflowY = "auto";
        content.style.height = "100%";

        //add text editor
        
    }
    
}


//=======================
// End of Actions
//=======================

//registry for actions, same as how components work
export const eventActionTypeRegistry = {
    matchEvent: ActionRecordMatchEvent,
    triggerEvent: ActionTriggerEvent,
    styleChange: ActionStyleChange,
    textChange: ActionTextChange,
} as const;

export type EventActionType = keyof typeof eventActionTypeRegistry;

export const EVENT_ACTION_TYPES: string[][] = [
  //[registryName, displayName, description]
  ["matchEvent", "Add match event", ""],
  ["triggerEvent", "Trigger an event", ""],
  ["styleChange", "Change component style", ""],
  ["textChange", "Change component text", ""],
];



/**
 * Add events from a component to its rendered HTML Element
 */
export function applyComponentEvents(component: components.Component, element: HTMLElement) {
    for (const event of component.componentEvents) {
        switch (event.trigger) {
            case EventTrigger.COMPONENT_CLICK:
                element.onclick = (e) => {
                    e.stopPropagation();
                    event.run();
                }
                break;
            case EventTrigger.COMPONENT_HOVER:
                element.onmouseover = (e) => {
                    e.stopPropagation();
                    event.run();
                }
            default:
                break;
        }
        
        //set any necessary properties for actions
        for (const action of event.actions) {
            if (action instanceof ActionStyleChange) action.element = element;
        }
    }
}

/*
Lets plan events here!

Components have a list of their corresponding events
Events have triggers and a list of actions that happen when they are run
When a component is loaded, it's triggers are applied by passing the component and HTML elements into the apply component events function
Triggers are an enum with things like Click, Hover, etc.
Each event action is it's own class (record match event, change component style, etc)


*/