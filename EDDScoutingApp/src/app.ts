// =======================
// STATE
// =======================

import * as components from "./components.js";
import * as events from "./events.js";
import * as matchdata from "./matchdata.js";
import * as bluetooth from "./bluetooth.js";

let root = components.createComponent("root") 
let selectedId: any = null;
let insertContext: any = null;
let draggedId: any = null;

let runtime_mode = false;
let editor_enabled = true;

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

  //applyStyles(div, node);
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
/*
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

  div.style.color = node.style.color || "#000000";

  //div.style.color = node.color || "#000000"
}*/

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
  modal.style.width = "50%";
  modal.style.height = "75%";
  modal.innerHTML = "<h2>Select a component to add</h2>";

  let grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.height = "80%";
  grid.style.gridTemplateColumns = "25% 25% 25% 25%";
  grid.style.placeItems = "center";

  components.COMPONENT_TYPES.forEach(type => {
    if (type[0] && type[1] && type[2] && type[0] != "root") {
      let componentDiv: HTMLDivElement = document.createElement("div");
      componentDiv.style.width = "80%";
      componentDiv.style.height = "80%";
      componentDiv.style.marginTop = "10%";
      componentDiv.style.borderWidth = "1px";
      componentDiv.style.borderStyle = "solid";
      componentDiv.style.justifyContent = "center";
      componentDiv.style.padding = "5px";

      let componentName = document.createElement("strong");
      componentName.textContent = type[1];
      componentName.style.width = "100%";
      componentName.style.display = "flex";
      componentName.style.justifyContent = "center";
      componentName.style.textAlign = "center";
      componentName.style.fontSize = "22px";

      let description = document.createElement("p");
      description.textContent = type[2];
      description.style.display = "flex";
      description.style.justifyContent = "center";
      description.style.textAlign = "center";
      description.style.font = "16px";
      description.style.marginTop = "5px";

      let buttonDiv = document.createElement("div");
      let addButton: HTMLButtonElement = document.createElement("button");
      buttonDiv.style.display = "flex";
      buttonDiv.style.justifyContent = "center";
      addButton.textContent = "+";
      addButton.style.width = "90%";
      addButton.style.textAlign = "center";
      addButton.style.fontSize = "18px";
      addButton.style.borderRadius = "20px";
      addButton.onclick = () => addComponent(type[0] || "null");
      buttonDiv.appendChild(addButton);

      componentDiv.appendChild(componentName);
      componentDiv.appendChild(description);
      componentDiv.appendChild(buttonDiv);
      grid.appendChild(componentDiv);
    }
  });

  modal.appendChild(grid);
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
  //save the app
  runtime_mode = true;

  saveLocalState();

  let sidebar = document.getElementById("sidebar");
  sidebar?.classList.add("hidden");

  let previewTitle = document.getElementById("preview-title");
  previewTitle?.classList.add("hidden");

  let edit = document.getElementById("edit");
  edit?.classList.remove("hidden");
  if (editor_enabled) {
    edit?.classList.remove("hidden")
  } else {
    edit?.classList.add("hidden");
  } 

  document.getElementById("export")?.classList.remove("hidden");
  document.getElementById("matches")?.classList.remove("hidden");
  document.getElementById("settings")?.classList.remove("hidden");

  let previewDiv = document.getElementById("preview");
  if (previewDiv) previewDiv.style.overflowY = "unset";

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
  //force runtime mode if the editor is disabled
  if (!editor_enabled) {
    closeDesigner();
    return;
  }

  runtime_mode = false;

  saveLocalState();

  let sidebar = document.getElementById("sidebar");
  sidebar?.classList.remove("hidden");

  let previewTitle = document.getElementById("preview-title");
  previewTitle?.classList.remove("hidden");

  let edit = document.getElementById("edit");
  edit?.classList.add("hidden");

  document.getElementById("export")?.classList.add("hidden");
  document.getElementById("matches")?.classList.add("hidden");
  document.getElementById("settings")?.classList.add("hidden");

  let previewDiv = document.getElementById("preview");
  if (previewDiv) previewDiv.style.overflowY = "auto";

  renderPreview();
}

/**
 * Save the current configuration and download it as a JSON file
 */
