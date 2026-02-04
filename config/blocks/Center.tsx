import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Center as GluestackCenter } from "../../components/ui/center";
import { aiInstructions } from "../fields/aiInstructions";

export type CenterProps = {
  className: string;
  content?: any;
};

const Center: ComponentConfig<CenterProps> = {
  inline: false,
  fields: {
    content: { type: "slot", ai: { instructions: aiInstructions.slotContent } },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    className: "",
  },
  render: ({
    content: Content,
    className,
    puck,
  }: WithPuckProps<CenterProps>) => {
    const CenterDropZone = React.forwardRef<any, any>(function CenterDropZone(
      props,
      ref
    ) {
      const mergedClassName = [className, props?.className]
        .filter(Boolean)
        .join(" ");

      return (
        <GluestackCenter
          {...props}
          ref={
            puck.dragRef as unknown as React.Ref<
              React.ComponentRef<typeof GluestackCenter>
            >
          }
          className={mergedClassName}
        />
      );
    });

    return <Content as={CenterDropZone} />;
  },
};

export default Center;
