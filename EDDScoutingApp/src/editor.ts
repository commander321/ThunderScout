import * as app from "./app.js";
import * as components from "./components.js";
import * as events from "./events.js";
import * as actions from "./action.js"

export function addInput(node: components.Component, parentDiv: HTMLDivElement, labelText: string, value: any, onChange: any, type: string = "text", inputElement?: HTMLInputElement) {
  if (labelText != "") {
    let label = document.createElement("div");
    label.textContent = labelText;
    parentDiv.appendChild(label);
  }
  
  let input = inputElement || document.createElement("input");
  input.type = type;
  input.value = value;

  if (type === "number") {
    input.classList.add("number-input");
  }

  //Checkboxes have onchange instead of oninput like text fields
  if (type === "checkbox") {
    input.checked = value
    input.onchange = () => {
      actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
      onChange(input);
    }
  } else {
    input.oninput = () => {
      actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
      onChange(input.value);
    }
  }

  if (!inputElement) parentDiv.appendChild(input);
}

export function addSelect(node: components.Component, parentDiv: HTMLDivElement, labelText: string, value: string, options: string[], onChange: any, selectElement?: HTMLSelectElement) {
  //const editorDiv = document.getElementById("editor");
  //if (!editorDiv) return;

  if (labelText != "") {
    let label = document.createElement("div");
    label.textContent = labelText;
    parentDiv.appendChild(label);
  }

  let select = selectElement || document.createElement("select");

  options.forEach(opt => {
    let option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });

  select.value = value;
  select.onchange = () => {
    actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
    onChange(select.value);
  }

  if (!selectElement) parentDiv.appendChild(select);
}

/**
 * Adds the dropdown selection for all events
 */
export function addEventSelection(node: components.Component) {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    addSelect(node, editorDiv, "Event", node.eventType, events.getEventTypes(), (val: any) => { 
      node.eventType = val;
      app.renderPreview();
    });

    addSelect(node, editorDiv, "Group", node.eventGroup, events.getEventGroups(), (val: any) => {
      node.eventGroup = val;
      app.renderPreview();
    });

    let button: HTMLButtonElement = document.createElement("button");
    button.textContent = "Edit Events";
    button.onclick = (e) => {
      e.stopPropagation();

      //Open the events list modal
      openEventsModal();
    }

    editorDiv.appendChild(button);
}

/**
 * Adds just the event group selection (and the edit events button)
 */
export function addGroupSection(node: components.Component) {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    addSelect(node, editorDiv, "Group", node.eventGroup, events.getEventGroups(), (val: any) => {
      node.eventGroup = val;
      app.renderPreview();
    });

    let button: HTMLButtonElement = document.createElement("button");
    button.textContent = "Edit Events";
    button.onclick = (e) => {
      e.stopPropagation();

      //Open the events list modal
      openEventsModal();
    }

    editorDiv.appendChild(button);
}

/**
 * Add a new section for styling the layout
 */
