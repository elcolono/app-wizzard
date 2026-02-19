import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Input as GluestackInput, InputField } from "../../components/ui/input";
import { aiInstructions } from "../fields/aiInstructions";

export type InputProps = {
  variant: "outline" | "rounded" | "underlined";
  size: "sm" | "md" | "lg" | "xl";
  isDisabled: boolean;
  isInvalid: boolean;
  isReadOnly: boolean;
  placeholder: string;
  className: string;
};

const Input: ComponentConfig<InputProps> = {
  inline: true,
  fields: {
    variant: {
      type: "select",
      options: [
        { label: "Outline", value: "outline" },
        { label: "Rounded", value: "rounded" },
        { label: "Underlined", value: "underlined" },
      ],
      ai: { instructions: aiInstructions.inputVariant },
    },
    size: {
      type: "select",
      options: [
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
        { label: "XL", value: "xl" },
      ],
      ai: { instructions: aiInstructions.inputSize },
    },
    isDisabled: {
      type: "radio",
      options: [
        { label: "No", value: false },
        { label: "Yes", value: true },
      ],
    },
    isInvalid: {
      type: "radio",
      options: [
        { label: "No", value: false },
        { label: "Yes", value: true },
      ],
    },
    isReadOnly: {
      type: "radio",
      options: [
        { label: "No", value: false },
        { label: "Yes", value: true },
      ],
    },
    placeholder: {
      type: "text",
      label: "Placeholder",
      ai: { instructions: aiInstructions.inputPlaceholder },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    variant: "outline",
    size: "md",
    isDisabled: false,
    isInvalid: false,
    isReadOnly: false,
    placeholder: "Enter text here...",
    className: "",
  },
  render: ({
    variant,
    size,
    isDisabled,
    isInvalid,
    isReadOnly,
    placeholder,
    className,
    puck,
  }: WithPuckProps<InputProps>) => (
    <GluestackInput
      variant={variant}
      size={size}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      isReadOnly={isReadOnly}
      className={className}
      ref={
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackInput>
        >
      }
    >
      <InputField placeholder={placeholder} />
    </GluestackInput>
  ),
};

export default Input;
