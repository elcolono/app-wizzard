import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { ButtonText as GluestackButtonText } from "../../components/ui/button";
import { aiInstructions } from "../fields/aiInstructions";

export type ButtonTextProps = {
  className: string;
  text: string;
};

const ButtonText: ComponentConfig<ButtonTextProps> = {
  inline: false,
  fields: {
    text: { type: "text", ai: { instructions: aiInstructions.textContent } },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
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
