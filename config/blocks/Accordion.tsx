import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Accordion as GluestackAccordion } from "../../components/ui/accordion";
import { aiInstructions } from "../fields/aiInstructions";
import { SLOT_ONLY_CHILDREN } from "../fields/slotRules";

export type AccordionProps = {
  content: any;
  type: "single" | "multiple";
  isCollapsible: boolean;
  isDisabled: boolean;
  size: "sm" | "md" | "lg";
  variant: "filled" | "unfilled";
  className: string;
};

const Accordion: ComponentConfig<AccordionProps> = {
  inline: false,
  fields: {
    content: {
      type: "slot",
      allow: SLOT_ONLY_CHILDREN.Accordion,
      ai: { instructions: aiInstructions.slotContent },
    },
    type: {
      type: "select",
      options: [
        { label: "Single", value: "single" },
        { label: "Multiple", value: "multiple" },
      ],
      ai: { instructions: aiInstructions.accordionType },
    },
    isCollapsible: {
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
      ai: {
        instructions: "Allow closing an open item by clicking its trigger.",
      },
    },
    isDisabled: {
      type: "radio",
      options: [
        { label: "No", value: false },
        { label: "Yes", value: true },
      ],
      ai: { instructions: "Disable the entire accordion." },
    },
    size: {
      type: "select",
      options: [
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
      ],
      ai: { instructions: aiInstructions.accordionSize },
    },
    variant: {
      type: "select",
      options: [
        { label: "Filled", value: "filled" },
        { label: "Unfilled", value: "unfilled" },
      ],
      ai: { instructions: aiInstructions.accordionVariant },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    content: [
      {
        type: "AccordionItem",
        props: {
          value: "a",
          titleText: "How do I place an order?",
          contentText:
            "To place an order, simply select the products you want, proceed to checkout, provide shipping and payment information, and finalize your purchase.",
          iconExpanded: "ChevronUpIcon",
          iconCollapsed: "ChevronDownIcon",
          iconClassName: "ml-3",
        },
      },
      {
        type: "AccordionItem",
        props: {
          value: "b",
          titleText: "What payment methods do you accept?",
          contentText:
            "We accept all major credit cards, including Visa, Mastercard, and American Express. We also support payments through PayPal.",
          iconExpanded: "ChevronUpIcon",
          iconCollapsed: "ChevronDownIcon",
          iconClassName: "ml-3",
        },
      },
    ],
    type: "single",
    isCollapsible: true,
    isDisabled: false,
    size: "md",
    variant: "filled",
    className: "",
  },
  render: ({
    type,
    isCollapsible,
    isDisabled,
    size,
    variant,
    content: Content,
    className,
    puck,
  }: WithPuckProps<AccordionProps>) => {
    const AccordionDropZone = React.forwardRef<any, any>(
      function AccordionDropZone(props, ref) {
        return (
          <GluestackAccordion
            {...props}
            ref={
              puck.dragRef as unknown as React.Ref<
                React.ComponentRef<typeof GluestackAccordion>
              >
            }
            type={type}
            isCollapsible={isCollapsible}
            isDisabled={isDisabled}
            size={size}
            variant={variant}
            className={className}
          />
        );
      }
    );

    return <Content as={AccordionDropZone} />;
  },
};

export default Accordion;
