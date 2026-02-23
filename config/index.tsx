import type { Config } from "@puckeditor/core";
import RootWrapper from "../components/RootWrapper";
import { THEME_DEFAULTS } from "./theme";
import Heading from "./blocks/Heading";
import Text from "./blocks/Text";
import Box from "./blocks/Box";
import Divider from "./blocks/Divider";
import HStack from "./blocks/HStack";
import VStack from "./blocks/VStack";
import Spacer from "./blocks/Spacer";
import Grid from "./blocks/Grid";
import GridItem from "./blocks/GridItem";
import Container from "./blocks/Container";
import Card from "./blocks/Card";
import Button from "./blocks/Button";
import DarkModeButton from "./blocks/DarkModeButton";
import ButtonText from "./blocks/ButtonText";
import ButtonSpinner from "./blocks/ButtonSpinner";
import ButtonIcon from "./blocks/ButtonIcon";
import ButtonGroup from "./blocks/ButtonGroup";
import Link from "./blocks/Link";
import LinkText from "./blocks/LinkText";
import Badge from "./blocks/Badge";
import BadgeText from "./blocks/BadgeText";
import BadgeIcon from "./blocks/BadgeIcon";
import Center from "./blocks/Center";
import Image from "./blocks/Image";
import Progress from "./blocks/Progress";
import Spinner from "./blocks/Spinner";
import Alert from "./blocks/Alert";
import AlertText from "./blocks/AlertText";
import AlertIcon from "./blocks/AlertIcon";
import Accordion from "./blocks/Accordion";
import AccordionItem from "./blocks/AccordionItem";
import Input from "./blocks/Input";
import TextArea from "./blocks/TextArea";
import Icon from "./blocks/Icon";
import Avatar from "./blocks/Avatar";
import AvatarGroup from "./blocks/AvatarGroup";
import Hero from "./blocks/Hero";
import HeroSimpleCentered from "./blocks/HeroSimpleCentered";
import AboutSection from "./blocks/AboutSection";
import ServicesSection from "./blocks/ServicesSection";
import TestimonialsSection from "./blocks/TestimonialsSection";
import CtaSection from "./blocks/CtaSection";
import ContactSection from "./blocks/ContactSection";
import FooterSection from "./blocks/FooterSection";
import TeamSectionLargeImages from "./blocks/TeamSectionLargeImages";
import TeamSectionSmallImages from "./blocks/TeamSectionSmallImages";
import { SECTION_COMPONENTS } from "./sections/registry";

export const config: Config = {
  root: {
    defaultProps: {
      pageTitle: "Untitled Page",
      primary: THEME_DEFAULTS.primary,
      secondary: THEME_DEFAULTS.secondary,
    },
    fields: {
      pageTitle: {
        label: "Page title (head)",
        type: "text",
      },
      primary: {
        label: "Primary color (hex)",
        type: "text",
      },
      secondary: {
        label: "Secondary color (hex)",
        type: "text",
      },
    },
    render: (props) => {
      const { children, primary, secondary } = props as {
        children: React.ReactNode;
        pageTitle?: string;
        primary?: string;
        secondary?: string;
      };
      return (
        <RootWrapper primary={primary} secondary={secondary}>
          {children}
        </RootWrapper>
      );
    },
  },
  categories: {
    typography: {
      components: ["Heading", "Text", "LinkText"],
    },
    layout: {
      components: [
        "Box",
        "Divider",
        "HStack",
        "VStack",
        "Spacer",
        "Grid",
        "GridItem",
        "Container",
      ],
    },
    section: {
      components: [...SECTION_COMPONENTS],
      visible: false,
    },
    dataDisplay: {
      components: [
        "Card",
        "Badge",
        "BadgeText",
        "BadgeIcon",
        "Accordion",
        "AccordionItem",
      ],
    },
    feedback: {
      components: ["Progress", "Spinner", "Alert", "AlertText", "AlertIcon"],
    },
    media: {
      components: ["Image", "Icon", "Avatar", "AvatarGroup"],
    },
    form: {
      components: [
        "Button",
        "DarkModeButton",
        "ButtonText",
        "ButtonSpinner",
        "ButtonIcon",
        "ButtonGroup",
        "Link",
        "Input",
        "TextArea",
      ],
    },
  },
  components: (() => {
    const base = {
      Heading,
      Text,
      Box,
      Divider,
      HStack,
      VStack,
      Spacer,
      Grid,
      GridItem,
      Container,
      Card,
      Button,
      DarkModeButton,
      ButtonText,
      ButtonSpinner,
      ButtonIcon,
      ButtonGroup,
      Link,
      LinkText,
      Badge,
      BadgeText,
      BadgeIcon,
      Center,
      Image,
      Progress,
      Spinner,
      Alert,
      AlertText,
      AlertIcon,
      Accordion,
      AccordionItem,
      Input,
      TextArea,
      Icon,
      Avatar,
      AvatarGroup,
      Hero,
      HeroSimpleCentered,
      AboutSection,
      ServicesSection,
      TestimonialsSection,
      TeamSectionLargeImages,
      TeamSectionSmallImages,
      CtaSection,
      ContactSection,
      FooterSection,
    } as const;

    const wrap = (component: any) => {
      if (!component) return component;
      const existing = component.resolvePermissions;
      return {
        ...component,
        resolvePermissions: async (data: any, params: any) => {
          const id = data?.id ?? data?.props?.id;
          const basePerms = existing
            ? await existing(data, params)
            : params.permissions;
          if (typeof id !== "string") return basePerms;
          if (
            id.startsWith("layout-header-") ||
            id.startsWith("layout-footer-")
          ) {
            return {
              ...basePerms,
              drag: false,
              delete: false,
              duplicate: false,
              edit: false,
              insert: false,
            };
          }
          return basePerms;
        },
      };
    };

    return Object.fromEntries(
      Object.entries(base).map(([key, component]) => [key, wrap(component)])
    );
  })(),
};

export default config;
