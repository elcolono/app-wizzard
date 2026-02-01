import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { ButtonText as GluestackButtonText } from "../../components/ui/button";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";

export type ButtonTextProps = {
  className: string;
  text: string;
};

const ButtonText: ComponentConfig<ButtonTextProps> = {
  inline: false,
  fields: {
    className: ClassNameGeneratorField("Classes", {
      padding: true,
      margin: true,
    }),
    text: { type: "text" },
  },
  defaultProps: {
    className: "",
    text: "Button",
  },
  render: ({ text, className, puck }: WithPuckProps<ButtonTextProps>) => (
    <GluestackButtonText
      className={className}
      ref={
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackButtonText>
        >
      }
    >
      {text}
    </GluestackButtonText>
  ),
};

export default ButtonText;
