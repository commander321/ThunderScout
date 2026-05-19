import * as editor from "./editor.js";
import * as app from "./app.js";
import * as matchdata from "./matchdata.js";
import * as events from "./events.js";

export abstract class Component {
  id: string;
  type: string;
  style: Record<string, any>;
  children: Component[];
  eventType: string;
  eventGroup: string;

  constructor(type: string) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.style = {};
    this.children = [];
    this.eventType = "None";
    this.eventGroup = "None";
  }

  /**
   * Creates the editor for the component
   */
  abstract addEditorFeatures(): void;

  /**
   * Renders the component for either editor mode or runtime mode
   */
  abstract render(div: HTMLDivElement): void;
}

export class Root extends Component {
  constructor() {
    super("root");
  }

  addEditorFeatures() {
    
  }

  render(div: HTMLDivElement) {

  }
}

export class Label extends Component {
  text: string;

  constructor() {
    super("label");
    this.text = "New Label";
  }

  addEditorFeatures() {
    editor.addTextLabel(this);
    editor.addLayoutStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement) {
    div.textContent = this.text;

    applyLayoutStlyes(div, this.style);
    applyTextStyles(div, this.style);
  }
}

export class Counter extends Component {
  //list of counters so that they can be updated
  static counters: Counter[] = [];

  constructor() {
    super("counter");
    Counter.counters.push(this);
  }

  addEditorFeatures() {
    editor.addEventSelection(this);
    editor.addLayoutStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement) {
    let label: HTMLDivElement = document.createElement("div");
    label.id = this.id;
    label.textContent = matchdata.getCurrentMatch().getEventCount(this.eventType).toString();

    div.appendChild(label);

    applyLayoutStlyes(div, this.style);
    applyTextStyles(label, this.style);
  }

  update() {
    let label = document.getElementById(this.id);
    if (!label) return;
    label.textContent = matchdata.getCurrentMatch().getEventCount(this.eventType).toString();
  }
}

export class Button extends Component {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;

  constructor() {
    super("button");
    this.text = "New Button";
    this.bold = false;
    this.italic = false;
    this.underline = false;
  }

  addEditorFeatures() {
    editor.addTextLabel(this);
    editor.addEventSelection(this);
    //Button styles aren't working now... hmm
    editor.addLayoutStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement) {
    let button: HTMLButtonElement = document.createElement("button");
    button.textContent = this.text;

    button.onclick = (e) => {
      e.stopPropagation();
      if (app.isRuntimeMode()) {
        matchdata.getCurrentMatch().addEvent(new events.MatchEvent(this.eventType, this.eventGroup));
        updateCounters(this.eventType);
        console.log(matchdata.getCurrentMatch().matchEvents); //for testing, might remove later (or not, doesn't really matter)
      }
      app.renderPreview();
    };

    div.appendChild(button);

    applyLayoutStlyes(div, this.style);
    applyTextStyles(button, this.style);
  }
}

export class Section extends Component {
  thickness: number;
  color: string;

  constructor() {
    super("section");
    this.thickness = 2;
    this.color = "#000000";
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    editor.addInput(editorDiv, "Thickness (px)", this.thickness || 2, (val: any) => {
        this.thickness = parseInt(val) || 2;
        app.renderPreview();
    }, "number");
    editor.addInput(editorDiv, "Color", this.color || "#000000", (val: any) => {
        this.color = val;
        app.renderPreview();
    }, "color");
  }

  render(div: HTMLDivElement) {
    let hr: HTMLHRElement = document.createElement("hr");

    hr.style.border = "none";
    hr.style.height = this.thickness + "px";
    hr.style.backgroundColor = this.color || "#000";

    hr.onclick = e => e.stopPropagation();

    div.appendChild(hr);

    applyLayoutStlyes(div, this.style);
  }
}

export class Dropdown extends Component {
  //text: string;
  options: string[];
  required: boolean;
  //selection: string;

