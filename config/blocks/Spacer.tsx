import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { aiInstructions } from "../fields/aiInstructions";

const spacerSizeOptions = [
  { label: "XS", value: "xs" },
  { label: "SM", value: "sm" },
  { label: "MD", value: "md" },
  { label: "LG", value: "lg" },
  { label: "XL", value: "xl" },
  { label: "2XL", value: "2xl" },
  { label: "3XL", value: "3xl" },
  { label: "4XL", value: "4xl" },
] as const;

type SpacerSize = (typeof spacerSizeOptions)[number]["value"];

const spacerSizeToClassName: Record<SpacerSize, string> = {
  xs: "h-1",
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
  xl: "h-5",
  "2xl": "h-6",
  "3xl": "h-7",
  "4xl": "h-8",
};

export type SpacerProps = {
  className: string;
  size: SpacerSize;
};

const Spacer: ComponentConfig<SpacerProps> = {
  inline: false,
  fields: {
    size: {
      type: "select",
      options: spacerSizeOptions,
      ai: { instructions: aiInstructions.spacerSize },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    className: "",
    size: "lg",
  },
  render: ({ className, size, puck }: WithPuckProps<SpacerProps>) => (
    <div
      ref={puck.dragRef as unknown as React.Ref<HTMLDivElement>}
      aria-hidden="true"
      className={["w-full", spacerSizeToClassName[size], className]
        .filter(Boolean)
        .join(" ")}
    />
  ),
};

export default Spacer;
