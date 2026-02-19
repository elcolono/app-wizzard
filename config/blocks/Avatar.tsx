import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Icon as GluestackIcon } from "@/components/ui/icon";
import { aiInstructions } from "../fields/aiInstructions";
import CheckboxField from "../fields/Checkbox";
import {
  AddIcon,
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  AtSignIcon,
  BellIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  CircleIcon,
  ClockIcon,
  CloseCircleIcon,
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FavouriteIcon,
  GlobeIcon,
  GripVerticalIcon,
  HelpCircleIcon,
  InfoIcon,
  LinkIcon,
  LoaderIcon,
  LockIcon,
  MailIcon,
  MenuIcon,
  MessageCircleIcon,
  MoonIcon,
  PaperclipIcon,
  PhoneIcon,
  PlayIcon,
  RemoveIcon,
  Repeat1Icon,
  RepeatIcon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  SlashIcon,
  StarIcon,
  SunIcon,
  ThreeDotsIcon,
  TrashIcon,
  UnlockIcon,
} from "@/components/ui/icon";

const iconNames = [
  "AddIcon",
  "AlertCircleIcon",
  "ArrowUpIcon",
  "ArrowDownIcon",
  "ArrowRightIcon",
  "ArrowLeftIcon",
  "AtSignIcon",
  "BellIcon",
  "CalendarDaysIcon",
  "CheckIcon",
  "CheckCircleIcon",
  "ChevronUpIcon",
  "ChevronDownIcon",
  "ChevronLeftIcon",
  "ChevronRightIcon",
  "ChevronsLeftIcon",
  "ChevronsRightIcon",
  "ChevronsUpDownIcon",
  "CircleIcon",
  "ClockIcon",
  "CloseIcon",
  "CloseCircleIcon",
  "CopyIcon",
  "DownloadIcon",
  "EditIcon",
  "EyeIcon",
  "EyeOffIcon",
  "FavouriteIcon",
  "GlobeIcon",
  "GripVerticalIcon",
  "HelpCircleIcon",
  "InfoIcon",
  "LinkIcon",
  "ExternalLinkIcon",
  "LoaderIcon",
  "LockIcon",
  "MailIcon",
  "MenuIcon",
  "MessageCircleIcon",
  "MoonIcon",
  "PaperclipIcon",
  "PhoneIcon",
  "PlayIcon",
  "RemoveIcon",
  "RepeatIcon",
  "Repeat1Icon",
  "SearchIcon",
  "SettingsIcon",
  "ShareIcon",
  "SlashIcon",
  "StarIcon",
  "SunIcon",
  "ThreeDotsIcon",
  "TrashIcon",
  "UnlockIcon",
] as const;

type IconName = (typeof iconNames)[number];

const iconMap: Record<IconName, unknown> = {
  AddIcon,
  AlertCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AtSignIcon,
  BellIcon,
  CalendarDaysIcon,
  CheckIcon,
  CheckCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  CircleIcon,
  ClockIcon,
  CloseIcon,
  CloseCircleIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  FavouriteIcon,
  GlobeIcon,
  GripVerticalIcon,
  HelpCircleIcon,
  InfoIcon,
  LinkIcon,
  ExternalLinkIcon,
  LoaderIcon,
  LockIcon,
  MailIcon,
  MenuIcon,
  MessageCircleIcon,
  MoonIcon,
  PaperclipIcon,
  PhoneIcon,
  PlayIcon,
  RemoveIcon,
  RepeatIcon,
  Repeat1Icon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  SlashIcon,
  StarIcon,
  SunIcon,
  ThreeDotsIcon,
  TrashIcon,
  UnlockIcon,
};

const iconOptions = iconNames.map((name) => ({
  label: name.replace(/Icon$/, "").replace(/([a-z])([A-Z])/g, "$1 $2"),
  value: name,
}));

const avatarSizeOptions = [
  { label: "XS", value: "xs" },
  { label: "SM", value: "sm" },
  { label: "MD", value: "md" },
  { label: "LG", value: "lg" },
  { label: "XL", value: "xl" },
  { label: "2XL", value: "2xl" },
];

const iconSizeOptions = [
  { label: "2XS", value: "2xs" },
  { label: "XS", value: "xs" },
  { label: "SM", value: "sm" },
  { label: "MD", value: "md" },
  { label: "LG", value: "lg" },
  { label: "XL", value: "xl" },
];

