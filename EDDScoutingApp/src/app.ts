import * as components from "./components.js";
import * as matchevents from "./matchevents.js";
import * as matchdata from "./matchdata.js";
import * as bluetooth from "./bluetooth.js";
import * as actions from "./action.js";
import * as storage from "./storage.js";
import * as editor from "./editor.js";
import * as events from "./events.js";
import { v4 as uuid } from 'uuid';

let appName: string = "";
let root = components.createComponent("root");
let selectedId: any = null;
let insertContext: any = null;
let draggedId: any = null;
let copiedComponent: any = null;
let cutting: boolean = false;

let runtime_mode = false;
let editor_enabled = true;

function isContainer(node: components.Component) {
  return node.type === "layout" || node.type === "root";
}

/**
 * Get a component from its ID
 */
export function find(id: string, node: components.Component = root, parent: any = null) {
  if (node.id === id) return { node, parent };

  if (!node.children) return null;

  for (let child of node.children) {
    let result: any = find(id, child, node);
    if (result) return result;
  }

  return null;
}

/**
 * Renders the app
 */
export function renderPreview() {
  if (runtime_mode) return;
  const app = document.getElementById("app");
  if (!app) return;
  if (!(app instanceof HTMLDivElement)) return;
  app.innerHTML = "";

  app.onclick = (e) => {
    //e.stopPropagation();
    setSelectedID(null);
    renderPreview();
    renderEditor();
  }

  renderNode(root, app);
}

