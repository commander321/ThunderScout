import * as components from "./components.js";
import * as matchdata from "./matchdata.js"
import * as matchevents from "./matchevents.js";

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
        for (const action of this.actions) {
            action.onTrigger();
        }
    }
}

export abstract class EventAction {
    /**
     * Code that runs when the event is triggered
     */
    abstract onTrigger(): void;
}

/**
 * Ways an event can be triggered
 */
export enum EventTrigger {
    OTHER_EVENT,
    COMPONENT_CLICK,
    COMPONENT_HOVER,
}




//=======================
// Event Actions
//=======================

/**
 * Records a match event of a specific type/group
 */
export class ActionRecordMatchEvent extends EventAction {
    matchEventType: string;
    matchEventGroup: string;

    constructor(matchEventType: string, matchEventGroup: string) {
        super();
        this.matchEventType = matchEventType;
        this.matchEventGroup = matchEventGroup;        
    }

    onTrigger(): void {
        matchdata.getCurrentMatch().addEvent(new matchevents.MatchEvent(this.matchEventType, this.matchEventGroup));
    }
}

/**
 * Triggers another event
 */
export class ActionTriggerEvent extends EventAction {
    event: Event;

    constructor(event: Event) {
        super();
        this.event = event;
    }

    onTrigger(): void {
        if (this.event.trigger == EventTrigger.OTHER_EVENT) this.event.run();
    }
}

/**
 * Change the style of a component
 */
export class ActionStyleChange extends EventAction {

    component: components.Component;
    styles: Record<string, any>;

    constructor(component: components.Component, styles: Record<string, any>) {
        super();

        this.component = component;
        this.styles = styles;
    }

    onTrigger(): void {
        for (const [style, value] of Object.entries(this.styles)) {
            this.component.style[style] = value;
        }
    }
}


//=======================
// End of Actions
//=======================


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