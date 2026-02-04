import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { ButtonGroup as GluestackButtonGroup } from "@/components/ui/button";
import { aiInstructions } from "../fields/aiInstructions";
import CheckboxField from "../fields/Checkbox";

export type ButtonGroupProps = {
  className: string;
  space: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  isAttached: boolean;
  flexDirection: "row" | "column" | "row-reverse" | "column-reverse";
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

const directionOptions = [
  { label: "Row", value: "row" },
  { label: "Column", value: "column" },
  { label: "Row reverse", value: "row-reverse" },
  { label: "Column reverse", value: "column-reverse" },
];

const ButtonGroup: ComponentConfig<ButtonGroupProps> = {
  inline: false,
  fields: {
    content: {
      type: "slot",
      allow: ["Button"],
      ai: { instructions: aiInstructions.slotContent },
    },
    space: {
      type: "select",
      label: "Space",
      options: spaceOptions,
      ai: { instructions: aiInstructions.buttonGroupSpace },
    },
    isAttached: CheckboxField("Attached"),
    flexDirection: {
      type: "select",
      label: "Direction",
      options: directionOptions,
      ai: { instructions: aiInstructions.buttonGroupDirection },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    content: [
      {
        type: "Button",
        props: {
          variant: "solid",
          action: "primary",
          content: [
            { type: "ButtonIcon", props: { icon: "ArrowRightIcon" } },
            { type: "ButtonText", props: { text: "Button" } },
          ],
        },
      },
      {
        type: "Button",
        props: {
          variant: "outline",
          action: "secondary",
          content: [
            { type: "ButtonIcon", props: { icon: "ArrowRightIcon" } },
            { type: "ButtonText", props: { text: "Button" } },
          ],
        },
      },
    ],
    space: "md",
    isAttached: false,
    flexDirection: "row",
    className: "",
  },
  render: ({
    className,
    space,
    isAttached,
    flexDirection,
    content: Content,
    puck,
  }: WithPuckProps<ButtonGroupProps>) => {
    const GroupDropZone = React.forwardRef<any, any>(function GroupDropZone(
      props,
      ref
    ) {
      const mergedClassName = [className, props?.className]
        .filter(Boolean)
        .join(" ");

      const mergedRef = setRefs<
        React.ComponentRef<typeof GluestackButtonGroup>
      >(
        ref,
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackButtonGroup>
        >
      );

      return (
        <GluestackButtonGroup
          {...props}
          ref={mergedRef}
          className={mergedClassName}
          space={space}
          isAttached={isAttached}
          flexDirection={flexDirection}
        >
          {props.children}
        </GluestackButtonGroup>
      );
    });

    return <Content as={GroupDropZone} minEmptyHeight={100} />;
  },
};

export default ButtonGroup;