function renderNode(node: components.Component, container: HTMLDivElement) {
  //handle the root
  if (node.type === "root") {
    renderChildren(node, container);
    return;
  }

  let div: HTMLDivElement = document.createElement("div");
  div.className = "editor-component";

  if (node.id === selectedId) {
    div.classList.add("selected");
  }

  div.onclick = e => {
    if (runtime_mode) return;
    e.stopPropagation();
    setSelectedID(node.id);
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
  node.applyStyles();
  //renderComponentContent(div, node);

  container.appendChild(div);

  //only containers render children and insert bars
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

  if (target.node instanceof components.Layout) {
    target.node.children.splice(targetIndex, 0, drag.node);
  } else {
    target.parent.children.splice(targetIndex, 0, drag.node);
  }

  renderPreview();
}

// =======================
// EDITOR
// =======================

export function renderEditor() {
  const editorDiv = document.getElementById("editor");
  if (!editorDiv) return;
  editorDiv.innerHTML = "";

  const editorTitle = document.getElementById("editor-title");
  if (!editorTitle) return;

  let result = find(selectedId);
  if (!result) {
    editorTitle.innerHTML = "Select a Component";
    return;
  }

  let node = result.node;

  let title = "Component"
  for (const component of components.COMPONENT_TYPES) {
    if (node.constructor.name.toLowerCase() === component[0] && component[1]) {
      title = component[1];
      break;
    }
  }
  editorTitle.innerHTML = title;

  //Editor features specific to the type of component
  node.addEditorFeatures();

  if (!node.style) node.style = {}
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
  modal.style.width = "60%";
  modal.style.height = "75%";
  modal.style.borderStyle = "solid";
  modal.style.borderWidth = "2px";
  modal.style.borderColor = "#bbbbbb";
  modal.style.borderRadius = "5px";
  modal.innerHTML = "<h2>Select a component to add</h2>";

  let grid = document.createElement("div");
  grid.style.display = "grid";
  //grid.style.height = "80%";
  grid.style.gridTemplateColumns = "33% 33% 33%";
  grid.style.placeItems = "center";

  components.COMPONENT_TYPES.forEach(type => {
    if (type[0] && type[1] && type[2] && type[0] != "root") {
      let componentDiv: HTMLDivElement = document.createElement("div");
      componentDiv.style.width = "80%";
      componentDiv.style.height = "350px";
      componentDiv.style.marginTop = "10%";
      componentDiv.style.borderWidth = "1px";
      componentDiv.style.borderStyle = "solid";
      componentDiv.style.justifyContent = "center";
      componentDiv.style.padding = "5px";
      componentDiv.style.borderRadius = "5px";

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
      description.style.height = "100px";

      let pictureDiv = document.createElement("div");
      let picture = document.createElement("img");
      pictureDiv.style.width = "90%";
      pictureDiv.style.height = "200px";
      pictureDiv.style.marginTop = "-20%";
      pictureDiv.style.marginLeft = "auto";
      pictureDiv.style.marginRight = "auto";
      pictureDiv.style.display = "flex";
      pictureDiv.style.justifyContent = "center";
      picture.src = "/src/assets/components/" + type[0] + ".png";
      picture.style.objectFit = "contain";
      picture.style.width = "100%";
      picture.style.height = "100%";
      picture.style.textAlign = "center";
      pictureDiv.appendChild(picture);

      let buttonDiv = document.createElement("div");
      let addButton: HTMLButtonElement = document.createElement("button");
      buttonDiv.style.display = "flex";
      buttonDiv.style.justifyContent = "center";
      buttonDiv.style.marginTop = "25px";
      addButton.textContent = "+";
      addButton.classList.add("add-component-button");
      addButton.onclick = () => addComponent(type[0] || "null");
      buttonDiv.appendChild(addButton);

      componentDiv.appendChild(componentName);
      componentDiv.appendChild(description);
      componentDiv.appendChild(pictureDiv);
      componentDiv.appendChild(buttonDiv);
      grid.appendChild(componentDiv);
    }
  });

  modal.appendChild(grid);
}

function addComponent(type: string) {
  let parent = find(insertContext.parentId);

  //Add component
  let component = components.createComponent(type as components.ComponentType)
  parent.node.children.splice(insertContext.index, 0, component);

  //set background to parent so it looks right when adding new components in a layout
  component.style.background = parent.node.style.background || "#FFFFFF";

  //Add to actions list
  //savedActions.push([component, parent.parent]);
  actions.saveAction(new actions.Action(component, parent.parent, actions.ActionType.COMPONENT_PLACE));

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

//close any modals when you hit escape
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeModal();
    editor.closeEventsModal();
    setSelectedID(selectedId); //use this to close component select modal too
  }
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

  //let previewDiv = document.getElementById("preview");
  //if (previewDiv) previewDiv.style.overflowY = "unset";

  document.querySelectorAll(".insert-bar").forEach(element => {
    element.classList.add("hidden");
  });

  document.querySelectorAll(".editor-component, .selected, .container").forEach(element => {
    element.classList.remove("editor-component");
    element.classList.remove("selected");
    element.classList.remove("container");
    element.classList.add("component");
    element.removeAttribute("draggable");
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

  //let previewDiv = document.getElementById("preview");
  //if (previewDiv) previewDiv.style.overflowY = "auto";

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
    name: appName,
    events: matchevents.getEventTypes(),
    groups: matchevents.getEventGroups(),
    app: root
  }

  let json = JSON.stringify(data, (key, val) => {
    return (key == "styleTypes" || key == "divElement" || key == "component") ? undefined : val;
  }, 2);
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

export function setupEditButton() {
  let openDesignerButton = document.getElementById("edit");
  if (!openDesignerButton) return;
  openDesignerButton.onclick = openDesigner;
}

/**
 * Creates a component (and all it's children) from a JSON string. Used for loading from files.
 */
export function loadComponent(data: any, newUUID?: boolean): components.Component {
  let component = components.createComponent(data.type);
  component.id = newUUID ? uuid() : data.id;
  component.style = data.style;
  component.eventType = data.eventType;
  component.eventGroup = data.eventGroup;
  
  //Load specific attributes for components
  if (component instanceof components.Layout) {
    //component.direction = data.direction;
  } else if (component instanceof components.Label) {
    component.text = data.text;
  } else if (component instanceof components.Button) {
    component.text = data.text;
    //component.decrease = data.decrease;
  } else if (component instanceof components.Dropdown) {
    component.options = data.options;
    component.required = data.required;
  } else if (component instanceof components.TextBox) {
    component.key = data.key;
  } else if (component instanceof components.ResetButton) {
    component.text = data.text;
  } else if (component instanceof components.Section) {
    component.color = data.color;
    component.thickness = data.thickness;
  } else if (component instanceof components.AnalyticsMatchesTable) {
    component.minRows = data.minRows;
    component.children = [];
  } else if (component instanceof components.AnalyticsMatchesTableColumn) {
    component.dataType = data.dataType;
    component.header = data.header;
    component.textboxKey = data.textboxKey;
    component.value = data.value;
  } else if (component instanceof components.Image) {
    component.imageId = data.imageId;
  }

  //load component events
  for (const eventData of data.componentEvents) {
    let event = new events.Event(eventData.trigger);
    for (const actionData of eventData.actions) {
      let action = new events.eventActionTypeRegistry[actionData.type as events.EventActionType]();
      if (action instanceof events.ActionRecordMatchEvent) {
        action.matchEventType = actionData.matchEventType;
        action.matchEventGroup = actionData.matchEventGroup;
      } else if (action instanceof events.ActionStyleChange) {
        action.styles = actionData.styles;
        action.componentID = actionData.componentID;
      } else if (action instanceof events.ActionTriggerEvent) {
        //add later
      } else if (action instanceof events.ActionTextChange) {
        //add later
      }
      event.actions.push(action);
    }
    component.componentEvents.push(event);
  }

  for (const child of data.children) {
    component.children.push(loadComponent(child, newUUID));
  }

  return component;
}

/**
 * Copy the selected component to the clipboard
 */
function copyComponent() {
  if (!selectedId || selectedId == null) return;
  let found = find(selectedId);
  if (!found) return;
  if (found.node == null) return;

  //make a copy of the component and change the id
  copiedComponent = loadComponent(found.node, true);
  //copiedComponent.id = uuid();

  //delete the component if cutting it (and save action in case you undo the cut)
  if (cutting) {
    actions.saveAction(new actions.Action(found.node, found.parent, actions.ActionType.COMPONENT_CUT));
    found.parent.children = found.parent.children.filter((c: components.Component) => c.id !== found.node.id);
  }

  renderPreview();
}

/**
 * Paste a copy of the copied component into the specified component (or it's parent if it isn't a layout)
 * If it's from a cut, then remove from clipboard afterwards
 */
function pasteComponent() {
  if (!copiedComponent || copiedComponent == null) return;

  let selected = find(selectedId);
  let pasteInto = selected ? (selected.node instanceof components.Layout ? selected.node : selected.parent) : root;

  let insertIndex = pasteInto.children.findIndex((c: components.Component) => c.id === selectedId);

  //paste the component to selected id
  pasteInto.children.splice(insertIndex+1, 0, copiedComponent);

  //save the paste action in case you undo it
  actions.saveAction(new actions.Action(copiedComponent, pasteInto, actions.ActionType.COMPONENT_PASTE));

  setSelectedID(copiedComponent.id);

  //if cutting, remove the component from the clipboard. If not, make another copy in case you want to paste it again
  if (cutting) {
    copiedComponent = null;
  } else {
    let nextComponent = loadComponent(copiedComponent);
    nextComponent.id = uuid();
    copiedComponent = nextComponent;
  }
  cutting = false;

  renderPreview();
}

/**
 * Clears the copied component. Used when undoing a component cut
 */
export function clearClipboard() {
  cutting = false;
  copiedComponent = null;
}

//add listener for ctrl + z
document.addEventListener("keydown", (e) => {
  if (!e.ctrlKey || e.key.toLowerCase() != 'z') return;
  actions.undoLastAction();
});

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

document.addEventListener("keydown", (e) => {
  if (e.key !== "Delete") return;
  deleteSelectedComponent();
});

document.addEventListener("keydown", (e) => {
  if (!e.ctrlKey || e.key.toLowerCase() != 's') return;
  e.preventDefault();
  saveLocalState();
});

/**
 * Deletes the component you have selected. 
 * Used for keybind and delete button
 */
function deleteSelectedComponent() {
  if (!selectedId || selectedId == null) return;
  let found = find(selectedId);
  if (!found) return;
  if (found.node == null) return;

  actions.saveAction(new actions.Action(found.node, found.parent, actions.ActionType.COMPONENT_DELETE));
  found.parent.children = found.parent.children.filter((c: components.Component) => c.id !== found.node.id);
 
  renderPreview();
  renderEditor();
}

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

      //set the app/page name
      appName = data.name;
      document.title = appName;

      //set the event types and groups
      matchevents.setEventTypes(data.events);
      matchevents.setEventGroups(data.groups);

      //loads the root component, which loads all other ones
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
 
  let name = document.getElementById("settings-app-name");
  if (name && name instanceof HTMLInputElement) {
    name.value = appName;
    name.onchange = (e) => {
      e.stopPropagation();
      appName = name.value;
      document.title = appName;
      localStorage.setItem("app_name", JSON.stringify(appName));
    }
  }

  //event code
  let eventCode = document.getElementById("settings-event-code");
  if (eventCode && eventCode instanceof HTMLInputElement) {
    eventCode.value = matchdata.getCurrentMatch().eventCode;
    eventCode.onchange = (e) => {
      e.stopPropagation();

      matchdata.getCurrentMatch().eventCode = eventCode.value;

      //save to the local storage
      localStorage.setItem("event_code", JSON.stringify(matchdata.getCurrentMatch().eventCode));
    }
  }

  //toggle editor
  let toggleEditor = document.getElementById("settings-editor-enabled");
  if (toggleEditor && toggleEditor instanceof HTMLInputElement) {
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
  }

  //reset button
  let resetButton = document.getElementById("settings-reset-button");
  if (resetButton && resetButton instanceof HTMLButtonElement) {
    resetButton.onclick = (e) => {
      e.stopPropagation();

      matchdata.clearAllMatches();
    };
  }
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

function setupEditorButtons() {
  const undoButton = document.getElementById("editor-button-undo")
  if (undoButton) undoButton.onclick = (e) => {
    e.stopPropagation();
    actions.undoLastAction();
  }
  
  const redoButton = document.getElementById("editor-button-redo");
  //This doesn't work yet :(

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

  const deleteButton = document.getElementById("editor-button-delete");
  if (deleteButton) deleteButton.onclick = (e) => {
    e.stopPropagation();
    deleteSelectedComponent();
  }

  const exportButton = document.getElementById("editor-button-export");
  if (exportButton) exportButton.onclick = (e) => {
    e.stopPropagation();
    saveToJSON();
  }

  const saveButton = document.getElementById("editor-button-save");
  if (saveButton) saveButton.onclick = (e) => {
    e.stopPropagation();
    saveLocalState();
  }

  const uploadButton = document.getElementById("editor-button-upload");
  if (uploadButton) uploadButton.onclick = (e) => {
    e.stopPropagation();
    const loadButton = document.getElementById("load");
    if (loadButton && loadButton instanceof HTMLInputElement) loadButton.click();
  }

  const closeButton = document.getElementById("editor-button-close");
  if (closeButton) closeButton.onclick = (e) => {
    e.stopPropagation();
    closeDesigner();
  }

}

export function getEditorEnabled(): boolean {
  return editor_enabled;
}

export function setEditorEnabled(enabled: boolean) {
  editor_enabled = enabled;
}

//used by analytics tables because their columns are weird
export function setSelectedID(id: any) {
  if (onComponentChange) onComponentChange(id);
  selectedId = id;
}
export function getSelectedID(): any {
  return selectedId;
}


let onComponentChange: ((newID: any) => void) | undefined;
/**
 * Lets the user select a component and runs a function when a component is selected
 */
export function userSelectComponent(current: any, onSelect: (newID: any) => void): void {
  //make the current selection look selected even if it isn't the selected component
  const oldSelection = selectedId;
  selectedId = current;
  renderPreview();

  //open the overlay
  let overlay = document.getElementById("overlay-component-select")
  if (!overlay) return;
  overlay.classList.remove("hidden");
  
  //if the current component is changed, then return the new component
  onComponentChange = (newID: any) => {
    selectedId = oldSelection;
    renderPreview();
    overlay.classList.add("hidden");
    onComponentChange = undefined;
    window.onclick = null;
    onSelect(newID);
  }

  //if you close out of the window, return the new component
  window.onclick = () => {
    selectedId = oldSelection;
    renderPreview();
    overlay.classList.add("hidden");
    onComponentChange = undefined;
    window.onclick = null;
    onSelect(current);
  }

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
  localStorage.setItem("events", JSON.stringify(matchevents.getEventTypes()));
  localStorage.setItem("groups", JSON.stringify(matchevents.getEventGroups()));
  localStorage.setItem("app", JSON.stringify(root, (key, val) => {
    return (key == "styleTypes" || key == "divElement" || key == "component") ? undefined : val;
  }));
  localStorage.setItem("unsaved_matches", JSON.stringify(matchdata.getUnsavedMatches()));
  localStorage.setItem("app_name", JSON.stringify(appName));
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
  if (saved_events) matchevents.setEventTypes(JSON.parse(saved_events));

  const saved_groups = localStorage.getItem("groups");
  if (saved_groups) matchevents.setEventGroups(JSON.parse(saved_groups));

  const saved_app = localStorage.getItem("app");
  if (saved_app) root = loadComponent(JSON.parse(saved_app));

  const saved_unsaved_matches = localStorage.getItem("unsaved_matches");
  if (saved_unsaved_matches) matchdata.setUnsavedMatches(JSON.parse(saved_unsaved_matches));

  const saved_app_name = localStorage.getItem("app_name");
  if (saved_app_name) {
    appName = JSON.parse(saved_app_name);
    document.title = JSON.parse(saved_app_name);
  }
}

//initialize buttons
setupEditButton();
setupLoadButton();
setupExportButton();
setupMatchesButton();
setupSettingsButton();
setupEditorButtons();

//load all saved image files (only do this when loading the page)
storage.loadImages();

//initialize HTML components that get reused
editor.initEventSelection();

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