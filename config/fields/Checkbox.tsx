import { CustomField } from "@puckeditor/core";
import { checkboxInstruction } from "./aiInstructions";

const CheckboxField = (label: string): CustomField<boolean> => ({
  type: "custom",
  ai: {
    instructions: checkboxInstruction(label),
    schema: {
      type: "boolean",
    },
  },
  label,
  render: ({ id, value, onChange, readOnly, field }) => {
    const checked = Boolean(value);

    return (
      <label
        htmlFor={id}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
          lineHeight: "16px",
          cursor: readOnly ? "not-allowed" : "pointer",
          userSelect: "none",
        }}
      >
        <span>{field.label ?? label}</span>
        <span
          style={{
            position: "relative",
            width: 34,
            height: 20,
            borderRadius: 999,
            backgroundColor: checked ? "#0ea5e9" : "#e5e7eb",
            transition: "background-color 150ms ease",
            border: "1px solid #d1d5db",
            display: "inline-flex",
            alignItems: "center",
            padding: 2,
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: "#ffffff",
              transform: checked ? "translateX(14px)" : "translateX(0)",
              transition: "transform 150ms ease",
              boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            }}
          />
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            disabled={readOnly}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              margin: 0,
              cursor: readOnly ? "not-allowed" : "pointer",
            }}
          />
        </span>
      </label>
    );
  },
});

export default CheckboxField;
