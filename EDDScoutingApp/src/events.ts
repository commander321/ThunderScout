import * as Components from "./components.js";
import * as MatchData from "./data/matchdata.js"
import * as MatchEvents from "./data/matchevents.js";
import * as App from "./app.js";
import * as Editor from"./editor.js";
import * as Style from "./style.js";
import {createElement} from "./app.js";

export class Event {
    open: boolean;
    trigger: EventTrigger;
    actions: EventAction[];

    constructor(trigger: EventTrigger) {
        this.trigger = trigger;
        this.actions = [];
        this.open = true;
    }

    /**
     * Runs the event when it is triggered
     */
    run(): void {
        if (!App.isPreviewMode()) return;
        for (const action of this.actions) {
            action.onTrigger();
        }
    }
}

export abstract class EventAction {
    type: string;
    open: boolean;

    constructor(type: string) {
        this.type = type;
        this.open = false;
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
    matchEventType: MatchEvents.EventPointer;
    matchEventGroup: MatchEvents.EventPointer;

    constructor() {
        super("matchEvent");
        this.matchEventType = {type: "type", value: "None"};
        this.matchEventGroup = {type:"group", value: "None"};
    }

    onTrigger(): void {
        MatchData.getCurrentMatch().addEvent(new MatchEvents.MatchEvent(this.matchEventType.value, this.matchEventGroup.value));
        console.log(MatchData.getCurrentMatch().matchEvents);
        Components.updateCounters(this.matchEventType.value);
    }

    addProperties(div: HTMLDivElement): void {
        let typeDiv = createElement("div", ["editor-event-action-properties-div"], div);
        typeDiv.innerHTML = "Event Type:";
        Editor.addMatchEventSelection(this.matchEventType, typeDiv);

        let groupDiv = createElement("div", ["editor-event-action-properties-div"], div);
        groupDiv.innerHTML = "Event Group:";
        Editor.addMatchEventSelection(this.matchEventGroup, groupDiv);

    }
}

/**
 * Triggers another event
 */
export class ActionTriggerEvent extends EventAction {
    event: Event | undefined;

