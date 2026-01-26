import type { ComponentConfig } from "@puckeditor/core";
import { Spinner as GluestackSpinner } from "../../components/ui/spinner";
import CheckboxField from "../fields/Checkbox";

export type SpinnerProps = {
  className: string;
  size: "small" | "large";
  color: string;
  animating: boolean;
};

const Spinner: ComponentConfig<SpinnerProps> = {
  fields: {
    className: { type: "text" },
    size: {
      type: "select",
      options: [
        { label: "Small", value: "small" },
        { label: "Large", value: "large" },
      ],
    },
    color: { type: "text" },
    animating: CheckboxField("Animating"),
  },
  defaultProps: {
    className: "",
    size: "small",
    color: "",
    animating: true,
  },
  render: ({ className, size, color, animating }) => {
    const resolvedColor = color?.trim() || undefined;

    return (
      <GluestackSpinner
        className={className}
        size={size}
        color={resolvedColor}
        animating={animating}
      />
    );
  },
};

export default Spinner;