export function addLayoutStyleSection(node: components.Component) {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    //Add a line between component info and style
    editorDiv.appendChild(document.createElement("hr"));
    let label = document.createElement("div");
    label.textContent = "Layout Style:";
    editorDiv.appendChild(label);
    editorDiv.appendChild(document.createElement("br"));

    //width and height
    let widthLabel = document.createElement("div");
    widthLabel.textContent = "Width:";
    editorDiv.appendChild(widthLabel);
    addPixelPercentInput(node, "width", "widthType");

    let heightLabel = document.createElement("div");
    heightLabel.textContent = "Height:";
    editorDiv.appendChild(heightLabel);
    addPixelPercentInput(node, "height", "heightType");

    /*
    addInput(node, editorDiv, "Width (px)", node.style.width || 0, (val: any) => {
        node.style.width = val;
        app.renderPreview();
    }, "number");*/

    /*
    addInput(node, editorDiv, "Height (px)", node.style.height || 0, (val: any) => {
        node.style.height = val;
        app.renderPreview();
    }, "number");*/

    addInput(node, editorDiv, "Background", node.style.background || "#FFFFFF", (val: any) => {
        node.style.background = val;
        app.renderPreview();
    }, "color");

    //======= Div Alignment =======
    
    addSelect(node, editorDiv, "Allignment", node.style.allignment || "left", ["left", "right", "center"], (val: any) => {
        node.style.allignment = val;
        app.renderPreview();
    });

    //======= Padding Section =======

    let paddingDiv1 = document.createElement("div");
    paddingDiv1.classList.add("horizontal-editor-inputs");

    addInput(node, paddingDiv1, "Padding Left", node.style.paddingLeft || 5, (val: any) => {
        node.style.paddingLeft = parseInt(val);
        app.renderPreview();
      }, "number"); 
      
    addInput(node, paddingDiv1, "Padding Right", node.style.paddingRight || 5, (val: any) => {
      node.style.paddingRight = parseInt(val);
      app.renderPreview();
    }, "number");  

    editorDiv.appendChild(paddingDiv1);

    let paddingDiv2 = document.createElement("div");
    paddingDiv2.classList.add("horizontal-editor-inputs");

    addInput(node, paddingDiv2, "Padding Top", node.style.paddingTop || 5, (val: any) => {
        node.style.paddingTop = parseInt(val) == 0 ? "0" : parseInt(val);
        app.renderPreview();
      }, "number"); 
      
    addInput(node, paddingDiv2, "Padding Bottom", node.style.paddingBottom || 5, (val: any) => {
      node.style.paddingBottom = parseInt(val) == 0 ? "0" : parseInt(val);
      app.renderPreview();
    }, "number");  

    //Should probably make label divs for padding and margins, do this later
    paddingDiv2.style.paddingBottom = "15px";
    editorDiv.appendChild(paddingDiv2);

    //======= Margins Section =======

    let marginDiv1 = document.createElement("div");
    marginDiv1.classList.add("horizontal-editor-inputs");

    addInput(node, marginDiv1, "Margin Left", node.style.marginLeft || 0, (val: any) => {
      node.style.marginLeft = parseInt(val) == 0 ? "0" : parseInt(val);
      app.renderPreview();
    }, "number");  

    addInput(node, marginDiv1, "Margin Right", node.style.marginRight || 0, (val: any) => {
      node.style.marginRight = parseInt(val) == 0 ? "0" : parseInt(val);
      app.renderPreview();
    }, "number");  

    editorDiv.appendChild(marginDiv1);

    let marginDiv2 = document.createElement("div");
    marginDiv2.classList.add("horizontal-editor-inputs");

    addInput(node, marginDiv2, "Margin Top", node.style.marginTop || 6, (val: any) => {
      node.style.marginTop = parseInt(val) == 0 ? "0" : parseInt(val); //Make 0 be a string otherwise it glitches out and always set it to 6
      app.renderPreview();
    }, "number");  

    addInput(node, marginDiv2, "Margin Bottom", node.style.marginBottom || 6, (val: any) => {
      node.style.marginBottom = parseInt(val) == 0 ? "0" : parseInt(val);
      app.renderPreview();
    }, "number");  

    editorDiv.appendChild(marginDiv2);

}

/**
 * Add a input that has pixel and percentage options (width and height)
 */
export function addPixelPercentInput(node: components.Component, numberProperty: string, typeProperty: string) {
  const editorDiv = document.getElementById("editor");
  if (!editorDiv) return;
  if (!(editorDiv instanceof HTMLDivElement)) return;

  let div = document.createElement("div");
  div.classList.add("editor-width-height");

  let numberInput = document.createElement("input");
  numberInput.classList.add("editor-width-height-input");
  numberInput.type = "number";
  numberInput.min = "0";
  numberInput.max = "9999";
  numberInput.style.fontSize = "14px";
  numberInput.style.width = "60%";

  let divider = document.createElement("div");
  divider.classList.add("textbox-editor-divider");

  let typeDropdown = document.createElement("select");
  typeDropdown.classList.add("editor-width-height-input");
  typeDropdown.style.fontSize = "14px";
  typeDropdown.style.width = "40%";
  addInput(node, div, "", node.style[numberProperty] || 0, (val: any) => {
    node.style[numberProperty] = val;
    app.renderPreview();
  }, "number", numberInput);
  div.appendChild(numberInput);

  div.appendChild(divider);

  addSelect(node, div, "", node.style[typeProperty] || "px", ["px", "%"], (val: any) => {
    node.style[typeProperty] = val;
    app.renderPreview();
  }, typeDropdown);
  div.appendChild(typeDropdown);

  editorDiv.appendChild(div);
}

/**
 * New fancy text editor box
 */
