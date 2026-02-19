import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import {
  Textarea as GluestackTextarea,
  TextareaInput,
} from "../../components/ui/textarea";
import { aiInstructions } from "../fields/aiInstructions";

export type TextAreaProps = {
  size: "sm" | "md" | "lg" | "xl";
  isDisabled: boolean;
  isInvalid: boolean;
  isReadOnly: boolean;
  placeholder: string;
  className: string;
};

const TextArea: ComponentConfig<TextAreaProps> = {
  inline: true,
  fields: {
    size: {
      type: "select",
      options: [
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
        { label: "XL", value: "xl" },
      ],
      ai: { instructions: aiInstructions.textareaSize },
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
      ai: { instructions: aiInstructions.textareaPlaceholder },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    size: "md",
    isDisabled: false,
    isInvalid: false,
    isReadOnly: false,
    placeholder: "Your text goes here...",
    className: "",
  },
  render: ({
    size,
    isDisabled,
    isInvalid,
    isReadOnly,
    placeholder,
    className,
    puck,
  }: WithPuckProps<TextAreaProps>) => (
    <GluestackTextarea
      size={size}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      isReadOnly={isReadOnly}
      className={className}
      ref={
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackTextarea>
        >
      }
    >
      <TextareaInput placeholder={placeholder} />
    </GluestackTextarea>
  ),
};

export default TextArea;
