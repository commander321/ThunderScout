type InputStyle = {
    style: string;
    inputType: "number" | "text" | "color" | "checkbox";
    displayName: string;
    description: string;
    defaultValue: any;
    options?: undefined;
    applyToNode: (node: HTMLElement, style: Record<string, any>) => void;
}

type OptionStyle = {
    style: string;
    inputType?: undefined;
    displayName: string;
    description: string;
    defaultValue: any;
    options: string[];
    applyToNode: (node: HTMLElement, style: Record<string, any>) => void;
}

export type Style = InputStyle | OptionStyle;

//=======================
// Component Style Types
//=======================

export const text: Style = {
    style: "text",
    inputType: "text",
    displayName: "Text",
    description: "Text of the component",
    defaultValue: "",
    applyToNode(node, style) {node.innerHTML = style.text || this.defaultValue}
}

export const width: Style = {
    style: "width",
    inputType: "number",
    displayName: "Width",
    description: "Width of the component",
    defaultValue: "0",
    applyToNode(node, style) {node.style.width = style.width ? (style.width == 0 ? "fit-content" : style.width + (style.widthType || "px")) : "fit-content"}
}

export const widthType: Style = {
    style: "widthType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px",
    applyToNode(node, style) {}
}

export const height: Style = {
    style: "height",
    inputType: "number",
    displayName: "Height",
    description: "Height of the component",
    defaultValue: "0",
    applyToNode(node, style) {node.style.height = style.height ? (style.height == 0 ? "auto" : style.height + (style.heightType || "px")) : "auto"}
}

export const heightType: Style = {
    style: "heightType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px",
    applyToNode(node, style) {}
}

export const background: Style = {
    style: "background",
    inputType: "color",
    displayName: "Background Color",
    description: "",
    defaultValue: "#ffffff",
    applyToNode(node, style) {node.style.background = style.background || ""}
}

export const paddingLeft: Style = {
    style: "paddingLeft",
    inputType: "number",
    displayName: "Padding Left",
    description: "",
    defaultValue: "5",
    applyToNode(node, style) {node.style.paddingLeft = (style.paddingLeft == "0" ? 0 : (style.paddingLeft || this.defaultValue)) + (style.paddingLeftType || "px")}
}

export const paddingLeftType: Style = {
    style: "paddingLeftType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px",
    applyToNode(node, style) {}
}

export const paddingRight: Style = {
    style: "paddingRight",
    inputType: "number",
    displayName: "Padding Right",
    description: "",
    defaultValue: "5",
    applyToNode(node, style) {node.style.paddingRight = (style.paddingRight == "0" ? 0 : (style.paddingRight || this.defaultValue)) + (style.paddingRightType || "px")}
}

export const paddingRightType: Style = {
    style: "paddingRightType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px",
    applyToNode(node, style) {}
}

export const paddingTop: Style = {
    style: "paddingTop",
    inputType: "number",
    displayName: "Padding Top",
    description: "",
    defaultValue: "5",
    applyToNode(node, style) {node.style.paddingTop = (style.paddingTop == "0" ? 0 : (style.paddingTop || this.defaultValue)) + (style.paddingTopType || "px")}
}

export const paddingTopType: Style = {
    style: "paddingTopType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px",
    applyToNode(node, style) {}
}

export const paddingBottom: Style = {
    style: "paddingBottom",
    inputType: "number",
    displayName: "Padding Bottom",
    description: "",
    defaultValue: "5",
    applyToNode(node, style) {node.style.paddingBottom = (style.paddingBottom == "0" ? 0 : (style.paddingBottom || this.defaultValue)) + (style.paddingBottomType || "px")}
}

export const paddingBottomType: Style = {
    style: "paddingBottomType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px",
    applyToNode(node, style) {}
}

export const marginLeft: Style = {
    style: "marginLeft",
    inputType: "number",
    displayName: "Margin Left",
    description: "",
    defaultValue: "0",
    applyToNode(node, style) {/*Handled by layout alignment */}
}

export const marginLeftType: Style = {
    style: "marginLeftType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px",
    applyToNode(node, style) {}
}

export const marginRight: Style = {
    style: "marginRight",
    inputType: "number",
    displayName: "Margin Right",
    description: "",
    defaultValue: "0",
    applyToNode(node, style) {/*Handled by layout alignment */}
}

export const marginRightType: Style = {
    style: "marginRightType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px",
    applyToNode(node, style) {}
}

