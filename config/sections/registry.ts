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

export type SectionPreviewLayout =
  | "hero"
  | "aboutSplit"
  | "servicesGrid"
  | "testimonialsGrid"
  | "ctaBox"
  | "contactSplit"
  | "footerSplit";

export type SectionPreviewDefinition = {
  layout: SectionPreviewLayout;
};

export type SectionPluginItem = {
  id: string;
  component: SectionComponentName;
  label?: string;
  variant?: string;
  preview: SectionPreviewDefinition;
};

export const SECTION_PLUGIN_ITEMS: readonly SectionPluginItem[] = [
  {
    id: "hero-default",
    component: "Hero",
    label: "Hero",
    variant: "Default",
    preview: { layout: "hero" },
  },
  {
    id: "about-default",
    component: "AboutSection",
    label: "About Section",
    preview: { layout: "aboutSplit" },
  },
  {
    id: "services-default",
    component: "ServicesSection",
    label: "Services Section",
    preview: { layout: "servicesGrid" },
  },
  {
    id: "testimonials-default",
    component: "TestimonialsSection",
    label: "Testimonials Section",
    preview: { layout: "testimonialsGrid" },
  },
  {
    id: "cta-default",
    component: "CtaSection",
    label: "CTA Section",
    preview: { layout: "ctaBox" },
  },
  {
    id: "contact-default",
    component: "ContactSection",
    label: "Contact Section",
    preview: { layout: "contactSplit" },
  },
  {
    id: "footer-default",
    component: "FooterSection",
    label: "Footer Section",
    preview: { layout: "footerSplit" },
  },
];
