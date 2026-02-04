import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { HStack as GluestackHStack } from "../../components/ui/hstack";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";

export type HStackProps = {
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

const HStack: ComponentConfig<HStackProps> = {
  inline: false,
  fields: {
    content: { type: "slot", ai: { instructions: aiInstructions.slotContent } },
    space: {
      type: "select",
      options: spaceOptions,
      ai: { instructions: aiInstructions.spacing },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
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
  }: WithPuckProps<HStackProps>) => {
    const HStackDropZone = React.forwardRef<any, any>(function HStackDropZone(
      props,
      ref
    ) {
      const mergedClassName = [className, props?.className]
        .filter(Boolean)
        .join(" ");

      const mergedRef = setRefs<React.ComponentRef<typeof GluestackHStack>>(
        ref,
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackHStack>
        >
      );

      return (
        <GluestackBox>
          <GluestackHStack
            {...props}
            ref={mergedRef}
            className={mergedClassName}
            space={space}
          />
        </GluestackBox>
      );
    });

    return <Content as={HStackDropZone} minEmptyHeight={200} />;
  },
};

export default HStack;
