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

  constructor(type: string) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.style = {};
    this.children = [];
    this.eventType = "None";
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
    editor.addStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement) {
    div.textContent = this.text;
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
    editor.addStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement) {
    let label: HTMLDivElement = document.createElement("div");
    label.id = this.id;
    label.textContent = matchdata.getCurrentMatch().getEventCount(this.eventType).toString();

    div.appendChild(label);
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
    editor.addStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement) {
    let button: HTMLButtonElement = document.createElement("button");
    button.textContent = this.text;

    button.onclick = (e) => {
      e.stopPropagation();
      if (app.isRuntimeMode()) {
        matchdata.getCurrentMatch().addEvent(new events.MatchEvent(this.eventType));
        updateCounters(this.eventType);
        console.log(matchdata.getCurrentMatch().matchEvents); //for testing, might remove later (or not, doesn't really matter)
      }
      app.renderPreview();
    };

    div.appendChild(button);
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
  }
}

export class Dropdown extends Component {
  //text: string;
  options: string[];
  //selection: string;

  constructor() {
    super("dropdown");
    //this.text = "New Dropdown";
    this.options = ["Option 1","Option 2"];
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
    editor.addStyleSection(this);
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
          matchdata.getCurrentMatch().removeType(t);
        });

        matchdata.getCurrentMatch().addEvent(new events.MatchEvent(this.options[select.selectedIndex] || "null"));
        updateCounters();
      }

    }

    select.onchange = (e) => {
      e.stopPropagation();
      //node.selected = e.target.value;
    };

    //div.appendChild(label);
    div.appendChild(select);
  }
}

export class Checkbox extends Component {
 // checked: boolean;
  //text: string;

  constructor() {
    super ("Checkbox");
   // this.checked = false;
   // this.text = "New Checkbox";
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    editor.addEventSelection(this);
    editor.addStyleSection(this);
  }

  render(div: HTMLDivElement) {
    let checkbox: HTMLInputElement = document.createElement("input");
    checkbox.checked = matchdata.getCurrentMatch().getEventCount(this.eventType) > 0;
    checkbox.type = "checkbox";

    checkbox.onchange = (e) => {
      e.stopPropagation();
     // this.checked = checkbox.checked;

      if (!app.isRuntimeMode()) return;

      //Handle changing the event
      if (checkbox.checked) {
        matchdata.getCurrentMatch().addEvent(new events.MatchEvent(this.eventType));
      } else {
        matchdata.getCurrentMatch().removeType(this.eventType);
      }

      updateCounters(this.eventType);

    }

    div.appendChild(checkbox);

  }
}

export class Layout extends Component {
  direction: string;
  text: string;

  constructor() {
    super("layout");
    this.direction = "vertical";
    this.text = "New Layout";
  }

  addEditorFeatures() {
    editor.addTextLabel(this);
    editor.addSelect("Direction", this.direction, ["vertical", "horizontal"], (val: any) => {
        this.direction = val;
        app.renderPreview();
    });
    editor.addStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement) {
    let title: HTMLDivElement = document.createElement("div");
    title.innerHTML = this.text;
    div.appendChild(title);

    div.classList.add("container");

    if (this.type === "layout" && this.direction === "horizontal") {
      div.classList.add("horizontal");
    }
  }
}

export class TeamNum extends Component {
  constructor() {
    super("teamnum");
  }

  addEditorFeatures(): void {
    editor.addStyleSection(this);
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
      
    editor.addStyleSection(this);
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
  }
}

export class MatchNum extends Component {
  constructor() {
    super("matchnum");
  }

  addEditorFeatures(): void {
    editor.addStyleSection(this);
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
  }
}

export class MatchType extends Component {
  constructor() {
    super("matchtype");
  }

  addEditorFeatures(): void {
    editor.addStyleSection(this);
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
  }
}

export class AllianceStation extends Component {
  constructor() {
    super("alliancestation");
  }

  addEditorFeatures(): void {
    editor.addStyleSection(this);
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
  }
}

export class ResetButton extends Component {
  constructor() {
    super("resetbutton");
  }

  addEditorFeatures(): void {
    
  }

  render(div: HTMLDivElement): void {
    let button: HTMLButtonElement = document.createElement("button");
    button.textContent = "Next Match";

    button.onclick = (e) => {
      e.stopPropagation();
      if (!app.isRuntimeMode()) return;
      matchdata.saveCurrentMatch();
      console.log(matchdata.getCurrentMatch());
      app.openDesigner();
      app.renderPreview();
      app.closeDesigner();
    };

    div.appendChild(button);

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
 * All types of components
 */
export const componentRegistry = {
  root: Root,
  label: Label,
  counter: Counter,
  button: Button,
  section: Section,
  dropdown: Dropdown,
  checkbox: Checkbox,
  textbox: TextBox,
  layout: Layout,
  teamnum: TeamNum,
  matchnum: MatchNum,
  matchtype: MatchType,
  resetbutton: ResetButton,
  alliancestation: AllianceStation,
} as const;

export type ComponentType = keyof typeof componentRegistry;

/**
 * Creates a component from a specific type (from componentRegistry)
 */
export function createComponent(type: ComponentType): Component {
  const ComponentClass = componentRegistry[type];
  return new ComponentClass();
}