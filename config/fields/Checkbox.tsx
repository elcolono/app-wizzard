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
  render: ({ id, value, onChange, readOnly, field }) => (
    <label
      htmlFor={id}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        lineHeight: "16px",
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => onChange(event.target.checked)}
        disabled={readOnly}
      />
      <span>{field.label ?? label}</span>
    </label>
  ),
});

export default CheckboxField;
