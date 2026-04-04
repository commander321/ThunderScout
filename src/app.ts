// =======================
// STATE
// =======================

import * as components from "./components.js";
import * as events from "./events.js";
import * as matchdata from "./matchdata.js";

let root = components.createComponent("root") 
let selectedId: any = null;
let insertContext: any = null;
let draggedId: any = null;

let runtime_mode = false;

const COMPONENT_TYPES = [
  "root",
  "label",
  "counter",
  "dropdown",
  "section",
  "layout",
  "checkbox",
  "textbox",
  "button",
  "teamnum",
  "matchnum",
  "matchtype",
  "resetbutton",
  "alliancestation"
];

// =======================
// UTILITIES
// =======================

/*
function uid() {
  return Math.random().toString(36).substr(2, 9);
}
*/

function isContainer(node: components.Component) {
  return node.type === "layout"/*|| node.type === "section"*/ || node.type === "root";
}

function find(id: string, node: components.Component = root, parent: any = null) {
  if (node.id === id) return { node, parent };

  if (!node.children) return null;

  for (let child of node.children) {
    let result: any = find(id, child, node);
    if (result) return result;
  }

  return null;
}

// =======================
// RENDER PREVIEW
// =======================

export function renderPreview() {
  if (runtime_mode) return;
  const app = document.getElementById("app");
  if (!app) return;
  if (!(app instanceof HTMLDivElement)) return;
  app.innerHTML = "";
  renderNode(root, app);
}

function renderNode(node: components.Component, container: HTMLDivElement) {

  // ROOT HANDLING
  if (node.type === "root") {
    renderChildren(node, container);
    return;
  }

  let div: HTMLDivElement = document.createElement("div");
  div.className = "editor-component";

  if (node.id === selectedId)
    div.classList.add("selected");

  div.onclick = e => {
    if (runtime_mode) return;
    e.stopPropagation();
    selectedId = node.id;
    renderPreview();
    renderEditor();
  };

  div.draggable = true;

  div.ondragstart = e => {
    if (runtime_mode) return;
    e.stopPropagation();
    draggedId = node.id;
  };

  div.ondragover = e => {
    if (runtime_mode) return;
    e.preventDefault();
  };

  div.ondrop = e => {
    if (runtime_mode) return;
    e.stopPropagation();
    handleDrop(node.id);
  };

  applyStyles(div, node);
  node.render(div);
  //renderComponentContent(div, node);

  container.appendChild(div);

  // Only containers render children + insert bars
  if (isContainer(node)) {
    renderChildren(node, div);
  }
}

function renderChildren(node: components.Component, container: HTMLDivElement) {
  node.children.forEach((child: components.Component, index: number) => {
    renderInsertBar(container, node.id, index);
    renderNode(child, container);
  });

  renderInsertBar(container, node.id, node.children.length);
}

function renderInsertBar(container: HTMLDivElement, parentId: string, index: number) {
  let bar: HTMLDivElement = document.createElement("div");
  bar.className = "insert-bar";
  bar.textContent = "+";
  bar.onclick = () => openModal(parentId, index);
  container.appendChild(bar);
}

// =======================
// DRAG & DROP
// =======================

function handleDrop(targetId: string) {
  if (!draggedId || draggedId === targetId) return;

  let drag = find(draggedId);
  let target = find(targetId);

  // Remove from old parent
  drag.parent.children =
    drag.parent.children.filter((c: components.Component) => c.id !== draggedId);

  // Insert before target
  let targetIndex =
    target.parent.children.findIndex((c: components.Component) => c.id === targetId);

  target.parent.children.splice(targetIndex, 0, drag.node);

  renderPreview();
}

// =======================
// STYLING
// =======================

/**
 * Applies styles to a component based on it's styles list. 
 * This is where it makes the actual CSS of the components
 */
function applyStyles(div: HTMLDivElement, node: components.Component) {
  if (!node.style) return;

  div.style.background = node.style.background || "";
  div.style.fontSize = (node.style.textSize || 14) + "px";
  div.style.fontWeight = node.style.bold ? "bold" : "normal";
  div.style.fontStyle = node.style.fontStyle || ""
  div.style.textDecoration = node.style.textDecoration || ""
  div.style.width = (node.style.width || 100) + "%";

  div.style.paddingLeft = (node.style.paddingLeft == "0" ? 0 : (node.style.paddingLeft || 5)) + "px";
  div.style.paddingRight = (node.style.paddingRight == "0" ? 0 : (node.style.paddingRight || 5)) + "px";
  div.style.paddingTop = (node.style.paddingTop == "0" ? 0 : (node.style.paddingTop || 5)) + "px";
  div.style.paddingBottom = (node.style.paddingBottom == "0" ? 0 : (node.style.paddingBottom || 5)) + "px";

  div.style.marginTop = (node.style.marginTop == "0" ? 0 : (node.style.marginTop || 6)) + "px";
  div.style.marginBottom = (node.style.marginBottom == "0" ? 0 : (node.style.marginBottom || 6)) + "px";

  if (node.style.allignment === "right") {
    div.style.marginRight = (node.style.marginRight == "0" ? 0 : (node.style.marginRight || 0)) + "px";
    div.classList.remove("center-align");
    div.classList.remove("left-align");
    div.classList.add("right-align");
  } else if (node.style.allignment === "center") {
    div.classList.remove("right-align");
    div.classList.remove("left-align");
    div.classList.add("center-align");
  } else {
    div.classList.remove("right-align");
    div.classList.remove("center-align");
    div.classList.add("left-align");
    div.style.marginLeft = (node.style.marginLeft == "0" ? 0 : (node.style.marginLeft || 0)) + "px";
  }
  //div.style.color = node.color || "#000000"
}

