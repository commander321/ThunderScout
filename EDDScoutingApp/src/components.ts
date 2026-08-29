import * as Editor from "./editor.js";
import * as App from "./app.js";
import * as MatchData from "./data/matchdata.js";
import * as MatchEvents from "./data/matchevents.js";
import * as ImageStore from "./storage/imagestore.js";
import * as Events from "./events.js"
import * as Style from "./style.js";
import { v4 as uuid } from 'uuid';
import { createElement } from "./app.js";

export abstract class Component {
  id: string;
  type: string;
  style: Record<string, any>;
  children: Component[];
  eventType: MatchEvents.EventPointer;
  eventGroup: MatchEvents.EventPointer; 
  componentEvents: Events.Event[];
  divElement: HTMLDivElement | undefined;
  abstract readonly styleTypes: Style.Style[];

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
  readonly styleTypes: Style.Style[] = [];

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
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.textStyleTypes, ...Style.borderStyleTypes];

  constructor() {
    super("label");
    this.style.text = "New Label";
  }

  addEditorFeatures() {
    Editor.addTextEditor(this, true);
    //editor.addTextLabel(this);
    Editor.addLayoutStyleSection(this);
    Editor.addBorderSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    div.textContent = this.style.text || "";

    Events.applyComponentEvents(this, div);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
    if (!this.divElement) return;

    for (const styleType of this.styleTypes) {
      styleType.applyToNode(this.divElement, getCorrectStyles(styleType, this.style, overridenStyles));
    }
  }
}

export class Counter extends Component {
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.textStyleTypes, ...Style.borderStyleTypes];

  //list of counters so that they can be updated
  static counters: Counter[] = [];

  constructor() {
    super("counter");
    Counter.counters.push(this);
  }

  addEditorFeatures() {
    
    Editor.addMatchEventSection(this);
    Editor.addTextEditor(this, false, MatchData.getCurrentMatch().getEventCount(this.eventType.value, this.eventGroup.value).toString());
    Editor.addLayoutStyleSection(this);
    Editor.addBorderSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    let label: HTMLDivElement = document.createElement("div");
    label.id = this.id;
    label.textContent = MatchData.getCurrentMatch().getEventCount(this.eventType.value, this.eventGroup.value).toString();

    div.appendChild(label);

    Events.applyComponentEvents(this, label);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, Style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

  update() {
    let label = document.getElementById(this.id);
    if (!label) return;
    label.textContent = MatchData.getCurrentMatch().getEventCount(this.eventType.value, this.eventGroup.value).toString();
  }
}

