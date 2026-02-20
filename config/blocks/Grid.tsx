import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import React from "react";
import { Grid as GluestackGrid } from "../../components/ui/grid";
import { aiInstructions } from "../fields/aiInstructions";
import { SLOT_ONLY_CHILDREN } from "../fields/slotRules";

export type GridProps = {
  className: string;
  columnsMobile:
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
  columnsTablet:
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
  columnsDesktop:
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
    columnsMobile: {
      type: "select",
      label: "Columns (Mobile)",
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
      ai: { instructions: aiInstructions.gridColumns },
    },
    columnsTablet: {
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
      ai: { instructions: aiInstructions.gridColumns },
    },
    columnsDesktop: {
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
      ai: { instructions: aiInstructions.gridColumns },
    },
    columnsClassName: {
      type: "text",
      label: "Columns (advanced classes)",
      ai: { instructions: aiInstructions.gridColumnsAdvanced },
    },
    content: {
      type: "slot",
      allow: SLOT_ONLY_CHILDREN.Grid,
      ai: { instructions: aiInstructions.slotContent },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    className: "gap-4",
    columnsMobile: "3",
    columnsTablet: "",
    columnsDesktop: "",
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
    columnsMobile,
    columnsTablet,
    columnsDesktop,
    columnsClassName,
    content: Content,
    puck,
  }: WithPuckProps<GridProps>) => {
    const GridDropZone = React.forwardRef<any, any>(function GridDropZone(
      props,
      ref
    ) {
      const mergedClassName = [className, props?.className]
        .filter(Boolean)
        .join(" ");
      const responsiveColumnsClassName = [
        `grid-cols-${columnsMobile}`,
        columnsTablet ? `md:grid-cols-${columnsTablet}` : "",
        columnsDesktop ? `lg:grid-cols-${columnsDesktop}` : "",
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
    });

    return <Content as={GridDropZone} />;
  },
};

export default Grid;
