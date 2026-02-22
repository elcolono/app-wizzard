import React from "react";
import type {
  ComponentConfig,
  SlotComponent,
  WithPuckProps,
} from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { DISALLOWED_NESTED_COMPONENTS } from "../fields/slotRules";

export type ContainerProps = {
  className?: string;
  maxWidth?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "full"
    | "none";
  content?: SlotComponent;
};

const maxWidthOptions = [
  { label: "SM", value: "sm" },
  { label: "MD", value: "md" },
  { label: "LG", value: "lg" },
  { label: "XL", value: "xl" },
  { label: "2XL", value: "2xl" },
  { label: "3XL", value: "3xl" },
  { label: "4XL", value: "4xl" },
  { label: "5XL", value: "5xl" },
  { label: "6XL", value: "6xl" },
  { label: "7XL", value: "7xl" },
  { label: "Full", value: "full" },
  { label: "None", value: "none" },
];

const Container: ComponentConfig<ContainerProps> = {
  inline: false,
  ai: {
    instructions:
      "Container has two layers: an outer full-width wrapper (uses className for backgrounds/padding/spacing) and an inner centered wrapper (uses maxWidth only). Use className for section styling like bg, px/py, borders. Use maxWidth to constrain inner content width.",
  },
  fields: {
    maxWidth: {
      type: "select",
      options: maxWidthOptions,
      label: "Max width",
      ai: { instructions: aiInstructions.maxWidth },
    },
    content: {
      type: "slot",
      disallow: DISALLOWED_NESTED_COMPONENTS,
      ai: { instructions: aiInstructions.slotContent },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    maxWidth: "6xl",
  },
  render: ({
    content: Content,
    className,
    maxWidth,
    puck,
  }: WithPuckProps<ContainerProps>) => {
    const ContainerDropZone = React.forwardRef<any, any>(
      function ContainerDropZone(props, ref) {
        const resolvedMaxWidth = maxWidth ?? "6xl";
        const maxWidthClass =
          resolvedMaxWidth === "none" ? "" : `max-w-${resolvedMaxWidth}`;
        const mergedClassName = ["mx-auto", maxWidthClass, props?.className]
          .filter(Boolean)
          .join(" ");

        return (
          <GluestackBox {...props} ref={ref} className={mergedClassName} />
        );
      }
    );

    return (
      <GluestackBox
        className={className}
        ref={
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackBox>
          >
        }
      >
        <Content as={ContainerDropZone} minEmptyHeight={300} />
      </GluestackBox>
    );
  },
};

export default Container;
