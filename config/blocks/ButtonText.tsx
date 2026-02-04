import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { ButtonText as GluestackButtonText } from "../../components/ui/button";
import { aiInstructions } from "../fields/aiInstructions";

export type ButtonTextProps = {
  className: string;
  text: string;
  variant?: "" | "solid" | "outline" | "link";
  action?: "" | "primary" | "secondary" | "positive" | "negative";
  size?: "" | "xs" | "sm" | "md" | "lg" | "xl";
};

const ButtonText: ComponentConfig<ButtonTextProps> = {
  inline: false,
  fields: {
    text: {
      type: "text",
      contentEditable: true,
      ai: { instructions: aiInstructions.textContent },
    },
    variant: {
      type: "select",
      options: [
        { label: "Default", value: "" },
        { label: "Solid", value: "solid" },
        { label: "Outline", value: "outline" },
        { label: "Link", value: "link" },
      ],
      ai: { instructions: aiInstructions.buttonVariant },
    },
    action: {
      type: "select",
      options: [
        { label: "Default", value: "" },
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
        { label: "Default", value: "" },
        { label: "XS", value: "xs" },
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
        { label: "XL", value: "xl" },
      ],
      ai: { instructions: aiInstructions.buttonSize },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    className: "",
    text: "Button",
    variant: "",
    action: "",
    size: "",
  },
  render: ({
    text,
    className,
    variant,
    action,
    size,
    puck,
  }: WithPuckProps<ButtonTextProps>) => (
    <GluestackButtonText
      className={className}
      variant={variant || undefined}
      action={action || undefined}
      size={size || undefined}
      ref={
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackButtonText>
        >
      }
    >
      {text}
    </GluestackButtonText>
  ),
};

export default ButtonText;
