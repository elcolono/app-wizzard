import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Center as GluestackCenter } from "../../components/ui/center";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";

export type CenterProps = {
  className: string;
  content?: any;
};

const Center: ComponentConfig<CenterProps> = {
  inline: false,
  fields: {
    className: ClassNameGeneratorField("Classes", {
      alignment: true,
      padding: true,
      margin: true,
    }),
    content: { type: "slot" },
  },
  defaultProps: {
    className: "",
  },
  render: ({
    content: Content,
    className,
    puck,
  }: WithPuckProps<CenterProps>) => {
    const CenterDropZone = React.forwardRef<any, any>(
      function CenterDropZone(props, ref) {
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
      },
    );

    return <Content as={CenterDropZone} />;
  },
};

export default Center;
