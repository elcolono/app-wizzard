import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import {
  AccordionItem as GluestackAccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionIcon,
  AccordionContent,
  AccordionContentText,
} from "../../components/ui/accordion";
import { aiInstructions } from "../fields/aiInstructions";
import {
  ChevronDownIcon,
  ChevronUpIcon,
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
  ChevronLeftIcon,
  ChevronRightIcon,
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
  "ChevronUpIcon",
  "ChevronDownIcon",
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

const iconMap: Record<IconName, React.ComponentType<any>> = {
  ChevronUpIcon,
  ChevronDownIcon,
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

export type AccordionItemProps = {
  value: string;
  isDisabled: boolean;
  titleText: string;
  contentText: string;
  iconExpanded: IconName;
  iconCollapsed: IconName;
  titleClassName: string;
  contentClassName: string;
  iconClassName: string;
};

const AccordionItem: ComponentConfig<AccordionItemProps> = {
  inline: false,
  fields: {
    value: {
      type: "text",
      label: "Value",
      ai: { instructions: aiInstructions.accordionItemValue },
    },
    isDisabled: {
      type: "radio",
      options: [
        { label: "No", value: false },
        { label: "Yes", value: true },
      ],
    },
    titleText: {
      type: "text",
      label: "Title",
      ai: { instructions: aiInstructions.textContent },
    },
    contentText: {
      type: "textarea",
      label: "Content",
      ai: { instructions: aiInstructions.textContent },
    },
    iconExpanded: {
      type: "select",
      label: "Icon (expanded)",
      options: iconOptions,
      ai: { instructions: aiInstructions.iconName },
    },
    iconCollapsed: {
      type: "select",
      label: "Icon (collapsed)",
      options: iconOptions,
      ai: { instructions: aiInstructions.iconName },
    },
    titleClassName: {
      type: "textarea",
      label: "Title classes",
      ai: { instructions: aiInstructions.className },
    },
    contentClassName: {
      type: "textarea",
      label: "Content classes",
      ai: { instructions: aiInstructions.className },
    },
    iconClassName: {
      type: "textarea",
      label: "Icon classes",
      ai: { instructions: aiInstructions.iconClassName },
    },
  },
  defaultProps: {
    value: "item",
    isDisabled: false,
    titleText: "Accordion title",
    contentText: "Accordion content goes here.",
    iconExpanded: "ChevronUpIcon",
    iconCollapsed: "ChevronDownIcon",
    titleClassName: "",
    contentClassName: "",
    iconClassName: "ml-3",
  },
  render: ({
    value,
    isDisabled,
    titleText,
    contentText,
    iconExpanded,
    iconCollapsed,
    titleClassName,
    contentClassName,
    iconClassName,
    puck,
  }: WithPuckProps<AccordionItemProps>) => {
    const IconExpanded = iconMap[iconExpanded];
    const IconCollapsed = iconMap[iconCollapsed];

    return (
      <GluestackAccordionItem
        value={value}
        isDisabled={isDisabled}
        ref={
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackAccordionItem>
          >
        }
      >
        <AccordionHeader>
          <AccordionTrigger>
            {({ isExpanded }: { isExpanded: boolean }) => (
              <>
                <AccordionTitleText className={titleClassName || undefined}>
                  {titleText}
                </AccordionTitleText>
                <AccordionIcon
                  as={isExpanded ? IconExpanded : IconCollapsed}
                  className={iconClassName || undefined}
                />
              </>
            )}
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <AccordionContentText className={contentClassName || undefined}>
            {contentText}
          </AccordionContentText>
        </AccordionContent>
      </GluestackAccordionItem>
    );
  },
};

export default AccordionItem;