export function saveToJSON() {
  //save the local state of the app first
  saveLocalState();

  //get the data that needs to be saved to JSON
  let data = {
    events: events.getEventTypes(),
    groups: events.getEventGroups(),
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
  saveButton.onclick = saveToJSON;
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
  component.eventGroup = data.eventGroup;
  
  if (component instanceof components.Layout) {
    component.direction = data.direction;
  } else if (component instanceof components.Label) {
    component.text = data.text;
  } else if (component instanceof components.Button) {
    component.text = data.text;
  } else if (component instanceof components.Dropdown) {
    component.options = data.options;
    component.required = data.required;
  } else if (component instanceof components.TextBox) {
    component.key = data.key;
  } else if (component instanceof components.ResetButton) {
    component.text = data.text;
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
      events.setEventGroups(data.groups);

      //Loads the root component, which loads all other ones
      root = loadComponent(data.app);

      renderPreview();

      //save the newly loaded state
      saveLocalState();
    };

    reader.readAsText(file);
  };
}

function setupExportButton() {
  let exportButton = document.getElementById("export");
  if (!exportButton) return;
  exportButton.onclick = matchdata.exportMatchData;
}

export function isRuntimeMode(): boolean {
  return runtime_mode;
}

function openMatchesModal() {
  let overlay = document.getElementById("overlay-matches");
  if (!overlay) return;
  overlay.classList.remove("hidden");

  let modal = document.getElementById("modal-matches");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.innerHTML = "<h3>Saved Matches</h3>";

  let div = document.createElement("div");
  div.style.overflowY = "auto";
  div.style.height = "80%";

  let table = document.createElement("table");
  let header = document.createElement("tr");
  let matchNum = document.createElement("th");
  let teamNum = document.createElement("th");
  let event = document.createElement("th");
  let type = document.createElement("th");
  let station = document.createElement("th");
  let resend = document.createElement("th");

  matchNum.innerHTML = "Match";
  teamNum.innerHTML = "Team";
  event.innerHTML = "Event";
  type.innerHTML = "Type";
  station.innerHTML = "Alliance";
  resend.innerHTML = "Resend Data";

  header.appendChild(matchNum);
  header.appendChild(teamNum);
  header.appendChild(event);
  header.appendChild(type);
  header.appendChild(station)
  header.appendChild(resend);

  table.appendChild(header);

  table.style.padding="5px";


  //add all matches
  for (const match of matchdata.getAllMatches()) {
    let row = document.createElement("tr");

    addCell(row, match.matchNumber.toString());
    addCell(row, match.teamNumber.toString());
    addCell(row, match.eventCode);
    addCell(row, match.matchType);
    addCell(row, match.allianceStation);

    let btCell = document.createElement("td");
    let btButton = document.createElement("button");

    btButton.onclick = (e) => {
      e.stopPropagation();
      bluetooth.sendMatch(match);
    }
    btButton.innerHTML = "Resend Data"

    btCell.appendChild(btButton);
    row.appendChild(btCell);

    table.appendChild(row);
  }

  div.appendChild(table);

  modal.appendChild(div);

}

//function to make adding a cell to a row easier
function addCell(row: HTMLTableRowElement, value: string): void {
    let cell = document.createElement("td");
    cell.innerHTML = value;
    row.appendChild(cell);
}

function closeMatchesModal() {
  let overlay = document.getElementById("overlay-matches");
  if (overlay) overlay.classList.add("hidden");

  let modal = document.getElementById("modal-matches");
  if (modal) modal.classList.add("hidden");
}

function setupMatchesButton() {
  let matchesButton = document.getElementById("matches");
  if (!matchesButton) return;
  matchesButton.onclick = openMatchesModal;
  
  //setup closing modal on click
  let overlay = document.getElementById("overlay-matches")
  if (overlay) overlay.onclick = closeMatchesModal;

}

