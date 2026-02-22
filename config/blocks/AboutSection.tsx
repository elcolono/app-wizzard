import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { CHILD_ONLY_COMPONENTS } from "../fields/slotRules";

export type AboutSectionProps = {
  className: string;
  content: any;
};

const AboutSection: ComponentConfig<AboutSectionProps> = {
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
              type: "Grid",
              props: {
                className: "items-start",
                gap: "10",
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
                                  title: "About us",
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
                                  text: "We help teams launch high-converting websites quickly with reusable building blocks and clear design systems.",
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
                                  space: "sm",
                                  content: [
                                    {
                                      type: "Heading",
                                      props: {
                                        title: "Why clients choose us",
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
                                        text: "Fast implementation, consistent components, and easy iteration for marketing and product teams.",
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
  render: ({
    className,
    content: Content,
    puck,
  }: WithPuckProps<AboutSectionProps>) => {
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

export default AboutSection;
