import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { HStack as GluestackHStack } from "../../components/ui/hstack";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";

export type HStackProps = {
  className: string;
  space: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  content: any;
};

const spaceOptions = [
  { label: "XS", value: "xs" },
  { label: "SM", value: "sm" },
  { label: "MD", value: "md" },
  { label: "LG", value: "lg" },
  { label: "XL", value: "xl" },
  { label: "2XL", value: "2xl" },
  { label: "3XL", value: "3xl" },
  { label: "4XL", value: "4xl" },
];

const HStack: ComponentConfig<HStackProps> = {
  fields: {
    content: { type: "slot" },
    className: ClassNameGeneratorField("Classes", {
      alignment: true,
      padding: true,
      margin: true,
    }),
    space: {
      type: "select",
      options: spaceOptions,
    },
  },
  defaultProps: {
    content: [],
    className: "",
    space: "md",
  },
  render: ({ className, space, content: Content }) => {
    const HStackDropZone = React.forwardRef<any, any>(
      function HStackDropZone(props, ref) {
        const mergedClassName = [className, props?.className]
          .filter(Boolean)
          .join(" ");

        return (
          <GluestackHStack
            {...props}
            ref={ref}
            className={mergedClassName}
            space={space}
          />
        );
      },
    );

    return <Content as={HStackDropZone} />;
  },
};

export default HStack;
