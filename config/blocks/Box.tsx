import React from "react";
import type { ComponentConfig, SlotComponent } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";

export type BoxProps = {
  className: string;
  content?: SlotComponent;
};

const Box: ComponentConfig<BoxProps> = {
  fields: {
    className: { type: "text" },
    content: { type: "slot" },
  },
  defaultProps: {
    className: "bg-gray-500 w-24 h-24",
  },
  render: ({ content: Content, className }) => {
    const BoxDropZone = React.forwardRef<any, any>(
      function BoxDropZone(props, ref) {
        const mergedClassName = [className, props?.className]
          .filter(Boolean)
          .join(" ");

        return (
          <GluestackBox {...props} ref={ref} className={mergedClassName} />
        );
      },
    );

    return <Content as={BoxDropZone} />;
  },
};

export default Box;