export class Button extends Component {
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.textStyleTypes, ...Style.borderStyleTypes, Style.buttonColor, Style.buttonHoverColor];

  constructor() {
    super("button");
    this.style.text = "New Button";
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    Editor.addNewEventSection(this);

    Editor.addTextEditor(this, true);

    //add a button styles section (for background colors, hover colors, etc)
    editorDiv.appendChild(document.createElement("hr"));
    let label = document.createElement("div");
    label.textContent = "Button Style";
    editorDiv.appendChild(label);
    editorDiv.appendChild(document.createElement("br"));

    Editor.addInput(this, editorDiv, Style.buttonColor.displayName, Style.buttonColor);
    Editor.addInput(this, editorDiv, Style.buttonHoverColor.displayName, Style.buttonHoverColor);

    Editor.addLayoutStyleSection(this);
    Editor.addBorderSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    let button: HTMLButtonElement = document.createElement("button");
    button.textContent = this.style.text || "";

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
      if (App.isPreviewMode()) {
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

    Events.applyComponentEvents(this, button);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;
      
      let button = this.divElement.firstChild;
      if (!(button instanceof HTMLElement)) return;

      for (const styleType of this.styleTypes) {
        if (Style.layoutStyleTypes.includes(styleType)) {
          styleType.applyToNode(this.divElement, getCorrectStyles(styleType, this.style, overridenStyles));
        }
        styleType.applyToNode(button, getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class Section extends Component {
  readonly styleTypes: Style.Style[] = [Style.sectionWidth, Style.widthType, Style.height, Style.heightType, Style.sectionColor];

  constructor() {
    super("section");
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    //editor.addInput(this, editorDiv, style.width.displayName, style.width);
    Editor.addPixelPercentInput(this, Style.sectionWidth, Style.widthType, editorDiv);
    Editor.addPixelPercentInput(this, Style.height, Style.heightType, editorDiv);
    //editor.addInput(this, editorDiv, style.thickness.displayName, style.thickness);
    Editor.addInput(this, editorDiv, Style.sectionColor.displayName, Style.sectionColor);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    let hr: HTMLHRElement = document.createElement("hr");

    hr.style.border = "none";
    Style.sectionColor.applyToNode(hr, this.style);

    div.appendChild(hr);

    div.style.margin = "0px";
    div.style.padding = "0px";
    hr.style.margin = "0px";
    hr.style.padding = "0px";

    div.style.width = this.style.sectionWidth ? (this.style.sectionWidth == 0 ? "100%" : this.style.sectionWidth + (this.style.widthType || "px")) : "100%";
    hr.style.width = this.style.sectionWidth ? (this.style.sectionWidth == 0 ? "100%" : this.style.sectionWidth + (this.style.widthType || "px")) : "100%";

    div.style.height = (this.style.height && this.style.height != 0) ? (this.style.height + (this.style.heightType || "px")) : "2px";
    hr.style.height = (this.style.height && this.style.height != 0) ? (this.style.height + (this.style.heightType || "px")) : "2px";

    Events.applyComponentEvents(this, hr);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;
      for (const styleType of this.styleTypes) {
        styleType.applyToNode(this.divElement, getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class Dropdown extends Component {
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.textStyleTypes, ...Style.borderStyleTypes];
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

    Editor.addTextEditor(this, false, this.options.toString());
    Editor.addLayoutStyleSection(this);
    //editor.addTextSection(this);
    Editor.addBorderSection(this);
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
      if (App.isPreviewMode()) {
        this.options.forEach(t => {
          MatchData.getCurrentMatch().removeType(t, this.eventGroup.value);
        });

        MatchData.getCurrentMatch().addEvent(new MatchEvents.MatchEvent(this.options[select.selectedIndex] || "null", this.eventGroup.value));
        updateCounters();
      }

    }

    select.onchange = (e) => {
      e.stopPropagation();
      //node.selected = e.target.value;
    };

    div.appendChild(select);

    Events.applyComponentEvents(this, select);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;
      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, Style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class Checkbox extends Component {
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.borderStyleTypes, Style.scale, Style.checkboxColor, Style.checkboxCheckedColor];

  constructor() {
    super ("checkbox");
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    Editor.addMatchEventSection(this);

    //checkbox features
    editorDiv.appendChild(document.createElement("hr"));
    let label = document.createElement("div");
    label.textContent = "Checkbox Style";
    editorDiv.appendChild(label);
    editorDiv.appendChild(document.createElement("br"));

    Editor.addInput(this, editorDiv, Style.scale.displayName, Style.scale);
    Editor.addInput(this, editorDiv, Style.checkboxColor.displayName, Style.checkboxColor);
    Editor.addInput(this, editorDiv, Style.checkboxCheckedColor.displayName, Style.checkboxCheckedColor);

    Editor.addLayoutStyleSection(this);
    Editor.addBorderSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    let checkbox: HTMLInputElement = document.createElement("input");
    checkbox.checked = MatchData.getCurrentMatch().getEventCount(this.eventType.value) > 0;
    checkbox.type = "checkbox";

    checkbox.onchange = (e) => {
      e.stopPropagation();

      if (!App.isPreviewMode()) return;

      //Handle changing the event
      if (checkbox.checked) {
        MatchData.getCurrentMatch().addEvent(new MatchEvents.MatchEvent(this.eventType.value, this.eventGroup.value));
      } else {
        MatchData.getCurrentMatch().removeType(this.eventType.value, this.eventGroup.value);
      }

      updateCounters(this.eventType.value);

    }

    div.appendChild(checkbox);

    Events.applyComponentEvents(this, checkbox);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, Style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class Layout extends Component {
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.borderStyleTypes];

  constructor() {
    super("layout");
  }

  addEditorFeatures() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    Editor.addSelect(this, editorDiv, Style.direction.displayName, Style.direction);

    Editor.addLayoutStyleSection(this);
    Editor.addBorderSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    div.classList.add("container");

    if (this.type === "layout" && this.style.direction === "horizontal") {
      div.classList.add("horizontal");
    }

    Events.applyComponentEvents(this, div);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(this.divElement, getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class TeamNum extends Component {
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.textStyleTypes, ...Style.borderStyleTypes];

  constructor() {
    super("teamnum");
  }

  addEditorFeatures(): void {
    Editor.addLayoutStyleSection(this);
    Editor.addTextEditor(this, false, MatchData.getCurrentMatch().teamNumber.toString());
    Editor.addBorderSection(this);
  }

  render(div: HTMLDivElement): void {
    this.divElement = div;

    let team: HTMLInputElement = document.createElement("input");
    team.type = "number";

    team.onchange = (e) => {
      MatchData.getCurrentMatch().teamNumber = parseInt(team.value);
    }

    team.valueAsNumber = MatchData.getCurrentMatch().teamNumber;

    div.appendChild(team);

    div.style.width = "fit-content";
    div.style.height = "auto";
    team.style.width = this.style.width ? (this.style.width == 0 ? "fit-content" : this.style.width + "px") : "fit-content";
    team.style.height = this.style.height ? (this.style.height == 0 ? "auto" : this.style.height + "px") : "auto";
    team.style.marginBottom = "0px";

    Events.applyComponentEvents(this, team);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, Style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }

      forceMatchInputStyles(this.divElement, this.style, overridenStyles);
  }

}

export class TextBox extends Component {
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.textStyleTypes, ...Style.borderStyleTypes, Style.textboxID];

  constructor() {
    super("textbox");
  }

  addEditorFeatures(): void {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;
      
    Editor.addInput(this, editorDiv, Style.textboxID.displayName, Style.textboxID);
    Editor.addLayoutStyleSection(this);
    Editor.addTextEditor(this, false, MatchData.getCurrentMatch().getTextData(this.style.textboxID || ""));
    Editor.addBorderSection(this);
  }

  render(div: HTMLDivElement): void {
      this.divElement = div;

      let textbox = document.createElement("input");
      textbox.type = "text";

      textbox.value = MatchData.getCurrentMatch().getTextData(this.style.textboxID || "");

      textbox.onchange = (e) => {
        e.stopPropagation();

        if (!App.isPreviewMode()) return;

        //handle setting the text data value
        if (!this.style.textboxID) return;
        MatchData.getCurrentMatch().setTextData(this.style.textboxID, textbox.value);
      }

      div.appendChild(textbox);

      Events.applyComponentEvents(this, textbox);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;
  
      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, Style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }

      forceMatchInputStyles(this.divElement, this.style, overridenStyles);
  }

}

export class Image extends Component {
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.borderStyleTypes];

  imageId: string;

  constructor() {
    super("image");

    this.imageId = "";
  }

  addEditorFeatures(): void {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    Editor.addImageSelection(this, "imageId");

    let imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.accept = "image/*"
    imageInput.onchange = () => {
      if (!imageInput) return;

      const file = imageInput.files?.[0];
      if (!file) return;

      this.imageId = uuid();
      ImageStore.uploadImage(this.imageId, file);

      App.renderPreview();
    }

    editorDiv.appendChild(imageInput);

    Editor.addLayoutStyleSection(this);
  }

  render(div: HTMLDivElement) {
    this.divElement = div;

    let image = document.createElement("img");

    image.src = ImageStore.getImageURL(this.imageId);
    image.style.width = "100%";
    image.style.height = "100%";
    
    div.appendChild(image);

    Events.applyComponentEvents(this, image);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(this.divElement, getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class MatchNum extends Component {
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.textStyleTypes, ...Style.borderStyleTypes];

  constructor() {
    super("matchnum");
  }

  addEditorFeatures(): void {
    Editor.addLayoutStyleSection(this);
    Editor.addTextEditor(this, false, MatchData.getCurrentMatch().matchNumber.toString());
    Editor.addBorderSection(this);
  }

  render(div: HTMLDivElement): void {
    this.divElement = div;

    let match: HTMLInputElement = document.createElement("input");
    match.type = "number";

    match.onchange = (e) => {
      MatchData.getCurrentMatch().matchNumber = parseInt(match.value);
    }

    match.valueAsNumber = MatchData.getCurrentMatch().matchNumber;

    div.appendChild(match);

    Events.applyComponentEvents(this, match);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, Style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }

      forceMatchInputStyles(this.divElement, this.style, overridenStyles);
  }

}

export class MatchType extends Component {
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.textStyleTypes, ...Style.borderStyleTypes];

  constructor() {
    super("matchtype");
  }

  addEditorFeatures(): void {
    Editor.addLayoutStyleSection(this);
    Editor.addTextEditor(this, false, MatchData.getCurrentMatch().matchType.toString());
    Editor.addBorderSection(this);
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
      MatchData.getCurrentMatch().matchType = MatchData.MatchType[select.value as keyof typeof MatchData.MatchType];
    }

    select.value = MatchData.getCurrentMatch().matchType;

    div.appendChild(select);

    Events.applyComponentEvents(this, select);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, Style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }

      forceMatchInputStyles(this.divElement, this.style, overridenStyles);
  }

}

export class AllianceStation extends Component {
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.textStyleTypes, ...Style.borderStyleTypes];

  constructor() {
    super("alliancestation");
  }

  addEditorFeatures(): void {
    Editor.addLayoutStyleSection(this);
    Editor.addTextEditor(this, false, MatchData.getCurrentMatch().allianceStation.toString());
    Editor.addBorderSection(this);
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
      MatchData.getCurrentMatch().allianceStation = MatchData.AllianceStation[select.value as keyof typeof MatchData.AllianceStation];
    }

    select.value = MatchData.getCurrentMatch().allianceStation;

    div.appendChild(select);

    Events.applyComponentEvents(this, select);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, Style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }

      forceMatchInputStyles(this.divElement, this.style, overridenStyles);
  }

}

