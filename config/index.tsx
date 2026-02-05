import type { Config } from "@puckeditor/core";
import RootWrapper from "../components/RootWrapper";
import { THEME_DEFAULTS } from "./theme";
import Heading from "./blocks/Heading";
import Text from "./blocks/Text";
import Box from "./blocks/Box";
import Divider from "./blocks/Divider";
import HStack from "./blocks/HStack";
import VStack from "./blocks/VStack";
import Grid from "./blocks/Grid";
import GridItem from "./blocks/GridItem";
import Container from "./blocks/Container";
import Card from "./blocks/Card";
import Button from "./blocks/Button";
import ButtonText from "./blocks/ButtonText";
import ButtonSpinner from "./blocks/ButtonSpinner";
import ButtonIcon from "./blocks/ButtonIcon";
import ButtonGroup from "./blocks/ButtonGroup";
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

export const config: Config = {
  root: {
    defaultProps: {
      primary: THEME_DEFAULTS.primary,
      secondary: THEME_DEFAULTS.secondary,
    },
    fields: {
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
      components: ["Heading", "Text"],
    },
    layout: {
      components: [
        "Box",
        "Divider",
        "HStack",
        "VStack",
        "Grid",
        "GridItem",
        "Container",
      ],
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
        "ButtonText",
        "ButtonSpinner",
        "ButtonIcon",
        "ButtonGroup",
        "Input",
        "TextArea",
      ],
    },
  },
  components: {
    Heading,
    Text,
    Box,
    Divider,
    HStack,
    VStack,
    Grid,
    GridItem,
    Container,
    Card,
    Button,
    ButtonText,
    ButtonSpinner,
    ButtonIcon,
    ButtonGroup,
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
  },
};

export default config;
