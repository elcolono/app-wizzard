export const aiInstructions = {
  className:
    "Add Tailwind classes for this component. Use utilities for spacing, layout, colors, typography, borders, shadows, etc.",
  backgroundClassName:
    "Tailwind classes for the outer/background wrapper (e.g., bg-*, py-*, etc.).",
  textContent: "Editable text content.",
  slotContent: "Add child components to this slot.",
  imageSource: "Image URL or path for the image source.",
  imageAlt: "Accessible alt text for the image.",
  imageSize: "Image size token for width/height.",
  iconName: "Choose an icon from the list.",
  alignment:
    "Text alignment using Tailwind: text-left, text-center, text-right, text-justify.",
  maxWidth:
    "Select max width size. Maps to Tailwind max-w-* utilities (e.g., max-w-6xl, max-w-full).",
  gridColumns:
    "Select grid columns. Maps to Tailwind grid-cols-* utilities. Responsive variants add sm:/md:/lg: prefixes.",
  gridColumnsAdvanced:
    "Advanced Tailwind classes for grid columns (e.g., grid-cols-*, md:grid-cols-*).",
  gridColumnSpan:
    "Select column span. Maps to Tailwind col-span-* utilities. Responsive variants add sm:/md:/lg: prefixes.",
  gridColumnSpanAdvanced:
    "Advanced Tailwind classes for column span (e.g., col-span-*, md:col-span-*).",
  spacing:
    "Spacing size token; maps to Tailwind gap-* utilities for stack spacing.",
  progressValue: "Progress value from 0 to 100.",
  spinnerColor: "Spinner color token or CSS color string.",
  orientation: "Orientation of the component (horizontal or vertical).",
  variant: "Visual variant of the component.",
  action: "Semantic action/style variant (e.g., error, success).",
  sizeToken:
    "Select size token for the component. Mapping is defined in the UI component styles.",
  buttonVariant: "Button variant (solid/outline/link).",
  buttonAction: "Button action style (primary/secondary/positive/negative).",
  buttonSize: "Button size token (xs/sm/md/lg).",
  headingSize:
    "Tailwind mapping for Heading sizes: 5xl->text-6xl, 4xl->text-5xl, 3xl->text-4xl, 2xl->text-3xl, xl->text-2xl, lg->text-xl, md->text-lg, sm->text-base, xs->text-sm.",
  textSize:
    "Tailwind mapping for Text sizes: 5xl->text-5xl, 4xl->text-4xl, 3xl->text-3xl, 2xl->text-2xl, xl->text-xl, lg->text-lg, md->text-base, sm->text-sm, xs->text-xs.",
};

export const checkboxInstruction = (label: string) =>
  `Toggle ${label.toLowerCase()} styling.`;