  constructor() {
    super("dropdown");
    //this.text = "New Dropdown";
    this.options = ["Option 1","Option 2"];
    this.required = false;
    //this.selection = this.options[0];
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    //editor.addTextLabel(this);
    editor.addInput(editorDiv, 
        "Options (comma separated)",
        this.options.join(","),
        (val: any) => {
          this.options = val.split(",");
          app.renderPreview();
        }
    );
    editor.addGroupSection(this);

    editor.addInput(editorDiv, "Required?", this.required, (val: any) => {
      this.required = val.checked;
    }, "checkbox");

    editor.addLayoutStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement) {
    //if (!node.selected) node.selected = node.options[0];

    //let label: HTMLDivElement = document.createElement("div");
    //label.textContent = this.text;

    let select: HTMLSelectElement = document.createElement("select");

    this.options.forEach(o => {
      let opt: HTMLOptionElement = document.createElement("option");
      opt.value = o;
      opt.textContent = o;
      //if (o === node.selected) opt.selected = true;
      select.appendChild(opt);
    });

    select.onclick = e => {
      e.stopPropagation();

      //Handle events, remove all of the other options and add the selected one
      if (app.isRuntimeMode()) {
        this.options.forEach(t => {
          matchdata.getCurrentMatch().removeType(t, this.eventGroup);
        });

        matchdata.getCurrentMatch().addEvent(new events.MatchEvent(this.options[select.selectedIndex] || "null", this.eventGroup));
        updateCounters();
      }

    }

    select.onchange = (e) => {
      e.stopPropagation();
      //node.selected = e.target.value;
    };

    //div.appendChild(label);
    div.appendChild(select);

    applyLayoutStlyes(div, this.style);
    applyTextStyles(select, this.style);
  }
}

export class Checkbox extends Component {
 // checked: boolean;
  //text: string;

  constructor() {
    super ("checkbox");
   // this.checked = false;
   // this.text = "New Checkbox";
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    //checkbox features
    editor.addInput(editorDiv, "Scale", this.style.scale || 1, (val: any) => {
      this.style.scale = val;
      app.renderPreview();
    }, "number");

    editor.addEventSelection(this);
    editor.addLayoutStyleSection(this);
  }

  render(div: HTMLDivElement) {
    let checkbox: HTMLInputElement = document.createElement("input");
    checkbox.checked = matchdata.getCurrentMatch().getEventCount(this.eventType) > 0;
    checkbox.type = "checkbox";

    checkbox.onchange = (e) => {
      e.stopPropagation();
      //this.checked = checkbox.checked;

      if (!app.isRuntimeMode()) return;

      //Handle changing the event
      if (checkbox.checked) {
        matchdata.getCurrentMatch().addEvent(new events.MatchEvent(this.eventType, this.eventGroup));
      } else {
        matchdata.getCurrentMatch().removeType(this.eventType, this.eventGroup);
      }

      updateCounters(this.eventType);

    }

    div.appendChild(checkbox);

    applyLayoutStlyes(div, this.style);
    checkbox.style.scale = this.style.scale || 1;
  }
}

export class Layout extends Component {
  direction: string;

  constructor() {
    super("layout");
    this.direction = "vertical";
  }

  addEditorFeatures() {
    editor.addSelect("Direction", this.direction, ["vertical", "horizontal"], (val: any) => {
        this.direction = val;
        app.renderPreview();
    });
    editor.addLayoutStyleSection(this);
  }

  render(div: HTMLDivElement) {
    div.classList.add("container");

    if (this.type === "layout" && this.direction === "horizontal") {
      div.classList.add("horizontal");
    }

    applyLayoutStlyes(div, this.style);
  }
}

export class TeamNum extends Component {
  constructor() {
    super("teamnum");
  }

  addEditorFeatures(): void {
    editor.addLayoutStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement): void {
    let team: HTMLInputElement = document.createElement("input");
    team.type = "number";

    team.onchange = (e) => {
      matchdata.getCurrentMatch().teamNumber = parseInt(team.value);
      console.log(matchdata.getCurrentMatch());
    }

    team.valueAsNumber = matchdata.getCurrentMatch().teamNumber;

    div.appendChild(team);

    applyLayoutStlyes(div, this.style);
    applyTextStyles(team, this.style);
  }
}

export class TextBox extends Component {

  //content: string;
  key: string;

  constructor() {
    super("textbox");
   // this.content = "";
    this.key = "";
  }

  addEditorFeatures(): void {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    editor.addInput(editorDiv, "Textbox ID (event name)", this.key, (val: any) => {
          this.key = val;
          app.renderPreview();
        }, "text");
      
    editor.addLayoutStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement): void {
      let textbox = document.createElement("input");
      textbox.type = "text";

      textbox.value = matchdata.getCurrentMatch().getTextData(this.key);

      textbox.onchange = (e) => {
        e.stopPropagation();

        //this.content = textbox.value;

        if (!app.isRuntimeMode()) return;

        console.log(matchdata.getCurrentMatch().textData);//for testing this

        //handle setting the text data value
        matchdata.getCurrentMatch().setTextData(this.key, textbox.value);
      }

      div.appendChild(textbox);

      applyLayoutStlyes(div, this.style);
      applyTextStyles(textbox, this.style);
  }
}

