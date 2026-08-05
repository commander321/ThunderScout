import * as app from "./app.js";
import * as components from "./components.js";
import * as matchevents from "./matchevents.js";
import * as actions from "./action.js"
import * as storage from "./storage.js";
import * as events from "./events.js";
import * as style from "./style.js";
import { createElement } from "./app.js";

/**
 * Adds an input for a specific style property
 */
export function addInput(node: components.Component, parent: HTMLElement, labelText: string, style: style.Style, inputElement?: HTMLInputElement, onChange?: (val: any) => void) {
  if (!style.inputType) return;
  
  //add an optional text label on the input
  if (labelText != "") {
    let label = document.createElement("div");
    label.textContent = labelText;
    parent.appendChild(label);
  }

  //create the input element and set its type
  let input = inputElement || document.createElement("input");
  input.type = style.inputType;
  input.value = node.style[style.style] || style.defaultValue;

  //make number inputs look right
  if (style.inputType == "number") {
    input.classList.add("number-input");
  }

  //color inputs save the actions when you close the menu, not every time the color is changed
  if (style.inputType == "color") {
    input.onfocus = () => {
      actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
    }
  }

  if (style.inputType == "checkbox") {
    //checkboxes used onchange and are slightly different
    input.checked = node.style[style.style] || style.defaultValue;
    input.onchange = () => {
      actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
      node.style[style.style] = input.checked;
      //app.renderPreview();
      node.applyStyles();
      if (onChange) onChange(input);
    }
  } else {
    //normal inputs are updated oninput
    input.oninput = () => {
      if (style.inputType != "color") actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
      node.style[style.style] = input.value;
      //app.renderPreview();
      node.applyStyles();
      if (onChange) onChange(input);
    }
  }

  //add the input element to the parent element
  if (!inputElement) parent.appendChild(input);
}

/**
 * Adds a select dropdown for a specific style property
 */
export function addSelect(node: components.Component, parent: HTMLElement, labelText: string, style: style.Style, selectElement?: HTMLSelectElement, onChange?: (val: any) => void) {
  if (!style.options) return;

  //add an optional text label to the dropdown
  if (labelText != "") {
    let label = document.createElement("div");
    label.textContent = labelText;
    parent.appendChild(label);
  }

  //create the select element with options
  let select = selectElement || document.createElement("select");
  style.options.forEach(opt => {
    let option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });

  //set the value when changed
  select.value = node.style[style.style] || style.defaultValue;
  select.onchange = () => {
    actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
    node.style[style.style] = select.value;
    if (onChange) onChange(select);
    //app.renderPreview();
    node.applyStyles();
  }

  if (!selectElement) parent.appendChild(select);
}

/**
 * Add the match event type selection dropdown
 */
