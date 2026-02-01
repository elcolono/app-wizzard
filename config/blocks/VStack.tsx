import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { VStack as GluestackVStack } from "../../components/ui/vstack";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";

export type VStackProps = {
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

const VStack: ComponentConfig<VStackProps> = {
  inline: false,
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
    content: [
      { type: "Box", props: { className: "h-60 w-60 bg-light-500" } },
      { type: "Box", props: { className: "h-60 w-60 bg-light-500" } },
    ],
    className: "",
    space: "md",
  },
  render: ({
    className,
    space,
    content: Content,
    puck,
  }: WithPuckProps<VStackProps>) => {
    const VStackDropZone = React.forwardRef<any, any>(
      function VStackDropZone(props, ref) {
        const mergedClassName = [className, props?.className]
          .filter(Boolean)
          .join(" ");

        return (
          <GluestackVStack
            {...props}
            ref={
              puck.dragRef as unknown as React.Ref<
                React.ComponentRef<typeof GluestackVStack>
              >
            }
            className={mergedClassName}
            space={space}
          />
        );
      },
    );

    return <Content as={VStackDropZone} />;
  },
};

export default VStack;