export class MatchNum extends Component {
  constructor() {
    super("matchnum");
  }

  addEditorFeatures(): void {
    editor.addLayoutStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement): void {
    let match: HTMLInputElement = document.createElement("input");
    match.type = "number";

    match.onchange = (e) => {
      matchdata.getCurrentMatch().matchNumber = parseInt(match.value);
      console.log(matchdata.getCurrentMatch());
    }

    match.valueAsNumber = matchdata.getCurrentMatch().matchNumber;

    div.appendChild(match);

    applyLayoutStlyes(div, this.style);
    applyTextStyles(match, this.style);
  }
}

export class MatchType extends Component {
  constructor() {
    super("matchtype");
  }

  addEditorFeatures(): void {
    editor.addLayoutStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement): void {
    let select: HTMLSelectElement = document.createElement("select");

    let practice: HTMLOptionElement = document.createElement("option");
    practice.text = "Practice";
    let quals: HTMLOptionElement = document.createElement("option");
    quals.text = "Quals";
    let finals: HTMLOptionElement = document.createElement("option");
    finals.text = "Finals";
    let other: HTMLOptionElement = document.createElement("option");
    other.text = "Other";

    select.add(practice);
    select.add(quals);
    select.add(finals);
    select.add(other);

    select.onchange = (e) => {
      matchdata.getCurrentMatch().matchType = matchdata.MatchType[select.value as keyof typeof matchdata.MatchType];
    }

    select.value = matchdata.getCurrentMatch().matchType;

    div.appendChild(select);

    applyLayoutStlyes(div, this.style);
    applyTextStyles(select, this.style);
  }
}

export class AllianceStation extends Component {
  constructor() {
    super("alliancestation");
  }

  addEditorFeatures(): void {
    editor.addLayoutStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement): void {
    let select: HTMLSelectElement = document.createElement("select");

    let r1: HTMLOptionElement = document.createElement("option");
    r1.text = "Red_1";
    let r2: HTMLOptionElement = document.createElement("option");
    r2.text = "Red_2";
    let r3: HTMLOptionElement = document.createElement("option");
    r3.text = "Red_3";
    let b1: HTMLOptionElement = document.createElement("option");
    b1.text = "Blue_1";
    let b2: HTMLOptionElement = document.createElement("option");
    b2.text = "Blue_2";
    let b3: HTMLOptionElement = document.createElement("option");
    b3.text = "Blue_3";

    select.add(r1);
    select.add(r2);
    select.add(r3);
    select.add(b1);
    select.add(b2);
    select.add(b3);

    select.onchange = (e) => {
      matchdata.getCurrentMatch().allianceStation = matchdata.AllianceStation[select.value as keyof typeof matchdata.AllianceStation];
    }

    select.value = matchdata.getCurrentMatch().allianceStation;

    div.appendChild(select);

    applyLayoutStlyes(div, this.style);
    applyTextStyles(select, this.style);
  }
}

export class ResetButton extends Component {

  text: string;

  constructor() {
    super("resetbutton");

    this.text = "Next Match";
  }

  addEditorFeatures(): void {
    editor.addTextLabel(this);
    editor.addLayoutStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement): void {
    let button: HTMLButtonElement = document.createElement("button");
    button.textContent = this.text;

    button.onclick = (e) => {
      e.stopPropagation();
      if (!app.isRuntimeMode()) return;

      //Check for required components (THIS IS 1511 SPECIFIC FOR CHAMPS!!!!)
      /*
      if (matchdata.getCurrentMatch().getEventsByGroup("StartLoc").length == 0 || matchdata.getCurrentMatch().getEventCount("None", "StartLoc") > 0) {
        alert("Please select a starting location!")
        return;
      }
      if (matchdata.getCurrentMatch().getEventsByGroup("WinAuto").length == 0 || matchdata.getCurrentMatch().getEventCount("None", "WinAuto") > 0) {
        alert("Please select a win auto option!")
        return;
      }
      if (matchdata.getCurrentMatch().getTextData("Scouter Name").trim().length === 0) {
        alert("Please enter a scouter name!");
        return;
      }*/

      document.documentElement.scrollTop = 0;

      matchdata.saveCurrentMatch();
      console.log(matchdata.getCurrentMatch());
      const editorEnabled: boolean = app.getEditorEnabled();
      app.setEditorEnabled(true);
      app.openDesigner();
      app.renderPreview();
      app.closeDesigner();
      app.setEditorEnabled(editorEnabled);
      if (editorEnabled) {
        document.getElementById("edit")?.classList.remove("hidden")
      } else {
        document.getElementById("edit")?.classList.add("hidden")
      }
    };

    div.appendChild(button);

    applyLayoutStlyes(div, this.style);
    applyTextStyles(button, this.style);
  }
}




