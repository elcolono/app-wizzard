import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { AvatarGroup as GluestackAvatarGroup } from "@/components/ui/avatar";
import { aiInstructions } from "../fields/aiInstructions";

export type AvatarGroupProps = {
  className: string;
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

const AvatarGroup: ComponentConfig<AvatarGroupProps> = {
  inline: false,
  fields: {
    content: {
      type: "slot",
      allow: ["Avatar"],
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
    content: [
      {
        type: "Avatar",
        props: {
          avatarType: "default",
          size: "md",
          fallbackText: "JD",
          imageSrc:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
          imageAlt: "John Doe",
          showBadge: true,
        },
      },
      {
        type: "Avatar",
        props: {
          avatarType: "default",
          size: "md",
          fallbackText: "JD",
          imageSrc:
            "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          imageAlt: "John Doe",
          showBadge: true,
        },
      },
      {
        type: "Avatar",
        props: {
          avatarType: "default",
          size: "md",
          fallbackText: "JD",
          imageSrc:
            "https://images.unsplash.com/photo-1614289371518-722f2615943d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
          imageAlt: "John Doe",
          showBadge: true,
        },
      },
      {
        type: "Avatar",
        props: {
          avatarType: "default",
          size: "md",
          fallbackText: "JD",
          imageSrc:
            "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          imageAlt: "John Doe",
          showBadge: true,
        },
      },
    ],
  },
  render: ({
    className,
    content: Content,
    puck,
  }: WithPuckProps<AvatarGroupProps>) => {
    const GroupDropZone = React.forwardRef<any, any>(function GroupDropZone(
      props,
      ref
    ) {
      const mergedClassName = [className, props?.className]
        .filter(Boolean)
        .join(" ");

      const mergedRef = setRefs<
        React.ComponentRef<typeof GluestackAvatarGroup>
      >(
        ref,
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackAvatarGroup>
        >
      );

      return (
        <GluestackAvatarGroup
          {...props}
          ref={mergedRef}
          className={mergedClassName}
        />
      );
    });

    return <Content as={GroupDropZone} minEmptyHeight={120} />;
  },
};

export default AvatarGroup;
