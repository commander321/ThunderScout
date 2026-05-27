import * as components from "./components.js";
import * as app from "./app.js";

let savedActions: Action[] = [];

export class Action {
    component: components.Component;
    parent: components.Component | null;
    type: ActionType;
    style: Record<string, any>;

    constructor(component: components.Component, parent: components.Component | null, type: ActionType, style?: Record<string, any>) {
        this.component = component;
        this.parent = parent;
        this.type = type;
        this.style = style || {};
    }
}

export enum ActionType {
    COMPONENT_PLACE,
    COMPONENT_DELETE,
    COMPONENT_STYLE_CHANGE,
    COMPONENT_CUT,
    COMPONENT_PASTE
}

export function saveAction(action: Action) {
    savedActions.push(action);
}

export function undoLastAction() {
if (savedActions.length == 0) return;

  //get the last modified compnent
  let lastAction = savedActions.pop();
  if (!lastAction) return;
  if (!lastAction.component) return;

  //get the existing version of that component
  let actionComponent = lastAction.component;
  let existingComponent = app.find(actionComponent.id);

  switch (lastAction.type) {
    //If undoing a component delete, recreate the component
    case ActionType.COMPONENT_DELETE:
        if (lastAction.parent) {
            lastAction.parent.children.push(lastAction.component);
        }
        break;

    //If undoing a component place, delete the existing component
    case ActionType.COMPONENT_PLACE:
        existingComponent.parent.children = existingComponent.parent.children.filter((c: components.Component) => c.id !== existingComponent.node.id);
        break;

    //If undoing a component style change, revert the existing components style to the saved one
    case ActionType.COMPONENT_STYLE_CHANGE:
        if (lastAction.style) {
          existingComponent.node.style = lastAction.style;
        }
        break;

    //If undoing a cut, add the component back and clear the clipboard
    case ActionType.COMPONENT_CUT:
        if (lastAction.parent) {
            lastAction.parent.children.push(lastAction.component);
        }
        app.clearClipboard();
        break;
    
    //If undoing a paste, delete the component (but don't clear the clipboard)
    case ActionType.COMPONENT_PASTE:
        existingComponent.parent.children = existingComponent.parent.children.filter((c: components.Component) => c.id !== existingComponent.node.id);
        break;

  }

  //render the updated app
  app.renderPreview();
}