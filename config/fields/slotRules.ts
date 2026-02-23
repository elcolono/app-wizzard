import { SECTION_COMPONENTS } from "../sections/registry";

export const SLOT_ONLY_CHILDREN: Record<string, string[]> = {
  Button: ["ButtonText", "ButtonSpinner", "ButtonIcon"],
  Link: ["LinkText"],
  Badge: ["BadgeText", "BadgeIcon"],
  Alert: ["AlertText", "AlertIcon"],
  Accordion: ["AccordionItem"],
  Grid: ["GridItem"],
};

export const CHILD_ONLY_COMPONENTS = Object.values(SLOT_ONLY_CHILDREN).flat();

export const NON_NESTABLE_COMPONENTS = [
  "Container",
  ...SECTION_COMPONENTS,
] as const;

export const DISALLOWED_NESTED_COMPONENTS = [
  ...CHILD_ONLY_COMPONENTS,
  ...NON_NESTABLE_COMPONENTS,
];