export const marginTop: Style = {
    style: "marginTop",
    inputType: "number",
    displayName: "Margin Top",
    description: "",
    defaultValue: "6",
    applyToNode(node, style) {node.style.marginTop = (style.marginTop == "0" ? 0 : (style.marginTop || this.defaultValue)) + (style.marginTopType || "px")}
}

export const marginTopType: Style = {
    style: "marginTopType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px",
    applyToNode(node, style) {}
}

export const marginBottom: Style = {
    style: "marginBottom",
    inputType: "number",
    displayName: "Margin Bottom",
    description: "",
    defaultValue: "6",
    applyToNode(node, style) {  node.style.marginBottom = (style.marginBottom == "0" ? 0 : (style.marginBottom || this.defaultValue)) + (style.marginBottomType || "px")}
}

export const marginBottomType: Style = {
    style: "marginBottomType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px",
    applyToNode(node, style) {}
}

export const alignment: Style = {
    style: "alignment",
    displayName: "Alignment",
    description: "",
    options: ["left", "center", "right"],
    defaultValue: "left",
    applyToNode(node, style) {
        if (style.alignment == "right") {
            node.style.marginRight = (style.marginRight == "0" ? 0 : (style.marginRight || marginRight.defaultValue)) + (style.marginRightType || "px");
            node.classList.remove("center-align");
            node.classList.remove("left-align");
            node.classList.add("right-align");
            node.style.marginLeft = "auto";
        } else if (style.alignment == "center") {
            node.classList.remove("right-align");
            node.classList.remove("left-align");
            node.classList.add("center-align");
            node.style.marginLeft = "auto";
            node.style.marginRight = "auto";
        } else {
            node.classList.remove("right-align");
            node.classList.remove("center-align");
            node.classList.add("left-align");
            node.style.marginLeft = (style.marginLeft == "0" ? 0 : (style.marginLeft || marginLeft.defaultValue)) + (style.marginLeftType || "px");
            node.style.marginRight = "auto";
        }
    }
}

export const fontSize: Style = {
    style: "fontSize",
    displayName: "Font Size",
    description: "",
    inputType: "number",
    defaultValue: "14",
    applyToNode(node, style) {node.style.fontSize = (style.fontSize || this.defaultValue) + "px"}
}

export const bold: Style = {
    style: "bold",
    displayName: "Bold",
    description: "",
    inputType: "checkbox",
    defaultValue: false,
    applyToNode(node, style) {node.style.fontWeight = style.bold ? "bold" : "normal"}
}

export const italic: Style = {
    style: "italic",
    displayName: "Italic",
    description: "",
    inputType: "checkbox",
    defaultValue: false,
    applyToNode(node, style) {node.style.fontStyle = style.fontStyle || ""}
}

export const underline: Style = {
    style: "underline",
    displayName: "Underline",
    description: "",
    inputType: "checkbox",
    defaultValue: false,
    applyToNode(node, style) {node.style.textDecoration = style.textDecoration || ""}
}

export const textAlign: Style = {
    style: "textAlign",
    displayName: "Text Align",
    description: "",
    options: ["left", "center", "right"],
    defaultValue: "left",
    applyToNode(node, style) {node.style.textAlign = style.textAlign || this.defaultValue}
}

export const fontColor: Style = {
    style: "color",
    displayName: "Text Color",
    description: "",
    inputType: "color",
    defaultValue: "#000000",
    applyToNode(node, style) {node.style.color = style.color || this.defaultValue}
}

export const fontFamily: Style = {
    style: "fontFamily",
    displayName: "Font",
    description: "",
    options: ["Arial", "Verdana", "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Garamond", "Courier New", "Brush Script MT"],
    defaultValue: "Arial",
    applyToNode(node, style) {node.style.fontFamily = style.fontFamily || this.defaultValue}
}

export const borderRadius: Style = {
    style: "borderRadius",
    displayName: "Border Radius",
    description: "",
    inputType: "number",
    defaultValue: "0",
    applyToNode(node, style) {node.style.borderRadius = (style.borderRadius || this.defaultValue) + "px"}
}

export const borderWidth: Style = {
    style: "borderWidth",
    displayName: "Border Width",
    description: "",
    inputType: "number",
    defaultValue: "1",
    applyToNode(node, style) {
        if (!style.borderStyle || style.borderStyle == "none") return;
        node.style.borderWidth = (style.borderWidth || this.defaultValue) + "px"
    }
}

