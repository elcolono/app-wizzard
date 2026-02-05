import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { BadgeIcon as GluestackBadgeIcon } from "@/components/ui/badge";
import { aiInstructions } from "../fields/aiInstructions";
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

export type BadgeIconProps = {
  iconName: IconName;
  size: "" | "sm" | "md" | "lg";
  className: string;
};

const BadgeIcon: ComponentConfig<BadgeIconProps> = {
  inline: false,
  fields: {
    iconName: {
      type: "select",
      label: "Icon",
      options: iconOptions,
      ai: { instructions: aiInstructions.iconName },
    },
    size: {
      type: "select",
      label: "Icon size",
      options: [
        { label: "Default", value: "" },
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
      ],
      ai: { instructions: aiInstructions.badgeSize },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.iconClassName },
    },
  },
  defaultProps: {
    iconName: "GlobeIcon",
    size: "",
    className: "",
  },
  render: ({
    iconName,
    size,
    className,
    puck,
  }: WithPuckProps<BadgeIconProps>) => {
    const SelectedIcon = iconMap[iconName] as React.ComponentType<any>;
    const iconSize = size ? size : undefined;

    return (
      <GluestackBadgeIcon
        as={SelectedIcon}
        size={iconSize}
        className={className}
        ref={
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackBadgeIcon>
          >
        }
      />
    );
  },
};

export default BadgeIcon;
