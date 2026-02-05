import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { BadgeText as GluestackBadgeText } from "../../components/ui/badge";
import { aiInstructions } from "../fields/aiInstructions";

export type BadgeTextProps = {
  text: string;
  className: string;
};

const BadgeText: ComponentConfig<BadgeTextProps> = {
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
    text: "Badge",
    className: "",
  },
  render: ({ text, className, puck }: WithPuckProps<BadgeTextProps>) => (
    <GluestackBadgeText
      className={className}
      ref={
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackBadgeText>
        >
      }
    >
      {text}
    </GluestackBadgeText>
  ),
};

export default BadgeText;
