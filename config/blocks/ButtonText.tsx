import type { ComponentConfig } from "@puckeditor/core";
import { ButtonText as GluestackButtonText } from "../../components/ui/button";

export type ButtonTextProps = {
  text: string;
};

const ButtonText: ComponentConfig<ButtonTextProps> = {
  fields: {
    text: { type: "text" },
  },
  defaultProps: {
    text: "Button",
  },
  render: ({ text }) => <GluestackButtonText>{text}</GluestackButtonText>,
};

export default ButtonText;
