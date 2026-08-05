import * as app from "./app.js";
import * as matchevents from "./matchevents.js";
import * as matchdata from "./matchdata.js";
import { createElement } from "./app.js";

let appName: string = "";

//app name
export function getAppName(): string {
    return appName;
}

export function setAppName(name: string) {
    appName = name;
}

/**
 * Opens the settings modal
 */
export function openSettingsModal() {
    let overlay = document.getElementById("overlay-settings");
    if (!overlay) return;
    overlay.classList.remove("hidden");
    overlay.onclick = closeSettingsModal;

    let modal = document.getElementById("modal-settings");
    if (!modal) return;
    modal.classList.remove("hidden");

    //app name
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

    //app background color


    //event types
    addEventList("type");
    addEventList("group");

    //reset button
    let resetButton = document.getElementById("settings-reset-button");
    if (resetButton && resetButton instanceof HTMLButtonElement) {
    resetButton.onclick = (e) => {
        e.stopPropagation();

        matchdata.clearAllMatches();
    };
    }
}

/**
 * Closes the settings modal
 */
export function closeSettingsModal() {
  let overlay = document.getElementById("overlay-settings");
  if (overlay) overlay.classList.add("hidden");

  let modal = document.getElementById("modal-settings");
  if (modal) modal.classList.add("hidden");
}



//Functions to add setting options to the modal

/**
 * Add either a list of groups or types that you can add to. 
 * Same code as in the editor
 */
function addEventList(type: "group" | "type") {
    const matchEventsList = document.getElementById(type === "group" ? "settings-event-groups" : "settings-event-types");
    matchEventsList?.replaceChildren();
    if (!matchEventsList) return;
    for (const eventType of (type === "type" ? matchevents.getEventTypes() : matchevents.getEventGroups())) {
        let eventTypeDiv = createElement("div", ["event-selection-dropdown-button"], matchEventsList);
        let eventTypeText = createElement("div", ["event-selection-dropdown-button-text"], eventTypeDiv);
        eventTypeText.innerHTML = eventType;
        let eventTypeMenuIconDiv = createElement("div", ["event-selection-dropdown-button-delete"], eventTypeDiv);
        let eventTypeMenuIcon = createElement("i", ["fa", "fa-times"], eventTypeMenuIconDiv);

        //delete button
        eventTypeMenuIconDiv.onclick = (e) => {
            e.stopPropagation();
             if (type === "type") {
                matchevents.removeEventType(eventType);
            } else {
                matchevents.removeEventGroup(eventType);
            } 
            eventTypeDiv.remove();
        }
    }

    //button to add a new event type
    let addButtonDiv = createElement("div", ["event-selection-dropdown-button"], matchEventsList);
    let addButtonIconDiv = createElement("div", ["event-selection-dropdown-button-text"], addButtonDiv)
    let addButtonIcon = createElement("i", ["fa", "fa-plus"], addButtonIconDiv);
    let addButtonText = createElement("div", [], addButtonDiv);

    //text to enter a new event type, hidden by default
    let addEventDiv = createElement("div", ["hidden"], matchEventsList);
    let addEventIconDiv = createElement("div", ["event-selection-add-remove"], addEventDiv);
    let addEventIcon = createElement("i", ["fa", "fa-times"], addEventIconDiv);
    let addEventDivText = createElement("input", ["event-selection-add-input"], addEventDiv);

    //press enter to add a new event type
    addEventDivText.addEventListener("keypress", (e) => {
        if (e.key != "Enter") return;
        e.preventDefault();

        if (!(addEventDivText instanceof HTMLInputElement)) return;
        const eventType = addEventDivText.value;

        //add type/group if it doesn't exist
        if (type === "type") {
            if (matchevents.getEventTypes().includes(eventType)) return;
            matchevents.addEventType(eventType);
        } else {
            if (matchevents.getEventGroups().includes(eventType)) return;
            matchevents.addEventGroup(eventType);
        }

        //add to the dropdown (same code as above)
        let eventTypeDiv = createElement("div", ["event-selection-dropdown-button"]);
        let eventTypeText = createElement("div", ["event-selection-dropdown-button-text"], eventTypeDiv);
        eventTypeText.innerHTML = eventType;
        let eventTypeMenuIconDiv = createElement("div", ["event-selection-dropdown-button-delete"], eventTypeDiv);
        let eventTypeMenuIcon = createElement("i", ["fa", "fa-times"], eventTypeMenuIconDiv);
        
        //delete button
        eventTypeMenuIconDiv.onclick = (e) => {
            e.stopPropagation();
            if (type === "type") {
                matchevents.removeEventType(eventType);
            } else {
                matchevents.removeEventGroup(eventType);
            } 
            eventTypeDiv.remove();
        }
        matchEventsList.insertBefore(eventTypeDiv, matchEventsList.children[matchEventsList.children.length-2] || null);

        //add the plus sign button again
        addButtonDiv.classList.remove("hidden");
        addButtonDiv.classList.add("event-selection-dropdown-button");
        addEventDiv.classList.add("hidden");
        addEventDiv.classList.remove("event-selection-add-input-button");

        //clear the text input
        addEventDivText.value = "";
    })

    //add a new row with a text field
    addButtonDiv.onclick = (e) => {
    e.stopPropagation();

    addButtonDiv.classList.add("hidden");
    addButtonDiv.classList.remove("event-selection-dropdown-button");
    addEventDiv.classList.remove("hidden");
    addEventDiv.classList.add("event-selection-add-input-button");

    //select the textbox
    addEventDivText.focus();
    (addEventDivText as HTMLInputElement).select();
    }

    //prevent the text from closing the menu when clicked
    addEventDiv.onclick = (e) => {e.stopPropagation();}

    //x button to cancel the new event type input
    addEventIconDiv.onclick = (e) => {
    e.stopPropagation();

    //add the plus sign button again
    addButtonDiv.classList.remove("hidden");
    addButtonDiv.classList.add("event-selection-dropdown-button");
    addEventDiv.classList.add("hidden");
    addEventDiv.classList.remove("event-selection-add-input-button");

    //clear the text input
    (addEventDivText as HTMLInputElement).value = "";
    }
}