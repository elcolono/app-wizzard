export const SLOT_ONLY_CHILDREN: Record<string, string[]> = {
  Button: ["ButtonText", "ButtonSpinner", "ButtonIcon"],
  Badge: ["BadgeText", "BadgeIcon"],
  Alert: ["AlertText", "AlertIcon"],
  Accordion: ["AccordionItem"],
  Grid: ["GridItem"],
};

export const CHILD_ONLY_COMPONENTS = Object.values(SLOT_ONLY_CHILDREN).flat();

export const SECTION_COMPONENTS = [
  "Hero",
  "AboutSection",
  "ServicesSection",
  "TestimonialsSection",
  "CtaSection",
  "ContactSection",
  "FooterSection",
] as const;

export const DISALLOWED_NESTED_COMPONENTS = [
  ...CHILD_ONLY_COMPONENTS,
  ...SECTION_COMPONENTS,
];
