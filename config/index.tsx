import type { Config } from "@puckeditor/core";
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
import Center from "./blocks/Center";
import Image from "./blocks/Image";
import Progress from "./blocks/Progress";
import Spinner from "./blocks/Spinner";
import Alert from "./blocks/Alert";
import Icon from "./blocks/Icon";

export const config: Config = {
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
        "Card",
      ],
    },
    feedback: {
      components: ["Progress", "Spinner", "Alert"],
    },
    media: {
      components: ["Image", "Icon"],
    },
    forms: {
      components: ["Button", "ButtonText"],
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
    Center,
    Image,
    Progress,
    Spinner,
    Alert,
    Icon,
  },
};

export default config;
