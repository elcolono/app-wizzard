import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Button as GluestackButton } from "../../components/ui/button";
import { aiInstructions } from "../fields/aiInstructions";
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
    content: {
      type: "slot",
      allow: ["ButtonText"],
      ai: { instructions: aiInstructions.slotContent },
    },
    variant: {
      type: "select",
      options: [
        { label: "Solid", value: "solid" },
        { label: "Outline", value: "outline" },
        { label: "Link", value: "link" },
      ],
      ai: { instructions: aiInstructions.buttonVariant },
    },
    action: {
      type: "select",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Positive", value: "positive" },
        { label: "Negative", value: "negative" },
      ],
      ai: { instructions: aiInstructions.buttonAction },
    },
    size: {
      type: "select",
      options: [
        { label: "XS", value: "xs" },
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
      ],
      ai: { instructions: aiInstructions.buttonSize },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
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
    const ButtonDropZone = React.forwardRef<any, any>(function ButtonDropZone(
      props,
      ref
    ) {
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
    });

    return <Content as={ButtonDropZone} />;
  },
};

export default Button;
