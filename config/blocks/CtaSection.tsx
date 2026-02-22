import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { DISALLOWED_NESTED_COMPONENTS } from "../fields/slotRules";

export type CtaSectionProps = {
  className: string;
  content: any;
};

const CtaSection: ComponentConfig<CtaSectionProps> = {
  inline: false,
  fields: {
    content: {
      type: "slot",
      disallow: DISALLOWED_NESTED_COMPONENTS,
      ai: { instructions: aiInstructions.slotContent },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    className: "py-16 md:py-24",
    content: [
      {
        type: "Container",
        props: {
          maxWidth: "5xl",
          className: "",
          content: [
            {
              type: "Box",
              props: {
                className: "rounded-xl border border-outline-200 p-8 md:p-12",
                content: [
                  {
                    type: "VStack",
                    props: {
                      className: "items-center",
                      space: "lg",
                      content: [
                        {
                          type: "Heading",
                          props: {
                            title: "Ready to launch your next page?",
                            size: "4xl",
                            className: "max-w-3xl",
                            textAlignment: "text-center",
                            isTruncated: false,
                            bold: false,
                            underline: false,
                            strikeThrough: false,
                            sub: false,
                            italic: false,
                            highlight: false,
                          },
                        },
                        {
                          type: "Text",
                          props: {
                            text: "Use this call-to-action section near the end of the page to convert visitors into leads.",
                            size: "lg",
                            className: "max-w-2xl text-typography-600",
                            textAlignment: "text-center",
                            isTruncated: false,
                            bold: false,
                            underline: false,
                            strikeThrough: false,
                            sub: false,
                            italic: false,
                            highlight: false,
                          },
                        },
                        {
                          type: "HStack",
                          props: {
                            className: "flex-wrap justify-center",
                            space: "sm",
                            content: [
                              {
                                type: "Button",
                                props: {
                                  variant: "solid",
                                  action: "primary",
                                  size: "md",
                                  className: "",
                                  content: [
                                    {
                                      type: "ButtonText",
                                      props: { text: "Start now", className: "" },
                                    },
                                  ],
                                },
                              },
                              {
                                type: "Button",
                                props: {
                                  variant: "outline",
                                  action: "secondary",
                                  size: "md",
                                  className: "",
                                  content: [
                                    {
                                      type: "ButtonText",
                                      props: { text: "Book a demo", className: "" },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
  render: ({
    className,
    content: Content,
    puck,
  }: WithPuckProps<CtaSectionProps>) => {
    const DropZone = React.forwardRef<any, any>(function DropZone(props, ref) {
      const mergedClassName = [className, props?.className]
        .filter(Boolean)
        .join(" ");
      return <GluestackBox {...props} ref={ref} className={mergedClassName} />;
    });

    return (
      <GluestackBox
        ref={
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackBox>
          >
        }
      >
        <Content as={DropZone} minEmptyHeight={300} />
      </GluestackBox>
    );
  },
};

export default CtaSection;
