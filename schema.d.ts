/**
 * Schema definition language for Unity UI components
 */
export interface UnityUiSchemaDefinitionLanguage {
  /**
   * Component type. Core components that can be composed to create complex UI elements.
   */
  type: "Container" | "Text" | "Image" | "Grid" | "Carousel";
  /**
   * Style properties supported across web, Android, and iOS platforms
   */
  styleMap?: {
    /**
     * Layout display mode
     */
    display?: "flex" | "none";
    /**
     * Direction of flex items
     */
    flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
    /**
     * Whether flex items wrap
     */
    flexWrap?: "wrap" | "nowrap" | "wrap-reverse";
    /**
     * Alignment along main axis (flex) or inline axis (grid)
     */
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
    /**
     * Alignment along cross axis (flex) or block axis (grid)
     */
    alignItems?:
      | "flex-start"
      | "flex-end"
      | "center"
      | "stretch"
      | "baseline"
      | "start"
      | "end";
    /**
     * Override alignItems for individual item
     */
    alignSelf?:
      | "auto"
      | "flex-start"
      | "flex-end"
      | "center"
      | "stretch"
      | "baseline"
      | "start"
      | "end";
    /**
     * Alignment of wrapped lines (flex) or grid along block axis (grid)
     */
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
    /**
     * Positioning method
     */
    position?: "relative" | "absolute" | "fixed";
    /**
     * Distance from top edge
     */
    top?: any;
    /**
     * Distance from right edge
     */
    right?: any;
    /**
     * Distance from bottom edge
     */
    bottom?: any;
    /**
     * Distance from left edge
     */
    left?: any;
    /**
     * Stacking order
     */
    zIndex?: number;
    /**
     * Defines the columns of the grid (e.g., 'repeat(3, 1fr)', '1fr 2fr 1fr', 'auto', 'minmax(200px, 1fr)')
     */
    gridTemplateColumns?: string;
    /**
     * Defines the rows of the grid (e.g., 'repeat(3, 1fr)', '1fr 2fr 1fr', 'auto', 'minmax(200px, 1fr)')
     */
    gridTemplateRows?: string;
    /**
     * Defines named grid areas (e.g., 'header header header' 'sidebar content content')
     */
    gridTemplateAreas?: string;
    /**
     * Size of implicitly created columns (e.g., '1fr', 'auto', 'minmax(100px, 1fr)')
     */
    gridAutoColumns?: string;
    /**
     * Size of implicitly created rows (e.g., '1fr', 'auto', 'minmax(100px, 1fr)')
     */
    gridAutoRows?: string;
    /**
     * How auto-placed items are flowed into the grid
     */
    gridAutoFlow?: "row" | "column" | "row dense" | "column dense";
    /**
     * Gap between columns (deprecated, use columnGap instead)
     */
    gridColumnGap?: any;
    /**
     * Gap between rows (deprecated, use rowGap instead)
     */
    gridRowGap?: any;
    /**
     * Alignment of grid items along the inline axis
     */
    justifyItems?: "start" | "end" | "center" | "stretch";
    /**
     * Alignment of item along inline axis
     */
    justifySelf?: "start" | "end" | "center" | "stretch";
    /**
     * Placement of item in columns (e.g., '1 / 3', 'span 2', '1')
     */
    gridColumn?: string;
    /**
     * Placement of item in rows (e.g., '1 / 3', 'span 2', '1')
     */
    gridRow?: string;
    /**
     * Placement of item in named grid area (e.g., 'header', 'content')
     */
    gridArea?: string;
    /**
     * Margin on all sides
     */
    margin?: any;
    /**
     * Top margin
     */
    marginTop?: any;
    /**
     * Right margin
     */
    marginRight?: any;
    /**
     * Bottom margin
     */
    marginBottom?: any;
    /**
     * Left margin
     */
    marginLeft?: any;
    /**
     * Horizontal margin (left and right)
     */
    marginHorizontal?: any;
    /**
     * Vertical margin (top and bottom)
     */
    marginVertical?: any;
    /**
     * Padding on all sides
     */
    padding?: any;
    /**
     * Top padding
     */
    paddingTop?: any;
    /**
     * Right padding
     */
    paddingRight?: any;
    /**
     * Bottom padding
     */
    paddingBottom?: any;
    /**
     * Left padding
     */
    paddingLeft?: any;
    /**
     * Horizontal padding (left and right)
     */
    paddingHorizontal?: any;
    /**
     * Vertical padding (top and bottom)
     */
    paddingVertical?: any;
    /**
     * Gap between flex items
     */
    gap?: any;
    /**
     * Gap between rows
     */
    rowGap?: any;
    /**
     * Gap between columns
     */
    columnGap?: any;
    /**
     * Element width
     */
    width?: any;
    /**
     * Element height
     */
    height?: any;
    /**
     * Minimum width
     */
    minWidth?: any;
    /**
     * Minimum height
     */
    minHeight?: any;
    /**
     * Maximum width
     */
    maxWidth?: any;
    /**
     * Maximum height
     */
    maxHeight?: any;
    /**
     * Aspect ratio (width/height)
     */
    aspectRatio?: any;
    /**
     * Flex grow/shrink value
     */
    flex?: any;
    /**
     * Flex grow factor
     */
    flexGrow?: number;
    /**
     * Flex shrink factor
     */
    flexShrink?: number;
    /**
     * Initial main size
     */
    flexBasis?: any;
    /**
     * Background color
     */
    backgroundColor?: any;
    /**
     * Text/foreground color
     */
    color?: any;
    /**
     * Border color
     */
    borderColor?: any;
    /**
     * Top border color
     */
    borderTopColor?: any;
    /**
     * Right border color
     */
    borderRightColor?: any;
    /**
     * Bottom border color
     */
    borderBottomColor?: any;
    /**
     * Left border color
     */
    borderLeftColor?: any;
    /**
     * Opacity (0.0 to 1.0)
     */
    opacity?: number;
    /**
     * Border width on all sides
     */
    borderWidth?: any;
    /**
     * Top border width
     */
    borderTopWidth?: any;
    /**
     * Right border width
     */
    borderRightWidth?: any;
    /**
     * Bottom border width
     */
    borderBottomWidth?: any;
    /**
     * Left border width
     */
    borderLeftWidth?: any;
    /**
     * Border radius on all corners
     */
    borderRadius?: any;
    /**
     * Top-left corner radius
     */
    borderTopLeftRadius?: any;
    /**
     * Top-right corner radius
     */
    borderTopRightRadius?: any;
    /**
     * Bottom-left corner radius
     */
    borderBottomLeftRadius?: any;
    /**
     * Bottom-right corner radius
     */
    borderBottomRightRadius?: any;
    /**
     * Border style
     */
    borderStyle?: "solid" | "dashed" | "dotted";
    /**
     * Font size
     */
    fontSize?: any;
    /**
     * Font weight
     */
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
    /**
     * Font family name
     */
    fontFamily?: string;
    /**
     * Font style
     */
    fontStyle?: "normal" | "italic";
    /**
     * Line height
     */
    lineHeight?: any;
    /**
     * Letter spacing
     */
    letterSpacing?: any;
    /**
     * Text alignment
     */
    textAlign?: "left" | "right" | "center" | "justify" | "auto";
    /**
     * Text decoration
     */
    textDecoration?: "none" | "underline" | "line-through";
    /**
     * Text decoration color
     */
    textDecorationColor?: any;
    /**
     * Text decoration style
     */
    textDecorationStyle?: "solid" | "dashed" | "dotted" | "double" | "wavy";
    /**
     * Text transform
     */
    textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
    /**
     * Text overflow handling
     */
    textOverflow?: "clip" | "ellipsis";
    /**
     * Maximum number of lines (iOS/Android)
     */
    numberOfLines?: number;
    /**
     * Shadow token reference
     */
    shadow?: string;
    /**
     * Shadow color
     */
    shadowColor?: any;
    /**
     * Shadow offset (object with width/height or string)
     */
    shadowOffset?: any;
    /**
     * Horizontal shadow offset
     */
    shadowOffsetX?: any;
    /**
     * Vertical shadow offset
     */
    shadowOffsetY?: any;
    /**
     * Shadow opacity (0.0 to 1.0)
     */
    shadowOpacity?: number;
    /**
     * Shadow blur radius
     */
    shadowRadius?: any;
    /**
     * Android elevation (shadow depth)
     */
    elevation?: number;
    /**
     * Overflow behavior
     */
    overflow?: "visible" | "hidden" | "scroll";
    /**
     * Horizontal overflow behavior
     */
    overflowX?: "visible" | "hidden" | "scroll";
    /**
     * Vertical overflow behavior
     */
    overflowY?: "visible" | "hidden" | "scroll";
    /**
     * Transform operations (e.g., 'rotate(45deg)', 'scale(1.2)', 'translateX(10px)', 'translateY(10px)', 'scaleX(1.2)', 'scaleY(1.2)', or combinations like 'rotate(45deg) scale(1.2)')
     */
    transform?: string;
    /**
     * Transform origin point ('center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right', or specific coordinates)
     */
    transformOrigin?: string;
    /**
     * Rotation angle (degrees, numeric value)
     */
    rotation?: number;
    /**
     * Horizontal scale factor (numeric value)
     */
    scaleX?: number;
    /**
     * Vertical scale factor (numeric value)
     */
    scaleY?: number;
    /**
     * Horizontal translation (numeric value or string with unit)
     */
    translateX?: any;
    /**
     * Vertical translation (numeric value or string with unit)
     */
    translateY?: any;
    /**
     * Pointer events handling
     */
    pointerEvents?: "auto" | "none" | "box-none" | "box-only";
    /**
     * Cursor style (web only)
     */
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
    /**
     * User selection behavior (web only)
     */
    userSelect?: "none" | "auto" | "text" | "all";
  };
  /**
   * Child components for composition
   */
  children?: UnityUiSchemaDefinitionLanguage[];
  /**
   * Component-specific data (e.g., content for Text, src for Image)
   */
  data?: {
    /**
     * Text content (for Text component)
     */
    content?: string;
    /**
     * Image source (for Image component)
     */
    src?: string;
    [k: string]: any;
  };
}