export class ResetButton extends Component {
  readonly styleTypes: Style.Style[] = [...Style.layoutStyleTypes, ...Style.textStyleTypes, ...Style.borderStyleTypes];

  constructor() {
    super("resetbutton");

    this.style.text = "Next Match";
  }

  addEditorFeatures(): void {
    Editor.addTextEditor(this, true);
    Editor.addLayoutStyleSection(this);
    Editor.addBorderSection(this);
  }

  render(div: HTMLDivElement): void {
    this.divElement = div;

    let button: HTMLButtonElement = document.createElement("button");
    button.textContent = this.style.text || "";

    button.onclick = (e) => {
      //e.stopPropagation();
      if (!App.isPreviewMode()) return;
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

      MatchData.saveCurrentMatch();
      
      const editorEnabled: boolean = App.getEditorEnabled();
      App.setEditorEnabled(true);
      App.openEditMode();
      App.renderPreview();
      App.openPreviewMode();
      App.setEditorEnabled(editorEnabled);
      if (editorEnabled) {
        document.getElementById("edit")?.classList.remove("hidden")
      } else {
        document.getElementById("edit")?.classList.add("hidden")
      }
    };

    div.appendChild(button);

    Events.applyComponentEvents(this, div);
  }

  applyStyles(overridenStyles?: Record<string, any>): void {
      if (!this.divElement) return;

      for (const styleType of this.styleTypes) {
        styleType.applyToNode(getCorrectStyleDiv(styleType, Style.layoutStyleTypes, this.divElement), getCorrectStyles(styleType, this.style, overridenStyles));
      }
  }

}

