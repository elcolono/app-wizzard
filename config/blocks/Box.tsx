import React from "react";
import type {
  ComponentConfig,
  SlotComponent,
  WithPuckProps,
} from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";

export type BoxProps = {
  className: string;
  content?: SlotComponent;
};

const Box: ComponentConfig<BoxProps> = {
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
  render: ({ content: Content, className, puck }: WithPuckProps<BoxProps>) => {
    const BoxDropZone = React.forwardRef<any, any>(
      function BoxDropZone(props, ref) {
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
      },
    );

    return <Content as={BoxDropZone} minEmptyHeight={300} />;
  },
};

export default Box;
