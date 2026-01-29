import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { Card as GluestackCard } from "../../components/ui/card";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";

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

const Card: ComponentConfig<CardProps> = {
  fields: {
    className: ClassNameGeneratorField("Classes", {
      text: false,
      padding: true,
      margin: true,
      alignment: true,
    }),
    size: {
      type: "select",
      options: sizeOptions,
    },
    variant: {
      type: "select",
      options: variantOptions,
    },
    content: { type: "slot" },
  },
  defaultProps: {
    className: "",
    size: "md",
    variant: "elevated",
    content: [{ type: "Text", props: { text: "Card content" } }],
  },
  render: ({ content: Content, className, size, variant }) => {
    const CardDropZone = React.forwardRef<any, any>(
      function CardDropZone(props, ref) {
        const mergedClassName = [className, props?.className]
          .filter(Boolean)
          .join(" ");

        return (
          <GluestackCard
            {...props}
            ref={ref}
            className={mergedClassName}
            size={size}
            variant={variant}
          />
        );
      },
    );

    return <Content as={CardDropZone} minEmptyHeight={300} />;
  },
};

export default Card;
