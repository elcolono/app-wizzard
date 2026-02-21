export const aiInstructions = {
  className:
    "Add Tailwind classes for this component. Use utilities for spacing, layout, colors, typography, borders, shadows, etc. Important: `text-center` only centers text. To center block elements (e.g., Avatar, Image, Button), use layout utilities such as `self-center`/`mx-auto` for single elements or `flex items-center justify-center` on the parent.",
  backgroundClassName:
    "Tailwind classes for the outer/background wrapper (e.g., bg-*, py-*, etc.).",
  textContent: "Editable text content.",
  slotContent: "Add child components to this slot.",
  imageSource:
    "Use loremflickr placeholder images. URL structure: https://loremflickr.com/[width]/[height]/[search_term] (e.g. https://loremflickr.com/1600/900/yoga). Use width, height and a descriptive English search term.",
  imageAlt:
    "Accessible alt text describing the image (e.g. the topic or search term used for the image).",
  imageSize: "Image size token for width/height.",
  iconName: "Choose an icon from the list.",
  iconClassName: "Tailwind classes for the icon (e.g., stroke-white, text-*).",
  avatarType: "Choose avatar type: standard avatar or icon avatar.",
  avatarFallbackText: "Text shown when no avatar image is available.",
  avatarFallbackClassName:
    "Tailwind classes for the fallback text inside the avatar.",
  avatarImageClassName: "Tailwind classes for the avatar image.",
  avatarBadgeClassName: "Tailwind classes for the avatar badge.",
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
  spacerSize:
    "Vertical spacer size token using Tailwind height classes: xs->h-1 (4px), sm->h-2 (8px), md->h-3 (12px), lg->h-4 (16px), xl->h-5 (20px), 2xl->h-6 (24px), 3xl->h-7 (28px), 4xl->h-8 (32px).",
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
  buttonSpinnerSize: "Spinner size (small or large).",
  buttonSpinnerColor: "Spinner color token or CSS color string.",
  buttonIconSize: "Button icon size token (xs/sm/md/lg/xl) or custom size.",
  buttonGroupSpace: "Spacing between buttons (gap-*).",
  buttonGroupDirection:
    "Direction of the button group (row, column, row-reverse, column-reverse).",
  badgeAction: "Badge color scheme: error, warning, success, info, muted.",
  badgeVariant: "Badge style: solid or outline.",
  badgeSize: "Badge size: sm, md, lg.",
  alertAction: "Alert color scheme: error, warning, success, info, muted.",
  alertVariant: "Alert style: solid or outline.",
  alertIconSize: "Alert icon size: 2xs, xs, sm, md, lg, xl.",
  accordionType: "Accordion: single (one item open) or multiple.",
  accordionVariant: "Accordion style: filled or unfilled.",
  accordionSize: "Accordion size: sm, md, lg.",
  accordionItemValue: "Unique value for this accordion item (e.g. 'a', 'b').",
  inputVariant: "Input style: outline, rounded, or underlined.",
  inputSize: "Input size: sm, md, lg, xl.",
  inputPlaceholder: "Placeholder text when the input is empty.",
  textareaSize: "Textarea size: sm, md, lg, xl.",
  textareaPlaceholder: "Placeholder text when the textarea is empty.",
  headingSize:
    "Tailwind mapping for Heading sizes: 5xl->text-6xl, 4xl->text-5xl, 3xl->text-4xl, 2xl->text-3xl, xl->text-2xl, lg->text-xl, md->text-lg, sm->text-base, xs->text-sm.",
  textSize:
    "Tailwind mapping for Text sizes: 5xl->text-5xl, 4xl->text-4xl, 3xl->text-3xl, 2xl->text-2xl, xl->text-xl, lg->text-lg, md->text-base, sm->text-sm, xs->text-xs.",
};

export const checkboxInstruction = (label: string) =>
  `Toggle ${label.toLowerCase()} styling.`;
