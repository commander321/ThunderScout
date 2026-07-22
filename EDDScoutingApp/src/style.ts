type InputStyle = {
    style: string;
    inputType: "number" | "text" | "color" | "checkbox";
    displayName: string;
    description: string;
    defaultValue: any;
    options?: undefined;
}

type OptionStyle = {
    style: string;
    inputType?: undefined;
    displayName: string;
    description: string;
    defaultValue: any;
    options: string[];
}

export type Style = InputStyle | OptionStyle;

//=======================
// Component Style Types
//=======================

export const width: Style = {
    style: "width",
    inputType: "number",
    displayName: "Width",
    description: "Width of the component",
    defaultValue: "0"
}

export const widthType: Style = {
    style: "widthType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px"
}

export const height: Style = {
    style: "height",
    inputType: "number",
    displayName: "Hidth",
    description: "Hidth of the component",
    defaultValue: "0"
}

export const heightType: Style = {
    style: "heightType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px"
}

export const background: Style = {
    style: "background",
    inputType: "color",
    displayName: "Background Color",
    description: "",
    defaultValue: "#ffffff"
}

export const paddingLeft: Style = {
    style: "paddingLeft",
    inputType: "number",
    displayName: "Padding Left",
    description: "",
    defaultValue: "0"
}

export const paddingLeftType: Style = {
    style: "paddingLeftType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px"
}

export const paddingRight: Style = {
    style: "paddingRight",
    inputType: "number",
    displayName: "Padding Right",
    description: "",
    defaultValue: "0"
}

export const paddingRightType: Style = {
    style: "paddingRightType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px"
}

export const paddingTop: Style = {
    style: "paddingTop",
    inputType: "number",
    displayName: "Padding Top",
    description: "",
    defaultValue: "0"
}

export const paddingTopType: Style = {
    style: "paddingTopType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px"
}

export const paddingBottom: Style = {
    style: "paddingBottom",
    inputType: "number",
    displayName: "Padding Bottom",
    description: "",
    defaultValue: "0"
}

export const paddingBottomType: Style = {
    style: "paddingBottomType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px"
}

export const marginLeft: Style = {
    style: "marginLeft",
    inputType: "number",
    displayName: "Margin Left",
    description: "",
    defaultValue: "0"
}

export const marginLeftType: Style = {
    style: "marginLeftType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px"
}

export const marginRight: Style = {
    style: "marginRight",
    inputType: "number",
    displayName: "Margin Right",
    description: "",
    defaultValue: "0"
}

export const marginRightType: Style = {
    style: "marginRightType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px"
}

export const marginTop: Style = {
    style: "marginTop",
    inputType: "number",
    displayName: "Margin Top",
    description: "",
    defaultValue: "0"
}

export const marginTopType: Style = {
    style: "marginTopType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px"
}

export const marginBottom: Style = {
    style: "marginBottom",
    inputType: "number",
    displayName: "Margin Bottom",
    description: "",
    defaultValue: "0"
}

export const marginBottomType: Style = {
    style: "marginBottomType",
    displayName: "",
    description: "",
    options: ["px", "%"],
    defaultValue: "px"
}

export const alignment: Style = {
    style: "alignment",
    displayName: "Alignment",
    description: "",
    options: ["left", "center", "right"],
    defaultValue: "left"
}

export const fontSize: Style = {
    style: "fontSize",
    displayName: "Font Size",
    description: "",
    inputType: "number",
    defaultValue: "14"
}

export const bold: Style = {
    style: "bold",
    displayName: "Bold",
    description: "",
    inputType: "checkbox",
    defaultValue: false
}

export const italic: Style = {
    style: "italic",
    displayName: "Italic",
    description: "",
    inputType: "checkbox",
    defaultValue: false
}

export const underline: Style = {
    style: "underline",
    displayName: "Underline",
    description: "",
    inputType: "checkbox",
    defaultValue: false
}

export const textAlign: Style = {
    style: "textAlign",
    displayName: "Text Align",
    description: "",
    options: ["left", "center", "right"],
    defaultValue: "left"
}

export const fontColor: Style = {
    style: "color",
    displayName: "Text Color",
    description: "",
    inputType: "color",
    defaultValue: "#000000"
}

export const fontFamily: Style = {
    style: "fontFamily",
    displayName: "Font",
    description: "",
    options: ["Arial", "Verdana", "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Garamond", "Courier New", "Brush Script MT"],
    defaultValue: "Arial"
}

export const borderRadius: Style = {
    style: "borderRadius",
    displayName: "Border Radius",
    description: "",
    inputType: "number",
    defaultValue: "0"
}

export const borderWidth: Style = {
    style: "borderWidth",
    displayName: "Border Width",
    description: "",
    inputType: "number",
    defaultValue: "1"
}

export const borderColor: Style = {
    style: "borderColor",
    displayName: "Border Color",
    description: "",
    inputType: "color",
    defaultValue: "#000000"
}

export const borderStyle: Style = {
    style: "borderStyle",
    displayName: "Border Style",
    description: "",
    options: ["none", "solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset"],
    defaultValue: "none"
}

export const buttonColor: Style = {
    style: "buttonColor",
    displayName: "Button Color",
    description: "",
    inputType: "color",
    defaultValue: "#F0F0F0"
}

export const buttonHoverColor: Style = {
    style: "buttonHoverColor",
    displayName: "Button Hover Color",
    description: "",
    inputType: "color",
    defaultValue: "#E0E0E0"
}

export const thickness: Style = {
    style: "thickness",
    inputType: "number",
    displayName: "Thickness",
    description: "",
    defaultValue: "2"
}

export const scale: Style = {
    style: "scale",
    inputType: "number",
    displayName: "Size",
    description: "",
    defaultValue: "2"
}

export const checkboxColor: Style = {
    style: "checkboxColor",
    displayName: "Checkbox Color",
    description: "",
    inputType: "color",
    defaultValue: "#FFFFFF"
}

export const checkboxCheckedColor: Style = {
    style: "checkboxCheckedColor",
    displayName: "Checked Color",
    description: "",
    inputType: "color",
    defaultValue: "#FF3333"
}

export const direction: Style = {
    style: "direction",
    displayName: "Direction",
    description: "Orientation of the layout",
    options: ["vertical", "horizontal"],
    defaultValue: "vertical"
}

//=======================
// Style Types Lists
//=======================

export const textStyleTypes: Style[] = [
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