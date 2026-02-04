import React, { type ComponentType } from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { aiInstructions } from "../fields/aiInstructions";
import {
  Icon as GluestackIcon,
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
} from "../../components/ui/icon";

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

export type IconProps = {
  className: string;
  icon: IconName;
  size: "2xs" | "xs" | "sm" | "md" | "lg" | "xl";
};

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

const sizeOptions = [
  { label: "2XS", value: "2xs" },
  { label: "XS", value: "xs" },
  { label: "SM", value: "sm" },
  { label: "MD", value: "md" },
  { label: "LG", value: "lg" },
  { label: "XL", value: "xl" },
];

const formatLabel = (value: string) =>
  value.replace(/Icon$/, "").replace(/([a-z])([A-Z])/g, "$1 $2");

const iconOptions = iconNames.map((name) => ({
  label: formatLabel(name),
  value: name,
}));

const IconBlock: ComponentConfig<IconProps> = {
  inline: false,
  fields: {
    icon: {
      type: "select",
      options: iconOptions,
      ai: { instructions: aiInstructions.iconName },
    },
    size: {
      type: "select",
      options: sizeOptions,
      ai: { instructions: aiInstructions.sizeToken },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    className: "text-typography-500",
    icon: "AddIcon",
    size: "md",
  },
  render: ({ className, icon, size, puck }: WithPuckProps<IconProps>) => {
    const SelectedIcon = iconMap[icon] as ComponentType<any>;

    return (
      <GluestackIcon
        as={SelectedIcon}
        className={className}
        size={size}
        ref={
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackIcon>
          >
        }
      />
    );
  },
};

export default IconBlock;