export type AvatarProps = {
  avatarType: "default" | "icon";
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  fallbackText: string;
  imageSrc: string;
  imageAlt: string;
  showBadge: boolean;
  badgeClassName: string;
  imageClassName: string;
  fallbackClassName: string;
  iconName: IconName;
  iconSize: "2xs" | "xs" | "sm" | "md" | "lg" | "xl";
  iconClassName: string;
  className: string;
};

const AvatarBlock: ComponentConfig<AvatarProps> = {
  inline: true,
  resolveFields: (data) => {
    const avatarType = data.props.avatarType ?? "default";
    const baseFields = {
      avatarType: {
        type: "radio",
        label: "Type",
        options: [
          { label: "Avatar", value: "default" },
          { label: "Icon avatar", value: "icon" },
        ],
        ai: { instructions: aiInstructions.avatarType },
      },
      size: {
        type: "select",
        label: "Size",
        options: avatarSizeOptions,
        ai: { instructions: aiInstructions.sizeToken },
      },
    };

    if (avatarType === "icon") {
      return {
        ...baseFields,
        iconName: {
          type: "select",
          label: "Icon",
          options: iconOptions,
          ai: { instructions: aiInstructions.iconName },
        },
        iconSize: {
          type: "select",
          label: "Icon size",
          options: iconSizeOptions,
          ai: { instructions: aiInstructions.sizeToken },
        },
        iconClassName: {
          type: "textarea",
          label: "Icon classes",
          ai: { instructions: aiInstructions.iconClassName },
        },
        className: {
          type: "textarea",
          label: "Classes",
          ai: { instructions: aiInstructions.className },
        },
      } as any;
    }

    return {
      ...baseFields,
      fallbackText: {
        type: "text",
        label: "Fallback text",
        ai: { instructions: aiInstructions.avatarFallbackText },
      },
      imageSrc: {
        type: "text",
        label: "Image source",
        ai: { instructions: aiInstructions.imageSource },
      },
      imageAlt: {
        type: "text",
        label: "Image alt",
        ai: { instructions: aiInstructions.imageAlt },
      },
      showBadge: CheckboxField("Show badge"),
      fallbackClassName: {
        type: "textarea",
        label: "Fallback text classes",
        ai: { instructions: aiInstructions.avatarFallbackClassName },
      },
      imageClassName: {
        type: "textarea",
        label: "Image classes",
        ai: { instructions: aiInstructions.avatarImageClassName },
      },
      badgeClassName: {
        type: "textarea",
        label: "Badge classes",
        ai: { instructions: aiInstructions.avatarBadgeClassName },
      },
      className: {
        type: "textarea",
        label: "Classes",
        ai: { instructions: aiInstructions.className },
      },
    } as any;
  },
  defaultProps: {
    avatarType: "default",
    size: "md",
    fallbackText: "AB",
    imageSrc:
      "https://gluestack.github.io/public-blog-video-assets/mountains.png",
    imageAlt: "Avatar",
    showBadge: false,
    badgeClassName: "",
    imageClassName: "",
    fallbackClassName: "",
    iconName: "InfoIcon",
    iconSize: "lg",
    iconClassName: "stroke-white",
    className: "",
  },
  render: ({
    avatarType,
    size,
    fallbackText,
    imageSrc,
    imageAlt,
    showBadge,
    badgeClassName,
    imageClassName,
    fallbackClassName,
    iconName,
    iconSize,
    iconClassName,
    className,
    puck,
  }: WithPuckProps<AvatarProps>) => {
    if (avatarType === "icon") {
      const SelectedIcon = iconMap[iconName] as React.ComponentType<any>;

      return (
        <Avatar
          size={size}
          className={className}
          ref={
            puck.dragRef as unknown as React.Ref<
              React.ComponentRef<typeof Avatar>
            >
          }
        >
          <GluestackIcon
            as={SelectedIcon}
            size={iconSize}
            className={iconClassName}
          />
        </Avatar>
      );
    }

    return (
      <Avatar
        size={size}
        className={className}
        ref={
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof Avatar>
          >
        }
      >
        <AvatarFallbackText className={fallbackClassName}>
          {fallbackText}
        </AvatarFallbackText>
        {imageSrc ? (
          <AvatarImage
            source={{ uri: imageSrc }}
            accessibilityLabel={imageAlt}
            className={imageClassName}
          />
        ) : null}
        {showBadge ? <AvatarBadge className={badgeClassName} /> : null}
      </Avatar>
    );
  },
};

export default AvatarBlock;