/**
* Updates all event counter components because event counts change all the time
*/
function updateCounters(type?: string) {
  for (const counter of Counter.counters) {
    if (type) {
      if (counter.eventType === type) counter.update();
    } else {
      counter.update();
    }
  }
}

/**
 * Applies styles to a component based on it's styles list. 
 * This is where it makes the actual CSS of the components
 */
function applyLayoutStlyes(node: HTMLElement, style: Record<string, any>) {
  if (!style) return;

  node.style.background = style.background || "";
  node.style.width = (style.width || 100) + "%";

  node.style.paddingLeft = (style.paddingLeft == "0" ? 0 : (style.paddingLeft || 5)) + "px";
  node.style.paddingRight = (style.paddingRight == "0" ? 0 : (style.paddingRight || 5)) + "px";
  node.style.paddingTop = (style.paddingTop == "0" ? 0 : (style.paddingTop || 5)) + "px";
  node.style.paddingBottom = (style.paddingBottom == "0" ? 0 : (style.paddingBottom || 5)) + "px";

  node.style.marginTop = (style.marginTop == "0" ? 0 : (style.marginTop || 6)) + "px";
  node.style.marginBottom = (style.marginBottom == "0" ? 0 : (style.marginBottom || 6)) + "px";

  if (style.allignment === "right") {
    node.style.marginRight = (style.marginRight == "0" ? 0 : (style.marginRight || 0)) + "px";
    node.classList.remove("center-align");
    node.classList.remove("left-align");
    node.classList.add("right-align");
  } else if (style.allignment === "center") {
    node.classList.remove("right-align");
    node.classList.remove("left-align");
    node.classList.add("center-align");
  } else {
    node.classList.remove("right-align");
    node.classList.remove("center-align");
    node.classList.add("left-align");
    node.style.marginLeft = (style.marginLeft == "0" ? 0 : (style.marginLeft || 0)) + "px";
  }  
}

/**
 * Apply CSS styles for text
 */
function applyTextStyles(node: HTMLElement, style: Record<string, any>) {
  node.style.fontSize = (style.textSize || 14) + "px";
  node.style.fontWeight = style.bold ? "bold" : "normal";
  node.style.fontStyle = style.fontStyle || ""
  node.style.textDecoration = style.textDecoration || ""
  node.style.color = style.color || "#000000";
}

/**
 * All types of components
 */
export const componentRegistry = {
  root: Root,
  layout: Layout,
  label: Label,
  button: Button,
  counter: Counter,
  checkbox: Checkbox,
  dropdown: Dropdown,
  textbox: TextBox,
  section: Section,
  teamnum: TeamNum,
  matchnum: MatchNum,
  matchtype: MatchType,
  alliancestation: AllianceStation,
  resetbutton: ResetButton,
} as const;

export const COMPONENT_TYPES: string[][] = [
  //[componentClass, displayName, description]
  ["root", "Root", ""],
  ["layout", "Layout", "Stores other components to organize your app. Can be oriented either vertically or horizontally."],
  ["label", "Text Label", "Text."],
  ["button", "Button", "When clicked, an event of a specified type is tracked."],
  ["counter", "Event Counter", "Displays the number of a specific type of event that has occured during the match."],
  ["checkbox", "Checkbox", "Yes/no option that corresponds to a match event."],
  ["dropdown", "Dropdown", "Select an event type from a specified list of options."],
  ["textbox", "Text Box", "Text box"],
  ["section", "Section", "Line to separate sections of the app."],
  ["teamnum", "Team Number", "Enter the team number for a match."],
  ["matchnum", "Match Number", "Enter the match number for a match."],
  ["matchtype", "Match Type", "Select the type of match (practice, quals, etc)."],
  ["alliancestation", "Alliance Station", "Select the alliance station for the match (Red 1, Blue 1, etc)."],
  ["resetbutton", "Next Match Button", "Button to save the match data, transfer it, and reset the app to the next match."]
];

export type ComponentType = keyof typeof componentRegistry;

/**
 * Creates a component from a specific type (from componentRegistry)
 */
export function createComponent(type: ComponentType): Component {
  const ComponentClass = componentRegistry[type];
  return new ComponentClass();
}