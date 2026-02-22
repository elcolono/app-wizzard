import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import React from "react";
import { Grid as GluestackGrid } from "../../components/ui/grid";
import { aiInstructions } from "../fields/aiInstructions";
import { SLOT_ONLY_CHILDREN } from "../fields/slotRules";

export type GridProps = {
  __createdBy?: string;
  className: string;
  gap:
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "8"
  | "10"
  | "12"
  | "16";
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

const setRefs =
  <T,>(...refs: Array<React.Ref<T> | undefined>) =>
  (value: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
        return;
      }

      if (ref && typeof ref === "object" && "current" in ref) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };

function isDefaultTemplateGridItems(content: unknown): boolean {
  if (!Array.isArray(content) || content.length === 0) return false;
  return content.every((item) => {
    if (!item || typeof item !== "object") return false;
    if ((item as any).type !== "GridItem") return false;
    const props = ((item as any).props ?? {}) as Record<string, unknown>;
    const className = typeof props.className === "string" ? props.className : "";
    const columnsClassName =
      typeof props.columnsClassName === "string" ? props.columnsClassName : "";
    const hasTemplateClass =
      className === "bg-background-50 p-3 rounded-md text-center";
    const hasTemplateColumnClass = columnsClassName === "col-span-1";
    const contentItems = Array.isArray(props.content) ? props.content : [];
    return hasTemplateClass && hasTemplateColumnClass && contentItems.length === 0;
  });
}

const Grid: ComponentConfig<GridProps> = {
  inline: false,
  resolveData(data) {
    const props = (data?.props ?? {}) as Record<string, unknown>;
    if (props.__createdBy !== "ai") return data;
    if (!isDefaultTemplateGridItems(props.content)) return data;
    return {
      ...data,
      props: {
        ...props,
        content: [],
      },
    };
  },
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
    gap: {
      type: "select",
      label: "Gap",
      options: [
        { label: "0", value: "0" },
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
        { label: "5", value: "5" },
        { label: "6", value: "6" },
        { label: "8", value: "8" },
        { label: "10", value: "10" },
        { label: "12", value: "12" },
        { label: "16", value: "16" },
      ],
      ai: { instructions: aiInstructions.spacing },
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
    className: "",
    gap: "4",
    columnsMobile: "3",
    columnsTablet: "",
    columnsDesktop: "",
    columnsClassName: "",
    content: [],
  },
  render: ({
    className,
    gap,
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
      const mergedClassName = [`gap-${gap}`, className, props?.className]
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
      const mergedRef = setRefs<React.ComponentRef<typeof GluestackGrid>>(
        ref,
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackGrid>
        >
      );

      return (
        <GluestackGrid
          {...props}
          ref={mergedRef}
          className={mergedClassName}
          _extra={{ className: mergedColumnsClassName }}
        />
      );
    });

    return <Content as={GridDropZone} />;
  },
};

export default Grid;
