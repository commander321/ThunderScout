import * as editor from "./editor.js";
import * as app from "./app.js";
import * as matchdata from "./matchdata.js";
import * as matchevents from "./matchevents.js";
import * as storage from "./storage.js";
import * as events from "./events.js"
import * as style from "./style.js";
import { v4 as uuid } from 'uuid';
import { createElement } from "./app.js";

export abstract class Component {
  id: string;
  type: string;
  style: Record<string, any>;
  children: Component[];
  eventType: matchevents.EventPointer;
  eventGroup: matchevents.EventPointer; 
  componentEvents: events.Event[];
  divElement: HTMLDivElement | undefined;
  abstract readonly styleTypes: style.Style[];

  constructor(type: string) {
    this.id = uuid();
    this.type = type;
    this.style = {};
    this.children = [];
    this.eventType = {type: "type", value: "None"};
    this.eventGroup = {type: "group", value: "None"};;
    this.componentEvents = [];
  }

  /**
   * Creates the editor for the component
   */
  abstract addEditorFeatures(): void;

  /**
   * Renders the component for either editor mode or runtime mode and sets its current div
   */
  abstract render(div: HTMLDivElement): void;

  /**
   * Applies the components styles to its HTML element
   */
  abstract applyStyles(overridenStyles?: Record<string, any>): void;
}

export class Root extends Component {
  readonly styleTypes: style.Style[] = [];

  constructor() {
    super("root");
  }

  addEditorFeatures() {
    
  }

  render(div: HTMLDivElement) {

  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      
  }
}

export class Label extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.textStyleTypes, ...style.borderStyleTypes];
  text: string;

  constructor() {
    super("label");
    this.text = "New Label";
  }

  addEditorFeatures() {
    editor.addTextEditor(this, true);
    //editor.addTextLabel(this);
    editor.addLayoutStyleSection(this);
    editor.addBorderSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    div.textContent = this.text;

    events.applyComponentEvents(this, div);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
    if (!this.divElement) return;

    for (const styleType of this.styleTypes) {
      styleType.applyToNode(this.divElement, getCorrectStyles(styleType, this.style, overridenStyles));
    }
  }
}

export class Counter extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.textStyleTypes, ...style.borderStyleTypes];

  //list of counters so that they can be updated
  static counters: Counter[] = [];

  constructor() {
    super("counter");
    Counter.counters.push(this);
  }

  addEditorFeatures() {
    
    editor.addMatchEventSection(this);
    editor.addTextEditor(this, false, matchdata.getCurrentMatch().getEventCount(this.eventType.value, this.eventGroup.value).toString());
    editor.addLayoutStyleSection(this);
    editor.addBorderSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    let label: HTMLDivElement = document.createElement("div");
    label.id = this.id;
    label.textContent = matchdata.getCurrentMatch().getEventCount(this.eventType.value, this.eventGroup.value).toString();

    div.appendChild(label);

    events.applyComponentEvents(this, label);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

  update() {
    let label = document.getElementById(this.id);
    if (!label) return;
    label.textContent = matchdata.getCurrentMatch().getEventCount(this.eventType.value, this.eventGroup.value).toString();
  }
}