    constructor() {
        super("triggerEvent");
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
    componentID: string;
    styles: Record<string, any>;

    constructor() {
        super("styleChange");

        this.styles = {};
        this.componentID = "";
    }

    onTrigger(): void {
        if (!this.componentID || this.componentID.length == 0) return;
        const component = App.findComponent(this.componentID).component;
        if (!component || !(component instanceof Components.Component)) return;

        component.applyStyles(this.styles);
    }

    addProperties(div: HTMLDivElement): void {
        let content = document.createElement("div");
        content.style.overflowY = "auto";
        content.style.maxHeight = "200px";

        let idDiv = document.createElement("div");
        idDiv.innerHTML = "Component:"
        idDiv.classList.add("editor-event-action-properties-div");
        let componentSelect = document.createElement("button");
        componentSelect.textContent = this.componentID;
        componentSelect.classList.add("editor-event-action-component-select");
        componentSelect.onclick = (e) => {
            e.stopPropagation();
            const eventsModal = document.querySelectorAll(".modal-events")[0];
            if (!eventsModal || !(eventsModal instanceof HTMLElement)) return;
            eventsModal.classList.add("hidden");
            const overlay = document.querySelectorAll(".overlay-events")[0];
            if (!overlay || !(overlay instanceof HTMLElement)) return;
            overlay.classList.add("hidden");

            //have the user select a component
            App.userSelectComponent(this.componentID, (newID: any) => {
                eventsModal.classList.remove("hidden");
                overlay.classList.remove("hidden");

                if (typeof newID != "string") return;
                this.componentID = newID;

                //refresh the menu (idk if this is the best way to do it)
                div.innerHTML = "";
                this.addProperties(div);
            });
        }
        idDiv.appendChild(componentSelect);
        content.appendChild(idDiv);

        let hr = document.createElement("hr");
        content.appendChild(hr);

        //add all styles
        if (!this.componentID || this.componentID.length == 0) return;
        const component = App.findComponent(this.componentID).component;
        if (!component || !(component instanceof Components.Component)) return;
    
        for (const styleType of component.styleTypes) {
            if (Style.actionPropertiesExclude.includes(styleType)) continue;

            let styleDiv = document.createElement("div");
            styleDiv.innerHTML = styleType.displayName;
            styleDiv.classList.add("editor-event-action-properties-div");

            if (styleType.options) {
                //dropdowns
                let select = document.createElement("select");
                select.classList.add("editor-event-action-style-input");
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
            } else if (Style.pixelPercentTypes.includes(styleType)) {
                //pixel and percent inputs like width and height
                let div = document.createElement("div");
                div.classList.add("editor-width-height", "editor-event-action-style-input");
            
                let numberInput = document.createElement("input");
                numberInput.classList.add("editor-width-height-input");
                numberInput.type = "number";
                numberInput.min = "0";
                numberInput.max = "9999";
                numberInput.style.width = "60%";
                numberInput.value = this.styles[styleType.style] || styleType.defaultValue;
                numberInput.onchange = () => {
                    this.styles[styleType.style] = numberInput.value;
                    //app.renderPreview();
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
                    //app.renderPreview();
                }
            
                div.appendChild(numberInput);
                div.appendChild(divider);
                div.appendChild(typeDropdown);
            
                styleDiv.appendChild(div);
            } else {
                //normal inputs
                let input = document.createElement("input");
                input.type = styleType.inputType;
                input.classList.add("editor-event-action-style-input");
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

/**
 * Saves the current match and resets to the next one
 */
export class ActionSaveMatchData extends EventAction {
    constructor() {
        super("saveMatchData");
    }

    onTrigger(): void {
        document.documentElement.scrollTop = 0;

        MatchData.saveCurrentMatch();
        console.log(MatchData.getCurrentMatch());

        const editorEnabled: boolean = App.getEditorEnabled();
        App.setEditorEnabled(true);
        App.openEditMode();
        App.renderPreview();
        App.openPreviewMode();
        App.setEditorEnabled(editorEnabled);
        if (editorEnabled) {
            document.getElementById("edit")?.classList.remove("hidden")
        } else {
            document.getElementById("edit")?.classList.add("hidden")
        }
    }

    addProperties(div: HTMLDivElement): void {
        
    }
}

/**
 * Downloads all saved match data as a JSON file
 */
export class ActionDownloadMatchData extends EventAction {
    constructor() {
        super("downloadMatchData");
    }

    onTrigger(): void {
        MatchData.exportMatchData();
    }

    addProperties(div: HTMLDivElement): void {
        
    }
}

//add this later
export class ActionTextChange extends EventAction {
    component: Components.Component | undefined;
    styles: Record<string, any>;
    text: string;

    constructor() {
        super("textChange");
        this.styles = {};
        this.text = "";
    }

    onTrigger(): void {

    }

    addProperties(div: HTMLDivElement): void {
        let content = document.createElement("div");
        content.style.overflowY = "auto";
        content.style.maxHeight = "200px";

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
    saveMatchData: ActionSaveMatchData,
    downloadMatchData: ActionDownloadMatchData,
    textChange: ActionTextChange,
} as const;

export type EventActionType = keyof typeof eventActionTypeRegistry;

export const EVENT_ACTION_TYPES: string[][] = [
  //[registryName, displayName, description, icon]
  ["matchEvent", "Add match event", "", "fa-bolt"],
  ["triggerEvent", "Trigger an event", "", "fa-bolt"],
  ["styleChange", "Change component style", "", "fa-paint-brush"],
  ["saveMatchData", "Save match data", "", "fa-floppy-o"],
  ["downloadMatchData", "Download match data", "", "fa-download"],
  ["textChange", "Change component text", "", "fa-font"],
];

/**
 * Add events from a component to its rendered HTML Element
 */
export function applyComponentEvents(component: Components.Component, element: HTMLElement) {
    for (const event of component.componentEvents) {
        switch (event.trigger) {
            case EventTrigger.COMPONENT_CLICK:
                element.onclick = (e) => {
                    //e.stopPropagation();
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
    }
}