export const SECTION_COMPONENTS = [
  "Hero",
  "HeroSimpleCentered",
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
  | "heroCentered"
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

export type SectionCategoryId =
  | "hero"
  | "about"
  | "services"
  | "testimonials"
  | "cta"
  | "contact"
  | "footer";

export type SectionCategory = {
  id: SectionCategoryId;
  label: string;
  defaultExpanded?: boolean;
  items: readonly SectionPluginItem[];
};

export const SECTION_CATEGORIES: readonly SectionCategory[] = [
  {
    id: "hero",
    label: "Hero",
    defaultExpanded: true,
    items: [
      {
        id: "hero-default",
        component: "Hero",
        label: "Hero",
        variant: "Default",
        preview: { layout: "hero" },
      },
      {
        id: "hero-simple-centered",
        component: "HeroSimpleCentered",
        label: "Hero",
        variant: "Simple centered",
        preview: { layout: "heroCentered" },
      },
    ],
  },
  {
    id: "about",
    label: "About",
    items: [
      {
        id: "about-default",
        component: "AboutSection",
        label: "About Section",
        preview: { layout: "aboutSplit" },
      },
    ],
  },
  {
    id: "services",
    label: "Services",
    items: [
      {
        id: "services-default",
        component: "ServicesSection",
        label: "Services Section",
        preview: { layout: "servicesGrid" },
      },
    ],
  },
  {
    id: "testimonials",
    label: "Testimonials",
    items: [
      {
        id: "testimonials-default",
        component: "TestimonialsSection",
        label: "Testimonials Section",
        preview: { layout: "testimonialsGrid" },
      },
    ],
  },
  {
    id: "cta",
    label: "CTA",
    items: [
      {
        id: "cta-default",
        component: "CtaSection",
        label: "CTA Section",
        preview: { layout: "ctaBox" },
      },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    items: [
      {
        id: "contact-default",
        component: "ContactSection",
        label: "Contact Section",
        preview: { layout: "contactSplit" },
      },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    items: [
      {
        id: "footer-default",
        component: "FooterSection",
        label: "Footer Section",
        preview: { layout: "footerSplit" },
      },
    ],
  },
];

export const SECTION_PLUGIN_ITEMS: readonly SectionPluginItem[] =
  SECTION_CATEGORIES.flatMap((category) => category.items);
