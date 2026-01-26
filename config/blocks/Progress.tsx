import type { ComponentConfig } from "@puckeditor/core";
import {
  Progress as GluestackProgress,
  ProgressFilledTrack,
} from "../../components/ui/progress";

export type ProgressProps = {
  className: string;
  value: number;
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  orientation: "horizontal" | "vertical";
};

const Progress: ComponentConfig<ProgressProps> = {
  fields: {
    className: { type: "text" },
    value: { type: "number" },
    size: {
      type: "select",
      options: [
        { label: "XS", value: "xs" },
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
        { label: "XL", value: "xl" },
        { label: "2XL", value: "2xl" },
      ],
    },
    orientation: {
      type: "select",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
    },
  },
  defaultProps: {
    className: "w-full",
    value: 40,
    size: "md",
    orientation: "horizontal",
  },
  render: ({ className, value, size, orientation }) => (
    <GluestackProgress
      className={className}
      value={value}
      size={size}
      orientation={orientation}
    >
      <ProgressFilledTrack />
    </GluestackProgress>
  ),
};

export default Progress;
