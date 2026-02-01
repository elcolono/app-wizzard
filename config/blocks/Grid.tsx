import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Grid as GluestackGrid } from "../../components/ui/grid";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";

export type GridProps = {
  className: string;
  columnsClassName: string;
  content: any;
};

const Grid: ComponentConfig<GridProps> = {
  inline: false,
  fields: {
    className: ClassNameGeneratorField("Classes", {
      alignment: true,
      padding: true,
      margin: true,
    }),
    columnsClassName: { type: "text", label: "Columns (e.g. grid-cols-12)" },
    content: { type: "slot", allow: ["GridItem"] },
  },
  defaultProps: {
    className: "gap-4",
    columnsClassName: "grid-cols-10",
    content: [
      {
        type: "GridItem",
        props: {
          className: "bg-background-50 p-6 rounded-md",
          columnsClassName: "col-span-3",
        },
      },
      {
        type: "GridItem",
        props: {
          className: "bg-background-50 p-6 rounded-md",
          columnsClassName: "col-span-5",
        },
      },
      {
        type: "GridItem",
        props: {
          className: "bg-background-50 p-6 rounded-md",
          columnsClassName: "col-span-2",
        },
      },
      {
        type: "GridItem",
        props: {
          className: "bg-background-50 p-6 rounded-md",
          columnsClassName: "col-span-4",
        },
      },
      {
        type: "GridItem",
        props: {
          className: "bg-background-50 p-6 rounded-md",
          columnsClassName: "col-span-6",
        },
      },
      {
        type: "GridItem",
        props: {
          className: "bg-background-50 p-6 rounded-md",
          columnsClassName: "col-span-2",
        },
      },
      {
        type: "GridItem",
        props: {
          className: "bg-background-50 p-6 rounded-md",
          columnsClassName: "col-span-4",
        },
      },
      {
        type: "GridItem",
        props: {
          className: "bg-background-50 p-6 rounded-md",
          columnsClassName: "col-span-4",
        },
      },
    ],
  },
  render: ({
    className,
    columnsClassName,
    content: Content,
    puck,
  }: WithPuckProps<GridProps>) => {
    const GridDropZone = React.forwardRef<any, any>(
      function GridDropZone(props, ref) {
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
          <GluestackGrid
            {...props}
            ref={
              puck.dragRef as unknown as React.Ref<
                React.ComponentRef<typeof GluestackGrid>
              >
            }
            className={mergedClassName}
            _extra={{ className: mergedColumnsClassName }}
          />
        );
      },
    );

    return <Content as={GridDropZone} />;
  },
};

export default Grid;
