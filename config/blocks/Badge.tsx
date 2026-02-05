import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Badge as GluestackBadge } from "../../components/ui/badge";
import { aiInstructions } from "../fields/aiInstructions";
import { SLOT_ONLY_CHILDREN } from "../fields/slotRules";

export type BadgeProps = {
  content: any;
  action: "error" | "warning" | "success" | "info" | "muted";
  variant: "solid" | "outline";
  size: "sm" | "md" | "lg";
  className: string;
};

const Badge: ComponentConfig<BadgeProps> = {
  fields: {
    content: {
      type: "slot",
      allow: SLOT_ONLY_CHILDREN.Badge,
      ai: { instructions: aiInstructions.slotContent },
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
      ai: { instructions: aiInstructions.badgeAction },
    },
    variant: {
      type: "select",
      options: [
        { label: "Solid", value: "solid" },
        { label: "Outline", value: "outline" },
      ],
      ai: { instructions: aiInstructions.badgeVariant },
    },
    size: {
      type: "select",
      options: [
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
      ],
      ai: { instructions: aiInstructions.badgeSize },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  inline: false,
  defaultProps: {
    content: [
      { type: "BadgeText", props: { text: "Badge" } },
      {
        type: "BadgeIcon",
        props: { iconName: "GlobeIcon", className: "ml-2" },
      },
    ],
    action: "muted",
    variant: "solid",
    size: "md",
    className: "",
  },
  render: ({
    action,
    variant,
    size,
    content: Content,
    className,
  }: WithPuckProps<BadgeProps>) => {
    const BadgeDropZone = React.forwardRef<any, any>(function BadgeDropZone(
      props,
      ref
    ) {
      return (
        <GluestackBadge
          {...props}
          action={action}
          variant={variant}
          size={size}
          className={className}
        />
      );
    });

    return <Content as={BadgeDropZone} />;
  },
};

export default Badge;