export class Button extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.textStyleTypes, ...style.borderStyleTypes, style.buttonColor, style.buttonHoverColor];
  text: string;

  constructor() {
    super("button");
    this.text = "New Button";
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    editor.addNewEventSection(this);

    editor.addTextEditor(this, true);

    //add a button styles section (for background colors, hover colors, etc)
    editorDiv.appendChild(document.createElement("hr"));
    let label = document.createElement("div");
    label.textContent = "Button Style";
    editorDiv.appendChild(label);
    editorDiv.appendChild(document.createElement("br"));

    editor.addInput(this, editorDiv, style.buttonColor.displayName, style.buttonColor);
    editor.addInput(this, editorDiv, style.buttonHoverColor.displayName, style.buttonHoverColor);

    editor.addLayoutStyleSection(this);
    editor.addBorderSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    let button: HTMLButtonElement = document.createElement("button");
    button.textContent = this.text;

   /* button.onclick = (e) => {
      //e.stopPropagation();
      if (app.isRuntimeMode()) {
        if (this.decrease) {
          matchdata.getCurrentMatch().removeLatestEvent(this.eventType, this.eventGroup);
        } else {
          matchdata.getCurrentMatch().addEvent(new matchevents.MatchEvent(this.eventType, this.eventGroup));
        }
        updateCounters(this.eventType);
        //console.log(matchdata.getCurrentMatch().matchEvents); //for testing, might remove later (or not, doesn't really matter)
      }
      app.renderPreview();
    };*/

    button.onmouseover = (e) => {
      e.stopPropagation();
      button.style.backgroundColor = this.style.buttonHoverColor || "#E0E0E0";
      if (app.isRuntimeMode()) {
        button.style.cursor = "pointer";
      }
    }

    button.onmouseout = (e) => {
      e.stopPropagation();
      button.style.backgroundColor = this.style.buttonColor || "#F0F0F0";
      button.style.cursor = "auto";
    }

    div.appendChild(button);

    button.style.backgroundColor = this.style.buttonColor || "#F0F0F0";

    events.applyComponentEvents(this, button);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;
      
      let button = this.divElement.firstChild;
      if (!(button instanceof HTMLElement)) return;

      for (const styleType of this.styleTypes) {
        if (style.layoutStyleTypes.includes(styleType)) {
          styleType.applyToNode(this.divElement, getCorrectStyles(styleType, this.style, overridenStyles));
        }
        styleType.applyToNode(button, getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class Section extends Component {
  readonly styleTypes: style.Style[] = [style.width, style.thickness, style.background];
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

    editor.addInput(this, editorDiv, style.width.displayName, style.width);
    editor.addInput(this, editorDiv, style.thickness.displayName, style.thickness);
    editor.addInput(this, editorDiv, style.background.displayName, style.background);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    let hr: HTMLHRElement = document.createElement("hr");

    hr.style.border = "none";
    hr.style.backgroundColor = this.style[style.background.style] || style.background.defaultValue;

    div.appendChild(hr);

    div.style.margin = "0px";
    div.style.padding = "0px";
    hr.style.margin = "0px";
    hr.style.padding = "0px";

    div.style.width = this.style.width ? (this.style.width == 0 ? "auto" : this.style.width + "px") : "auto";
    hr.style.width = this.style.width ? (this.style.width == 0 ? "auto" : this.style.width + "px") : "auto";

    div.style.height = (this.style.thickness || 2) + "px";
    hr.style.height = (this.style.thickness || 2) + "px";

    events.applyComponentEvents(this, hr);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;
      for (const styleType of this.styleTypes) {
        styleType.applyToNode(this.divElement, getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class Dropdown extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.textStyleTypes, ...style.borderStyleTypes];
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
    /*
    editor.addInput(this, editorDiv, 
        "Options (comma separated)",
        this.options.join(","),
        (val: any) => {
          this.options = val.split(",");
          app.renderPreview();
        }
    );*/
    //editor.addGroupSection(this);

    /*
    editor.addInput(this, editorDiv, "Required?", this.required, (val: any) => {
      this.required = val.checked;
    }, "checkbox");*/

    editor.addTextEditor(this, false, this.options.toString());
    editor.addLayoutStyleSection(this);
    //editor.addTextSection(this);
    editor.addBorderSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

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
      //e.stopPropagation();

      //Handle events, remove all of the other options and add the selected one
      if (app.isRuntimeMode()) {
        this.options.forEach(t => {
          matchdata.getCurrentMatch().removeType(t, this.eventGroup.value);
        });

        matchdata.getCurrentMatch().addEvent(new matchevents.MatchEvent(this.options[select.selectedIndex] || "null", this.eventGroup.value));
        updateCounters();
      }

    }

    select.onchange = (e) => {
      e.stopPropagation();
      //node.selected = e.target.value;
    };

    div.appendChild(select);

    events.applyComponentEvents(this, select);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;
      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class Checkbox extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.borderStyleTypes, style.scale, style.checkboxColor, style.checkboxCheckedColor];

  constructor() {
    super ("checkbox");
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    editor.addMatchEventSection(this);

    //checkbox features
    editorDiv.appendChild(document.createElement("hr"));
    let label = document.createElement("div");
    label.textContent = "Checkbox Style";
    editorDiv.appendChild(label);
    editorDiv.appendChild(document.createElement("br"));

    editor.addInput(this, editorDiv, style.scale.displayName, style.scale);
    editor.addInput(this, editorDiv, style.checkboxColor.displayName, style.checkboxColor);
    editor.addInput(this, editorDiv, style.checkboxCheckedColor.displayName, style.checkboxCheckedColor);

    editor.addLayoutStyleSection(this);
    editor.addBorderSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    let checkbox: HTMLInputElement = document.createElement("input");
    checkbox.checked = matchdata.getCurrentMatch().getEventCount(this.eventType.value) > 0;
    checkbox.type = "checkbox";

    checkbox.onchange = (e) => {
      e.stopPropagation();

      if (!app.isRuntimeMode()) return;

      //Handle changing the event
      if (checkbox.checked) {
        matchdata.getCurrentMatch().addEvent(new matchevents.MatchEvent(this.eventType.value, this.eventGroup.value));
      } else {
        matchdata.getCurrentMatch().removeType(this.eventType.value, this.eventGroup.value);
      }

      updateCounters(this.eventType.value);

    }

    div.appendChild(checkbox);

    events.applyComponentEvents(this, checkbox);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class Layout extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.borderStyleTypes];

  constructor() {
    super("layout");
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    editor.addSelect(this, editorDiv, style.direction.displayName, style.direction);

    editor.addLayoutStyleSection(this);
    editor.addBorderSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    div.classList.add("container");

    if (this.type === "layout" && this.style.direction === "horizontal") {
      div.classList.add("horizontal");
    }

    events.applyComponentEvents(this, div);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(this.divElement, getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class TeamNum extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.textStyleTypes, ...style.borderStyleTypes];

  constructor() {
    super("teamnum");
  }

  addEditorFeatures(): void {
    editor.addLayoutStyleSection(this);
    editor.addTextEditor(this, false, matchdata.getCurrentMatch().teamNumber.toString());
    editor.addBorderSection(this);
  }

  render(div: HTMLDivElement): void {
    this.divElement = div;

    let team: HTMLInputElement = document.createElement("input");
    team.type = "number";

    team.onchange = (e) => {
      matchdata.getCurrentMatch().teamNumber = parseInt(team.value);
    }

    team.valueAsNumber = matchdata.getCurrentMatch().teamNumber;

    div.appendChild(team);

    div.style.width = "fit-content";
    div.style.height = "auto";
    team.style.width = this.style.width ? (this.style.width == 0 ? "fit-content" : this.style.width + "px") : "fit-content";
    team.style.height = this.style.height ? (this.style.height == 0 ? "auto" : this.style.height + "px") : "auto";
    team.style.marginBottom = "0px";

    events.applyComponentEvents(this, team);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }

      forceMatchInputStyles(this.divElement, this.style, overridenStyles);
  }

}

export class TextBox extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.textStyleTypes, ...style.borderStyleTypes];

  key: string;

  constructor() {
    super("textbox");
    this.key = "";
  }

  addEditorFeatures(): void {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    /*
    editor.addInput(this, editorDiv, "Textbox ID (event name)", this.key, (val: any) => {
          this.key = val;
          app.renderPreview();
        }, "text");*/
      
    editor.addLayoutStyleSection(this);
    editor.addTextEditor(this, false, matchdata.getCurrentMatch().getTextData(this.key));
    editor.addBorderSection(this);
  }

  render(div: HTMLDivElement): void {
      this.divElement = div;

      let textbox = document.createElement("input");
      textbox.type = "text";

      textbox.value = matchdata.getCurrentMatch().getTextData(this.key);

      textbox.onchange = (e) => {
        e.stopPropagation();

        if (!app.isRuntimeMode()) return;

        //handle setting the text data value
        matchdata.getCurrentMatch().setTextData(this.key, textbox.value);
      }

      div.appendChild(textbox);

      events.applyComponentEvents(this, textbox);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;
  
      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }

      forceMatchInputStyles(this.divElement, this.style, overridenStyles);
  }

}

