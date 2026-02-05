import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Alert as GluestackAlert } from "../../components/ui/alert";
import { aiInstructions } from "../fields/aiInstructions";
import { SLOT_ONLY_CHILDREN } from "../fields/slotRules";

export type AlertProps = {
  content: any;
  action: "error" | "warning" | "success" | "info" | "muted";
  variant: "solid" | "outline";
  className: string;
};

const Alert: ComponentConfig<AlertProps> = {
  inline: false,
  fields: {
    content: {
      type: "slot",
      allow: SLOT_ONLY_CHILDREN.Alert,
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
      ai: { instructions: aiInstructions.alertAction },
    },
    variant: {
      type: "select",
      options: [
        { label: "Solid", value: "solid" },
        { label: "Outline", value: "outline" },
      ],
      ai: { instructions: aiInstructions.alertVariant },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    content: [
      { type: "AlertIcon", props: { iconName: "InfoIcon" } },
      { type: "AlertText", props: { text: "Description of alert!" } },
    ],
    action: "muted",
    variant: "outline",
    className: "",
  },
  render: ({
    action,
    variant,
    content: Content,
    className,
    puck,
  }: WithPuckProps<AlertProps>) => {
    const AlertDropZone = React.forwardRef<any, any>(function AlertDropZone(
      props,
      ref
    ) {
      return (
        <GluestackAlert
          {...props}
          ref={
            puck.dragRef as unknown as React.Ref<
              React.ComponentRef<typeof GluestackAlert>
            >
          }
          action={action}
          variant={variant}
          className={className}
        />
      );
    });

    return <Content as={AlertDropZone} />;
  },
};

export default Alert;
