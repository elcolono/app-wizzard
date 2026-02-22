import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { CHILD_ONLY_COMPONENTS } from "../fields/slotRules";

export type FooterSectionProps = {
  className: string;
  content: any;
};

const FooterSection: ComponentConfig<FooterSectionProps> = {
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
    className: "py-12 border-t border-outline-200",
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
                gap: "6",
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
                            space: "xs",
                            content: [
                              {
                                type: "Heading",
                                props: {
                                  title: "Your Company",
                                  size: "lg",
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
                                  text: "Helping teams build and ship better websites.",
                                  size: "sm",
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
                          type: "HStack",
                          props: {
                            className: "flex-wrap justify-start md:justify-end",
                            space: "sm",
                            content: [
                              {
                                type: "Button",
                                props: {
                                  variant: "link",
                                  action: "secondary",
                                  size: "sm",
                                  className: "",
                                  content: [
                                    {
                                      type: "ButtonText",
                                      props: { text: "Privacy", className: "" },
                                    },
                                  ],
                                },
                              },
                              {
                                type: "Button",
                                props: {
                                  variant: "link",
                                  action: "secondary",
                                  size: "sm",
                                  className: "",
                                  content: [
                                    {
                                      type: "ButtonText",
                                      props: { text: "Terms", className: "" },
                                    },
                                  ],
                                },
                              },
                              {
                                type: "Button",
                                props: {
                                  variant: "link",
                                  action: "secondary",
                                  size: "sm",
                                  className: "",
                                  content: [
                                    {
                                      type: "ButtonText",
                                      props: { text: "Contact", className: "" },
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
  }: WithPuckProps<FooterSectionProps>) => {
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

export default FooterSection;
