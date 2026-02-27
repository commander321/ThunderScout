import * as app from "./app.js";
import * as components from "./components.js";
import * as events from "./events.js";
export function addInput(parentDiv, labelText, value, onChange, type = "text") {
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
        input.checked = value;
        input.onchange = () => onChange(input);
    }
    else {
        input.oninput = () => onChange(input.value);
    }
    parentDiv.appendChild(input);
}
export function addSelect(labelText, value, options, onChange) {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv)
        return;
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
export function addTextLabel(node) {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv)
        return;
    if (!(editorDiv instanceof HTMLDivElement))
        return;
    addInput(editorDiv, "Label", node.text, (val) => {
        node.text = val;
        app.renderPreview();
    });
}
/**
 * Adds the dropdown selection for all events
 */
export function addEventSelection(node) {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv)
        return;
    if (!(editorDiv instanceof HTMLDivElement))
        return;
    addSelect("Event", node.eventType, events.getEventTypes(), (val) => {
        node.eventType = val;
        app.renderPreview();
    });
}
/**
 * Add a new section for styles
 */
export function addStyleSection(node) {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv)
        return;
    if (!(editorDiv instanceof HTMLDivElement))
        return;
    //Add a line between component info and style
    editorDiv.appendChild(document.createElement("hr"));
    let label = document.createElement("div");
    label.textContent = "Style:";
    editorDiv.appendChild(label);
    editorDiv.appendChild(document.createElement("br"));
    addInput(editorDiv, "Background", node.style.background || "#FFFFFF", (val) => {
        node.style.background = val;
        app.renderPreview();
    }, "color");
    addInput(editorDiv, "Width (%)", node.style.width || 100, (val) => {
        node.style.width = val;
        app.renderPreview();
    }, "number");
    //======= Div Alignment =======
    addSelect("Allignment", node.style.allignment || "left", ["left", "right", "center"], (val) => {
        node.style.allignment = val;
        app.renderPreview();
    });
    //======= Padding Section =======
    let paddingDiv1 = document.createElement("div");
    paddingDiv1.classList.add("horizontal-editor-inputs");
    addInput(paddingDiv1, "Padding Left", node.style.paddingLeft || 5, (val) => {
        node.style.paddingLeft = parseInt(val);
        app.renderPreview();
    }, "number");
    addInput(paddingDiv1, "Padding Right", node.style.paddingRight || 5, (val) => {
        node.style.paddingRight = parseInt(val);
        app.renderPreview();
    }, "number");
    editorDiv.appendChild(paddingDiv1);
    let paddingDiv2 = document.createElement("div");
    paddingDiv2.classList.add("horizontal-editor-inputs");
    addInput(paddingDiv2, "Padding Top", node.style.paddingTop || 5, (val) => {
        node.style.paddingTop = parseInt(val) == 0 ? "0" : parseInt(val);
        app.renderPreview();
    }, "number");
    addInput(paddingDiv2, "Padding Bottom", node.style.paddingBottom || 5, (val) => {
        node.style.paddingBottom = parseInt(val) == 0 ? "0" : parseInt(val);
        app.renderPreview();
    }, "number");
    //Should probably make label divs for padding and margins, do this later
    paddingDiv2.style.paddingBottom = "15px";
    editorDiv.appendChild(paddingDiv2);
    //======= Margins Section =======
    let marginDiv1 = document.createElement("div");
    marginDiv1.classList.add("horizontal-editor-inputs");
    addInput(marginDiv1, "Margin Left", node.style.marginLeft || 0, (val) => {
        node.style.marginLeft = parseInt(val) == 0 ? "0" : parseInt(val);
        app.renderPreview();
    }, "number");
    addInput(marginDiv1, "Margin Right", node.style.marginRight || 0, (val) => {
        node.style.marginRight = parseInt(val) == 0 ? "0" : parseInt(val);
        app.renderPreview();
    }, "number");
    editorDiv.appendChild(marginDiv1);
    let marginDiv2 = document.createElement("div");
    marginDiv2.classList.add("horizontal-editor-inputs");
    addInput(marginDiv2, "Margin Top", node.style.marginTop || 6, (val) => {
        node.style.marginTop = parseInt(val) == 0 ? "0" : parseInt(val); //Make 0 be a string otherwise it glitches out and always set it to 6
        app.renderPreview();
    }, "number");
    addInput(marginDiv2, "Margin Bottom", node.style.marginBottom || 6, (val) => {
        node.style.marginBottom = parseInt(val) == 0 ? "0" : parseInt(val);
        app.renderPreview();
    }, "number");
    editorDiv.appendChild(marginDiv2);
}
/**
 * Add a section for components with text
 */
export function addTextSection(node) {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv)
        return;
    if (!(editorDiv instanceof HTMLDivElement))
        return;
    //Add a line between component info and text section
    editorDiv.appendChild(document.createElement("hr"));
    let label = document.createElement("div");
    label.textContent = "Text:";
    editorDiv.appendChild(label);
    editorDiv.appendChild(document.createElement("br"));
    addInput(editorDiv, "Font Size", node.style.textSize || 14, (val) => {
        node.style.textSize = parseInt(val);
        app.renderPreview();
    }, "number");
    /*addInput("Text Color", node.color || "#FFFFFF", val => {
        node.color = val;
        app.renderPreview();
      }, "color");*/
    addInput(editorDiv, "Bold", node.style.bold || false, (val) => {
        node.style.bold = val.checked;
        app.renderPreview();
    }, "checkbox");
    addInput(editorDiv, "Italics", node.style.fontStyle === "italic" || false, (val) => {
        node.style.fontStyle = val.checked ? "italic" : "";
        app.renderPreview();
    }, "checkbox");
    addInput(editorDiv, "Underlined", node.style.textDecoration === "underline" || false, (val) => {
        node.style.textDecoration = val.checked ? "underline" : "";
        app.renderPreview();
    }, "checkbox");
}
//# sourceMappingURL=editor.js.map