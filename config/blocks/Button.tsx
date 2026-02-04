import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Button as GluestackButton } from "../../components/ui/button";
import { aiInstructions } from "../fields/aiInstructions";
import { SLOT_ONLY_CHILDREN } from "../fields/slotRules";
import { Box as GluestackBox } from "../../components/ui/box";

export type ButtonProps = {
  // showSpinner?: boolean;
  // showText?: boolean;
  content: any;
  variant: "solid" | "outline" | "link";
  action: "primary" | "secondary" | "positive" | "negative";
  size: "xs" | "sm" | "md" | "lg";
  className: string;
};

const Button: ComponentConfig<ButtonProps> = {
  // resolveData(data) {
  //   const content = Array.isArray(data.props.content) ? data.props.content : [];
  //   const hasSpinner = content.some((item) => item?.type === "ButtonSpinner");
  //   const hasText = content.some((item) => item?.type === "ButtonText");

  //   if (data.props.showSpinner && !hasSpinner) {
  //     data.props.content = [
  //       {
  //         type: "ButtonSpinner",
  //         props: {
  //           size: "small",
  //           color: "",
  //           className: "",
  //         },
  //       },
  //       ...(Array.isArray(data.props.content) ? data.props.content : content),
  //     ];
  //   }

  //   if (!data.props.showSpinner && hasSpinner) {
  //     data.props.content = content.filter(
  //       (item) => item?.type !== "ButtonSpinner"
  //     );
  //   }

  //   if (data.props.showText && !hasText) {
  //     data.props.content = [
  //       ...(Array.isArray(data.props.content) ? data.props.content : content),
  //       { type: "ButtonText", props: { text: "Button" } },
  //     ];
  //   }

  //   if (!data.props.showText && hasText) {
  //     const next = (
  //       Array.isArray(data.props.content) ? data.props.content : content
  //     ).filter((item) => item?.type !== "ButtonText");
  //     data.props.content = next;
  //   }

  //   return data;
  // },
  fields: {
    // showSpinner: CheckboxField("Show spinner"),
    // showText: CheckboxField("Show text"),
    content: {
      type: "slot",
      allow: SLOT_ONLY_CHILDREN.Button,
      ai: { instructions: aiInstructions.slotContent },
    },
    variant: {
      type: "select",
      options: [
        { label: "Solid", value: "solid" },
        { label: "Outline", value: "outline" },
        { label: "Link", value: "link" },
      ],
      ai: { instructions: aiInstructions.buttonVariant },
    },
    action: {
      type: "select",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Positive", value: "positive" },
        { label: "Negative", value: "negative" },
      ],
      ai: { instructions: aiInstructions.buttonAction },
    },
    size: {
      type: "select",
      options: [
        { label: "XS", value: "xs" },
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
      ],
      ai: { instructions: aiInstructions.buttonSize },
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
      { type: "ButtonIcon", props: { icon: "ArrowRightIcon" } },
      { type: "ButtonText", props: { text: "Button" } },
    ],
    // showText: true,
    variant: "solid",
    action: "primary",
    size: "md",
    className: null,
  },
  render: ({
    variant,
    action,
    size,
    content: Content,
    className,
    puck,
  }: WithPuckProps<ButtonProps>) => {
    const ButtonDropZone = React.forwardRef<any, any>(function ButtonDropZone(
      props,
      ref
    ) {
      return (
        <GluestackBox>
          <GluestackButton
            {...props}
            ref={
              puck.dragRef as unknown as React.Ref<
                React.ComponentRef<typeof GluestackButton>
              >
            }
            variant={variant}
            action={action}
            size={size}
            className={className}
          />
        </GluestackBox>
      );
    });

    return <Content as={ButtonDropZone} />;
  },
};

export default Button;
