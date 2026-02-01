import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { GridItem as GluestackGridItem } from "../../components/ui/grid";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";

export type GridItemProps = {
  className: string;
  columnsClassName: string;
  content: any;
};

const GridItem: ComponentConfig<GridItemProps> = {
  inline: false,
  fields: {
    className: ClassNameGeneratorField("Classes", {
      alignment: true,
      padding: true,
      margin: true,
    }),
    columnsClassName: { type: "text", label: "Column span (e.g. col-span-3)" },
    content: { type: "slot" },
  },
  defaultProps: {
    className: "bg-background-50 p-6 rounded-md",
    columnsClassName: "col-span-3",
    content: [],
  },
  render: ({
    className,
    columnsClassName,
    content: Content,
    puck,
  }: WithPuckProps<GridItemProps>) => {
    const GridItemDropZone = React.forwardRef<any, any>(
      function GridItemDropZone(props, ref) {
        const mergedClassName = [className, props?.className]
          .filter(Boolean)
          .join(" ");
        const mergedColumnsClassName = [
          columnsClassName,
          props?._extra?.className,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <GluestackGridItem
            {...props}
            ref={
              puck.dragRef as unknown as React.Ref<
                React.ComponentRef<typeof GluestackGridItem>
              >
            }
            className={mergedClassName}
            _extra={{ className: mergedColumnsClassName }}
          />
        );
      },
    );

    return <Content as={GridItemDropZone} />;
  },
};

export default GridItem;
