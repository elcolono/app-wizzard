import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Link as GluestackLink } from "../../components/ui/link";
import CheckboxField from "../fields/Checkbox";
import { aiInstructions } from "../fields/aiInstructions";
import { SLOT_ONLY_CHILDREN } from "../fields/slotRules";

export type LinkProps = {
  content: any;
  href: string;
  isExternal: boolean;
  className: string;
};

const Link: ComponentConfig<LinkProps> = {
  inline: true,
  fields: {
    content: {
      type: "slot",
      allow: SLOT_ONLY_CHILDREN.Link,
      ai: { instructions: aiInstructions.slotContent },
    },
    href: {
      type: "text",
      label: "URL",
      ai: { instructions: "Target URL for this link." },
    },
    isExternal: CheckboxField("Open in new tab"),
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    content: [{ type: "LinkText", props: { text: "Link" } }],
    href: "#",
    isExternal: false,
    className: "",
  },
  render: ({
    content: Content,
    href,
    isExternal,
    className,
    puck,
  }: WithPuckProps<LinkProps>) => {
    const preventEditorNavigation = (event: unknown) => {
      const candidate = event as {
        preventDefault?: () => void;
        stopPropagation?: () => void;
      };
      candidate.preventDefault?.();
      candidate.stopPropagation?.();
    };

    const LinkDropZone = React.forwardRef<any, any>(function LinkDropZone(
      props,
      ref
    ) {
      return (
        <GluestackLink
          {...props}
          ref={
            puck.dragRef as unknown as React.Ref<
              React.ComponentRef<typeof GluestackLink>
            >
          }
          href={puck.isEditing ? undefined : href}
          isExternal={puck.isEditing ? false : isExternal}
          onPress={puck.isEditing ? preventEditorNavigation : props.onPress}
          className={className}
        />
      );
    });

    return <Content as={LinkDropZone} />;
  },
};

export default Link;
