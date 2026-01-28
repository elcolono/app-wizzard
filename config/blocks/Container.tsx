import React from "react";
import type { ComponentConfig, SlotComponent } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";

export type ContainerProps = {
  backgroundClassName: string;
  className: string;
  maxWidth:
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
  fields: {
    backgroundClassName: { type: "text", label: "Background classes" },
    className: { type: "text", label: "Container classes" },
    maxWidth: { type: "select", options: maxWidthOptions, label: "Max width" },
    content: { type: "slot" },
  },
  defaultProps: {
    backgroundClassName: "bg-background-50 py-8",
    className: "mx-auto w-full px-4",
    maxWidth: "6xl",
  },
  render: ({ content: Content, className, backgroundClassName, maxWidth }) => {
    const ContainerDropZone = React.forwardRef<any, any>(
      function ContainerDropZone(props, ref) {
        const maxWidthClass = maxWidth === "none" ? "" : `max-w-${maxWidth}`;
        const mergedClassName = [className, maxWidthClass, props?.className]
          .filter(Boolean)
          .join(" ");

        return (
          <GluestackBox {...props} ref={ref} className={mergedClassName} />
        );
      },
    );

    return (
      <GluestackBox className={backgroundClassName}>
        <Content as={ContainerDropZone} minEmptyHeight={300} />
      </GluestackBox>
    );
  },
};

export default Container;
