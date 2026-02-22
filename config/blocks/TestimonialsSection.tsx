import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { CHILD_ONLY_COMPONENTS } from "../fields/slotRules";

export type TestimonialsSectionProps = {
  className: string;
  content: any;
};

const TestimonialsSection: ComponentConfig<TestimonialsSectionProps> = {
  inline: false,
  fields: {
    content: {
      type: "slot",
      disallow: CHILD_ONLY_COMPONENTS,
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
              type: "VStack",
              props: {
                className: "",
                space: "xl",
                content: [
                  {
                    type: "Heading",
                    props: {
                      title: "What clients say",
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
                    type: "Grid",
                    props: {
                      className: "",
                      gap: "6",
                      columnsMobile: "1",
                      columnsTablet: "2",
                      columnsDesktop: "3",
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
                                type: "Card",
                                props: {
                                  className: "h-full",
                                  size: "md",
                                  variant: "elevated",
                                  content: [
                                    {
                                      type: "VStack",
                                      props: {
                                        className: "",
                                        space: "sm",
                                        content: [
                                          {
                                            type: "Text",
                                            props: {
                                              text: "The new site communicates our offer clearly and conversion improved in the first week.",
                                              size: "md",
                                              className: "",
                                              textAlignment: "text-left",
                                              isTruncated: false,
                                              bold: false,
                                              underline: false,
                                              strikeThrough: false,
                                              sub: false,
                                              italic: true,
                                              highlight: false,
                                            },
                                          },
                                          {
                                            type: "Text",
                                            props: {
                                              text: "Ava Reynolds, Marketing Lead",
                                              size: "sm",
                                              className: "text-typography-500",
                                              textAlignment: "text-left",
                                              isTruncated: false,
                                              bold: true,
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
                                  className: "h-full",
                                  size: "md",
                                  variant: "elevated",
                                  content: [
                                    {
                                      type: "VStack",
                                      props: {
                                        className: "",
                                        space: "sm",
                                        content: [
                                          {
                                            type: "Text",
                                            props: {
                                              text: "Our team now has a reusable system. We ship pages in hours, not weeks.",
                                              size: "md",
                                              className: "",
                                              textAlignment: "text-left",
                                              isTruncated: false,
                                              bold: false,
                                              underline: false,
                                              strikeThrough: false,
                                              sub: false,
                                              italic: true,
                                              highlight: false,
                                            },
                                          },
                                          {
                                            type: "Text",
                                            props: {
                                              text: "Liam Chen, Product Manager",
                                              size: "sm",
                                              className: "text-typography-500",
                                              textAlignment: "text-left",
                                              isTruncated: false,
                                              bold: true,
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
                                  className: "h-full",
                                  size: "md",
                                  variant: "elevated",
                                  content: [
                                    {
                                      type: "VStack",
                                      props: {
                                        className: "",
                                        space: "sm",
                                        content: [
                                          {
                                            type: "Text",
                                            props: {
                                              text: "Implementation was smooth and the editing experience is simple for non-technical teammates.",
                                              size: "md",
                                              className: "",
                                              textAlignment: "text-left",
                                              isTruncated: false,
                                              bold: false,
                                              underline: false,
                                              strikeThrough: false,
                                              sub: false,
                                              italic: true,
                                              highlight: false,
                                            },
                                          },
                                          {
                                            type: "Text",
                                            props: {
                                              text: "Noah Patel, Operations",
                                              size: "sm",
                                              className: "text-typography-500",
                                              textAlignment: "text-left",
                                              isTruncated: false,
                                              bold: true,
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
  }: WithPuckProps<TestimonialsSectionProps>) => {
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

export default TestimonialsSection;