export function addTextEditor(node: components.Component, editable: boolean, textValue?: string) {
  const editorDiv = document.getElementById("editor");
  if (!editorDiv) return;
  if (!(editorDiv instanceof HTMLDivElement)) return;

  //Add a line between component info and text section
  editorDiv.appendChild(document.createElement("hr"));
  //let label = document.createElement("div");
  //label.textContent = "Text:";
  //editorDiv.appendChild(label);
  editorDiv.appendChild(document.createElement("br"));

  //create textbox
  let textboxEditor = document.getElementById("textbox-editor")?.cloneNode(true);
  if (!textboxEditor || !(textboxEditor instanceof HTMLElement)) return;
  textboxEditor.classList.remove("hidden");
  textboxEditor.classList.add("textbox-editor");
  editorDiv.appendChild(textboxEditor);

  let textboxStyleBar = document.getElementById("textbox-style-bar");
  if (!textboxStyleBar || !(textboxStyleBar instanceof HTMLDivElement)) return;

  //the actual text
  let textbox = document.getElementById("textbox-editor-textbox");
  if (!textbox || !(textbox instanceof HTMLDivElement)) return;
  if (!editable) textbox.contentEditable = "false";
  if (textValue) textbox.textContent = textValue;
  if (editable && 'text' in node && typeof node.text == 'string') {
    textbox.textContent = node.text;
    textbox.oninput = (e) => {
      e.stopPropagation();
      actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
      node.text = textbox.textContent;
      app.renderPreview();
    }
  }
  

  //set styles (using the same method the component uses)
  components.applyTextStyles(textbox, node.style);

  //font selection
  let fontSelection = document.getElementById("textbox-editor-font");
  if (fontSelection && fontSelection instanceof HTMLSelectElement) {
    addSelect(node, textboxStyleBar, "", node.style.fontFamily || "Arial", ["Arial", "Verdana", "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Garamond", "Courier New", "Brush Script MT"], (val: any) => {
      node.style.fontFamily = val;
      app.renderPreview();
      components.applyTextStyles(textbox, node.style);
    }, fontSelection);
  }

  //font size
  let fontSize = document.getElementById("textbox-editor-font-size");
  if (fontSize && fontSize instanceof HTMLInputElement) {
    addInput(node, textboxStyleBar, "", node.style.textSize || 14, (val: any) => {
      node.style.textSize = parseInt(val);
      app.renderPreview();
      components.applyTextStyles(textbox, node.style);
    }, "number", fontSize);
  }

  //bold button
  let boldButton = document.getElementById("textbox-editor-bold");
  if (boldButton && boldButton instanceof HTMLButtonElement) {
    if (node.style.bold) boldButton.classList.add("textbox-editor-button-selected");
    boldButton.onclick = (e) => {
      e.stopPropagation();
      actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
      boldButton.classList.toggle("textbox-editor-button-selected");
      node.style.bold = !node.style.bold;
      app.renderPreview();
      components.applyTextStyles(textbox, node.style);
    }
  }

  //italic button
  let italicButton = document.getElementById("textbox-editor-italic");
  if (italicButton && italicButton instanceof HTMLButtonElement) {
    if (node.style.fontStyle === "italic") italicButton.classList.add("textbox-editor-button-selected");
    italicButton.onclick = (e) => {
      e.stopPropagation();
      actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
      italicButton.classList.toggle("textbox-editor-button-selected");
      node.style.fontStyle = (node.style.fontStyle === "italic") ? "" : "italic";
      app.renderPreview();
      components.applyTextStyles(textbox, node.style);
    }
  }

  //underline button
  let underlineButton = document.getElementById("textbox-editor-underline");
  if (underlineButton && underlineButton instanceof HTMLButtonElement) {
    if (node.style.textDecoration === "underline") underlineButton.classList.add("textbox-editor-button-selected");
    underlineButton.onclick = (e) => {
      e.stopPropagation();
      actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
      underlineButton.classList.toggle("textbox-editor-button-selected");
      node.style.textDecoration = (node.style.textDecoration === "underline") ? "" : "underline";
      app.renderPreview();
      components.applyTextStyles(textbox, node.style);
    }
  }

  //text color
  let colorInput = document.getElementById("textbox-editor-text-color");
  let icon = document.getElementById("textbox-editor-text-color-icon");
  if (colorInput && colorInput instanceof HTMLInputElement && icon && icon instanceof HTMLElement) {
    icon.style.color = node.style.color || "#000000";
    addInput(node, textboxStyleBar, "", node.style.color || "#000000", (val: any) => {
        node.style.color = val;
        app.renderPreview();
        icon.style.color = node.style.color || "#000000";
        components.applyTextStyles(textbox, node.style);
    }, "color", colorInput);
  }
  
  //text alignment
  for (const align of ["left", "center", "right"]) {
    let alignButton = document.getElementById("textbox-editor-align-" + align);
    if (!alignButton || !(alignButton instanceof HTMLButtonElement)) continue;
    if (node.style.textAlign == align || (!node.style.textAlign && align === "left")) alignButton.classList.add("textbox-editor-button-selected");
    alignButton.onclick = (e) => {
      e.stopPropagation();
      if (node.style.textAlign == align) return;
      actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
      node.style.textAlign = align;
      app.renderPreview();
      app.renderEditor(); //render editor to deselect the other buttons
    };
  }

  //old funny dropdowns
  /*let alignmentDropdown = document.getElementById("textbox-editor-alignment-dropdown")
  if (alignmentDropdown) {
    //open the dropdown
    alignmentDropdown.onclick = (e) => {
      console.log("aaa");
      //e.stopPropagation();
      alignmentDropdown.classList.toggle("open");
    }

    //select an option
    document.querySelectorAll(".textbox-editor-alignment-option").forEach((val: any) => {
      if (val instanceof HTMLElement) val.onclick = (e) => {
        node.style.textAlign = val.getAttribute("data-align") || "left";
        alignmentDropdown.classList.remove("open");
        app.renderPreview();
      };
    });
  }*/
}

