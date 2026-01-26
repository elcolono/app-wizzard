import type { ComponentConfig } from "@puckeditor/core";
import { Heading as GluestackHeading } from "../../components/ui/heading";
import CheckboxField from "../fields/Checkbox";

export type HeadingProps = {
  title: string;
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

const Heading: ComponentConfig<HeadingProps> = {
  fields: {
    title: { type: "text" },
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
    title: "Heading",
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
    size,
    isTruncated,
    bold,
    underline,
    strikeThrough,
    sub,
    italic,
    highlight,
  }) => (
    <GluestackHeading
      size={size}
      isTruncated={isTruncated}
      bold={bold}
      underline={underline}
      strikeThrough={strikeThrough}
      sub={sub}
      italic={italic}
      highlight={highlight}
    >
      {title}
    </GluestackHeading>
  ),
};

export default Heading;
