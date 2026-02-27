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
  text: string;
  value: number;

  constructor() {
    super("counter");
    this.text = "New Counter";
    this.value = 0;
  }

  addEditorFeatures() {
    editor.addTextLabel(this);
    editor.addStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement) {
    let label: HTMLDivElement = document.createElement("div");
    label.textContent = this.text;

    let value: HTMLDivElement = document.createElement("div");
    value.innerHTML = "<strong>" + this.value + "</strong>";

    let inc: HTMLButtonElement = document.createElement("button");
    inc.textContent = "+";
    inc.onclick = (e) => {
      e.stopPropagation();
      this.value++;
      app.renderPreview();
    };

    let dec: HTMLButtonElement = document.createElement("button");
    dec.textContent = "-";
    dec.onclick = (e) => {
      e.stopPropagation();
      this.value--;
      app.renderPreview();
    };

    div.appendChild(label);
    div.appendChild(value);
    div.appendChild(inc);
    div.appendChild(dec);
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
        console.log(matchdata.getCurrentMatch().matchEvents);
      } else {
        console.log("not runtime");
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
  text: string;
  options: string[];
  //selection: string;

  constructor() {
    super("dropdown");
    this.text = "New Dropdown";
    this.options = ["Option 1","Option 2"];
    //this.selection = this.options[0];
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    editor.addTextLabel(this);
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

    let label: HTMLDivElement = document.createElement("div");
    label.textContent = this.text;

    let select: HTMLSelectElement = document.createElement("select");

    this.options.forEach(o => {
      let opt: HTMLOptionElement = document.createElement("option");
      opt.value = o;
      opt.textContent = o;
      //if (o === node.selected) opt.selected = true;
      select.appendChild(opt);
    });

    select.onclick = e => e.stopPropagation();

    select.onchange = (e) => {
      e.stopPropagation();
      //node.selected = e.target.value;
    };

    div.appendChild(label);
    div.appendChild(select);
  }
}

export class Checkbox extends Component {
  checked: boolean;
  text: string;

  constructor() {
    super ("Checkbox");
    this.checked = false;
    this.text = "New Checkbox";
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    editor.addTextLabel(this);
    editor.addStyleSection(this);
    editor.addTextSection(this);
  }

  render(div: HTMLDivElement) {
    let checkbox: HTMLInputElement = document.createElement("input");
    checkbox.checked = this.checked;
    checkbox.type = "checkbox";

    checkbox.onchange = (e) => {
      e.stopPropagation();
      this.checked = checkbox.checked;
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
    title.innerHTML = "<strong>" + this.text + "</strong>";
    div.appendChild(title);

    div.classList.add("container");

    if (this.type === "layout" && this.direction === "horizontal") {
      div.classList.add("horizontal");
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
  layout: Layout
} as const;

export type ComponentType = keyof typeof componentRegistry;

/**
 * Creates a component from a specific type (from componentRegistry)
 */
export function createComponent(type: ComponentType): Component {
  const ComponentClass = componentRegistry[type];
  return new ComponentClass();
}