import type { ComponentConfig } from "@puckeditor/core";
import { Divider as GluestackDivider } from "../../components/ui/divider";

export type DividerProps = {
  className: string;
  orientation: "horizontal" | "vertical";
};

const Divider: ComponentConfig<DividerProps> = {
  fields: {
    className: { type: "text" },
    orientation: {
      type: "select",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
    },
  },
  render: ({ className, orientation }) => (
    <GluestackDivider className={className} orientation={orientation} />
  ),
};

export default Divider;