export function addBorderSection(node: components.Component) {
  const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    editorDiv.appendChild(document.createElement("hr"));
    let label = document.createElement("div");
    label.textContent = "Border:";
    editorDiv.appendChild(label);
    editorDiv.appendChild(document.createElement("br"));

    //border width, radius, style, and color
    addInput(node, editorDiv, "Border Width", node.style.borderWidth || 0, (val: any) => {
      node.style.borderWidth = parseInt(val);
      app.renderPreview();
    }, "number");

    addInput(node, editorDiv, "Border Radius", node.style.borderRadius || 0, (val: any) => {
      node.style.borderRadius = parseInt(val);
      app.renderPreview();
    }, "number");

    addSelect(node, editorDiv, "Border Style", node.style.borderStyle || "none", ["none", "solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset"], (val: any) => { 
      node.style.borderStyle = val;
      app.renderPreview();
    });

    addInput(node, editorDiv, "Border Color", node.style.borderColor || "#000000", (val: any) => {
      node.style.borderColor = val;
      app.renderPreview();
    }, "color");
}


function openEventsModal() {
  let overlay = document.getElementById("overlay-events");
  if (!overlay) return;
  overlay.classList.remove("hidden");

  let modal = document.getElementById("modal-events");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.innerHTML = "<h3>Event Types:</h3>";

  let typesDiv = document.createElement("div");
  typesDiv.style.overflowY = "auto";
  typesDiv.style.height = "30%";

  for (const type of events.getEventTypes()) {
    let text = document.createElement("div")
    text.textContent = type;

    //remove type button
    let remove = document.createElement("button");
    remove.textContent = "X";
    remove.style.marginLeft = "25px";
    remove.onclick = (e) => {
      e.stopPropagation();
      events.removeEventType(type);
      openEventsModal();
    }
    text.appendChild(remove);

    typesDiv.appendChild(text);
  }

  modal.appendChild(typesDiv);

  let addInput: HTMLInputElement = document.createElement("input");
  addInput.type = "text";
  addInput.style.marginTop = "20px";

  //The add button adds a new event type if it doesn't exist
  let addButton: HTMLButtonElement = document.createElement("button");
  addButton.textContent = "+"
  addButton.onclick = (e) => {
    e.stopPropagation();
    if (addInput.value.trim().length === 0) return;
    if (events.getEventTypes().includes(addInput.value)) return;

    /*let text = document.createElement("div")
    text.textContent = addInput.value;
    typesDiv.appendChild(text);*/

    events.addEventType(addInput.value);
    addInput.value = "";

    openEventsModal();
  }

  modal.appendChild(addInput);
  modal.appendChild(addButton);

  //Event Groups (same thing just for event groups)
  let groupsDiv = document.createElement("div");
  groupsDiv.style.overflowY = "auto";
  groupsDiv.style.height = "30%";

  let title = document.createElement("h3");
  title.innerHTML = "Event Groups:";
  groupsDiv.appendChild(title);

  for (const group of events.getEventGroups()) {
     let text = document.createElement("div")
    text.textContent = group;

    //remove group button
    let remove = document.createElement("button");
    remove.textContent = "X";
    remove.style.marginLeft = "25px";
    remove.onclick = (e) => {
      e.stopPropagation();
      events.removeEventGroup(group);
      openEventsModal();
    }
    text.appendChild(remove);

    groupsDiv.appendChild(text);
  }

  modal.appendChild(groupsDiv);

  let addGroupInput: HTMLInputElement = document.createElement("input");
  addGroupInput.type = "text";
  addGroupInput.style.marginTop = "20px";

  let addGroupButton: HTMLButtonElement = document.createElement("button");
  addGroupButton.textContent = "+"
  addGroupButton.onclick = (e) => {
    e.stopPropagation();
    if (addGroupInput.value.trim().length === 0) return;
    if (events.getEventGroups().includes(addGroupInput.value)) return;

    events.addEventGroup(addGroupInput.value);
    addGroupInput.value = "";

    openEventsModal();
  }

  modal.appendChild(addGroupInput);
  modal.appendChild(addGroupButton);

}


function closeEventsModal() {
  let overlay = document.getElementById("overlay-events");
  if (overlay) overlay.classList.add("hidden");

  let modal = document.getElementById("modal-events");
  if (modal) modal.classList.add("hidden");
  
}

let overlay = document.getElementById("overlay-events")
if (overlay) overlay.onclick = closeEventsModal;