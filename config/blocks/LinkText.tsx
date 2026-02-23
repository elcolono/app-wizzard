import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { LinkText as GluestackLinkText } from "../../components/ui/link";
import CheckboxField from "../fields/Checkbox";
import { aiInstructions } from "../fields/aiInstructions";

export type LinkTextProps = {
  text: string;
  className: string;
  size:
    | "2xs"
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl";
  isTruncated: boolean;
  bold: boolean;
  underline: boolean;
  strikeThrough: boolean;
  sub: boolean;
  italic: boolean;
  highlight: boolean;
};

const LinkText: ComponentConfig<LinkTextProps> = {
  inline: true,
  fields: {
    text: {
      type: "text",
      contentEditable: true,
      ai: { instructions: aiInstructions.textContent },
    },
    size: {
      type: "select",
      options: [
        { label: "2XS", value: "2xs" },
        { label: "XS", value: "xs" },
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
        { label: "XL", value: "xl" },
        { label: "2XL", value: "2xl" },
        { label: "3XL", value: "3xl" },
        { label: "4XL", value: "4xl" },
        { label: "5XL", value: "5xl" },
        { label: "6XL", value: "6xl" },
      ],
      ai: { instructions: aiInstructions.textSize },
    },
    isTruncated: CheckboxField("Truncate"),
    bold: CheckboxField("Bold"),
    underline: CheckboxField("Underline"),
    strikeThrough: CheckboxField("Strikethrough"),
    sub: CheckboxField("Sub"),
    italic: CheckboxField("Italic"),
    highlight: CheckboxField("Highlight"),
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    text: "Link",
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
  }: WithPuckProps<LinkTextProps>) => (
    <GluestackLinkText
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
          React.ComponentRef<typeof GluestackLinkText>
        >
      }
    >
      {text}
    </GluestackLinkText>
  ),
};

export default LinkText;
