import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { GridItem as GluestackGridItem } from "../../components/ui/grid";
import ClassNameGeneratorField from "../fields/ClassNameGenerator";

export type GridItemProps = {
  className: string;
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

const GridItem: ComponentConfig<GridItemProps> = {
  inline: true,
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

        const mergedRef = setRefs<React.ComponentRef<typeof GluestackGridItem>>(
          ref,
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackGridItem>
          >,
        );

        return (
          <GluestackGridItem
            {...props}
            ref={mergedRef}
            className={mergedClassName}
            _extra={{ className: mergedColumnsClassName }}
          />
        );
      },
    );

    return <Content as={GridItemDropZone} minEmptyHeight={200} />;
  },
};

export default GridItem;
