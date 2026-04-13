import * as app from "./app.js";
import * as components from "./components.js";
import * as events from "./events.js";

export function addInput(parentDiv: HTMLDivElement, labelText: string, value: any, onChange: any, type: string = "text") {
  let label = document.createElement("div");
  label.textContent = labelText;
  parentDiv.appendChild(label);

  let input = document.createElement("input");
  input.type = type;
  input.value = value;

  
  if (type === "number") {
    input.classList.add("number-input");
  }

  //Checkboxes have onchange instead of oninput like text fields
  if (type === "checkbox") {
    input.checked = value
    input.onchange = () => onChange(input);
  } else {
    input.oninput = () => onChange(input.value);
  }

  parentDiv.appendChild(input);
}

export function addSelect(labelText: string, value: string, options: string[], onChange: any) {
  const editorDiv = document.getElementById("editor");
  if (!editorDiv) return;

  let label = document.createElement("div");
  label.textContent = labelText;
  editorDiv.appendChild(label);

  let select = document.createElement("select");

  options.forEach(opt => {
    let option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });

  select.value = value;
  select.onchange = () => onChange(select.value);

  editorDiv.appendChild(select);
}

/**
 * Add the label option for components with a text label
 */
export function addTextLabel(node: any) {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    addInput(editorDiv, "Label", node.text, (val: any) => {
        node.text = val;
        app.renderPreview();
    });
}

/**
 * Adds the dropdown selection for all events
 */
export function addEventSelection(node: components.Component) {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    addSelect("Event", node.eventType, events.getEventTypes(), (val: any) => { 
      node.eventType = val;
      app.renderPreview();
    });

    addSelect("Group", node.eventGroup, events.getEventGroups(), (val: any) => {
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

    addSelect("Group", node.eventGroup, events.getEventGroups(), (val: any) => {
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

    addInput(editorDiv, "Background", node.style.background || "#FFFFFF", (val: any) => {
        node.style.background = val;
        app.renderPreview();
      }, "color");


    addInput(editorDiv, "Width (%)", node.style.width || 100, (val: any) => {
        node.style.width = val;
        app.renderPreview();
      }, "number");


    //======= Div Alignment =======
    
    addSelect("Allignment", node.style.allignment || "left", ["left", "right", "center"], (val: any) => {
        node.style.allignment = val;
        app.renderPreview();
    });

    //======= Padding Section =======

    let paddingDiv1 = document.createElement("div");
    paddingDiv1.classList.add("horizontal-editor-inputs");

    addInput(paddingDiv1, "Padding Left", node.style.paddingLeft || 5, (val: any) => {
        node.style.paddingLeft = parseInt(val);
        app.renderPreview();
      }, "number"); 
      
    addInput(paddingDiv1, "Padding Right", node.style.paddingRight || 5, (val: any) => {
      node.style.paddingRight = parseInt(val);
      app.renderPreview();
    }, "number");  

    editorDiv.appendChild(paddingDiv1);

    let paddingDiv2 = document.createElement("div");
    paddingDiv2.classList.add("horizontal-editor-inputs");

    addInput(paddingDiv2, "Padding Top", node.style.paddingTop || 5, (val: any) => {
        node.style.paddingTop = parseInt(val) == 0 ? "0" : parseInt(val);
        app.renderPreview();
      }, "number"); 
      
    addInput(paddingDiv2, "Padding Bottom", node.style.paddingBottom || 5, (val: any) => {
      node.style.paddingBottom = parseInt(val) == 0 ? "0" : parseInt(val);
      app.renderPreview();
    }, "number");  

    //Should probably make label divs for padding and margins, do this later
    paddingDiv2.style.paddingBottom = "15px";
    editorDiv.appendChild(paddingDiv2);

    //======= Margins Section =======

    let marginDiv1 = document.createElement("div");
    marginDiv1.classList.add("horizontal-editor-inputs");

    addInput(marginDiv1, "Margin Left", node.style.marginLeft || 0, (val: any) => {
      node.style.marginLeft = parseInt(val) == 0 ? "0" : parseInt(val);
      app.renderPreview();
    }, "number");  

    addInput(marginDiv1, "Margin Right", node.style.marginRight || 0, (val: any) => {
      node.style.marginRight = parseInt(val) == 0 ? "0" : parseInt(val);
      app.renderPreview();
    }, "number");  

    editorDiv.appendChild(marginDiv1);

    let marginDiv2 = document.createElement("div");
    marginDiv2.classList.add("horizontal-editor-inputs");

    addInput(marginDiv2, "Margin Top", node.style.marginTop || 6, (val: any) => {
      node.style.marginTop = parseInt(val) == 0 ? "0" : parseInt(val); //Make 0 be a string otherwise it glitches out and always set it to 6
      app.renderPreview();
    }, "number");  

    addInput(marginDiv2, "Margin Bottom", node.style.marginBottom || 6, (val: any) => {
      node.style.marginBottom = parseInt(val) == 0 ? "0" : parseInt(val);
      app.renderPreview();
    }, "number");  

    editorDiv.appendChild(marginDiv2);

}

/**
 * Add a section for components with text
 */
export function addTextSection(node: components.Component) {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;
    if (!(editorDiv instanceof HTMLDivElement)) return;

    //Add a line between component info and text section
    editorDiv.appendChild(document.createElement("hr"));
    let label = document.createElement("div");
    label.textContent = "Text:";
    editorDiv.appendChild(label);
    editorDiv.appendChild(document.createElement("br"));

    addInput(editorDiv, "Font Size", node.style.textSize || 14, (val: any) => {
        node.style.textSize = parseInt(val);
        app.renderPreview();
    }, "number");

    addInput(editorDiv, "Text Color", node.style.color || "#000000", (val: any) => {
        node.style.color = val;
        app.renderPreview();
      }, "color");

    addInput(editorDiv, "Bold", node.style.bold || false, (val: any) => {
        node.style.bold = val.checked;
        app.renderPreview();
    }, "checkbox");

    addInput(editorDiv, "Italics", node.style.fontStyle === "italic" || false, (val: any) => {
        node.style.fontStyle = val.checked ? "italic" : "";
        app.renderPreview();
    }, "checkbox");

    addInput(editorDiv, "Underlined", node.style.textDecoration === "underline" || false, (val: any) => {
        node.style.textDecoration = val.checked ? "underline" : "";
        app.renderPreview();
    }, "checkbox");
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

    let text = document.createElement("div")
    text.textContent = addInput.value;
    typesDiv.appendChild(text);

    events.addEventType(addInput.value);
    addInput.value = "";
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

    let text = document.createElement("div")
    text.textContent = addGroupInput.value;
    groupsDiv.appendChild(text);

    events.addEventGroup(addGroupInput.value);
    addGroupInput.value = "";
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