function openSettingsModal() {
  let overlay = document.getElementById("overlay-settings");
  if (!overlay) return;
  overlay.classList.remove("hidden");

  let modal = document.getElementById("modal-settings");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.innerHTML = "<h3>Settings</h3>";

  /*
    Things to add:
    - Event code
    - Clear all matches
    - Disable editing
    - Import schedule
  */

  let eventCodeDiv = document.createElement("div");
  eventCodeDiv.textContent = "Event Code: ";

  let eventCode = document.createElement("input");
  eventCode.type = "text";
  eventCode.value = matchdata.getCurrentMatch().eventCode;
  eventCode.onchange = (e) => {
    e.stopPropagation();

    matchdata.getCurrentMatch().eventCode = eventCode.value;

    //save to the local storage
    localStorage.setItem("event_code", JSON.stringify(matchdata.getCurrentMatch().eventCode));
  }
  eventCodeDiv.appendChild(eventCode);

  let toggleEditorDiv = document.createElement("div");
  toggleEditorDiv.textContent = "Edit Mode:";
  toggleEditorDiv.style.display = "inline-block";

  //Switch to disable edit mode
  let toggleEditor = document.createElement("input");
  toggleEditor.type = "checkbox";
  toggleEditor.style.scale = "1.5";
  toggleEditor.checked = editor_enabled;
  toggleEditor.onclick = (e) => {
    e.stopPropagation();

    editor_enabled = toggleEditor.checked;

    if (editor_enabled) {
      document.getElementById("edit")?.classList.remove("hidden")
    } else {
      document.getElementById("edit")?.classList.add("hidden");
    }

    //save the editor enabled option to local storage
    localStorage.setItem("editor_enabled", JSON.stringify(editor_enabled));
  }
  toggleEditorDiv.appendChild(toggleEditor);

  let resetButton = document.createElement("button");
  resetButton.innerHTML = "Clear all match data";
  resetButton.style.display = "block";
  resetButton.style.marginTop = "20px";
  resetButton.onclick = (e) => {
    e.stopPropagation();

    matchdata.clearAllMatches();
  };

  modal.appendChild(eventCodeDiv);
  modal.appendChild(toggleEditorDiv);
  modal.appendChild(resetButton);
}

function closeSettingsModal() {
  let overlay = document.getElementById("overlay-settings");
  if (overlay) overlay.classList.add("hidden");

  let modal = document.getElementById("modal-settings");
  if (modal) modal.classList.add("hidden");
}

function setupSettingsButton() {
  let settingsButton = document.getElementById("settings");
  if (!settingsButton) return;
  settingsButton.onclick = openSettingsModal;

  //setup closing modal on click
  let overlay = document.getElementById("overlay-settings")
  if (overlay) overlay.onclick = closeSettingsModal;
}

export function getEditorEnabled(): boolean {
  return editor_enabled;
}

export function setEditorEnabled(enabled: boolean) {
  editor_enabled = enabled;
}

//Manage service worker stuff for android
/*
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}*/

/**
 * Save the state of the app to the local storage
 */
function saveLocalState() {
  localStorage.setItem("runtime_mode", JSON.stringify(runtime_mode));
  localStorage.setItem("editor_enabled", JSON.stringify(editor_enabled));
  localStorage.setItem("event_code", JSON.stringify(matchdata.getCurrentMatch().eventCode));
  localStorage.setItem("events", JSON.stringify(events.getEventTypes()));
  localStorage.setItem("groups", JSON.stringify(events.getEventGroups()));
  localStorage.setItem("app", JSON.stringify(root));
  localStorage.setItem("unsaved_matches", JSON.stringify(matchdata.getUnsavedMatches()));
}

/**
 * Load the app state
 */
function loadLocalState() {
  const saved_runtime_mode = localStorage.getItem("runtime_mode");
  if (saved_runtime_mode) {
    runtime_mode = JSON.parse(saved_runtime_mode);
  }
  
  const saved_editor_enabled = localStorage.getItem("editor_enabled");
  if (saved_editor_enabled) editor_enabled = JSON.parse(saved_editor_enabled);

  const saved_event_code = localStorage.getItem("event_code");
  if (saved_event_code) matchdata.getCurrentMatch().eventCode = JSON.parse(saved_event_code);

  const saved_events = localStorage.getItem("events");
  if (saved_events) events.setEventTypes(JSON.parse(saved_events));

  const saved_groups = localStorage.getItem("groups");
  if (saved_groups) events.setEventGroups(JSON.parse(saved_groups));

  const saved_app = localStorage.getItem("app");
  if (saved_app) root = loadComponent(JSON.parse(saved_app));

  const saved_unsaved_matches = localStorage.getItem("unsaved_matches");
  if (saved_unsaved_matches) matchdata.setUnsavedMatches(JSON.parse(saved_unsaved_matches));
}

setupCloseButton();
setupEditButton();
setupSaveButton();
setupLoadButton();
setupExportButton();
setupMatchesButton();
setupSettingsButton();

//Get the saved state and load either the editor or runtime mode
loadLocalState();

if (runtime_mode) {
  //idk if this is the best way to force load the render preview function but it works
  runtime_mode = false;
  renderPreview();
  runtime_mode = true;
  closeDesigner();
} else {
  openDesigner();
}