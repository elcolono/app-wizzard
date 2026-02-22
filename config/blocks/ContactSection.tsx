import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { DISALLOWED_NESTED_COMPONENTS } from "../fields/slotRules";

export type ContactSectionProps = {
  className: string;
  content: any;
};

const ContactSection: ComponentConfig<ContactSectionProps> = {
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
          maxWidth: "6xl",
          className: "",
          content: [
            {
              type: "Grid",
              props: {
                className: "items-start",
                gap: "8",
                columnsMobile: "1",
                columnsTablet: "2",
                columnsDesktop: "2",
                columnsClassName: "",
                content: [
                  {
                    type: "GridItem",
                    props: {
                      className: "",
                      columnsBase: "1",
                      columnsSm: "",
                      columnsMd: "",
                      columnsLg: "",
                      columnsClassName: "",
                      content: [
                        {
                          type: "VStack",
                          props: {
                            className: "",
                            space: "md",
                            content: [
                              {
                                type: "Heading",
                                props: {
                                  title: "Get in touch",
                                  size: "4xl",
                                  className: "",
                                  textAlignment: "text-left",
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
                                  text: "Share your project goals and timeline. We will get back to you with next steps.",
                                  size: "lg",
                                  className: "text-typography-700",
                                  textAlignment: "text-left",
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
                                  text: "Email: hello@example.com",
                                  size: "md",
                                  className: "text-typography-500",
                                  textAlignment: "text-left",
                                  isTruncated: false,
                                  bold: false,
                                  underline: false,
                                  strikeThrough: false,
                                  sub: false,
                                  italic: false,
                                  highlight: false,
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    type: "GridItem",
                    props: {
                      className: "",
                      columnsBase: "1",
                      columnsSm: "",
                      columnsMd: "",
                      columnsLg: "",
                      columnsClassName: "",
                      content: [
                        {
                          type: "Card",
                          props: {
                            className: "",
                            size: "md",
                            variant: "outline",
                            content: [
                              {
                                type: "VStack",
                                props: {
                                  className: "",
                                  space: "md",
                                  content: [
                                    {
                                      type: "Input",
                                      props: {
                                        variant: "outline",
                                        size: "md",
                                        isDisabled: false,
                                        isInvalid: false,
                                        isReadOnly: false,
                                        placeholder: "Your name",
                                        className: "",
                                      },
                                    },
                                    {
                                      type: "Input",
                                      props: {
                                        variant: "outline",
                                        size: "md",
                                        isDisabled: false,
                                        isInvalid: false,
                                        isReadOnly: false,
                                        placeholder: "Your email",
                                        className: "",
                                      },
                                    },
                                    {
                                      type: "TextArea",
                                      props: {
                                        size: "md",
                                        isDisabled: false,
                                        isInvalid: false,
                                        isReadOnly: false,
                                        placeholder: "Tell us about your project",
                                        className: "",
                                      },
                                    },
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
                                            props: {
                                              text: "Send message",
                                              className: "",
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
  }: WithPuckProps<ContactSectionProps>) => {
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

export default ContactSection;
