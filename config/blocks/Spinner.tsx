import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Spinner as GluestackSpinner } from "../../components/ui/spinner";
import CheckboxField from "../fields/Checkbox";
import { aiInstructions } from "../fields/aiInstructions";

export type SpinnerProps = {
  className: string;
  size: "small" | "large";
  color: string;
  animating: boolean;
};

const Spinner: ComponentConfig<SpinnerProps> = {
  inline: false,
  fields: {
    size: {
      type: "select",
      options: [
        { label: "Small", value: "small" },
        { label: "Large", value: "large" },
      ],
      ai: { instructions: aiInstructions.sizeToken },
    },
    color: { type: "text", ai: { instructions: aiInstructions.spinnerColor } },
    animating: CheckboxField("Animating"),
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    className: "",
    size: "small",
    color: "",
    animating: true,
  },
  render: ({
    className,
    size,
    color,
    animating,
    puck,
  }: WithPuckProps<SpinnerProps>) => {
    const resolvedColor = color?.trim() || undefined;

    return (
      <GluestackSpinner
        className={className}
        size={size}
        color={resolvedColor}
        animating={animating}
        ref={
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackSpinner>
          >
        }
      />
    );
  },
};

export default Spinner;
