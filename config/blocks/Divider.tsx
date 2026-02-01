import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Divider as GluestackDivider } from "../../components/ui/divider";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";

export type DividerProps = {
  className: string;
  orientation: "horizontal" | "vertical";
};

const Divider: ComponentConfig<DividerProps> = {
  inline: false,
  fields: {
    className: ClassNameGeneratorField("Classes", {
      padding: true,
      margin: true,
    }),
    orientation: {
      type: "select",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
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
