import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { DISALLOWED_NESTED_COMPONENTS } from "../fields/slotRules";

export type HeroSimpleCenteredProps = {
  className: string;
  content: any;
};

const HeroSimpleCentered: ComponentConfig<HeroSimpleCenteredProps> = {
  inline: false,
  label: "Hero (Simple centered)",
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
              type: "VStack",
              props: {
                className: "items-center",
                space: "lg",
                content: [
                  {
                    type: "Heading",
                    props: {
                      title: "A simple centered hero for focused messaging",
                      size: "5xl",
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
                      text: "Use one clear headline, concise supporting text, and a short action row to drive the next click.",
                      size: "lg",
                      className: "max-w-2xl text-typography-700",
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
                      className: "w-full flex-wrap justify-center",
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
                                props: { text: "Talk to sales", className: "" },
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
  }: WithPuckProps<HeroSimpleCenteredProps>) => {
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

export default HeroSimpleCentered;