export class Image extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.borderStyleTypes];

  imageId: string;

  constructor() {
    super("image");

    this.imageId = "";
  }

  addEditorFeatures(): void {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    editor.addImageSelection(this, "imageId");

    let imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.accept = "image/*"
    imageInput.onchange = () => {
      if (!imageInput) return;

      const file = imageInput.files?.[0];
      if (!file) return;

      this.imageId = uuid();
      storage.uploadImage(this.imageId, file);

      app.renderPreview();
    }

    editorDiv.appendChild(imageInput);

    editor.addLayoutStyleSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    let image = document.createElement("img");

    image.src = storage.getImageURL(this.imageId);
    image.style.width = "100%";
    image.style.height = "100%";
    
    div.appendChild(image);

    events.applyComponentEvents(this, image);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(this.divElement, getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class MatchNum extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.textStyleTypes, ...style.borderStyleTypes];

  constructor() {
    super("matchnum");
  }

  addEditorFeatures(): void {
    editor.addLayoutStyleSection(this);
    editor.addTextEditor(this, false, matchdata.getCurrentMatch().matchNumber.toString());
    editor.addBorderSection(this);
  }

  render(div: HTMLDivElement): void {
    this.divElement = div;

    let match: HTMLInputElement = document.createElement("input");
    match.type = "number";

    match.onchange = (e) => {
      matchdata.getCurrentMatch().matchNumber = parseInt(match.value);
    }

    match.valueAsNumber = matchdata.getCurrentMatch().matchNumber;

    div.appendChild(match);

    events.applyComponentEvents(this, match);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }

      forceMatchInputStyles(this.divElement, this.style, overridenStyles);
  }

}

