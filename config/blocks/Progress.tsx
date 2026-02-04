import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import {
  Progress as GluestackProgress,
  ProgressFilledTrack,
} from "../../components/ui/progress";
import { aiInstructions } from "../fields/aiInstructions";

export type ProgressProps = {
  className: string;
  value: number;
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  orientation: "horizontal" | "vertical";
};

const Progress: ComponentConfig<ProgressProps> = {
  inline: false,
  fields: {
    value: {
      type: "number",
      ai: { instructions: aiInstructions.progressValue },
    },
    size: {
      type: "select",
      options: [
        { label: "XS", value: "xs" },
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
        { label: "XL", value: "xl" },
        { label: "2XL", value: "2xl" },
      ],
      ai: { instructions: aiInstructions.sizeToken },
    },
    orientation: {
      type: "select",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
      ai: { instructions: aiInstructions.orientation },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    className: "w-full",
    value: 40,
    size: "md",
    orientation: "horizontal",
  },
  render: ({
    className,
    value,
    size,
    orientation,
    puck,
  }: WithPuckProps<ProgressProps>) => (
    <GluestackProgress
      className={className}
      value={value}
      size={size}
      orientation={orientation}
      ref={
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackProgress>
        >
      }
    >
      <ProgressFilledTrack />
    </GluestackProgress>
  ),
};

export default Progress;
