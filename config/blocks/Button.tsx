import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { Button as GluestackButton } from "../../components/ui/button";

export type ButtonProps = {
  content: any;
  variant: "solid" | "outline" | "link";
  action: "primary" | "secondary" | "positive" | "negative";
  size: "xs" | "sm" | "md" | "lg";
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
  },
  defaultProps: {
    content: [{ type: "ButtonText", props: { text: "Button" } }],
    variant: "solid",
    action: "primary",
    size: "md",
  },
  render: ({ variant, action, size, content: Content }) => {
    const ButtonDropZone = React.forwardRef<any, any>(
      function ButtonDropZone(props, ref) {
        return (
          <GluestackButton
            {...props}
            ref={ref}
            variant={variant}
            action={action}
            size={size}
          />
        );
      },
    );

    return <Content as={ButtonDropZone} />;
  },
};

export default Button;