export class AnalyticsMatchesTable extends Component {
  readonly styleTypes: Style.Style[] = [];


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

    Editor.addLayoutStyleSection(this);
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
    for (const match of MatchData.getAllMatches().filter((m: MatchData.MatchData) => m.teamNumber == MatchData.getCurrentMatch().teamNumber)) {
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
    if (!App.isPreviewMode()) {
      let addButton: HTMLButtonElement = document.createElement("button");
      addButton.innerHTML = "Add Column";
      addButton.onclick = (e) => {
        e.stopPropagation();
        let newColumn = new AnalyticsMatchesTableColumn();
        //this.columns.push(newColumn);
        this.children.push(newColumn);
        App.renderPreview();
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
  readonly styleTypes: Style.Style[] = [];

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

    Editor.addTextEditor(this, false);
  }

  render(div: HTMLDivElement): void {
    return;
  }
  

  //adds the component selection events because these aren't "real" components
  //stolen from the render node method in app.ts
  applySelectionEvents(element: HTMLElement) {
    element.onclick = e => {
      if (App.isPreviewMode()) return;
      e.stopPropagation();
      App.setSelectedID(this.id);

      App.renderPreview();
      App.renderEditor();
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
    
    if (App.getSelectedID() == this.id) {
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
  addToRow(row: HTMLTableRowElement, match: MatchData.MatchData) {
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
function getCorrectStyleDiv(styleType: Style.Style, applyToParent: Style.Style[], div: HTMLElement): HTMLElement {
  if (div.firstChild instanceof HTMLElement && !applyToParent.includes(styleType)) return div.firstChild; 
  return div;
}

/**
 * Gets which styles list, normal or overriden, should be used to apply styles to an element
 */
function getCorrectStyles(styleType: Style.Style, styles: Record<string, any>, overridenStyles: Record<string, any> | undefined): Record<string, any> {
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
  Style.width.applyToNode(div.firstChild, getCorrectStyles(Style.width, styles, overridenStyles));
  Style.height.applyToNode(div.firstChild, getCorrectStyles(Style.height, styles, overridenStyles));
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