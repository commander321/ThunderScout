import * as App from "./app.js";
import * as Components from "./components.js"

/**
 * Renders the preview of the app for edit mode
 */
export function renderAppPreview() {
  if (App.isRuntimeMode()) return;
  const appContent = document.getElementById("app-preview-content");
  if (!appContent) return;
  if (!(appContent instanceof HTMLDivElement)) return;
  appContent.innerHTML = "";

  appContent.onclick = (e) => {
    //e.stopPropagation();
    App.setSelectedID(null);
    renderAppPreview();
    renderEditor();
  }

  renderComponent(root, appContent);
}


/**
 * Renders a component and all of it's children
 */
function renderComponent(component: Components.Component, container: HTMLDivElement) {
  //handle the root
  if (component instanceof Components.Root) {
    renderChildren(component, container);
    return;
  }

  let div: HTMLDivElement = document.createElement("div");
  div.className = "editor-component";

  if (component.id === App.getSelectedID()) {
    div.classList.add("selected");
  }

  div.onclick = e => {
    if (App.isRuntimeMode()) return;
    e.stopPropagation();
    App.setSelectedID(component.id);
    renderAppPreview();
    renderEditor();
  };

  div.draggable = true;

  div.ondragstart = e => {
    if (App.isRuntimeMode()) return;
    e.stopPropagation();
    draggedId = component.id;
  };

  div.ondragover = e => {
    if (App.isRuntimeMode()) return;
    e.preventDefault();
  };

  div.ondrop = e => {
    if (App.isRuntimeMode()) return;
    e.stopPropagation();
    handleDrop(component.id);
  };

  component.render(div);
  component.applyStyles();

  container.appendChild(div);

  //only containers render children
  if (component.type === "layout" || component.type === "root") {
    renderChildren(component, div);
  }
}


/**
 * Renders all children of a component
 */
function renderChildren(component: Components.Component, container: HTMLDivElement) {
  component.children.forEach((child: Components.Component, index: number) => {
    renderInsertBar(container, component.id, index);
    renderComponent(child, container);
  });

  renderInsertBar(container, component.id, component.children.length);
}

/**
 * Renders the bar with the + button to add a new component
 */
function renderInsertBar(container: HTMLDivElement, parentId: string, index: number) {
  let bar: HTMLDivElement = document.createElement("div");
  bar.className = "insert-bar";
  bar.textContent = "+";
  bar.onclick = () => App.openAddComponentModal(parentId, index);

  //drag and drop things
  bar.ondrop = (e) => {
    if (runtime_mode || !draggedId) return;
    e.preventDefault();
    bar.style.background = "#ffffff00";

    //move the dragged component to where it would go if it were added with the insert bar
    let drag = App.findComponent(draggedId);
    let draggedComponent = drag.component;
    let draggedParent = drag.parent;
    let parent = App.findComponent(parentId).parent;
    if (!(draggedComponent instanceof Components.Component) || !(parent instanceof Components.Component) || !(draggedParent instanceof Components.Component)) return;
    draggedParent.children = draggedParent.children.filter((c: Components.Component) => c.id !== draggedComponent.id);
    parent.children.splice(index, 0, draggedComponent);

    renderAppPreview();
  }

  bar.ondragover = (e) => {
    if (App.isRuntimeMode()) return;
    e.preventDefault();
    bar.style.background = "#eef6ff";
  }

  bar.ondragleave = (e) => {
    if (App.isRuntimeMode()) return;
    e.preventDefault();
    bar.style.background = "#ffffff00";
  }

  bar.ondragend = (e) => {
    if (App.isRuntimeMode()) return;
    e.preventDefault();
    bar.style.background = "#ffffff00";
  }

  container.appendChild(bar);
}


/**
 * Renders the editor for the selected component
 */
export function renderEditor() {
  const editorDiv = document.getElementById("editor");
  if (!editorDiv) return;
  editorDiv.innerHTML = "";

  const editorTitle = document.getElementById("editor-title");
  if (!editorTitle) return;

  //set height of editor because it doesn't work otherwise for some reason
  const appPreview = document.getElementById("app-preview");
  if (!appPreview) return;
  const editorContent = document.getElementById("editor-content");
  if (!editorContent) return;
  editorContent.style.maxHeight = appPreview.clientHeight.toString();


  let result = App.findComponent(selectedId);
  if (!result) {
    editorTitle.innerHTML = "Select a Component";
    return;
  }

  let component = result.component;

  let title = "Component"
  for (const component of Components.COMPONENT_TYPES) {
    if (component.constructor.name.toLowerCase() === component[0] && component[1]) {
      title = component[1];
      break;
    }
  }
  editorTitle.innerHTML = title;

  //Editor features specific to the type of component
  component.addEditorFeatures();

  if (!component.style) component.style = {}
}