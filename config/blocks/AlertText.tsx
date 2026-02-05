import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { AlertText as GluestackAlertText } from "../../components/ui/alert";
import { aiInstructions } from "../fields/aiInstructions";

export type AlertTextProps = {
  text: string;
  className: string;
};

const AlertText: ComponentConfig<AlertTextProps> = {
  inline: false,
  fields: {
    text: {
      type: "text",
      contentEditable: true,
      ai: { instructions: aiInstructions.textContent },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    text: "Description of alert!",
    className: "",
  },
  render: ({ text, className, puck }: WithPuckProps<AlertTextProps>) => (
    <GluestackAlertText
      className={className}
      ref={
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackAlertText>
        >
      }
    >
      {text}
    </GluestackAlertText>
  ),
};

export default AlertText;
