export const SLOT_ONLY_CHILDREN: Record<string, string[]> = {
  Button: ["ButtonText", "ButtonSpinner", "ButtonIcon"],
  Grid: ["GridItem"],
};

export const CHILD_ONLY_COMPONENTS = Object.values(SLOT_ONLY_CHILDREN).flat();
