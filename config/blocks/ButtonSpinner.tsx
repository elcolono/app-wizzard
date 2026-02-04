import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { ButtonSpinner as GluestackButtonSpinner } from "@/components/ui/button";
import { aiInstructions } from "../fields/aiInstructions";

export type ButtonSpinnerProps = {
  size: "small" | "large";
  color: string;
  className: string;
};

const ButtonSpinner: ComponentConfig<ButtonSpinnerProps> = {
  inline: false,
  fields: {
    size: {
      type: "select",
      options: [
        { label: "Small", value: "small" },
        { label: "Large", value: "large" },
      ],
      ai: { instructions: aiInstructions.buttonSpinnerSize },
    },
    color: {
      type: "text",
      ai: { instructions: aiInstructions.buttonSpinnerColor },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    size: "small",
    color: "",
    className: "",
  },
  render: ({
    size,
    color,
    className,
    puck,
  }: WithPuckProps<ButtonSpinnerProps>) => {
    const resolvedColor = color?.trim() || undefined;

    return (
      <GluestackButtonSpinner
        size={size}
        color={resolvedColor}
        className={className}
        ref={
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackButtonSpinner>
          >
        }
      />
    );
  },
};

export default ButtonSpinner;
