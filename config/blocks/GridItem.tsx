import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { GridItem as GluestackGridItem } from "../../components/ui/grid";
import { aiInstructions } from "../fields/aiInstructions";
import { CHILD_ONLY_COMPONENTS } from "../fields/slotRules";

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
      disallow: CHILD_ONLY_COMPONENTS,
      ai: { instructions: aiInstructions.slotContent },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    className: "bg-background-50 p-6 rounded-md",
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
    const GridItemDropZone = React.forwardRef<any, any>(
      function GridItemDropZone(props, ref) {
        const mergedClassName = [className, props?.className]
          .filter(Boolean)
          .join(" ");
        const responsiveColumnsClassName = [
          `col-span-${columnsBase}`,
          columnsSm ? `sm:col-span-${columnsSm}` : "",
          columnsMd ? `md:col-span-${columnsMd}` : "",
          columnsLg ? `lg:col-span-${columnsLg}` : "",
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

        const mergedRef = setRefs<React.ComponentRef<typeof GluestackGridItem>>(
          ref,
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackGridItem>
          >
        );

        return (
          <GluestackGridItem
            {...props}
            ref={mergedRef}
            className={mergedClassName}
            _extra={{ className: mergedColumnsClassName }}
          />
        );
      }
    );

    return <Content as={GridItemDropZone} minEmptyHeight={200} />;
  },
};

export default GridItem;
