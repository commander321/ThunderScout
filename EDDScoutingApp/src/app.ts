import * as Components from "./components.js";
import * as MatchEvents from "./data/matchevents.js";
import * as MatchData from "./data/matchdata.js";
import * as Actions from "./action.js";
import * as LocalStorage from "./storage/localstorage.js";
import * as Editor from "./editor.js";
import * as Events from "./events.js";
import * as Settings from "./settings.js";
import * as Renderer from "./renderer.js";
import * as ImageStore from "./storage/imagestore.js";
import * as MatchDataStore from "./storage/matchdatastore.js";
import * as Clipboard from "./clipboard.js";
import { v4 as uuid } from "uuid";

//let appName: string = "";
let root = Components.createComponent("root");
let selectedId: any = null;
let insertContext: any = null;

let preview_mode: boolean = false;
let editor_enabled: boolean = true;

/**
 * Get a component from its ID. 
 * Returns the component and its parent
 */
export function findComponent(id: string, component: Components.Component = root, parent: Components.Component|null = null) {
  if (component.id === id) return { component, parent };

  if (!component.children) return null;

  for (const child of component.children) {
    let result: any = findComponent(id, child, component);
    if (result) return result;
  }

  return null;
}

/**
 * Gets the root component (all other components are it's children)
 */
export function getRoot(): Components.Root {
  return root;
}

export function setRoot(component: Components.Root) {
  root = component;
}

export function renderPreview() {
  Renderer.renderAppPreview();
}

export function renderEditor() {
  Renderer.renderEditor();
}

/**
 * Open the component selection modal
 */
export function openAddComponentModal(parentId: string, index: number) {
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

  Components.COMPONENT_TYPES.forEach(type => {
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
  let parent = findComponent(insertContext.parentId);

  //Add component
  let component = Components.createComponent(type as Components.ComponentType)
  parent.component.children.splice(insertContext.index, 0, component);

  //set background to parent so it looks right when adding new components in a layout
  component.style.background = parent.component.style.background || "#FFFFFF";

  //Add to actions list
  Actions.saveAction(new Actions.Action(component, parent.parent, Actions.ActionType.COMPONENT_PLACE));

  closeModals();
  renderPreview();
}

/**
 * Closes any modals that are open
 */
function closeModals() {
  let overlay = document.getElementById("overlay");
  if (overlay) overlay.classList.add("hidden");

  //close add component modal
  let modal = document.getElementById("modal");
  if (modal) modal.classList.add("hidden");

  //close any other modals
  Settings.closeSettingsModal();
  Editor.closeEventsModal();

  setSelectedID(selectedId); //use this to close component select modal too
}

let overlay = document.getElementById("overlay")
if (overlay) overlay.onclick = closeModals;

//close any modals when you hit escape
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeModals();
  }
});

/**
 * Closes the editor and activates preview mode
 */
