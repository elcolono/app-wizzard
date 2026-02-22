export const SECTION_COMPONENTS = [
  "Hero",
  "AboutSection",
  "ServicesSection",
  "TestimonialsSection",
  "CtaSection",
  "ContactSection",
  "FooterSection",
] as const;

export type SectionComponentName = (typeof SECTION_COMPONENTS)[number];

export type SectionPluginItem = {
  component: SectionComponentName;
  label?: string;
};

export const SECTION_PLUGIN_ITEMS: readonly SectionPluginItem[] = [
  { component: "Hero", label: "Hero" },
  { component: "AboutSection", label: "About Section" },
  { component: "ServicesSection", label: "Services Section" },
  { component: "TestimonialsSection", label: "Testimonials Section" },
  { component: "CtaSection", label: "CTA Section" },
  { component: "ContactSection", label: "Contact Section" },
  { component: "FooterSection", label: "Footer Section" },
];
