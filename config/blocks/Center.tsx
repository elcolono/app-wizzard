import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { Center as GluestackCenter } from "../../components/ui/center";

export type CenterProps = {
  className: string;
  content: any;
};

const Center: ComponentConfig<CenterProps> = {
  fields: {
    className: { type: "text" },
    content: { type: "slot" },
  },
  render: ({ content: Content, className }) => {
    const CenterDropZone = React.forwardRef<any, any>(
      function CenterDropZone(props, ref) {
        const mergedClassName = [className, props?.className]
          .filter(Boolean)
          .join(" ");

        return (
          <GluestackCenter {...props} ref={ref} className={mergedClassName} />
        );
      },
    );

    return <Content as={CenterDropZone} />;
  },
};

export default Center;