// =======================
// EDITOR
// =======================

function renderEditor() {
  const editorDiv = document.getElementById("editor");
  if (!editorDiv) return;
  editorDiv.innerHTML = "";

  let result = find(selectedId);
  if (!result) return;

  let node = result.node;

  //Editor features specific to the type of component
  node.addEditorFeatures();

  if (!node.style) node.style = {};

  // DELETE BUTTON RESTORED
  let del = document.createElement("button");
  del.textContent = "Delete Component";
  del.onclick = () => {
    result.parent.children =
      result.parent.children.filter((c: components.Component) => c.id !== node.id);

    selectedId = null;
    renderPreview();
    renderEditor();
  };

  editorDiv.appendChild(document.createElement("hr"));
  editorDiv.appendChild(del);
}

// =======================
// MODAL
// =======================

function openModal(parentId: string, index: number) {
  insertContext = { parentId, index };

  let overlay = document.getElementById("overlay");
  if (!overlay) return;
  overlay.classList.remove("hidden");

  let modal = document.getElementById("modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.innerHTML = "<h3>Select Component</h3>";

  COMPONENT_TYPES.forEach(type => {
    if (type != "root" && modal) {
      let btn: HTMLButtonElement = document.createElement("button");
      btn.textContent = type;
      btn.onclick = () => addComponent(type);
      modal.appendChild(btn);
    }
  });
}

function addComponent(type: string) {
  let parent = find(insertContext.parentId).node;

  //Add component
  parent.children.splice(insertContext.index, 0, components.createComponent(type as components.ComponentType));

  closeModal();
  renderPreview();
}

function closeModal() {
  let overlay = document.getElementById("overlay");
  if (overlay) overlay.classList.add("hidden");

  let modal = document.getElementById("modal");
  if (modal) modal.classList.add("hidden");
}

let overlay = document.getElementById("overlay")
if (overlay) overlay.onclick = closeModal;

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});


// Switch from designer to real-app

/**
 * Closes the designer and activates runtime mode
 */
export function closeDesigner() {
  runtime_mode = true;

  let sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  sidebar.classList.add("hidden");

  let edit = document.getElementById("edit");
  if (!edit) return;
  edit.classList.remove("hidden");

  document.querySelectorAll(".insert-bar").forEach(element => {
    element.classList.add("hidden");
  });

  document.querySelectorAll(".editor-component, .selected, .container").forEach(element => {
    element.classList.remove("editor-component");
    element.classList.remove("selected");
    element.classList.remove("container");
    element.classList.add("component");
  });

  renderPreview();
}

/**
 * Opens the designer from runtime mode
 */
export function openDesigner() {
  runtime_mode = false;

  let sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  sidebar.classList.remove("hidden");

  let edit = document.getElementById("edit");
  if (!edit) return;
  edit.classList.add("hidden");

  renderPreview();
}

/**
 * Save the current configuration and download it as a JSON file
 */
export function save() {

  let data = {
    events: events.getEventTypes(),
    app: root
  }

  let json = JSON.stringify(data, null, 2);
  let blob = new Blob([json], { type: "application/json" });
  let url = URL.createObjectURL(blob);

  let link = document.createElement("a");
  link.href = url;
  link.download = "config.json";

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Adds the listener to the close design mode button
 */
export function setupCloseButton() {
  let closeDesignerButton = document.getElementById("close");
  if (!closeDesignerButton) return;
  closeDesignerButton.onclick = closeDesigner;
}

export function setupEditButton() {
  let openDesignerButton = document.getElementById("edit");
  if (!openDesignerButton) return;
  openDesignerButton.onclick = openDesigner;
}

export function setupSaveButton() {
  let saveButton = document.getElementById("save");
  if (!saveButton) return;
  saveButton.onclick = save;
}

/**
 * Creates a component (and all it's children) from a JSON string. Used for loading from files.
 */
export function loadComponent(data: any): components.Component {

//Right now it only supports styles. Labels, directions, etc should be added manually

  let component = components.createComponent(data.type);
  component.id = data.id;
  component.style = data.style;
  component.eventType = data.eventType;
  
  if (component instanceof components.Layout) {
    component.text = data.text;
    component.direction = data.direction;
  } else if (component instanceof components.Label) {
    component.text = data.text;
  } else if (component instanceof components.Button) {
    component.text = data.text;
  } else if (component instanceof components.Dropdown) {
    //component.text = data.text;
    component.options = data.options;
  } else if (component instanceof components.TextBox) {
    component.key = data.key;
  }

  for (const child of data.children) {
    component.children.push(loadComponent(child));
  }

  return component;
}

let loadingComponents = [];

export function setupLoadButton() {
  let loadButton = document.getElementById("load");
  if (!loadButton) return;
  if (!(loadButton instanceof HTMLInputElement)) return;
  loadButton.onchange = () => {
    if (!loadButton) return;
    if (!(loadButton instanceof HTMLInputElement)) return;
    const file = loadButton.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const data = JSON.parse(reader.result as string)

      console.log(data);
      events.setEventTypes(data.events);

      //Loads the root component, which loads all other ones
      root = loadComponent(data.app);

      renderPreview();
    };

    reader.readAsText(file);

  };
}

export function setupExportButton() {
  let exportButton = document.getElementById("export");
  if (!exportButton) return;
  exportButton.onclick = matchdata.exportMatchData;
}

export function isRuntimeMode(): boolean {
  return runtime_mode;
}

//Manage service worker stuff for android
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}

setupCloseButton();
setupEditButton();
setupSaveButton();
setupLoadButton();
setupExportButton();


//replaced 'renderPreview();' here
openDesigner();