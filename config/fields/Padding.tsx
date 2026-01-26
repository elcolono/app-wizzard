import { CustomField } from "@puckeditor/core";

const paddingSizeOptions = [
  { label: "None", value: "" },
  { label: "XS", value: "1" },
  { label: "SM", value: "2" },
  { label: "MD", value: "4" },
  { label: "LG", value: "6" },
  { label: "XL", value: "8" },
];

const paddingModeOptions = [
  { label: "All", value: "p" },
  { label: "X", value: "px" },
  { label: "Y", value: "py" },
  { label: "Top", value: "pt" },
  { label: "Right", value: "pr" },
  { label: "Bottom", value: "pb" },
  { label: "Left", value: "pl" },
];

const getPaddingMode = (value?: string) => {
  if (!value) return "p";
  if (value.startsWith("px-")) return "px";
  if (value.startsWith("py-")) return "py";
  if (value.startsWith("pt-")) return "pt";
  if (value.startsWith("pr-")) return "pr";
  if (value.startsWith("pb-")) return "pb";
  if (value.startsWith("pl-")) return "pl";
  return "p";
};

const getPaddingSize = (value?: string) => {
  if (!value) return "";
  const parts = value.split("-");
  return parts.length > 1 ? parts[1] : "";
};

const buildPaddingValue = (mode: string, size: string) =>
  size ? `${mode}-${size}` : "";

const PaddingField = (label: string): CustomField<string> => ({
  type: "custom",
  label,
  render: ({ id, value, onChange, readOnly, field }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontSize: 12,
        lineHeight: "16px",
      }}
    >
      <span id={`${id}-label`}>{field.label ?? label}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          role="group"
          aria-labelledby={`${id}-label`}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 32px)",
            gridAutoRows: "28px",
            gap: 6,
          }}
        >
          {paddingModeOptions.map((option) => {
            const isSelected = getPaddingMode(value) === option.value;
            return (
              <button
                key={option.label}
                type="button"
                title={option.label}
                aria-pressed={isSelected}
                onClick={() =>
                  onChange(buildPaddingValue(option.value, getPaddingSize(value)))
                }
                disabled={readOnly}
                style={{
                  width: 32,
                  height: 28,
                  borderRadius: 6,
                  border: isSelected ? "2px solid #0ea5e9" : "1px solid #e5e7eb",
                  backgroundColor: isSelected ? "#e0f2fe" : "transparent",
                  cursor: readOnly ? "not-allowed" : "pointer",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 10,
                  lineHeight: "12px",
                  color: isSelected ? "#0ea5e9" : "#64748b",
                  fontWeight: 600,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <div
          role="group"
          aria-labelledby={`${id}-label`}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 28px)",
            gridAutoRows: "28px",
            gap: 6,
          }}
        >
          {paddingSizeOptions.map((option) => {
            const isSelected = getPaddingSize(value) === option.value;
            return (
              <button
                key={option.label}
                type="button"
                title={option.label}
                aria-pressed={isSelected}
                onClick={() =>
                  onChange(buildPaddingValue(getPaddingMode(value), option.value))
                }
                disabled={readOnly}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: isSelected ? "2px solid #0ea5e9" : "1px solid #e5e7eb",
                  backgroundColor: isSelected ? "#e0f2fe" : "transparent",
                  cursor: readOnly ? "not-allowed" : "pointer",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 10,
                  lineHeight: "12px",
                  color: isSelected ? "#0ea5e9" : "#64748b",
                  fontWeight: 600,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  ),
});

export default PaddingField;
