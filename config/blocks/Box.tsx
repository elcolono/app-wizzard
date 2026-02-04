import React from "react";
import type {
  ComponentConfig,
  SlotComponent,
  WithPuckProps,
} from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { CHILD_ONLY_COMPONENTS } from "../fields/slotRules";

export type BoxProps = {
  className: string;
  content?: SlotComponent;
};

const Box: ComponentConfig<BoxProps> = {
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
    className: "",
  },
  render: ({ content: Content, className, puck }: WithPuckProps<BoxProps>) => {
    const BoxDropZone = React.forwardRef<any, any>(function BoxDropZone(
      props,
      ref
    ) {
      const mergedClassName = [className, props?.className]
        .filter(Boolean)
        .join(" ");

      return (
        <GluestackBox
          {...props}
          ref={
            puck.dragRef as unknown as React.Ref<
              React.ComponentRef<typeof GluestackBox>
            >
          }
          className={mergedClassName}
        />
      );
    });

    return <Content as={BoxDropZone} minEmptyHeight={300} />;
  },
};

export default Box;
