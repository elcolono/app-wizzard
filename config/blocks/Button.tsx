import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Button as GluestackButton } from "../../components/ui/button";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";
import { Box as GluestackBox } from "../../components/ui/box";

export type ButtonProps = {
  content: any;
  variant: "solid" | "outline" | "link";
  action: "primary" | "secondary" | "positive" | "negative";
  size: "xs" | "sm" | "md" | "lg";
  className: string;
};

const Button: ComponentConfig<ButtonProps> = {
  fields: {
    content: { type: "slot", allow: ["ButtonText"] },
    variant: {
      type: "select",
      options: [
        { label: "Solid", value: "solid" },
        { label: "Outline", value: "outline" },
        { label: "Link", value: "link" },
      ],
    },
    action: {
      type: "select",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Positive", value: "positive" },
        { label: "Negative", value: "negative" },
      ],
    },
    size: {
      type: "select",
      options: [
        { label: "XS", value: "xs" },
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
      ],
    },
    className: ClassNameGeneratorField("Classes", {
      text: false,
      padding: true,
      margin: true,
      alignment: true,
    }),
  },
  inline: false,
  defaultProps: {
    content: [{ type: "ButtonText", props: { text: "Button" } }],
    variant: "solid",
    action: "primary",
    size: "md",
    className: null,
  },
  render: ({
    variant,
    action,
    size,
    content: Content,
    className,
    puck,
  }: WithPuckProps<ButtonProps>) => {
    const ButtonDropZone = React.forwardRef<any, any>(
      function ButtonDropZone(props, ref) {
        return (
          <GluestackBox>
            <GluestackButton
              {...props}
              ref={
                puck.dragRef as unknown as React.Ref<
                  React.ComponentRef<typeof GluestackButton>
                >
              }
              variant={variant}
              action={action}
              size={size}
              className={className}
            />
          </GluestackBox>
        );
      },
    );

    return <Content as={ButtonDropZone} />;
  },
};

export default Button;
