import * as App from "./app.js";
import * as Actions from "./action.js";
import * as Components from "./components.js";
import { v4 as uuid } from "uuid";

let copiedComponent: any = null;
let cutting: boolean = false;

/**
 * Copy the selected component to the clipboard
 */
function copyComponent() {
    if (!App.getSelectedID() || App.getSelectedID() == null) return;
    let found = App.findComponent(App.getSelectedID());
    if (!found) return;
    if (found.component == null) return;

    //make a copy of the component and change the id
    copiedComponent = App.loadComponent(found.component, true);
    //copiedComponent.id = uuid();

    //delete the component if cutting it (and save action in case you undo the cut)
    if (cutting) {
        Actions.saveAction(new Actions.Action(found.component, found.parent, Actions.ActionType.COMPONENT_CUT));
        found.parent.children = found.parent.children.filter((c: Components.Component) => c.id !== found.component.id);
    }

    App.renderPreview();
}

/**
 * Paste a copy of the copied component into the specified component (or it's parent if it isn't a layout)
 * If it's from a cut, then remove from clipboard afterwards
 */
function pasteComponent() {
    if (!copiedComponent || copiedComponent == null) return;

    let selected = App.findComponent(App.getSelectedID());
    let pasteInto = selected ? (selected.component instanceof Components.Layout ? selected.component : selected.parent) : App.getRoot();

    let insertIndex = pasteInto.children.findIndex((c: Components.Component) => c.id === App.getSelectedID());

    //paste the component to selected id
    pasteInto.children.splice(insertIndex+1, 0, copiedComponent);

    //save the paste action in case you undo it
    Actions.saveAction(new Actions.Action(copiedComponent, pasteInto, Actions.ActionType.COMPONENT_PASTE));

    App.setSelectedID(copiedComponent.id);

    //if cutting, remove the component from the clipboard. If not, make another copy in case you want to paste it again
    if (cutting) {
        copiedComponent = null;
    } else {
        let nextComponent = App.loadComponent(copiedComponent);
        nextComponent.id = uuid();
        copiedComponent = nextComponent;
    }
    cutting = false;

    App.renderPreview();
}

/**
 * Adds keybinds for ctrl c, v, and x
 */
function setupKeybinds() {
    //keybinds for copy, cut, and paste
    document.addEventListener("keydown", (e) => {
        if (!e.ctrlKey || e.key.toLowerCase() != 'c') return;
        cutting = false;
        copyComponent();
    });

    document.addEventListener("keydown", (e) => {
        if (!e.ctrlKey || e.key.toLowerCase() != 'v') return;
        pasteComponent();
    });

    document.addEventListener("keydown", (e) => {
        if (!e.ctrlKey || e.key.toLowerCase() != 'x') return;
        cutting = true;
        copyComponent();
    });
}

/**
 * Adds listeners to the copy, cut, and paste buttons in the toolbar
 */
function setupButtons() {
    const copyButton = document.getElementById("editor-button-copy");
    if (copyButton) copyButton.onclick = (e) => {
        e.stopPropagation();
        cutting = false;
        copyComponent();
    }

    const cutButton = document.getElementById("editor-button-cut");
    if (cutButton) cutButton.onclick = (e) => {
        e.stopPropagation();
        cutting = true;
        copyComponent();
    }

    const pasteButton = document.getElementById("editor-button-paste");
    if (pasteButton) pasteButton.onclick = (e) => {
        e.stopPropagation();
        pasteComponent();
    }
}

/**
 * Called when app starts to setup keybinds and buttons for copy/paste
 */
export function initClipboard() {
    setupKeybinds();
    setupButtons();
}

/**
 * Clears the copied component. Used when undoing a component cut
 */
export function clearClipboard() {
    cutting = false;
    copiedComponent = null;
}