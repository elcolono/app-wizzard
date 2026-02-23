import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Image as GluestackImage } from "../../components/ui/image";
import { aiInstructions } from "../fields/aiInstructions";

export type ImageProps = {
  className: string;
  source: string;
  alt?: string;
  size: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  widthClass: "" | "w-full";
  heightClass: "" | "h-auto" | "h-full";
  aspectRatioClass:
    | ""
    | "aspect-square"
    | "aspect-video"
    | "aspect-[4/3]"
    | "aspect-[3/2]"
    | "aspect-[16/10]";
  borderRadiusClass:
    | ""
    | "rounded-sm"
    | "rounded"
    | "rounded-md"
    | "rounded-lg"
    | "rounded-xl"
    | "rounded-2xl"
    | "rounded-3xl"
    | "rounded-full";
  objectFitClass:
    | ""
    | "object-cover"
    | "object-contain"
    | "object-fill"
    | "object-none"
    | "object-scale-down";
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
    widthClass: {
      type: "select",
      label: "Width",
      options: [
        { label: "Default", value: "" },
        { label: "Full (w-full)", value: "w-full" },
      ],
      ai: { instructions: "Select width utility class for the image." },
    },
    heightClass: {
      type: "select",
      label: "Height",
      options: [
        { label: "Default", value: "" },
        { label: "Auto (h-auto)", value: "h-auto" },
        { label: "Full (h-full)", value: "h-full" },
      ],
      ai: { instructions: "Select height utility class for the image." },
    },
    aspectRatioClass: {
      type: "select",
      label: "Aspect ratio",
      options: [
        { label: "Default", value: "" },
        { label: "Square (aspect-square)", value: "aspect-square" },
        { label: "Video (aspect-video)", value: "aspect-video" },
        { label: "4:3 (aspect-[4/3])", value: "aspect-[4/3]" },
        { label: "3:2 (aspect-[3/2])", value: "aspect-[3/2]" },
        { label: "16:10 (aspect-[16/10])", value: "aspect-[16/10]" },
      ],
      ai: { instructions: "Select aspect ratio utility class for the image." },
    },
    borderRadiusClass: {
      type: "select",
      label: "Border radius",
      options: [
        { label: "Default", value: "" },
        { label: "SM", value: "rounded-sm" },
        { label: "Base", value: "rounded" },
        { label: "MD", value: "rounded-md" },
        { label: "LG", value: "rounded-lg" },
        { label: "XL", value: "rounded-xl" },
        { label: "2XL", value: "rounded-2xl" },
        { label: "3XL", value: "rounded-3xl" },
        { label: "Full", value: "rounded-full" },
      ],
      ai: { instructions: "Select border radius utility class for the image." },
    },
    objectFitClass: {
      type: "select",
      label: "Object fit",
      options: [
        { label: "Default", value: "" },
        { label: "Cover", value: "object-cover" },
        { label: "Contain", value: "object-contain" },
        { label: "Fill", value: "object-fill" },
        { label: "None", value: "object-none" },
        { label: "Scale down", value: "object-scale-down" },
      ],
      ai: { instructions: "Select object-fit utility class for the image." },
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
    widthClass: "",
    heightClass: "",
    aspectRatioClass: "",
    borderRadiusClass: "",
    objectFitClass: "",
  },
  inline: true,
  render: ({
    className,
    source,
    alt,
    size,
    widthClass,
    heightClass,
    aspectRatioClass,
    borderRadiusClass,
    objectFitClass,
    puck,
  }: WithPuckProps<ImageProps>) => {
    const generatedClassName = [
      widthClass,
      heightClass,
      aspectRatioClass,
      borderRadiusClass,
      objectFitClass,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <GluestackImage
        className={generatedClassName}
        source={source}
        alt={alt}
        size={size}
        ref={
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackImage>
          >
        }
      />
    );
  },
};

export default Image;
