import * as App from "./app.js"
import * as Components from "./components.js"

let draggedId: any = null;

/**
 * When a component gets dropped, move it to the right spot
 */
export function onDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) return;

    let drag = App.findComponent(draggedId);
    let target = App.findComponent(targetId);

    // Remove from old parent
    drag.parent.children = drag.parent.children.filter((c: Components.Component) => c.id !== draggedId);

    // Insert before target
    let targetIndex = target.parent.children.findIndex((c: Components.Component) => c.id === targetId);

    if (target.component instanceof Components.Layout) {
        target.component.children.splice(targetIndex, 0, drag.component);
    } else {
        target.parent.children.splice(targetIndex, 0, drag.component);
    }

    App.renderPreview();
}

/**
 * Adds the events needed for a node to be compatable with drag and drop
 */
export function applyToNode(node: HTMLElement, id: string) {
    node.draggable = true;

    node.ondragstart = (e) => {
        if (App.isPreviewMode()) return;
        e.stopPropagation();
        draggedId = id;
    };

    node.ondragover = (e) => {
        if (App.isPreviewMode()) return;
        e.preventDefault();
    };

    node.ondrop = (e) => {
        if (App.isPreviewMode()) return;
        e.stopPropagation();
        onDrop(id);
    };
}

/**
 * Adds drag and drop events to an insert bar
 */
export function applyToInsertBar(bar: HTMLElement, parentId: string, index: number) {
    bar.ondrop = (e) => {
        if (App.isPreviewMode() || !draggedId) return;
        e.preventDefault();
        bar.style.background = "#ffffff00";

        //move the dragged component to where it would go if it were added with the insert bar
        let drag = App.findComponent(draggedId);
        let draggedComponent = drag.component;
        let draggedParent = drag.parent;
        let parent = App.findComponent(parentId).component;
        if (!(draggedComponent instanceof Components.Component) || !(parent instanceof Components.Component) || !(draggedParent instanceof Components.Component)) return;
        draggedParent.children = draggedParent.children.filter((c: Components.Component) => c.id !== draggedComponent.id);
        parent.children.splice(index, 0, draggedComponent);

        App.renderPreview();
    }

    bar.ondragover = (e) => {
        if (App.isPreviewMode()) return;
        e.preventDefault();
        bar.style.background = "#eef6ff";
    }

    bar.ondragleave = (e) => {
        if (App.isPreviewMode()) return;
        e.preventDefault();
        bar.style.background = "#ffffff00";
    }

    bar.ondragend = (e) => {
        if (App.isPreviewMode()) return;
        e.preventDefault();
        bar.style.background = "#ffffff00";
    }
}

/**
 * Gets the ID of the component currently being dragged
 */
export function getDraggedID(): any {
    return draggedId;
}