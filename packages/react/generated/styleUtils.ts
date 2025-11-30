// Utility functions to map schema style properties to valid CSS properties for React
// Handles properties like shadowOffsetX, shadowOffsetY, shadowColor, shadowOpacity, shadowRadius, etc.

// Helper to filter out non-standard CSS values for React style (pointerEvents)
export function filterPointerEvents(styleMap: any): any | undefined {
  if (!styleMap) return undefined;
  const filtered = { ...styleMap };
  if (
    filtered.pointerEvents === "box-none" ||
    filtered.pointerEvents === "box-only"
  ) {
    delete filtered.pointerEvents;
  }
  return filtered;
}

export function mapShadowToBoxShadow(style: any): string | undefined {
  // If 'shadow' is a string token, ignore for now (could be handled by a theme system)
  if (typeof style.shadow === "string") return undefined;
  // Compose boxShadow from shadowColor, shadowOffsetX, shadowOffsetY, shadowOpacity, shadowRadius
  const color = style.shadowColor || "black";
  const opacity =
    typeof style.shadowOpacity === "number" ? style.shadowOpacity : 1;
  const rgba = colorToRgba(color, opacity);
  const offsetX = style.shadowOffsetX ?? style.shadowOffset?.width ?? 0;
  const offsetY = style.shadowOffsetY ?? style.shadowOffset?.height ?? 0;
  const blur = style.shadowRadius ?? 0;
  if (
    offsetX === undefined &&
    offsetY === undefined &&
    blur === 0 &&
    !style.shadowColor &&
    !style.shadowOpacity
  ) {
    return undefined;
  }
  return `${offsetX || 0}px ${offsetY || 0}px ${blur || 0}px ${rgba}`;
}

// Helper to convert color + opacity to rgba string
function colorToRgba(color: any, opacity: number): string {
  // If color is already rgba, just return
  if (typeof color === "string" && color.startsWith("rgba")) return color;
  // If color is hex or rgb, convert to rgba
  if (typeof color === "string" && color.startsWith("#")) {
    // Simple hex to rgba
    let r = 0,
      g = 0,
      b = 0;
    if (color.length === 7) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    }
    return `rgba(${r},${g},${b},${opacity})`;
  }
  if (typeof color === "string" && color.startsWith("rgb(")) {
    return color.replace("rgb(", "rgba(").replace(")", `,${opacity})`);
  }
  // Fallback
  return color;
}

// Main style mapping utility
export function mapSchemaStyleToCss(style: any): React.CSSProperties {
  if (!style) return {};
  const {
    shadow,
    shadowColor,
    shadowOffset,
    shadowOffsetX,
    shadowOffsetY,
    shadowOpacity,
    shadowRadius,
    elevation, // Android only, ignore for web
    marginHorizontal,
    marginVertical,
    paddingHorizontal,
    paddingVertical,
    numberOfLines,
    aspectRatio,
    ...rest
  } = style;
  const css: any = { ...rest };
  // Map shadow properties
  const boxShadow = mapShadowToBoxShadow(style);
  if (boxShadow) {
    css.boxShadow = boxShadow;
  }
  // Map marginHorizontal/marginVertical
  if (marginHorizontal !== undefined) {
    css.marginLeft = marginHorizontal;
    css.marginRight = marginHorizontal;
  }
  if (marginVertical !== undefined) {
    css.marginTop = marginVertical;
    css.marginBottom = marginVertical;
  }
  // Map paddingHorizontal/paddingVertical
  if (paddingHorizontal !== undefined) {
    css.paddingLeft = paddingHorizontal;
    css.paddingRight = paddingHorizontal;
  }
  if (paddingVertical !== undefined) {
    css.paddingTop = paddingVertical;
    css.paddingBottom = paddingVertical;
  }
  // Map numberOfLines to lineClamp/overflow/ellipsis
  if (numberOfLines !== undefined) {
    css.overflow = "hidden";
    css.display = "-webkit-box";
    css.webkitBoxOrient = "vertical";
    css.webkitLineClamp = numberOfLines;
    css.lineClamp = numberOfLines;
  }
  // Map aspectRatio to aspect-ratio (with vendor prefix for older browsers)
  if (aspectRatio !== undefined) {
    css.aspectRatio = aspectRatio;
    css.WebkitAspectRatio = aspectRatio;
  }
  // Remove non-CSS properties
  delete css.shadow;
  delete css.shadowColor;
  delete css.shadowOffset;
  delete css.shadowOffsetX;
  delete css.shadowOffsetY;
  delete css.shadowOpacity;
  delete css.shadowRadius;
  delete css.elevation;
  delete css.marginHorizontal;
  delete css.marginVertical;
  delete css.paddingHorizontal;
  delete css.paddingVertical;
  delete css.numberOfLines;
  delete css.aspectRatio;
  return css;
}
