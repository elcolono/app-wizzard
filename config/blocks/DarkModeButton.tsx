"use client";

import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import CheckboxField from "../fields/Checkbox";
import { aiInstructions } from "../fields/aiInstructions";
import {
  Button as GluestackButton,
  ButtonIcon as GluestackButtonIcon,
  ButtonText as GluestackButtonText,
} from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@/components/ui/icon";

export type DarkModeButtonProps = {
  variant: "solid" | "outline" | "link";
  action: "primary" | "secondary" | "positive" | "negative";
  size: "xs" | "sm" | "md" | "lg";
  showLabel: boolean;
  labelLight: string;
  labelDark: string;
  className: string;
  iconClassName: string;
  textClassName: string;
};

const getIsDarkMode = () => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;

  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;

  if (root.style.colorScheme === "dark") return true;
  if (root.style.colorScheme === "light") return false;

  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  return false;
};

const setMode = (isDark: boolean) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const nextMode = isDark ? "dark" : "light";
  const previousMode = isDark ? "light" : "dark";

  root.classList.remove(previousMode);
  root.classList.add(nextMode);
  root.style.colorScheme = nextMode;
};

type DarkModeButtonRendererProps = DarkModeButtonProps & {
  puck: WithPuckProps<DarkModeButtonProps>["puck"];
};

function DarkModeButtonRenderer({
  variant,
  action,
  size,
  showLabel,
  labelLight,
  labelDark,
  className,
  iconClassName,
  textClassName,
  puck,
}: DarkModeButtonRendererProps) {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(getIsDarkMode());
  }, []);

  const handleToggle = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    setMode(nextIsDark);
  };

  return (
    <GluestackButton
      variant={variant}
      action={action}
      size={size}
      className={className}
      onPress={handleToggle}
      ref={
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackButton>
        >
      }
    >
      <GluestackButtonIcon as={isDark ? SunIcon : MoonIcon} className={iconClassName} />
      {showLabel ? (
        <GluestackButtonText className={textClassName}>
          {isDark ? labelDark : labelLight}
        </GluestackButtonText>
      ) : null}
    </GluestackButton>
  );
}

const DarkModeButton: ComponentConfig<DarkModeButtonProps> = {
  fields: {
    variant: {
      type: "select",
      options: [
        { label: "Solid", value: "solid" },
        { label: "Outline", value: "outline" },
        { label: "Link", value: "link" },
      ],
      ai: { instructions: aiInstructions.buttonVariant },
    },
    action: {
      type: "select",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Positive", value: "positive" },
        { label: "Negative", value: "negative" },
      ],
      ai: { instructions: aiInstructions.buttonAction },
    },
    size: {
      type: "select",
      options: [
        { label: "XS", value: "xs" },
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
      ],
      ai: { instructions: aiInstructions.buttonSize },
    },
    showLabel: CheckboxField("Label anzeigen"),
    labelLight: {
      type: "text",
      label: "Label (hell)",
      ai: { instructions: aiInstructions.textContent },
    },
    labelDark: {
      type: "text",
      label: "Label (dunkel)",
      ai: { instructions: aiInstructions.textContent },
    },
    className: {
      type: "textarea",
      label: "Button classes",
      ai: { instructions: aiInstructions.className },
    },
    iconClassName: {
      type: "textarea",
      label: "Icon classes",
      ai: { instructions: aiInstructions.className },
    },
    textClassName: {
      type: "textarea",
      label: "Text classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    variant: "outline",
    action: "primary",
    size: "md",
    showLabel: false,
    labelLight: "Dark mode",
    labelDark: "Light mode",
    className: "rounded-full w-10 px-0",
    iconClassName: "",
    textClassName: "",
  },
  render: ({
    variant,
    action,
    size,
    showLabel,
    labelLight,
    labelDark,
    className,
    iconClassName,
    textClassName,
    puck,
  }: WithPuckProps<DarkModeButtonProps>) => (
    <DarkModeButtonRenderer
      variant={variant}
      action={action}
      size={size}
      showLabel={showLabel}
      labelLight={labelLight}
      labelDark={labelDark}
      className={className}
      iconClassName={iconClassName}
      textClassName={textClassName}
      puck={puck}
    />
  ),
};

export default DarkModeButton;
