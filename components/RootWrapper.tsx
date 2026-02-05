import React from "react";
import { THEME_CSS_VARS } from "@/config/theme";
import { Box as GluestackBox } from "./ui/box";

type RootWrapperProps = {
  children: React.ReactNode;
  primary?: string;
  secondary?: string;
};

export default function RootWrapper({
  children,
  primary,
  secondary,
}: RootWrapperProps) {
  const style: React.CSSProperties = {};

  const setCssVar = (name: string, value: string) => {
    (style as Record<string, string>)[name] = value;
  };

  const normalizeHex = (value?: string) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
    if (hex.length === 3) {
      return hex
        .split("")
        .map((char) => char + char)
        .join("")
        .toLowerCase();
    }
    if (hex.length === 6) return hex.toLowerCase();
    return null;
  };

  const hexToRgb = (value?: string) => {
    const hex = normalizeHex(value);
    if (!hex) return null;
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return `${r} ${g} ${b}`;
  };

  const setPalette = (name: "primary" | "secondary", rgb: string) => {
    const steps = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    steps.forEach((step) => {
      setCssVar(`--color-${name}-${step}`, rgb);
    });
  };

  if (primary != null && primary !== "") {
    setCssVar(THEME_CSS_VARS.primary, primary);
    const rgb = hexToRgb(primary);
    if (rgb) setPalette("primary", rgb);
  }

  if (secondary != null && secondary !== "") {
    setCssVar(THEME_CSS_VARS.secondary, secondary);
    const rgb = hexToRgb(secondary);
    if (rgb) setPalette("secondary", rgb);
  }

  const boxStyle =
    Object.keys(style).length > 0
      ? (style as React.ComponentProps<typeof GluestackBox>["style"])
      : undefined;

  return (
    <GluestackBox className="puck-root" style={boxStyle}>
      {children}
    </GluestackBox>
  );
}