export function addMatchEventSelection(matchEvent: matchevents.EventPointer, parent: HTMLElement) {
  let content = createElement("div", ["event-selection-container"], parent);

  let mainInput = createElement("div", ["event-selection-input"], content); //button you click on to open dropdown
  mainInput.style.display = "flex";
  let mainInputText = createElement("div", [],  mainInput)
  mainInputText.innerHTML = matchEvent.value;
  let mainInputIconDiv = createElement("div", ["editor-event-action-label-collapse"], mainInput);
  let mainInputIcon = createElement("i", ["fa", "fa-chevron-down"], mainInputIconDiv);
  let dropdown = createElement("div", ["hidden"], content); //dropdown with all event types and an add button
  let dropdownContent = createElement("div", ["event-selection-dropdown-scrollable"], dropdown);

  for (const eventType of (matchEvent.type === "type" ? matchevents.getEventTypes() : matchevents.getEventGroups())) {
      let eventTypeDiv = createElement("div", ["event-selection-dropdown-button"], dropdownContent);
      let eventTypeText = createElement("div", ["event-selection-dropdown-button-text"], eventTypeDiv);
      eventTypeText.innerHTML = eventType;
      let eventTypeMenuIconDiv = createElement("div", ["event-selection-dropdown-button-delete"], eventTypeDiv);
      let eventTypeMenuIcon = createElement("i", ["fa", "fa-times"], eventTypeMenuIconDiv);

      //set the event type to the one you click on
      eventTypeDiv.onclick = (e) => {
        matchEvent.value = eventType;
        mainInputText.innerHTML = eventType;

        dropdown.classList.add("hidden");
        dropdown.classList.remove("event-selection-dropdown");
        mainInputIcon.classList.add("fa-chevron-down");
        mainInputIcon.classList.remove("fa-chevron-up");
        app.renderPreview();
      }

      //delete button
      eventTypeMenuIconDiv.onclick = (e) => {
        e.stopPropagation();
        if (matchEvent.type === "type") {
          matchevents.removeEventType(eventType);
        } else {
          matchevents.removeEventGroup(eventType);
        } 
        eventTypeDiv.remove();
      }
  }

  //button to add a new event type
  let addButtonDiv = createElement("div", ["event-selection-dropdown-button"], dropdownContent);
  let addButtonIconDiv = createElement("div", ["event-selection-dropdown-button-text"], addButtonDiv)
  let addButtonIcon = createElement("i", ["fa", "fa-plus"], addButtonIconDiv);
  let addButtonText = createElement("div", [], addButtonDiv);

  //text to enter a new event type, hidden by default
  let addEventDiv = createElement("div", ["hidden"], dropdownContent);
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
    if (matchEvent.type === "type") {
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
    eventTypeDiv.onclick = (e) => {
      matchEvent.value = eventType;
      mainInputText.innerHTML = eventType;

      dropdown.classList.add("hidden");
      dropdown.classList.remove("event-selection-dropdown");
      mainInputIcon.classList.add("fa-chevron-down");
      mainInputIcon.classList.remove("fa-chevron-up");
      app.renderPreview();
    }
    //delete button
    eventTypeMenuIconDiv.onclick = (e) => {
      e.stopPropagation();
      if (matchEvent.type === "type") {
          matchevents.removeEventType(eventType);
        } else {
          matchevents.removeEventGroup(eventType);
        } 
      eventTypeDiv.remove();
    }
    dropdownContent.insertBefore(eventTypeDiv, dropdownContent.children[dropdownContent.children.length-2] || null);

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

  //open the menu when you click on it
  mainInput.onclick = (e) => {
    e.stopPropagation();

    //close all other dropdowns
    document.querySelectorAll(".event-selection-dropdown").forEach((d) => {
      if (d === dropdown) return;
      d.classList.add("hidden");
      d.classList.remove("event-selection-dropdown");
    });

    dropdown.classList.toggle("hidden");
    dropdown.classList.toggle("event-selection-dropdown");
    mainInputIcon.classList.toggle("fa-chevron-down");
    mainInputIcon.classList.toggle("fa-chevron-up");
  }

  //close the dropdown menus when you click off of them
  window.addEventListener("click", (e) => {

    dropdown.classList.add("hidden");
    dropdown.classList.remove("event-selection-dropdown");
    addButtonDiv.classList.remove("hidden");
    addButtonDiv.classList.add("event-selection-dropdown-button");
    addEventDiv.classList.add("hidden");
    addEventDiv.classList.remove("event-selection-add-input-button");
    mainInputIcon.classList.add("fa-chevron-down");
    mainInputIcon.classList.remove("fa-chevron-up");
    (addEventDivText as HTMLInputElement).value = "";
  });

}

export function addMatchEventSection(node: components.Component) {
  const editorDiv = document.getElementById("editor");
  if (!editorDiv) return;
  if (!(editorDiv instanceof HTMLDivElement)) return;
  
  let eventSection = createSection("Match Event:", editorDiv);

  let eventTypeDiv = createElement("div", [], eventSection);
  eventTypeDiv.style.display = "flex";
  eventTypeDiv.style.alignItems = "center";
  eventTypeDiv.style.marginBottom = "10px";
  eventTypeDiv.innerHTML = "Event Type:";
  addMatchEventSelection(node.eventType, eventTypeDiv);

  let eventGroupDiv = createElement("div", [], eventSection);
  eventGroupDiv.style.display = "flex";
  eventGroupDiv.style.alignItems = "center";
  eventGroupDiv.innerHTML = "Event Group";
  addMatchEventSelection(node.eventGroup, eventGroupDiv);
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
    addPixelPercentInput(node, style.width, style.widthType, widthDiv);
    layoutStyleSection.appendChild(widthDiv);

    let heightDiv = document.createElement("div");
    heightDiv.textContent = "Height:";
    heightDiv.style.width = "40%";
    addPixelPercentInput(node, style.height, style.heightType, heightDiv);
    layoutStyleSection.appendChild(heightDiv);

    //background color
    addInput(node, layoutStyleSection, "Background", style.background);

    //alignment
    addSelect(node, layoutStyleSection, style.alignment.displayName, style.alignment);

    //padding
    let paddingSection = document.createElement("div");
    paddingSection.textContent = "Padding:";

    let paddingDiv1 = document.createElement("div");
    paddingDiv1.classList.add("horizontal-editor-inputs");
    paddingDiv1.style.paddingTop = "15px";

    let paddingLeft = document.createElement("div");
    paddingLeft.textContent = "Left:";
    paddingLeft.style.width = "40%";
    addPixelPercentInput(node, style.paddingLeft, style.paddingLeftType, paddingLeft);

    let paddingRight = document.createElement("div");
    paddingRight.textContent = "Right:";
    paddingRight.style.width = "40%";
    paddingRight.style.paddingLeft = "10%";
    addPixelPercentInput(node, style.paddingRight, style.paddingRightType, paddingRight);

    paddingDiv1.appendChild(paddingLeft);
    paddingDiv1.appendChild(paddingRight);
    paddingSection.appendChild(paddingDiv1);

    let paddingDiv2 = document.createElement("div");
    paddingDiv2.classList.add("horizontal-editor-inputs");
    paddingDiv2.style.paddingBottom = "15px";

    let paddingTop = document.createElement("div");
    paddingTop.textContent = "Top:";
    paddingTop.style.width = "40%";
    addPixelPercentInput(node, style.paddingTop, style.paddingTopType, paddingTop);

    let paddingBottom = document.createElement("div");
    paddingBottom.textContent = "Bottom:";
    paddingBottom.style.width = "40%";
    paddingBottom.style.paddingLeft = "10%";
    addPixelPercentInput(node, style.paddingBottom, style.paddingBottomType, paddingBottom);

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
    addPixelPercentInput(node, style.marginLeft, style.marginLeftType, marginLeft);

    let marginRight = document.createElement("div");
    marginRight.textContent = "Right:";
    marginRight.style.width = "40%";
    marginRight.style.marginLeft = "10%";
    addPixelPercentInput(node, style.marginRight, style.marginRightType, marginRight);

    marginDiv1.appendChild(marginLeft);
    marginDiv1.appendChild(marginRight);
    marginSection.appendChild(marginDiv1);

    let marginDiv2 = document.createElement("div");
    marginDiv2.classList.add("horizontal-editor-inputs");
    marginDiv2.style.marginBottom = "15px";

    let marginTop = document.createElement("div");
    marginTop.textContent = "Top:";
    marginTop.style.width = "40%";
    addPixelPercentInput(node, style.marginTop, style.marginTopType, marginTop);

    let marginBottom = document.createElement("div");
    marginBottom.textContent = "Bottom:";
    marginBottom.style.width = "40%";
    marginBottom.style.marginLeft = "10%";
    addPixelPercentInput(node, style.marginBottom, style.marginBottomType, marginBottom);

    marginDiv2.appendChild(marginTop);
    marginDiv2.appendChild(marginBottom);
    marginSection.appendChild(marginDiv2);

    layoutStyleSection.appendChild(marginSection);
}

/**
 * Add a input that has pixel and percentage options (width and height)
 */
export function addPixelPercentInput(node: components.Component, numberStyle: style.Style, typeStyle: style.Style, parent: HTMLElement) {
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
  addInput(node, div, "", numberStyle, numberInput);

  div.appendChild(numberInput);

  div.appendChild(divider);

  addSelect(node, div, "", typeStyle, typeDropdown);

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
  if (node.styleTypes.includes(style.text)) {
    textbox.textContent = node.style.text || "";
    textbox.oninput = (e) => {
      e.stopPropagation();
      actions.saveAction(new actions.Action(app.loadComponent(node), null, actions.ActionType.COMPONENT_STYLE_CHANGE, structuredClone(node.style)));
      node.style.text = textbox.textContent;
      app.renderPreview();
    }
  }
  
  //set styles (using the same method the component uses)
  for (const styleType of node.styleTypes) {
    if (style.textStyleTypes.includes(styleType)) styleType.applyToNode(textbox, node.style);
  }
  //components.applyTextStyles(textbox, node.style);

  //font selection
  let fontSelection = document.getElementById("textbox-editor-font");
  if (fontSelection && fontSelection instanceof HTMLSelectElement) {
    addSelect(node, textboxStyleBar, "", style.fontFamily, fontSelection, (val: any) => {
      style.fontFamily.applyToNode(textbox, node.style);
      //components.applyTextStyles(textbox, node.style);
    });
  }

  //font size
  let fontSize = document.getElementById("textbox-editor-font-size");
  if (fontSize && fontSize instanceof HTMLInputElement) {
    addInput(node, textboxStyleBar, "", style.fontSize, fontSize, (val: any) => {
      style.fontSize.applyToNode(textbox, node.style);
    });
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
      //app.renderPreview();
      node.applyStyles();
      style.bold.applyToNode(textbox, node.style);
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
      //app.renderPreview();
      node.applyStyles();
      style.italic.applyToNode(textbox, node.style);
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
      //app.renderPreview();
      node.applyStyles();
      style.underline.applyToNode(textbox, node.style);
    }
  }

  //text color
  let colorInput = document.getElementById("textbox-editor-text-color");
  let icon = document.getElementById("textbox-editor-text-color-icon");
  if (colorInput && colorInput instanceof HTMLInputElement && icon && icon instanceof HTMLElement) {
    icon.style.color = node.style.color || "#000000";

    addInput(node, textboxStyleBar, "", style.fontColor, colorInput);
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
      //app.renderPreview();
      node.applyStyles();
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
  let borderStyleSelect = document.createElement("select");
  addSelect(node, borderSection, "Border Style", style.borderStyle, borderStyleSelect, (val: any) => {
    app.renderEditor();
  });
  borderSection.appendChild(borderStyleSelect);

  //only add border section if there's a border
  if (node.style.borderStyle === "none" || !node.style.borderStyle) return;

  addInput(node, borderSection, style.borderWidth.displayName, style.borderWidth);
  addInput(node, borderSection, style.borderRadius.displayName, style.borderRadius);
  addInput(node, borderSection, style.borderColor.displayName, style.borderColor);
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

    //add event
    let eventLabel = document.createElement("div");
    eventLabel.classList.add("editor-event-trigger-label");
    eventLabel.innerHTML = event.trigger;
    eventLabel.onclick = (e) => {
      e.stopPropagation();
      event.open = true;
      openNewEventsModal(node);
    }
    eventDiv.appendChild(eventLabel);

    //tree that contains actions
    let tree = document.createElement("div");
    tree.classList.add("editor-event-tree");

    //main list inside the tree
    let ul = document.createElement("ul");

    for (const action of event.actions) {
      //add action
      let li = document.createElement("li");

      //div that contains the action content
      let actionDiv = document.createElement("div");
      actionDiv.classList.add("editor-event-action-div");
      actionDiv.style.width = "100%";

      //action label
      let actionLabelDiv = document.createElement("div");
      actionLabelDiv.classList.add("editor-event-action-label");
      actionLabelDiv.style.marginTop = "18px";
      let actionLabelText = document.createElement("div");
      for (const type of events.EVENT_ACTION_TYPES) {
        if (type[0] == action.type && type[1]) actionLabelText.innerHTML = type[1];
      }
      actionLabelDiv.onclick = (e) => {
        e.stopPropagation();
        action.open = true;
        event.open = true;
        openNewEventsModal(node);
      }
      
      actionLabelDiv.appendChild(actionLabelText);
      actionDiv.appendChild(actionLabelDiv);

      li.appendChild(actionDiv);
      ul.appendChild(li);
    }

    //add the button to add an action to the list
    let addActionButtonContainer = document.createElement("div");
  
    let addActionButton = document.createElement("div");
    addActionButton.classList.add("editor-event", "editor-event-action-add");
    addActionButton.innerHTML = "+";
    addActionButton.onclick = (e) => {
      e.stopPropagation();
      openNewEventsModal(node);
    }
    addActionButtonContainer.appendChild(addActionButton);

    let li = document.createElement("li");
    li.appendChild(addActionButtonContainer);
    ul.appendChild(li);
    
    //add list to tree
    tree.appendChild(ul);

    //add tree to the div containing the event
    eventDiv.appendChild(tree);

    contentDiv.appendChild(eventDiv);
  }

  //add trigger button
  let addEventButton = document.createElement("div");
  addEventButton.classList.add("editor-event-trigger-add");
  addEventButton.style.width = "30%";
  addEventButton.innerHTML = "Add Event";
  addEventButton.onclick = (e) => {
    e.stopPropagation();

    openNewEventsModal(node);
  }
  contentDiv.appendChild(addEventButton);

  scrollableDiv.appendChild(contentDiv);
  outerDiv.appendChild(scrollableDiv);
  eventSection.appendChild(outerDiv);

  editorDiv.appendChild(container);
}

