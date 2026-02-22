export const isValidBuildOp = (op: any): boolean => {
  if (!op || typeof op !== "object" || typeof op.op !== "string") return false;
  switch (op.op) {
    case "reset":
      return true;
    case "updateRoot":
      return op.props && typeof op.props === "object";
    case "add":
      return (
        typeof op.type === "string" &&
        op.type.length > 0 &&
        typeof op.id === "string" &&
        op.id.length > 0 &&
        typeof op.index === "number" &&
        typeof op.zone === "string" &&
        op.zone.length > 0
      );
    case "update":
      return (
        typeof op.id === "string" &&
        op.id.length > 0 &&
        op.props &&
        typeof op.props === "object"
      );
    case "move":
      return (
        typeof op.id === "string" &&
        op.id.length > 0 &&
        typeof op.index === "number" &&
        typeof op.zone === "string" &&
        op.zone.length > 0
      );
    case "delete":
      return typeof op.id === "string" && op.id.length > 0;
    default:
      return false;
  }
};

export function normalizeTransientZone(op: any): string {
  const z = op?.zone;
  if (z != null && typeof z === "string" && z.includes(":")) return z;
  return "root:default-zone";
}
