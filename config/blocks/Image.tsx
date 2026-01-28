import type { ComponentConfig } from "@puckeditor/core";
import { Image as GluestackImage } from "../../components/ui/image";

export type ImageProps = {
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
    source: { type: "text" },
    alt: { type: "text" },
    size: {
      type: "select",
      options: sizeOptions,
    },
  },
  defaultProps: {
    source:
      "https://gluestack.github.io/public-blog-video-assets/mountains.png",
    alt: "Image",
    size: "md",
  },
  inline: true,
  render: ({ source, alt, size, puck }) => (
    <GluestackImage
      source={source}
      alt={alt}
      size={size}
      ref={puck.dragRef as React.Ref<React.ComponentRef<typeof GluestackImage>>}
    />
  ),
};

export default Image;