export const borderColor: Style = {
    style: "borderColor",
    displayName: "Border Color",
    description: "",
    inputType: "color",
    defaultValue: "#000000",
    applyToNode(node, style) {
        if (!style.borderStyle || style.borderStyle == "none") return;
        node.style.borderColor = style.borderColor || this.defaultValue
    }
}

export const borderStyle: Style = {
    style: "borderStyle",
    displayName: "Border Style",
    description: "",
    options: ["none", "solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset"],
    defaultValue: "none",
    applyToNode(node, style) {
        if (!style.borderStyle || style.borderStyle == "none") return;
        node.style.borderStyle = style.borderStyle || this.defaultValue
    }
}

export const buttonColor: Style = {
    style: "buttonColor",
    displayName: "Button Color",
    description: "",
    inputType: "color",
    defaultValue: "#F0F0F0",
    applyToNode(node, style) {/*Handled by button rendering and mouse over events */}
}

export const buttonHoverColor: Style = {
    style: "buttonHoverColor",
    displayName: "Button Hover Color",
    description: "",
    inputType: "color",
    defaultValue: "#E0E0E0",
    applyToNode(node, style) {/*Handled by button rendering and mouse over events */}
}

export const sectionWidth: Style = {
    style: "sectionWidth",
    inputType: "number",
    displayName: "Width",
    description: "",
    defaultValue: "100%",
    applyToNode(node, style) {node.style.width = style.sectionWidth ? (style.sectionWidth == 0 ? this.defaultValue : style.sectionWidth + (style.widthType || widthType.defaultValue)) : this.defaultValue}
}

export const scale: Style = {
    style: "scale",
    inputType: "number",
    displayName: "Size",
    description: "",
    defaultValue: "2",
    applyToNode(node, style) {
        node.style.width = style.scale ? (style.scale == 0 ? "auto" : style.scale + "px") : "auto";
        node.style.height = style.scale ? (style.scale == 0 ? "auto" : style.scale + "px") : "auto";
    }
}

export const checkboxColor: Style = {
    style: "checkboxColor",
    displayName: "Checkbox Color",
    description: "",
    inputType: "color",
    defaultValue: "#FFFFFF",
    applyToNode(node, style) {node.style.backgroundColor = style.checkboxColor || this.defaultValue}
}

export const checkboxCheckedColor: Style = {
    style: "checkboxCheckedColor",
    displayName: "Checked Color",
    description: "",
    inputType: "color",
    defaultValue: "#FF3333",
    applyToNode(node, style) {node.style.accentColor = style.checkboxCheckedColor || this.defaultValue}
}

export const direction: Style = {
    style: "direction",
    displayName: "Direction",
    description: "Orientation of the layout",
    options: ["vertical", "horizontal"],
    defaultValue: "vertical",
    applyToNode(node, style) {if (style.direction == "horizontal") node.classList.add("horizontal")}
}

export const sectionColor: Style = {
    style: "sectionColor",
    displayName: "Section Color",
    description: "",
    defaultValue: "#000000",
    inputType: "color",
    applyToNode(node, style) {node.style.background = style.sectionColor || this.defaultValue}
}

export const textboxID: Style = {
    style: "textboxID",
    displayName: "Textbox ID",
    description: "Give the textbox and ID so you can get it's value later",
    defaultValue: "",
    inputType: "text",
    applyToNode(node, style) {}
}

//=======================
// Style Types Lists
//=======================

export const textStyleTypes: Style[] = [
    text,
    fontSize,
    fontFamily,
    bold,
    italic,
    underline,
    textAlign,
    fontColor
]

export const layoutStyleTypes: Style[] = [
    width,
    widthType,
    height,
    heightType,
    background,
    alignment,
    paddingLeft,
    paddingLeftType,
    paddingRight,
    paddingRightType,
    paddingTop,
    paddingTopType,
    paddingBottom,
    paddingBottomType,
    marginTop,
    marginTopType,
    marginBottom,
    marginBottomType,
    marginLeft,
    marginLeftType,
    marginRight,
    marginRightType
]

export const borderStyleTypes: Style[] = [
    borderRadius,
    borderStyle,
    borderWidth,
    borderColor,
]

export const pixelPercentTypes: Style[] = [
    width,
    height,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom
]

export const actionPropertiesExclude: Style[] = [
    widthType,
    heightType,
    paddingLeftType,
    paddingRightType,
    paddingBottomType,
    paddingTopType,
    marginLeftType,
    marginRightType,
    marginTopType,
    marginBottomType
]