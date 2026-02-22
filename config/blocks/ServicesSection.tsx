import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { CHILD_ONLY_COMPONENTS } from "../fields/slotRules";

export type ServicesSectionProps = {
  className: string;
  content: any;
};

const ServicesSection: ComponentConfig<ServicesSectionProps> = {
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
                      title: "Services",
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
                                  variant: "outline",
                                  content: [
                                    {
                                      type: "VStack",
                                      props: {
                                        className: "",
                                        space: "sm",
                                        content: [
                                          {
                                            type: "Heading",
                                            props: {
                                              title: "Website strategy",
                                              size: "xl",
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
                                              text: "Plan structure and messaging around your audience and conversion goals.",
                                              size: "md",
                                              className: "text-typography-600",
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
                                  variant: "outline",
                                  content: [
                                    {
                                      type: "VStack",
                                      props: {
                                        className: "",
                                        space: "sm",
                                        content: [
                                          {
                                            type: "Heading",
                                            props: {
                                              title: "Design systems",
                                              size: "xl",
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
                                              text: "Create consistent UI patterns that scale across pages and campaigns.",
                                              size: "md",
                                              className: "text-typography-600",
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
                                  variant: "outline",
                                  content: [
                                    {
                                      type: "VStack",
                                      props: {
                                        className: "",
                                        space: "sm",
                                        content: [
                                          {
                                            type: "Heading",
                                            props: {
                                              title: "Optimization",
                                              size: "xl",
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
                                              text: "Improve engagement with iterative content and conversion testing.",
                                              size: "md",
                                              className: "text-typography-600",
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
  }: WithPuckProps<ServicesSectionProps>) => {
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

export default ServicesSection;
