import * as MatchEvents from "../data/matchevents.js";
import * as MatchData from "../data/matchdata.js";
import * as App from "../app.js";
import * as Settings from "../settings.js";

/**
 * Save the state of the app to the local storage
 */
export function saveLocalState() {
  localStorage.setItem("preview_mode", JSON.stringify(App.isPreviewMode()));
  localStorage.setItem("editor_enabled", JSON.stringify(App.getEditorEnabled()));
  localStorage.setItem("event_code", JSON.stringify(MatchData.getCurrentMatch().eventCode));
  localStorage.setItem("events", JSON.stringify(MatchEvents.getEventTypes()));
  localStorage.setItem("groups", JSON.stringify(MatchEvents.getEventGroups()));
  localStorage.setItem("app", JSON.stringify(App.getRoot(), (key, val) => {
    return (key == "styleTypes" || key == "divElement" || key == "component") ? undefined : val;
  }));
  localStorage.setItem("app_name", JSON.stringify(Settings.getAppName()));
}

/**
 * Load the app state
 */
export function loadLocalState() {
  const saved_runtime_mode = localStorage.getItem("runtime_mode");
  if (saved_runtime_mode) {
    App.setPreviewMode(JSON.parse(saved_runtime_mode));
  }
  
  const saved_editor_enabled = localStorage.getItem("editor_enabled");
  if (saved_editor_enabled) App.setEditorEnabled(JSON.parse(saved_editor_enabled));

  const saved_event_code = localStorage.getItem("event_code");
  if (saved_event_code) MatchData.getCurrentMatch().eventCode = JSON.parse(saved_event_code);

  const saved_events = localStorage.getItem("events");
  if (saved_events) MatchEvents.setEventTypes(JSON.parse(saved_events));

  const saved_groups = localStorage.getItem("groups");
  if (saved_groups) MatchEvents.setEventGroups(JSON.parse(saved_groups));

  const saved_app = localStorage.getItem("app");
  if (saved_app) App.setRoot(App.loadComponent(JSON.parse(saved_app)));

  const saved_app_name = localStorage.getItem("app_name");
  if (saved_app_name) {
    Settings.setAppName(JSON.parse(saved_app_name));
    document.title = JSON.parse(saved_app_name);
  }
}