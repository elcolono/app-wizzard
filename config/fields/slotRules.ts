export const SLOT_ONLY_CHILDREN: Record<string, string[]> = {
  Button: ["ButtonText", "ButtonSpinner", "ButtonIcon"],
  Badge: ["BadgeText", "BadgeIcon"],
  Grid: ["GridItem"],
};

export const CHILD_ONLY_COMPONENTS = Object.values(SLOT_ONLY_CHILDREN).flat();
