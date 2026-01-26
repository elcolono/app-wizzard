import { CustomField } from "@puckeditor/core";

const alignmentOptions = [
  { label: "Top Left", value: "flex items-start justify-start" },
  { label: "Top Center", value: "flex items-start justify-center" },
  { label: "Top Right", value: "flex items-start justify-end" },
  { label: "Center Left", value: "flex items-center justify-start" },
  { label: "Center", value: "flex items-center justify-center" },
  { label: "Center Right", value: "flex items-center justify-end" },
  { label: "Bottom Left", value: "flex items-end justify-start" },
  { label: "Bottom Center", value: "flex items-end justify-center" },
  { label: "Bottom Right", value: "flex items-end justify-end" },
];

const AlignmentField = (label: string): CustomField<string> => ({
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
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 28px)",
          gridAutoRows: "28px",
          gap: 6,
        }}
      >
        {alignmentOptions.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.label}
              type="button"
              title={option.label}
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
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
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: isSelected ? "#0ea5e9" : "#94a3b8",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  ),
});

export default AlignmentField;
