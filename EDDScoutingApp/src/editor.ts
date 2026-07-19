import * as app from "./app.js";
import * as components from "./components.js";
import * as matchevents from "./matchevents.js";
import * as actions from "./action.js"
import * as storage from "./storage.js";
import * as events from "./events.js";

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

  if (type === "color") {
    input.onfocus = () => {
      console.log("focus")
      actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
    }
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
      if (type != "color") actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
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

    addSelect(node, editorDiv, "Event", node.eventType, matchevents.getEventTypes(), (val: any) => { 
      node.eventType = val;
      app.renderPreview();
    });

    addSelect(node, editorDiv, "Group", node.eventGroup, matchevents.getEventGroups(), (val: any) => {
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

    addSelect(node, editorDiv, "Group", node.eventGroup, matchevents.getEventGroups(), (val: any) => {
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
    editorDiv.appendChild(document.createElement("br"));

    //details and summary
    let layoutStyleSection = createSection("Layout:", editorDiv);

    //width and height
    let widthDiv = document.createElement("div");
    widthDiv.textContent = "Width:";
    widthDiv.style.width="40%";
    addPixelPercentInput(node, "width", "widthType", widthDiv);
    layoutStyleSection.appendChild(widthDiv);

    let heightDiv = document.createElement("div");
    heightDiv.textContent = "Height:";
    heightDiv.style.width = "40%";
    addPixelPercentInput(node, "height", "heightType", heightDiv);
    layoutStyleSection.appendChild(heightDiv);

    //background color
    addInput(node, layoutStyleSection, "Background", node.style.background || "#FFFFFF", (val: any) => {
        node.style.background = val;
        app.renderPreview();
    }, "color");

    //alignment
    addSelect(node, layoutStyleSection, "Allignment", node.style.allignment || "left", ["left", "right", "center"], (val: any) => {
        node.style.allignment = val;
        app.renderPreview();
    });

    //padding
    let paddingSection = document.createElement("div");
    paddingSection.textContent = "Padding:";

    let paddingDiv1 = document.createElement("div");
    paddingDiv1.classList.add("horizontal-editor-inputs");
    paddingDiv1.style.paddingTop = "15px";

    let paddingLeft = document.createElement("div");
    paddingLeft.textContent = "Left:";
    paddingLeft.style.width = "40%";
    addPixelPercentInput(node, "paddingLeft", "paddingLeftType", paddingLeft);

    let paddingRight = document.createElement("div");
    paddingRight.textContent = "Right:";
    paddingRight.style.width = "40%";
    paddingRight.style.paddingLeft = "10%";
    addPixelPercentInput(node, "paddingRight", "paddingRightType", paddingRight);

    paddingDiv1.appendChild(paddingLeft);
    paddingDiv1.appendChild(paddingRight);
    paddingSection.appendChild(paddingDiv1);

    let paddingDiv2 = document.createElement("div");
    paddingDiv2.classList.add("horizontal-editor-inputs");
    paddingDiv2.style.paddingBottom = "15px";

    let paddingTop = document.createElement("div");
    paddingTop.textContent = "Top:";
    paddingTop.style.width = "40%";
    addPixelPercentInput(node, "paddingTop", "paddingTopType", paddingTop);

    let paddingBottom = document.createElement("div");
    paddingBottom.textContent = "Bottom:";
    paddingBottom.style.width = "40%";
    paddingBottom.style.paddingLeft = "10%";
    addPixelPercentInput(node, "paddingBottom", "paddingBottomType", paddingBottom);

    paddingDiv2.appendChild(paddingTop);
    paddingDiv2.appendChild(paddingBottom);
    paddingSection.appendChild(paddingDiv2);

    layoutStyleSection.appendChild(paddingSection);

    //margins
    let marginSection = document.createElement("div");
    marginSection.textContent = "Margins:";

    let marginDiv1 = document.createElement("div");
    marginDiv1.classList.add("horizontal-editor-inputs");
    marginDiv1.style.marginTop = "15px";

    let marginLeft = document.createElement("div");
    marginLeft.textContent = "Left:";
    marginLeft.style.width = "40%";
    addPixelPercentInput(node, "marginLeft", "marginLeftType", marginLeft);

    let marginRight = document.createElement("div");
    marginRight.textContent = "Right:";
    marginRight.style.width = "40%";
    marginRight.style.marginLeft = "10%";
    addPixelPercentInput(node, "marginRight", "marginRightType", marginRight);

    marginDiv1.appendChild(marginLeft);
    marginDiv1.appendChild(marginRight);
    marginSection.appendChild(marginDiv1);

    let marginDiv2 = document.createElement("div");
    marginDiv2.classList.add("horizontal-editor-inputs");
    marginDiv2.style.marginBottom = "15px";

    let marginTop = document.createElement("div");
    marginTop.textContent = "Top:";
    marginTop.style.width = "40%";
    addPixelPercentInput(node, "marginTop", "marginTopType", marginTop);

    let marginBottom = document.createElement("div");
    marginBottom.textContent = "Bottom:";
    marginBottom.style.width = "40%";
    marginBottom.style.marginLeft = "10%";
    addPixelPercentInput(node, "marginBottom", "marginBottomType", marginBottom);

    marginDiv2.appendChild(marginTop);
    marginDiv2.appendChild(marginBottom);
    marginSection.appendChild(marginDiv2);

    layoutStyleSection.appendChild(marginSection);
}

/**
 * Add a input that has pixel and percentage options (width and height)
 */
export function addPixelPercentInput(node: components.Component, numberProperty: string, typeProperty: string, parent: HTMLElement) {
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

  parent.appendChild(div);
}

/**
 * New fancy text editor box
 */
export function addTextEditor(node: components.Component, editable: boolean, textValue?: string) {
  const editorDiv = document.getElementById("editor");
  if (!editorDiv) return;
  if (!(editorDiv instanceof HTMLDivElement)) return;

  //Add a line between component info and text section
  editorDiv.appendChild(document.createElement("br"));

  //details and summary
  let textSection = createSection("Text:", editorDiv);

  //create textbox
  let textboxEditor = document.getElementById("textbox-editor")?.cloneNode(true);
  if (!textboxEditor || !(textboxEditor instanceof HTMLElement)) return;
  textboxEditor.classList.remove("hidden");
  textboxEditor.classList.add("textbox-editor");
  textSection.appendChild(textboxEditor);

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
}

export function addImageSelection(node: components.Component, imageIDProperty: string) {
  const editorDiv = document.getElementById("editor");
  if (!editorDiv) return;
  if (!(editorDiv instanceof HTMLDivElement)) return;

  let outerDiv = document.createElement("div");
  outerDiv.classList.add("image-selection");

  let div = document.createElement("div");
  div.classList.add("image-selection-scrollable");

  for (const image of storage.getImages()) {
    let row = document.createElement("div");
    row.classList.add("image-selection-row");

    if ((node as any)[imageIDProperty] == image.id) row.classList.add("image-selection-row-selected");

    let imgContainer = document.createElement("div");
    imgContainer.classList.add("image-selection-image-container");
    let img = document.createElement("img");
    img.src = image.tempURL;
    img.classList.add("image-selection-image");
    imgContainer.appendChild(img);
    row.appendChild(imgContainer);

    let textDiv = document.createElement("div");
    textDiv.innerText = "Image Name";
    textDiv.classList.add("image-selection-text");
    row.appendChild(textDiv);

    let deleteButton = document.createElement("button");
    deleteButton.classList.add("image-selection-delete-button");
    let deleteButtonIcon = document.createElement("i");
    deleteButtonIcon.classList.add("fa");
    deleteButtonIcon.classList.add("fa-trash");
    deleteButton.appendChild(deleteButtonIcon);
    row.appendChild(deleteButton);

    //set image
    row.onclick = (e) => {
      e.stopPropagation();
      if (!(node as any)[imageIDProperty]) return;
      if ((node as any)[imageIDProperty] == image.id) return;

      (node as any)[imageIDProperty] = image.id;
      
      document.querySelectorAll(".image-selection-row-selected").forEach((val) => {
        val.classList.remove("image-selection-row-selected");
      });
      row.classList.add("image-selection-row-selected");

      app.renderPreview();
    }

    //delete button
    deleteButton.onclick = async (e) => {
      e.stopPropagation();

      await storage.deleteImage(image.id);

      if ((node as any)[imageIDProperty] == image.id) (node as any)[imageIDProperty] = "";

      row.remove();
      app.renderPreview();
    }

    div.appendChild(row);

    //break line
    let hr = document.createElement("hr");
    hr.classList.add("image-selection-hr");
    div.appendChild(hr);
  }

  outerDiv.appendChild(div);

  editorDiv.appendChild(outerDiv);
}

export function addBorderSection(node: components.Component) {
  const editorDiv = document.getElementById("editor");
  if (!editorDiv) return;
  if (!(editorDiv instanceof HTMLDivElement)) return;

  editorDiv.appendChild(document.createElement("br"));

  //details and summary
  let borderSection = createSection("Border:", editorDiv);

  //border width, radius, style, and color
  addSelect(node, borderSection, "Border Style", node.style.borderStyle || "none", ["none", "solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset"], (val: any) => { 
    node.style.borderStyle = val;
    app.renderPreview();
    app.renderEditor();
  });

  //only add border section if there's a border
  if (node.style.borderStyle === "none" || !node.style.borderStyle) return;

  addInput(node, borderSection, "Border Width", node.style.borderWidth || 1, (val: any) => {
    node.style.borderWidth = parseInt(val);
    app.renderPreview();
  }, "number");

  addInput(node, borderSection, "Border Radius", node.style.borderRadius || 0, (val: any) => {
    node.style.borderRadius = parseInt(val);
    app.renderPreview();
  }, "number");

  addInput(node, borderSection, "Border Color", node.style.borderColor || "#000000", (val: any) => {
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

  for (const type of matchevents.getEventTypes()) {
    let text = document.createElement("div")
    text.textContent = type;

    //remove type button
    let remove = document.createElement("button");
    remove.textContent = "X";
    remove.style.marginLeft = "25px";
    remove.onclick = (e) => {
      e.stopPropagation();
      matchevents.removeEventType(type);
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
    if (matchevents.getEventTypes().includes(addInput.value)) return;

    /*let text = document.createElement("div")
    text.textContent = addInput.value;
    typesDiv.appendChild(text);*/

    matchevents.addEventType(addInput.value);
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

  for (const group of matchevents.getEventGroups()) {
     let text = document.createElement("div")
    text.textContent = group;

    //remove group button
    let remove = document.createElement("button");
    remove.textContent = "X";
    remove.style.marginLeft = "25px";
    remove.onclick = (e) => {
      e.stopPropagation();
      matchevents.removeEventGroup(group);
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
    if (matchevents.getEventGroups().includes(addGroupInput.value)) return;

    matchevents.addEventGroup(addGroupInput.value);
    addGroupInput.value = "";

    openEventsModal();
  }

  modal.appendChild(addGroupInput);
  modal.appendChild(addGroupButton);

}

export function addNewEventSection(node: components.Component) {
  const editorDiv = document.getElementById("editor");
  if (!editorDiv) return;
  if (!(editorDiv instanceof HTMLDivElement)) return;

  let container = document.createElement("div");
  let eventSection = createSection("Events:", container);

  let outerDiv = document.createElement("div");
  outerDiv.classList.add("image-selection");

  let scrollableDiv = document.createElement("div");
  scrollableDiv.classList.add("image-selection-scrollable");

  let contentDiv = document.createElement("div");
  contentDiv.classList.add("editor-event-content");

  for (const event of node.componentEvents) {
    
    let eventDiv = document.createElement("div");

    //add action
    let eventLabel = document.createElement("div");
    eventLabel.classList.add("editor-event-label");
    eventLabel.innerHTML = event.trigger.toString().toLowerCase().replace("_", " ");
    eventDiv.appendChild(eventLabel);

    for (const action of event.actions) {
      //add action
      
    }

    contentDiv.appendChild(eventDiv);
  }

  //add action button
  let addEventButton = document.createElement("div");
  addEventButton.classList.add("editor-event-add");
  addEventButton.innerHTML = "Add Event";
  addEventButton.onclick = (e) => {
    e.stopPropagation();
    //test event adding
    node.componentEvents.push(new events.Event(events.EventTrigger.COMPONENT_CLICK));
    app.renderPreview();
    app.renderEditor();
  }
  contentDiv.appendChild(addEventButton);

  scrollableDiv.appendChild(contentDiv);
  outerDiv.appendChild(scrollableDiv);
  eventSection.appendChild(outerDiv);

  editorDiv.appendChild(container);
}

/**
 * Creates a section and returns the div to add content
 */
export function createSection(title: string, parent: HTMLElement): HTMLDivElement {
  let details = document.createElement("details");
  details.open = true;
  let summary = document.createElement("summary");
  summary.innerHTML = title;
  summary.classList.add("editor-summary")
  details.appendChild(summary);

  let content = document.createElement("div");
  details.appendChild(content);

  parent.appendChild(details);

  return content;
}


function closeEventsModal() {
  let overlay = document.getElementById("overlay-events");
  if (overlay) overlay.classList.add("hidden");

  let modal = document.getElementById("modal-events");
  if (modal) modal.classList.add("hidden");
  
}

let overlay = document.getElementById("overlay-events")
if (overlay) overlay.onclick = closeEventsModal;