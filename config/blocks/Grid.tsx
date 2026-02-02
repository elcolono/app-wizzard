import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import React from "react";
import { Grid as GluestackGrid } from "../../components/ui/grid";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";

export type GridProps = {
  className: string;
  columnsBase:
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "11"
    | "12"
    | "none"
    | "auto"
    | "subgrid";
  columnsSm:
    | ""
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "11"
    | "12"
    | "none"
    | "auto"
    | "subgrid";
  columnsMd:
    | ""
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "11"
    | "12"
    | "none"
    | "auto"
    | "subgrid";
  columnsLg:
    | ""
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "11"
    | "12"
    | "none"
    | "auto"
    | "subgrid";
  columnsClassName: string;
  content: any;
};

const Grid: ComponentConfig<GridProps> = {
  inline: false,
  fields: {
    className: ClassNameGeneratorField("Classes", {
      alignment: false,
      padding: false,
      margin: false,
    }),
    columnsBase: {
      type: "select",
      label: "Columns",
      options: [
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
        { label: "5", value: "5" },
        { label: "6", value: "6" },
        { label: "7", value: "7" },
        { label: "8", value: "8" },
        { label: "9", value: "9" },
        { label: "10", value: "10" },
        { label: "11", value: "11" },
        { label: "12", value: "12" },
        { label: "None", value: "none" },
        { label: "Auto", value: "auto" },
        { label: "Subgrid", value: "subgrid" },
      ],
    },
    columnsSm: {
      type: "select",
      label: "Columns (Mobile)",
      options: [
        { label: "Default", value: "" },
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
        { label: "5", value: "5" },
        { label: "6", value: "6" },
        { label: "7", value: "7" },
        { label: "8", value: "8" },
        { label: "9", value: "9" },
        { label: "10", value: "10" },
        { label: "11", value: "11" },
        { label: "12", value: "12" },
        { label: "None", value: "none" },
        { label: "Auto", value: "auto" },
        { label: "Subgrid", value: "subgrid" },
      ],
    },
    columnsMd: {
      type: "select",
      label: "Columns (Tablet)",
      options: [
        { label: "Default", value: "" },
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
        { label: "5", value: "5" },
        { label: "6", value: "6" },
        { label: "7", value: "7" },
        { label: "8", value: "8" },
        { label: "9", value: "9" },
        { label: "10", value: "10" },
        { label: "11", value: "11" },
        { label: "12", value: "12" },
        { label: "None", value: "none" },
        { label: "Auto", value: "auto" },
        { label: "Subgrid", value: "subgrid" },
      ],
    },
    columnsLg: {
      type: "select",
      label: "Columns (Desktop)",
      options: [
        { label: "Default", value: "" },
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
        { label: "5", value: "5" },
        { label: "6", value: "6" },
        { label: "7", value: "7" },
        { label: "8", value: "8" },
        { label: "9", value: "9" },
        { label: "10", value: "10" },
        { label: "11", value: "11" },
        { label: "12", value: "12" },
        { label: "None", value: "none" },
        { label: "Auto", value: "auto" },
        { label: "Subgrid", value: "subgrid" },
      ],
    },
    columnsClassName: {
      type: "text",
      label: "Columns (advanced classes)",
    },
    content: { type: "slot", allow: ["GridItem"] },
  },
  defaultProps: {
    className: "gap-4",
    columnsBase: "3",
    columnsSm: "",
    columnsMd: "",
    columnsLg: "",
    columnsClassName: "",
    content: [
      {
        type: "GridItem",
        props: {
          className: "bg-background-50 p-3 rounded-md text-center",
          columnsClassName: "col-span-1",
        },
      },
      {
        type: "GridItem",
        props: {
          className: "bg-background-50 p-3 rounded-md text-center",
          columnsClassName: "col-span-1",
        },
      },
      {
        type: "GridItem",
        props: {
          className: "bg-background-50 p-3 rounded-md text-center",
          columnsClassName: "col-span-1",
        },
      },
    ],
  },
  render: ({
    className,
    columnsBase,
    columnsSm,
    columnsMd,
    columnsLg,
    columnsClassName,
    content: Content,
    puck,
  }: WithPuckProps<GridProps>) => {
    const GridDropZone = React.forwardRef<any, any>(
      function GridDropZone(props, ref) {
        const mergedClassName = [className, props?.className]
          .filter(Boolean)
          .join(" ");
        const responsiveColumnsClassName = [
          `grid-cols-${columnsBase}`,
          columnsSm ? `sm:grid-cols-${columnsSm}` : "",
          columnsMd ? `md:grid-cols-${columnsMd}` : "",
          columnsLg ? `lg:grid-cols-${columnsLg}` : "",
        ]
          .filter(Boolean)
          .join(" ");
        const mergedColumnsClassName = [
          responsiveColumnsClassName,
          columnsClassName,
          props?._extra?.className,
        ]
          .filter(Boolean)
          .join(" ");

        // return (
        //   <GluestackGrid
        //     className="gap-4"
        //     _extra={{
        //       className: "grid-cols-9",
        //     }}
        //   >
        //     <GluestackGridItem
        //       className="bg-background-50 p-3 rounded-md text-center"
        //       _extra={{
        //         className: "col-span-3",
        //       }}
        //     >
        //       <GluestackText>A</GluestackText>
        //     </GluestackGridItem>
        //     <GluestackGridItem
        //       className="bg-background-50 p-3 rounded-md text-center"
        //       _extra={{
        //         className: "col-span-3",
        //       }}
        //     >
        //       <GluestackText>B</GluestackText>
        //     </GluestackGridItem>
        //     <GluestackGridItem
        //       className="bg-background-50 p-3 rounded-md text-center"
        //       _extra={{
        //         className: "col-span-3",
        //       }}
        //     >
        //       <GluestackText>C</GluestackText>
        //     </GluestackGridItem>
        //   </GluestackGrid>
        // );

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