export function openPreviewMode() {
  //save the app
  preview_mode = true;

  LocalStorage.saveLocalState();

  const editorContent = document.getElementById("editor-content");
  editorContent?.classList.add("hidden");

  document.getElementById("export")?.classList.remove("hidden");
  document.getElementById("matches")?.classList.remove("hidden");
  document.getElementById("settings")?.classList.remove("hidden");

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
 * Opens the editor and closes preview mode
 */
export function openEditMode() {
  //force preview mode if the editor is disabled
  if (!editor_enabled) {
    openPreviewMode();
    return;
  }

  preview_mode = false;

  LocalStorage.saveLocalState();

  const editorContent = document.getElementById("editor-content");
  editorContent?.classList.remove("hidden");

  document.getElementById("export")?.classList.add("hidden");
  document.getElementById("matches")?.classList.add("hidden");
  document.getElementById("settings")?.classList.add("hidden");

  renderPreview();
}

/**
 * Save the current configuration and download it as a JSON file
 */
export function saveToJSON() {
  //save the local state of the app first
  LocalStorage.saveLocalState();

  //get the data that needs to be saved to JSON
  let data = {
    name: Settings.getAppName(),
    events: MatchEvents.getEventTypes(),
    groups: MatchEvents.getEventGroups(),
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

/**
 * Creates a component (and all it's children) from a JSON string. Used for loading from files.
 */
export function loadComponent(data: any, newUUID?: boolean): Components.Component {
  let component = Components.createComponent(data.type);
  component.id = newUUID ? uuid() : data.id;
  component.style = data.style;
  component.eventType = data.eventType;
  component.eventGroup = data.eventGroup;
  
  //Load specific attributes for components
  if (component instanceof Components.Dropdown) {
    component.options = data.options;
    component.required = data.required;
  } else if (component instanceof Components.AnalyticsMatchesTable) {
    component.minRows = data.minRows;
    component.children = [];
  } else if (component instanceof Components.AnalyticsMatchesTableColumn) {
    component.dataType = data.dataType;
    component.header = data.header;
    component.textboxKey = data.textboxKey;
    component.value = data.value;
  } else if (component instanceof Components.Image) {
    component.imageId = data.imageId;
  }

  //load component events
  for (const eventData of data.componentEvents) {
    let event = new Events.Event(eventData.trigger);
    for (const actionData of eventData.actions) {
      let action = new Events.eventActionTypeRegistry[actionData.type as Events.EventActionType]();
      if (action instanceof Events.ActionRecordMatchEvent) {
        action.matchEventType = actionData.matchEventType;
        action.matchEventGroup = actionData.matchEventGroup;
      } else if (action instanceof Events.ActionStyleChange) {
        action.styles = actionData.styles;
        action.componentID = actionData.componentID;
      } else if (action instanceof Events.ActionTriggerEvent) {
        //add later
      } else if (action instanceof Events.ActionTextChange) {
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



//add listener for ctrl + z
document.addEventListener("keydown", (e) => {
  if (!e.ctrlKey || e.key.toLowerCase() != 'z') return;
  Actions.undoLastAction();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Delete") return;
  deleteSelectedComponent();
});

document.addEventListener("keydown", (e) => {
  if (!e.ctrlKey || e.key.toLowerCase() != 's') return;
  e.preventDefault();
  LocalStorage.saveLocalState();
});

/**
 * Deletes the component you have selected. 
 * Used for keybind and delete button
 */
function deleteSelectedComponent() {
  if (!selectedId || selectedId == null) return;
  let found = findComponent(selectedId);
  if (!found) return;
  if (found.component == null) return;

  Actions.saveAction(new Actions.Action(found.component, found.parent, Actions.ActionType.COMPONENT_DELETE));
  found.parent.children = found.parent.children.filter((c: Components.Component) => c.id !== found.component.id);
 
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
      Settings.setAppName(data.name);
      document.title = Settings.getAppName();

      //set the event types and groups
      MatchEvents.setEventTypes(data.events);
      MatchEvents.setEventGroups(data.groups);

      //loads the root component, which loads all other ones
      root = loadComponent(data.app);

      renderPreview();

      //save the newly loaded state
      LocalStorage.saveLocalState();
    };

    reader.readAsText(file);
  };
}

function setupExportButton() {
  let exportButton = document.getElementById("export");
  if (!exportButton) return;
  exportButton.onclick = MatchData.exportMatchData;
}

export function isPreviewMode(): boolean {
  return preview_mode;
}

export function setPreviewMode(value: boolean) {
  preview_mode = value;
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
  for (const match of MatchData.getAllMatches()) {
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
      //bluetooth.sendMatch(match);
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

function setupEditorButtons() {
  const undoButton = document.getElementById("editor-button-undo")
  if (undoButton) undoButton.onclick = (e) => {
    e.stopPropagation();
    Actions.undoLastAction();
  }
  
  const redoButton = document.getElementById("editor-button-redo");
  //This doesn't work yet :(

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
    LocalStorage.saveLocalState();
  }

  const uploadButton = document.getElementById("editor-button-upload");
  if (uploadButton) uploadButton.onclick = (e) => {
    e.stopPropagation();
    const loadButton = document.getElementById("load");
    if (loadButton && loadButton instanceof HTMLInputElement) loadButton.click();
  }

  const settingsButton = document.getElementById("editor-button-settings");
  if (settingsButton) settingsButton.onclick = (e) => {
    e.stopPropagation();
    Settings.openSettingsModal();
  }

  //switch to go between edit mode (unchecked) and preview mode (checked)
  const editorModeSwitch = document.getElementById("edit-mode-toggle");
  if (editorModeSwitch && editorModeSwitch instanceof HTMLInputElement) editorModeSwitch.onchange = (e) => {
    e.stopPropagation();

    if (editorModeSwitch.checked) {
      openPreviewMode();
    } else {
      openEditMode();
    }
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

/**
 * Util function for easily creating an element. 
 * Will make more thing use this soon because it's very useful.
 */
export function createElement(type: string, classList?: string[], parent?: HTMLElement): HTMLElement {
    let element = document.createElement(type);
    if (classList && classList.length != 0) element.classList.add(...classList);
    if (parent) parent.appendChild(element);

    return element;
}

//initialize buttons
setupLoadButton();
setupExportButton();
setupMatchesButton();
setupEditorButtons();

//setup copy, cut, and paste
Clipboard.initClipboard();

//load all saved image files and match data records from the database
MatchDataStore.loadAllMatches();
ImageStore.loadImages();

//initialize HTML components that get reused
Editor.initEventSelection();

//Get the saved state and load either the editor or runtime mode
LocalStorage.loadLocalState();

const editModeToggle = document.getElementById("edit-mode-toggle");
if (editModeToggle instanceof HTMLInputElement) {
  editModeToggle.checked = preview_mode;
}

if (preview_mode) {
  //idk if this is the best way to force load the render preview function but it works
  preview_mode = false;
  renderPreview();
  preview_mode = true;
  openPreviewMode();
} else {
  openEditMode();
}