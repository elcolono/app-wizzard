import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { DISALLOWED_NESTED_COMPONENTS } from "../fields/slotRules";

export type ConstrainedHeaderProps = {
  className: string;
  content: any;
};

const ConstrainedHeader: ComponentConfig<ConstrainedHeaderProps> = {
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
    className: "bg-white",
    content: [
      {
        type: "Container",
        props: {
          maxWidth: "7xl",
          className: "p-6 lg:px-8",
          content: [
            {
              type: "Grid",
              props: {
                className: "items-center",
                gap: "4",
                columnsMobile: "3",
                columnsTablet: "3",
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
                          type: "Text",
                          props: {
                            text: "Your Company",
                            className: "text-base text-gray-900",
                            size: "md",
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
                  {
                    type: "GridItem",
                    props: {
                      className: "hidden lg:block",
                      columnsBase: "1",
                      columnsSm: "",
                      columnsMd: "",
                      columnsLg: "",
                      columnsClassName: "",
                      content: [
                        {
                          type: "HStack",
                          props: {
                            className: "justify-center",
                            space: "md",
                            content: [
                              {
                                type: "Text",
                                props: {
                                  text: "Product",
                                  className: "text-sm text-gray-900",
                                  size: "sm",
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
                              {
                                type: "Text",
                                props: {
                                  text: "Features",
                                  className: "text-sm text-gray-900",
                                  size: "sm",
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
                              {
                                type: "Text",
                                props: {
                                  text: "Marketplace",
                                  className: "text-sm text-gray-900",
                                  size: "sm",
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
                              {
                                type: "Text",
                                props: {
                                  text: "Company",
                                  className: "text-sm text-gray-900",
                                  size: "sm",
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
                  {
                    type: "GridItem",
                    props: {
                      className: "justify-self-end",
                      columnsBase: "1",
                      columnsSm: "",
                      columnsMd: "",
                      columnsLg: "",
                      columnsClassName: "",
                      content: [
                        {
                          type: "HStack",
                          props: {
                            className: "items-center",
                            space: "sm",
                            content: [
                              {
                                type: "Button",
                                props: {
                                  variant: "link",
                                  action: "secondary",
                                  size: "sm",
                                  className: "lg:hidden text-gray-700",
                                  content: [
                                    {
                                      type: "ButtonIcon",
                                      props: {
                                        iconName: "MenuIcon",
                                        size: "lg",
                                        className: "",
                                      },
                                    },
                                  ],
                                },
                              },
                              {
                                type: "Text",
                                props: {
                                  text: "Log in →",
                                  className:
                                    "hidden lg:inline-flex text-sm text-gray-900",
                                  size: "sm",
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
  render: ({
    className,
    content: Content,
    puck,
  }: WithPuckProps<ConstrainedHeaderProps>) => (
    <GluestackBox
      ref={
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackBox>
        >
      }
    >
      <Content
        as={React.forwardRef<any, any>(function HeaderDropZone(props, ref) {
          const mergedClassName = [className, props?.className]
            .filter(Boolean)
            .join(" ");
          return (
            <GluestackBox {...props} ref={ref} className={mergedClassName} />
          );
        })}
        minEmptyHeight={120}
      />
    </GluestackBox>
  ),
};

export default ConstrainedHeader;
