import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Divider as GluestackDivider } from "../../components/ui/divider";
import { aiInstructions } from "../fields/aiInstructions";

export type DividerProps = {
  className: string;
  orientation: "horizontal" | "vertical";
};

const Divider: ComponentConfig<DividerProps> = {
  inline: false,
  fields: {
    orientation: {
      type: "select",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
      ai: { instructions: aiInstructions.orientation },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  render: ({ className, orientation, puck }: WithPuckProps<DividerProps>) => (
    <GluestackDivider
      ref={
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackDivider>
        >
      }
      className={className}
      orientation={orientation}
    />
  ),
};

export default Divider;
