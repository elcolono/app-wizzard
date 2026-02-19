import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Image as GluestackImage } from "../../components/ui/image";
import { aiInstructions } from "../fields/aiInstructions";

export type ImageProps = {
  className: string;
  source: string;
  alt?: string;
  size: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
};

const sizeOptions = [
  { label: "2XS", value: "2xs" },
  { label: "XS", value: "xs" },
  { label: "SM", value: "sm" },
  { label: "MD", value: "md" },
  { label: "LG", value: "lg" },
  { label: "XL", value: "xl" },
  { label: "2XL", value: "2xl" },
  { label: "Full", value: "full" },
];

const Image: ComponentConfig<ImageProps> = {
  fields: {
    source: { type: "text", ai: { instructions: aiInstructions.imageSource } },
    alt: { type: "text", ai: { instructions: aiInstructions.imageAlt } },
    size: {
      type: "select",
      options: sizeOptions,
      ai: { instructions: aiInstructions.imageSize },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    className: "",
    source:
      "https://gluestack.github.io/public-blog-video-assets/mountains.png",
    alt: "Image",
    size: "md",
  },
  inline: true,
  render: ({
    className,
    source,
    alt,
    size,
    puck,
  }: WithPuckProps<ImageProps>) => (
    <GluestackImage
      className={className}
      source={source}
      alt={alt}
      size={size}
      ref={
        puck.dragRef as unknown as React.Ref<
          React.ComponentRef<typeof GluestackImage>
        >
      }
    />
  ),
};

export default Image;
