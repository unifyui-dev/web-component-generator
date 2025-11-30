import React from "react";
import { mapSchemaStyleToCss, filterPointerEvents } from "../../utils/styles";

// Accepts all possible Image properties as per schema.d.ts
export interface ImageProps {
  styleMap?: {
    display?: "flex" | "none";
    flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
    flexWrap?: "wrap" | "nowrap" | "wrap-reverse";
    justifyContent?:
      | "flex-start"
      | "flex-end"
      | "center"
      | "space-between"
      | "space-around"
      | "space-evenly"
      | "start"
      | "end"
      | "stretch";
    alignItems?:
      | "flex-start"
      | "flex-end"
      | "center"
      | "stretch"
      | "baseline"
      | "start"
      | "end";
    alignSelf?:
      | "auto"
      | "flex-start"
      | "flex-end"
      | "center"
      | "stretch"
      | "baseline"
      | "start"
      | "end";
    alignContent?:
      | "flex-start"
      | "flex-end"
      | "center"
      | "stretch"
      | "space-between"
      | "space-around"
      | "start"
      | "end"
      | "space-evenly";
    position?: "relative" | "absolute" | "fixed";
    top?: any;
    right?: any;
    bottom?: any;
    left?: any;
    zIndex?: number;
    gridTemplateColumns?: string;
    gridTemplateRows?: string;
    gridTemplateAreas?: string;
    gridAutoColumns?: string;
    gridAutoRows?: string;
    gridAutoFlow?: "row" | "column" | "row dense" | "column dense";
    gridColumnGap?: any;
    gridRowGap?: any;
    justifyItems?: "start" | "end" | "center" | "stretch";
    justifySelf?: "start" | "end" | "center" | "stretch";
    gridColumn?: string;
    gridRow?: string;
    gridArea?: string;
    margin?: any;
    marginTop?: any;
    marginRight?: any;
    marginBottom?: any;
    marginLeft?: any;
    marginHorizontal?: any;
    marginVertical?: any;
    padding?: any;
    paddingTop?: any;
    paddingRight?: any;
    paddingBottom?: any;
    paddingLeft?: any;
    paddingHorizontal?: any;
    paddingVertical?: any;
    gap?: any;
    rowGap?: any;
    columnGap?: any;
    width?: any;
    height?: any;
    minWidth?: any;
    minHeight?: any;
    maxWidth?: any;
    maxHeight?: any;
    aspectRatio?: any;
    flex?: any;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: any;
    backgroundColor?: any;
    color?: any;
    borderColor?: any;
    borderTopColor?: any;
    borderRightColor?: any;
    borderBottomColor?: any;
    borderLeftColor?: any;
    opacity?: number;
    borderWidth?: any;
    borderTopWidth?: any;
    borderRightWidth?: any;
    borderBottomWidth?: any;
    borderLeftWidth?: any;
    borderRadius?: any;
    borderTopLeftRadius?: any;
    borderTopRightRadius?: any;
    borderBottomLeftRadius?: any;
    borderBottomRightRadius?: any;
    borderStyle?: "solid" | "dashed" | "dotted";
    fontSize?: any;
    fontWeight?:
      | "normal"
      | "bold"
      | "100"
      | "200"
      | "300"
      | "400"
      | "500"
      | "600"
      | "700"
      | "800"
      | "900";
    fontFamily?: string;
    fontStyle?: "normal" | "italic";
    lineHeight?: any;
    letterSpacing?: any;
    textAlign?: "left" | "right" | "center" | "justify" | "auto";
    textDecoration?: "none" | "underline" | "line-through";
    textDecorationColor?: any;
    textDecorationStyle?: "solid" | "dashed" | "dotted" | "double" | "wavy";
    textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
    textOverflow?: "clip" | "ellipsis";
    numberOfLines?: number;
    shadow?: string;
    shadowColor?: any;
    shadowOffset?: any;
    shadowOffsetX?: any;
    shadowOffsetY?: any;
    shadowOpacity?: number;
    shadowRadius?: any;
    elevation?: number;
    overflow?: "visible" | "hidden" | "scroll";
    overflowX?: "visible" | "hidden" | "scroll";
    overflowY?: "visible" | "hidden" | "scroll";
    transform?: string;
    transformOrigin?: string;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    translateX?: any;
    translateY?: any;
    pointerEvents?: "auto" | "none" | "box-none" | "box-only";
    cursor?:
      | "auto"
      | "default"
      | "pointer"
      | "text"
      | "not-allowed"
      | "wait"
      | "help"
      | "move"
      | "crosshair"
      | "grab"
      | "grabbing";
    userSelect?: "none" | "auto" | "text" | "all";
  };
  children?: React.ReactNode;
  data?: {
    src?: string;
    [k: string]: any;
  };
  className?: string;
}

export const Image: React.FC<ImageProps> = ({
  styleMap,
  data,
  className,
  ...rest
}) => {
  // First filter pointerEvents, then map schema style to CSS
  const filteredStyle = filterPointerEvents(styleMap);
  const cssStyle = mapSchemaStyleToCss(filteredStyle);

  // Get image source from data.src
  const src = data?.src;

  return <img src={src} className={className} style={cssStyle} {...rest} />;
};
