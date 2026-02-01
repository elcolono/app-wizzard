import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Text as GluestackText } from "../../components/ui/text";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";
import CheckboxField from "../fields/Checkbox";
import { Box as GluestackBox } from "../../components/ui/box";

export type TextProps = {
  className?: string;
  text: string;
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  isTruncated: boolean;
  bold: boolean;
  underline: boolean;
  strikeThrough: boolean;
  sub: boolean;
  italic: boolean;
  highlight: boolean;
};

const sizeOptions = [
  { label: "XS", value: "xs" },
  { label: "SM", value: "sm" },
  { label: "MD", value: "md" },
  { label: "LG", value: "lg" },
  { label: "XL", value: "xl" },
  { label: "2XL", value: "2xl" },
  { label: "3XL", value: "3xl" },
  { label: "4XL", value: "4xl" },
  { label: "5XL", value: "5xl" },
];

const Text: ComponentConfig<TextProps> = {
  inline: false,
  fields: {
    className: ClassNameGeneratorField("Classes", {
      text: false,
      padding: true,
      margin: true,
    }),
    text: { type: "text" },
    size: {
      type: "select",
      options: sizeOptions,
    },
    isTruncated: CheckboxField("Truncate"),
    bold: CheckboxField("Bold"),
    underline: CheckboxField("Underline"),
    strikeThrough: CheckboxField("Strikethrough"),
    sub: CheckboxField("Sub"),
    italic: CheckboxField("Italic"),
    highlight: CheckboxField("Highlight"),
  },
  defaultProps: {
    text: "Text",
    className: "",
    size: "md",
    isTruncated: false,
    bold: false,
    underline: false,
    strikeThrough: false,
    sub: false,
    italic: false,
    highlight: false,
  },
  render: ({
    text,
    className,
    size,
    isTruncated,
    bold,
    underline,
    strikeThrough,
    sub,
    italic,
    highlight,
    puck,
  }: WithPuckProps<TextProps>) => (
    <GluestackBox className={className}>
      <GluestackText
        size={size}
        isTruncated={isTruncated}
        bold={bold}
        underline={underline}
        strikeThrough={strikeThrough}
        sub={sub}
        italic={italic}
        highlight={highlight}
        ref={
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackText>
          >
        }
      >
        {text}
      </GluestackText>
    </GluestackBox>
  ),
};

export default Text;