export class MatchType extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.textStyleTypes, ...style.borderStyleTypes];

  constructor() {
    super("matchtype");
  }

  addEditorFeatures(): void {
    editor.addLayoutStyleSection(this);
    editor.addTextEditor(this, false, matchdata.getCurrentMatch().matchType.toString());
    editor.addBorderSection(this);
  }

  render(div: HTMLDivElement): void {
    this.divElement = div;

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

    events.applyComponentEvents(this, select);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }

      forceMatchInputStyles(this.divElement, this.style, overridenStyles);
  }

}

export class AllianceStation extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.textStyleTypes, ...style.borderStyleTypes];

  constructor() {
    super("alliancestation");
  }

  addEditorFeatures(): void {
    editor.addLayoutStyleSection(this);
    editor.addTextEditor(this, false, matchdata.getCurrentMatch().allianceStation.toString());
    editor.addBorderSection(this);
  }

  render(div: HTMLDivElement): void {
    this.divElement = div;

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

    events.applyComponentEvents(this, select);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }

      forceMatchInputStyles(this.divElement, this.style, overridenStyles);
  }

}

export class ResetButton extends Component {
  readonly styleTypes: style.Style[] = [...style.layoutStyleTypes, ...style.textStyleTypes, ...style.borderStyleTypes];

  text: string;

  constructor() {
    super("resetbutton");

    this.text = "Next Match";
  }

  addEditorFeatures(): void {
    editor.addTextEditor(this, true);
    editor.addLayoutStyleSection(this);
    editor.addBorderSection(this);
  }