/**
 * Opens a menu to view events
 */
export function openNewEventsModal(node: components.Component) {
  currentComponent = node;
  closeEventsModal();

  const appContent = document.getElementById("content");
  if (!appContent) return;

  let overlay = createElement("div", ["overlay-events"], appContent);

  overlay.onclick = (e) => {
    e.stopPropagation();
    closeEventsModal();
  }

  let modal = createElement("div", ["modal-events"], appContent);

  let content = document.createElement("div");
  content.classList.add("modal-events-content");

  //get name of component type
  let title = document.createElement("div");
  title.innerHTML = "Events: ";
  title.style.fontSize = "20px";
  title.style.fontWeight = "bold";
  for (const component of components.COMPONENT_TYPES) {
    if (node.constructor.name.toLowerCase() === component[0] && component[1]) {
      title.innerHTML += component[1];
      break;
    }
  }
  content.appendChild(title);

  let hr = document.createElement("hr");
  content.appendChild(hr);

  for (const event of node.componentEvents) {
    currentEvent = event;
    
    //div that contains the whole event
    let eventDiv = document.createElement("div");
    eventDiv.classList.add("editor-event-div");

    //add event label with the event type and icon
    let eventLabel = document.createElement("div");
    eventLabel.classList.add("editor-event-trigger-label");

    let eventLabelText = document.createElement("div");
    eventLabelText.innerHTML = event.trigger;

    let eventLabelIconDiv = document.createElement("div");
    eventLabelIconDiv.classList.add("editor-event-action-label-icon");
    let eventLabelIcon = document.createElement("i");
    if (event.trigger == events.EventTrigger.COMPONENT_CLICK) {
      eventLabelIcon.classList.add("fa", "fa-mouse-pointer");
    } else if (event.trigger == events.EventTrigger.COMPONENT_HOVER) {
      eventLabelIcon.classList.add("fa", "fa-hand-pointer-o");
    } else if (event.trigger == events.EventTrigger.OTHER_EVENT) {
      eventLabelIcon.classList.add("fa", "fa-bolt");
    }
    eventLabelIconDiv.appendChild(eventLabelIcon);
    let eventLabelCollapse = document.createElement("div");
    eventLabelCollapse.classList.add("editor-event-action-label-collapse");
    let eventCollapseIcon = document.createElement("i");
    eventCollapseIcon.classList.add("fa", event.open ? "fa-minus" : "fa-plus");
    eventLabelCollapse.appendChild(eventCollapseIcon);

    eventLabel.appendChild(eventLabelIconDiv);
    eventLabel.appendChild(eventLabelText);
    eventLabel.appendChild(eventLabelCollapse);
    eventDiv.appendChild(eventLabel);

    //tree that contains actions
    let tree = document.createElement("div");
    tree.classList.add("editor-event-tree");

    //make it so you can close the event div
    if (!event.open) tree.classList.add("hidden");
    eventLabel.onclick = (e) => {
      e.stopPropagation();
      event.open = !event.open;
      eventCollapseIcon.classList.toggle("fa-plus");
      eventCollapseIcon.classList.toggle("fa-minus");
      tree.classList.toggle("hidden");
    }

    //main list inside the tree
    let ul = document.createElement("ul");
    
    //add a li for each action
    for (const action of event.actions) {
      if (action instanceof events.ActionStyleChange && action.componentID.length == 0) action.componentID = node.id;
      let li = document.createElement("li");

      //div that contains the action content
      let actionDiv = document.createElement("div");
      actionDiv.classList.add("editor-event-action-div");

      //action label
      let actionLabelDiv = document.createElement("div");
      actionLabelDiv.classList.add("editor-event-action-label");

      let actionLabelIconDiv = document.createElement("div");
      actionLabelIconDiv.classList.add("editor-event-action-label-icon");
      let actionLabelIcon = document.createElement("i");
      actionLabelIconDiv.appendChild(actionLabelIcon);

      let actionLabelText = document.createElement("div");
      for (const type of events.EVENT_ACTION_TYPES) {
        if (type[0] != action.type) continue;
        if (type[1]) actionLabelText.innerHTML = type[1];
        if (type[3]) actionLabelIcon.classList.add("fa", type[3]);
      }
      let actionLabelCollapse = document.createElement("div");
      actionLabelCollapse.classList.add("editor-event-action-label-collapse");
      let collapseIcon = document.createElement("i");
      collapseIcon.classList.add("fa", "fa-plus");
      actionLabelCollapse.appendChild(collapseIcon);

      actionLabelDiv.appendChild(actionLabelIconDiv);
      actionLabelDiv.appendChild(actionLabelText);
      actionLabelDiv.appendChild(actionLabelCollapse);
      actionDiv.appendChild(actionLabelDiv);

      //dropdown that opens on click that has settings and things
      let actionProperties = document.createElement("div");
      actionProperties.classList.add("hidden");
      actionLabelDiv.onclick = (e) => {
        e.stopPropagation();
        action.open = !action.open;
        actionProperties.classList.toggle("hidden");
        actionProperties.classList.toggle("editor-event-action-properties");

        collapseIcon.classList.toggle("fa-plus");
        collapseIcon.classList.toggle("fa-minus");

        actionProperties.replaceChildren();
        action.addProperties(actionProperties);
      }
      if (action.open) {
        actionLabelDiv.click();
        action.open = true;
      }
      actionDiv.appendChild(actionProperties);

      li.appendChild(actionDiv);
      ul.appendChild(li);
    }

    

    //add the button to add an action to the list
    let addActionButtonContainer = document.createElement("div");
    addActionButtonContainer.style.position = "relative";
  
    let addActionButton = document.createElement("div");
    addActionButton.classList.add("editor-event", "editor-event-action-add");
    addActionButton.innerHTML = "+";
    addActionButtonContainer.appendChild(addActionButton);

    addActionButton.onclick = (e) => {
      e.stopPropagation();
      currentComponent = node;
      currentEvent = event;
      addActionButtonContainer.appendChild(addEventActionDropdown);
      addEventActionDropdown.classList.toggle("hidden");
      addEventActionDropdown.classList.toggle("event-trigger-dropdown");

      addActionButtonContainer.appendChild(addEventActionDropdown);
    }

    let li = document.createElement("li");
    li.appendChild(addActionButtonContainer);
    ul.appendChild(li);
    
    //add list to tree
    tree.appendChild(ul);

    //add tree to the div containing the event
    eventDiv.appendChild(tree);
    
    //add event to modal content
    content.appendChild(eventDiv);
  }

  //add event trigger button
  content.appendChild(addEventTriggerButton);

  //put the content in the modal
  modal.appendChild(content);

  //close any dropdown menus that may still be open
  document.querySelectorAll(".event-trigger-dropdown").forEach((e) => {
    e.classList.add("hidden");
    e.classList.remove("event-trigger-dropdown");
  });
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

let addEventTriggerButton: HTMLDivElement;
//let addEventActionButton: HTMLDivElement;
let addEventActionDropdown: HTMLElement;
let currentComponent: components.Component;
let currentEvent: events.Event;

/**
 * Create the HTML elements for triggers and dropdowns when the app is loaded
 */
export function initEventSelection() {
  let addButtonContainer = document.createElement("div");

  //add event trigger button (opens trigger select dropdown)
  let addEventButton = document.createElement("div");
  let addEventButtonIcon = document.createElement("i");
  let addEventButtonText = document.createElement("div");
  addEventButton.classList.add("editor-event-trigger-add");
  addEventButtonText.innerHTML = "Add Event";
  addEventButtonIcon.classList.add("editor-event-action-label-icon", "fa", "fa-plus");
  addEventButton.appendChild(addEventButtonIcon);
  addEventButton.appendChild(addEventButtonText);
  addButtonContainer.appendChild(addEventButton);

  //dropdown that's hidden initially
  let addEventDropdown = document.createElement("div");
  addEventDropdown.classList.add("hidden");
  //add each trigger type
  Object.values(events.EventTrigger).forEach((trigger) => {
    let addTriggerButton = document.createElement("button");
    addTriggerButton.innerHTML = trigger;
    addTriggerButton.classList.add("event-trigger-dropdown-button");
    addTriggerButton.onclick = (e) => {
      e.stopPropagation();
      if (!currentComponent) return;
      //add the new event and refresh the modal 
      currentComponent.componentEvents.push(new events.Event(trigger));
      addEventDropdown.classList.add("hidden");
      addEventDropdown.classList.remove("event-trigger-dropdown");
      openNewEventsModal(currentComponent);
    }
      
    addEventDropdown.appendChild(addTriggerButton);
  })

  //click the button to open the dropdown
  addEventButton.onclick = (e) => {
    e.stopPropagation();
    addEventDropdown.classList.toggle("hidden");
    addEventDropdown.classList.toggle("event-trigger-dropdown");

    addButtonContainer.appendChild(addEventDropdown);
  }

  addEventTriggerButton = addButtonContainer;

  //====================================================================

  //action dropdown that's hidden initially
  let addActionDropdown = document.createElement("div");
  addActionDropdown.classList.add("hidden");
  //add each action type
  for (const action of events.EVENT_ACTION_TYPES) {
    if (!action[0]) continue;
    let addButton = document.createElement("button");
    addButton.innerHTML = action[1] || "Action";
    addButton.classList.add("event-trigger-dropdown-button");
    addButton.onclick = (e) => {
      e.stopPropagation();
      if (!currentComponent || !currentEvent) return;
      currentEvent.actions.push(new events.eventActionTypeRegistry[action[0] as events.EventActionType]());
      
      addActionDropdown.classList.add("hidden");
      addActionDropdown.classList.remove("event-trigger-dropdown");
      openNewEventsModal(currentComponent);
    }
      
    addActionDropdown.appendChild(addButton);
  }

  //close the dropdown menus when you click off of them
  window.addEventListener("click", (e) => {
      e.stopPropagation();
      addEventDropdown.classList.add("hidden");
      addEventDropdown.classList.remove("event-trigger-dropdown");
      addActionDropdown.classList.add("hidden");
      addActionDropdown.classList.remove("event-trigger-dropdown");
  });

  addEventActionDropdown = addActionDropdown;
}

/**
 * Closes the events modal if it's open
 */
export function closeEventsModal() {
  document.querySelectorAll(".modal-events").forEach((e) => {e.remove()});
  document.querySelectorAll(".overlay-events").forEach((e) => {e.remove()});
}