import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { GridItem as GluestackGridItem } from "../../components/ui/grid";
import { aiInstructions } from "../fields/aiInstructions";
import { DISALLOWED_NESTED_COMPONENTS } from "../fields/slotRules";
import EditorDragHandle from "./_shared/EditorDragHandle";

export type GridItemProps = {
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
  | "full"
  | "auto";
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
  | "full"
  | "auto";
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
  | "full"
  | "auto";
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
  | "full"
  | "auto";
  columnsClassName: string;
  content: any;
};

const columnsBaseOptions = [
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
  { label: "Full", value: "full" },
  { label: "Auto", value: "auto" },
];

const columnsResponsiveOptions = [
  { label: "Default", value: "" },
  ...columnsBaseOptions,
];

const GridItem: ComponentConfig<GridItemProps> = {
  inline: true,
  fields: {
    columnsBase: {
      type: "select",
      label: "Column span",
      options: columnsBaseOptions,
      ai: { instructions: aiInstructions.gridColumnSpan },
    },
    columnsSm: {
      type: "select",
      label: "Column span (sm)",
      options: columnsResponsiveOptions,
      ai: { instructions: aiInstructions.gridColumnSpan },
    },
    columnsMd: {
      type: "select",
      label: "Column span (md)",
      options: columnsResponsiveOptions,
      ai: { instructions: aiInstructions.gridColumnSpan },
    },
    columnsLg: {
      type: "select",
      label: "Column span (lg)",
      options: columnsResponsiveOptions,
      ai: { instructions: aiInstructions.gridColumnSpan },
    },
    columnsClassName: {
      type: "text",
      label: "Column span (advanced classes)",
      ai: { instructions: aiInstructions.gridColumnSpanAdvanced },
    },
    content: {
      type: "slot",
      disallow: DISALLOWED_NESTED_COMPONENTS,
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
    columnsBase: "1",
    columnsSm: "",
    columnsMd: "",
    columnsLg: "",
    columnsClassName: "",
    content: [],
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
  }: WithPuckProps<GridItemProps>) => {
    const responsiveColumnsClassName = [
      `col-span-${columnsBase}`,
      columnsSm ? `sm:col-span-${columnsSm}` : "",
      columnsMd ? `md:col-span-${columnsMd}` : "",
      columnsLg ? `lg:col-span-${columnsLg}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const mergedColumnsClassName = [responsiveColumnsClassName, columnsClassName]
      .filter(Boolean)
      .join(" ");
    const mergedClassName = [className, puck.isEditing ? "relative" : ""]
      .filter(Boolean)
      .join(" ");

    return (
      <GluestackGridItem
        ref={
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackGridItem>
          >
        }
        className={mergedClassName}
        _extra={{ className: mergedColumnsClassName }}
      >
        {puck.isEditing ? (
          <EditorDragHandle className="pointer-events-auto select-none" />
        ) : null}
        <Content minEmptyHeight={200} />
      </GluestackGridItem>
    );
  },
};

export default GridItem;
