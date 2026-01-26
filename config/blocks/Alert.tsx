import type { ComponentConfig } from "@puckeditor/core";
import { Alert as GluestackAlert, AlertText } from "../../components/ui/alert";
import CheckboxField from "../fields/Checkbox";

export type AlertProps = {
  className: string;
  text: string;
  variant: "solid" | "outline";
  action: "error" | "warning" | "success" | "info" | "muted";
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

const sizeOptions = [
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
];

const Alert: ComponentConfig<AlertProps> = {
  fields: {
    className: { type: "text" },
    text: { type: "text" },
    variant: {
      type: "select",
      options: [
        { label: "Solid", value: "solid" },
        { label: "Outline", value: "outline" },
      ],
    },
    action: {
      type: "select",
      options: [
        { label: "Error", value: "error" },
        { label: "Warning", value: "warning" },
        { label: "Success", value: "success" },
        { label: "Info", value: "info" },
        { label: "Muted", value: "muted" },
      ],
    },
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
    className: "",
    text: "Alert message",
    variant: "solid",
    action: "muted",
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
    className,
    text,
    variant,
    action,
    size,
    isTruncated,
    bold,
    underline,
    strikeThrough,
    sub,
    italic,
    highlight,
  }) => (
    <GluestackAlert className={className} variant={variant} action={action}>
      <AlertText
        size={size}
        isTruncated={isTruncated}
        bold={bold}
        underline={underline}
        strikeThrough={strikeThrough}
        sub={sub}
        italic={italic}
        highlight={highlight}
      >
        {text}
      </AlertText>
    </GluestackAlert>
  ),
};

export default Alert;
