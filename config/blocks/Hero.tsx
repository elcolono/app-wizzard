import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { CHILD_ONLY_COMPONENTS } from "../fields/slotRules";

export type HeroProps = {
  className: string;
  content: any;
};

const Hero: ComponentConfig<HeroProps> = {
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
                className: "items-start",
                space: "lg",
                content: [
                  {
                    type: "Badge",
                    props: {
                      action: "info",
                      variant: "outline",
                      size: "md",
                      className: "",
                      content: [
                        {
                          type: "BadgeText",
                          props: { text: "New release", className: "" },
                        },
                      ],
                    },
                  },
                  {
                    type: "Heading",
                    props: {
                      title: "Build pages faster with composable sections",
                      size: "5xl",
                      className: "max-w-3xl",
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
                      text: "Use Hero as a starting point, then customize the content and actions to match your product or campaign.",
                      size: "lg",
                      className: "max-w-2xl text-typography-700",
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
                    type: "HStack",
                    props: {
                      className: "w-full flex-wrap",
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
                                props: { text: "Get started", className: "" },
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
                                props: { text: "Learn more", className: "" },
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
  render: ({ className, content: Content, puck }: WithPuckProps<HeroProps>) => {
    const HeroDropZone = React.forwardRef<any, any>(function HeroDropZone(
      props,
      ref
    ) {
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
        <Content as={HeroDropZone} minEmptyHeight={300} />
      </GluestackBox>
    );
  },
};

export default Hero;
