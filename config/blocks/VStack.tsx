import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { VStack as GluestackVStack } from "../../components/ui/vstack";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";

export type VStackProps = {
  className: string;
  space: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  content: any;
};

const setRefs =
  <T,>(...refs: Array<React.Ref<T> | undefined>) =>
  (value: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
        return;
      }

      if (ref && typeof ref === "object" && "current" in ref) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
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
    content: [],
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

        const mergedRef = setRefs<React.ComponentRef<typeof GluestackVStack>>(
          ref,
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackVStack>
          >,
        );

        return (
          <GluestackVStack
            {...props}
            ref={mergedRef}
            className={mergedClassName}
            space={space}
          />
        );
      },
    );

    return <Content as={VStackDropZone} minEmptyHeight={200} />;
  },
};

export default VStack;
