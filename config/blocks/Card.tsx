import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Card as GluestackCard } from "../../components/ui/card";
import { aiInstructions } from "../fields/aiInstructions";
import { DISALLOWED_NESTED_COMPONENTS } from "../fields/slotRules";

export type CardProps = {
  className: string;
  size: "sm" | "md" | "lg";
  variant: "elevated" | "outline" | "ghost" | "filled";
  content?: any;
};

const sizeOptions = [
  { label: "SM", value: "sm" },
  { label: "MD", value: "md" },
  { label: "LG", value: "lg" },
];

const variantOptions = [
  { label: "Elevated", value: "elevated" },
  { label: "Outline", value: "outline" },
  { label: "Ghost", value: "ghost" },
  { label: "Filled", value: "filled" },
];

const CARD_DISALLOWED_COMPONENTS = [...DISALLOWED_NESTED_COMPONENTS, "Card"];

const Card: ComponentConfig<CardProps> = {
  inline: false,
  fields: {
    size: {
      type: "select",
      options: sizeOptions,
      ai: { instructions: aiInstructions.sizeToken },
    },
    variant: {
      type: "select",
      options: variantOptions,
      ai: { instructions: aiInstructions.variant },
    },
    content: {
      type: "slot",
      disallow: CARD_DISALLOWED_COMPONENTS,
      ai: { instructions: aiInstructions.slotContent },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    className: "",
    size: "md",
    variant: "elevated",
    content: [{ type: "Text", props: { text: "Card content" } }],
  },
  render: ({
    content: Content,
    className,
    size,
    variant,
    puck,
  }: WithPuckProps<CardProps>) => {
    const CardDropZone = React.forwardRef<any, any>(function CardDropZone(
      props,
      ref
    ) {
      const mergedClassName = [className, props?.className]
        .filter(Boolean)
        .join(" ");

      return (
        <GluestackCard
          {...props}
          ref={
            puck.dragRef as unknown as React.Ref<
              React.ComponentRef<typeof GluestackCard>
            >
          }
          className={mergedClassName}
          size={size}
          variant={variant}
        />
      );
    });

    return <Content as={CardDropZone} minEmptyHeight={300} />;
  },
};

export default Card;