  render(div: HTMLDivElement): void {
    this.divElement = div;

    let button: HTMLButtonElement = document.createElement("button");
    button.textContent = this.text;

    button.onclick = (e) => {
      //e.stopPropagation();
      if (!app.isRuntimeMode()) return;
      e.stopPropagation();

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

    events.applyComponentEvents(this, div);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class AnalyticsMatchesTable extends Component {
  readonly styleTypes: style.Style[] = [];


/*
How analytics tables will work:
Rows are for each match
Columns can be added to view events and what not
Maybe each column type can be a component?


Maybe add by team tables too

Lets start with a 1511 style table (by match for a team)
You can add columns 
Different types:
- Match num
- Other header info (start loc, alliance station, etc)
- List events of a group type
- List count of events of a specific type and/or group
- List data from a text field
- Match averages for event count of a type
- Custom (advanced), make a thing like workflows but this is complicated. I'd love to have things like conditions and what not.



*/
  minRows: number;

  constructor() {
    super("analyticsmatchestable");

    this.minRows = 5;

    //default columns
    let matchNum = new AnalyticsMatchesTableColumn();
    matchNum.dataType = "Match Number";
    matchNum.header = "Match Number";
    let teamNum = new AnalyticsMatchesTableColumn();
    teamNum.dataType = "Team Number";
    teamNum.header = "Team Number";

    this.children.push(matchNum);
    this.children.push(teamNum);
  }

  addEditorFeatures(): void {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    /*
    editor.addInput(this, editorDiv, "Minimum Rows", this.minRows, (val: any) => {
      this.minRows = val;
      app.renderPreview();
    }, "number");*/

    editor.addLayoutStyleSection(this);
  }

  render(div: HTMLDivElement): void {
    this.divElement = div;

    let table = document.createElement("table");

    //DEFAULT BORDER STYLES
    table.style.borderCollapse = "collapse";
    table.style.border = "1px solid";

    //colgroup
    let colgroup = document.createElement("colgroup");
    for (const column of this.children) {
      if (!(column instanceof AnalyticsMatchesTableColumn)) continue;
      column.addToColgroup(colgroup);
    }
    table.appendChild(colgroup);

    //header row
    let header = document.createElement("tr");
    for (const column of this.children) {
      if (!(column instanceof AnalyticsMatchesTableColumn)) continue;
      column.addToHeader(header);
    }
    table.appendChild(header);

    //get all matches for the current selected team
    for (const match of matchdata.getAllMatches().filter((m: matchdata.MatchData) => m.teamNumber == matchdata.getCurrentMatch().teamNumber)) {
      let row = document.createElement("tr");
      
      for (const column of this.children) {
        if (!(column instanceof AnalyticsMatchesTableColumn)) continue;
        column.addToRow(row, match);
      }

      table.appendChild(row);
    }

    //be able to set a minimum table size (default is 5)
    while (table.children.length <= this.minRows) {
      let row = document.createElement("tr");
      for (const column of this.children) {
        if (!(column instanceof AnalyticsMatchesTableColumn)) continue;
        column.addToBlankRow(row);
      }
      table.appendChild(row);
    }

    //if editing, add a button to add a column
    if (!app.isRuntimeMode()) {
      let addButton: HTMLButtonElement = document.createElement("button");
      addButton.innerHTML = "Add Column";
      addButton.onclick = (e) => {
        e.stopPropagation();
        let newColumn = new AnalyticsMatchesTableColumn();
        //this.columns.push(newColumn);
        this.children.push(newColumn);
        app.renderPreview();
      }
      table.appendChild(addButton);
    }

    div.appendChild(table);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(this.divElement, getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }
}

export class AnalyticsMatchesTableColumn extends Component {
  readonly styleTypes: style.Style[] = [];

  value: any;

  header: string;
  dataType: string; //make this enum later
  textboxKey: string; //only used if the data is from a textbox
  colElement: any; //col element in colgroup
  hovering: boolean; //are you hovering over the elemenet

  constructor() {
    super("analyticsmatchestablecolumn");
  
    this.header = "New Column";
    this.dataType = "Event Count";
    this.textboxKey = "";
    this.hovering = false;
  }

  addEditorFeatures(): void {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    /*
    editor.addInput(this, editorDiv, "Header", this.header, (val: any) => {
      this.header = val;
      app.renderPreview();
    }, "text");*/

    //columns have selection to select if it's an event, group, header info, etc
    /*
    editor.addSelect(this, editorDiv, "Data Type", this.dataType, ["Event Count", "Group", "Textbox", "Match Number", "Team Number", "Alliance Station", "Match Type", "Event Code"], (val: any) => {
      this.dataType = val;
      app.renderPreview();
      app.renderEditor();
    });*/

    if (this.dataType == "Event Count") {
      //editor.addEventSelection(this);
    } else if (this.dataType == "Group") {
      //editor.addGroupSection(this);
    } else if (this.dataType == "Textbox") {
      /*
        editor.addInput(this, editorDiv, "Textbox ID", this.textboxKey, (val: any) => {
          this.textboxKey = val;
          app.renderPreview();
        }, "text");*/
    }

    editor.addTextEditor(this, false);
  }

  render(div: HTMLDivElement): void {
    return;
  }
  

  //adds the component selection events because these aren't "real" components
  //stolen from the render node method in app.ts
  applySelectionEvents(element: HTMLElement) {
    element.onclick = e => {
      if (app.isRuntimeMode()) return;
      e.stopPropagation();
      app.setSelectedID(this.id);

      app.renderPreview();
      app.renderEditor();
    };

    //hover styles
    /*element.onmouseenter = e => {
      //if (app.isRuntimeMode()) return;
      e.stopPropagation();

      this.hovering = true;

      app.renderPreview();
    };

    element.onmouseleave = e => {
      console.log("aaa");
      //if (!app.isRuntimeMode()) return;
      e.stopPropagation();

      this.hovering = false;

      app.renderPreview();
    }*/
  }

  /**
   * Apply styles to the column/cells
   */
  applyStyles(element: HTMLElement) {
    if (!this.divElement) return;
    //default borders
    
    if (app.getSelectedID() == this.id) {
      element.style.backgroundColor = "#eef6ff;"
      element.style.borderLeft = "2px solid #007bff";
      element.style.borderRight = "2px solid #007bff";
      element.style.borderTop = "1px solid";
      element.style.borderBottom = "1px solid";
    } else if (this.hovering) {
      element.style.backgroundColor = "#eef6ff;"
      element.style.borderLeft = "1px solid #007bff";
      element.style.borderRight = "1px solid #007bff";
      element.style.borderTop = "1px solid";
      element.style.borderBottom = "1px solid";
    } else {
      element.classList.add("editor-component");
      element.style.borderCollapse = "collapse";
      element.style.border = "1px solid #000000";
    }

  }

  /**
   * Add this column to a colgroup element and set this object's colgroup
   */
  addToColgroup(colgroup: HTMLElement) {
    let col: HTMLTableColElement = document.createElement("col");
    colgroup.appendChild(col);

    this.colElement = col;
  }

  /**
   * Add this column to a header row in a table
   */
  addToHeader(row: HTMLTableRowElement) {
    let cell: HTMLTableCellElement = document.createElement("th");
    cell.textContent = this.header;

    this.applyStyles(cell);

    this.applySelectionEvents(cell);
    row.appendChild(cell);
  }

  /**
   * Add this column to a row, but don't include any data
   */
  addToBlankRow(row: HTMLTableRowElement) {
    let cell: HTMLTableCellElement = document.createElement("td");

    this.applyStyles(cell);

    this.applySelectionEvents(cell);
    row.appendChild(cell);
  }

  /**
   * Add this column to a row
   */
  addToRow(row: HTMLTableRowElement, match: matchdata.MatchData) {
    let cell: HTMLTableCellElement = document.createElement("td");

    this.applyStyles(cell);

    if (this.dataType == "Event Count") {
      cell.textContent = match.getEventCount(this.eventType.value, this.eventGroup.value).toString();
    } else if (this.dataType == "Group") {
      cell.textContent = match.getEventsByGroup(this.eventGroup.value).toString();
    } else if (this.dataType == "Textbox") {
      cell.textContent = match.getTextData(this.textboxKey);
    } else if (this.dataType == "Match Number") {
      cell.textContent = match.matchNumber.toString();
    } else if (this.dataType == "Team Number") {
      cell.textContent = match.teamNumber.toString();
    } else if (this.dataType == "Alliance Station") {
      cell.textContent = match.allianceStation.toString();
    } else if (this.dataType == "Match Type") {
      cell.textContent = match.matchType.toString();
    } else if (this.dataType == "Event Code") {
      cell.textContent = match.eventCode;
    }

    this.applySelectionEvents(cell);
    row.appendChild(cell);
  }
}


/**
* Updates all event counter components because event counts change all the time
*/
export function updateCounters(type?: string) {
  for (const counter of Counter.counters) {
    if (type) {
      if (counter.eventType.value === type) counter.update();
    } else {
      counter.update();
    }
  }
}

/**
 * Gets the element that styles should be applied to (the parent or first child)
 */
function getCorrectStyleDiv(styleType: style.Style, applyToParent: style.Style[], div: HTMLElement): HTMLElement {
  if (div.firstChild instanceof HTMLElement && !applyToParent.includes(styleType)) return div.firstChild; 
  return div;
}

/**
 * Gets which styles list, normal or overriden, should be used to apply styles to an element
 */
function getCorrectStyles(styleType: style.Style, styles: Record<string, any>, overridenStyles: Record<string, any> | undefined): Record<string, any> {
  if (overridenStyles && styleType.style in overridenStyles) return overridenStyles;
  return styles;
}

/**
 * The inputs for match info (teamnum, matchnum, etc) have specific properties they need to work right
 */
function forceMatchInputStyles(div: HTMLElement, styles: Record<string, any>, overridenStyles: Record<string, any> | undefined): void {
  div.style.width = "fit-content";
  div.style.height = "auto";
  if (!(div.firstChild instanceof HTMLElement)) return;
  style.width.applyToNode(div.firstChild, getCorrectStyles(style.width, styles, overridenStyles));
  style.height.applyToNode(div.firstChild, getCorrectStyles(style.height, styles, overridenStyles));
  div.firstChild.style.marginBottom = "0px";
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
  image: Image,
  teamnum: TeamNum,
  matchnum: MatchNum,
  matchtype: MatchType,
  alliancestation: AllianceStation,
  resetbutton: ResetButton,
  analyticsmatchestable: AnalyticsMatchesTable,
  analyticsmatchestablecolumn: AnalyticsMatchesTableColumn,
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
  ["image", "Image", "Add an image."],
  ["teamnum", "Team Number", "Enter the team number for a match."],
  ["matchnum", "Match Number", "Enter the match number for a match."],
  ["matchtype", "Match Type", "Select the type of match (practice, quals, etc)."],
  ["alliancestation", "Alliance Station", "Select the alliance station for the match (Red 1, Blue 1, etc)."],
  ["resetbutton", "Next Match Button", "Button to save the match data, transfer it, and reset the app to the next match."],
  ["analyticsmatchestable", "Matches Table", "Custom table to analyze a teams data across their matches."]
];

export type ComponentType = keyof typeof componentRegistry;

/**
 * Creates a component from a specific type (from componentRegistry)
 */
export function createComponent(type: ComponentType): Component {
  const ComponentClass = componentRegistry[type];
  return new ComponentClass();
}