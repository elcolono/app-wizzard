import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Heading as GluestackHeading } from "../../components/ui/heading";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";
import CheckboxField from "../fields/Checkbox";

export type HeadingProps = {
  title: string;
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  className: string;
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

const Heading: ComponentConfig<HeadingProps> = {
  inline: false,
  fields: {
    title: { type: "text" },
    size: {
      type: "select",
      options: sizeOptions,
    },
    className: ClassNameGeneratorField("Classes", {
      text: false,
      padding: true,
      margin: true,
      alignment: true,
    }),
    isTruncated: CheckboxField("Truncate"),
    bold: CheckboxField("Bold"),
    underline: CheckboxField("Underline"),
    strikeThrough: CheckboxField("Strikethrough"),
    sub: CheckboxField("Sub"),
    italic: CheckboxField("Italic"),
    highlight: CheckboxField("Highlight"),
  },
  defaultProps: {
    title: "Heading",
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
    title,
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
  }: WithPuckProps<HeadingProps>) => (
    <GluestackHeading
      className={className}
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
          React.ComponentRef<typeof GluestackHeading>
        >
      }
    >
      {title}
    </GluestackHeading>
  ),
};

export default Heading;
