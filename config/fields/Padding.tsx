import React from "react";
import { CustomField } from "@puckeditor/core";

const paddingSizeScale = [
  "",
  "0",
  "0.5",
  "1",
  "1.5",
  "2",
  "2.5",
  "3",
  "3.5",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "20",
  "24",
  "28",
  "32",
  "36",
  "40",
  "44",
  "48",
  "52",
  "56",
  "60",
  "64",
  "72",
  "80",
  "96",
] as const;

type PaddingSide = "top" | "right" | "bottom" | "left";
type PaddingTarget = PaddingSide | "all";

type PaddingSides = Record<PaddingSide, string>;

const emptySides = (): PaddingSides => ({
  top: "",
  right: "",
  bottom: "",
  left: "",
});

const parsePaddingValue = (value?: string): PaddingSides => {
  const sides = emptySides();
  if (!value) return sides;
  const tokens = value.split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    if (token.startsWith("p-")) {
      const size = token.slice(2);
      sides.top = size;
      sides.right = size;
      sides.bottom = size;
      sides.left = size;
      continue;
    }
    if (token.startsWith("px-")) {
      const size = token.slice(3);
      sides.left = size;
      sides.right = size;
      continue;
    }
    if (token.startsWith("py-")) {
      const size = token.slice(3);
      sides.top = size;
      sides.bottom = size;
      continue;
    }
    if (token.startsWith("pt-")) {
      sides.top = token.slice(3);
      continue;
    }
    if (token.startsWith("pr-")) {
      sides.right = token.slice(3);
      continue;
    }
    if (token.startsWith("pb-")) {
      sides.bottom = token.slice(3);
      continue;
    }
    if (token.startsWith("pl-")) {
      sides.left = token.slice(3);
    }
  }

  return sides;
};

const buildPaddingClasses = (sides: PaddingSides) => {
  const { top, right, bottom, left } = sides;
  const allEqual =
    top !== "" && top === right && top === bottom && top === left;

  if (allEqual) {
    return `p-${top}`;
  }

  const classes = [];
  if (top !== "") classes.push(`pt-${top}`);
  if (right !== "") classes.push(`pr-${right}`);
  if (bottom !== "") classes.push(`pb-${bottom}`);
  if (left !== "") classes.push(`pl-${left}`);

  return classes.join(" ");
};

const getPaddingSizeIndex = (size?: string) => {
  const index = paddingSizeScale.indexOf(
    (size ?? "") as (typeof paddingSizeScale)[number],
  );
  return index >= 0 ? index : 0;
};

const setPaddingSide = (
  value: string | undefined,
  side: PaddingSide,
  size: string,
) => {
  const sides = parsePaddingValue(value);
  sides[side] = size;
  return buildPaddingClasses(sides);
};

const setPaddingAll = (value: string | undefined, size: string) => {
  const sides = parsePaddingValue(value);
  sides.top = size;
  sides.right = size;
  sides.bottom = size;
  sides.left = size;
  return buildPaddingClasses(sides);
};

type PaddingFieldViewProps = {
  id: string;
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly: boolean | undefined;
  label: string;
  fieldLabel?: string;
};

const PaddingFieldView = ({
  id,
  value,
  onChange,
  readOnly,
  label,
  fieldLabel,
}: PaddingFieldViewProps) => {
  const [activeSide, setActiveSide] = React.useState<PaddingTarget>("top");
  const sides = parsePaddingValue(value);
  const sidePrefixes: Record<PaddingSide, string> = {
    top: "pt",
    right: "pr",
    bottom: "pb",
    left: "pl",
  };
  const current =
    activeSide === "all"
      ? (() => {
          const allEqual =
            sides.top !== "" &&
            sides.top === sides.right &&
            sides.top === sides.bottom &&
            sides.top === sides.left;
          return allEqual ? sides.top : "";
        })()
      : sides[activeSide];

  const sideButtons = [
    { label: "", side: null },
    { label: "T", side: "top" as const, title: "Top" },
    { label: "", side: null },
    { label: "L", side: "left" as const, title: "Left" },
    { label: "+", side: "all" as const, title: "All" },
    { label: "R", side: "right" as const, title: "Right" },
    { label: "", side: null },
    { label: "B", side: "bottom" as const, title: "Bottom" },
    { label: "", side: null },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontSize: 12,
        lineHeight: "16px",
      }}
    >
      <span id={`${id}-label`}>{fieldLabel ?? label}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
          {sideButtons.map((item, index) => {
            if (!item.side) {
              return <div key={`empty-${index}`} />;
            }
            const isSelected = activeSide === item.side;
            return (
              <button
                key={item.label}
                type="button"
                title={item.title ?? item.label}
                aria-pressed={isSelected}
                onClick={() => setActiveSide(item.side)}
                disabled={readOnly}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: isSelected
                    ? "2px solid #0ea5e9"
                    : "1px solid #e5e7eb",
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
                {item.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#64748b" }}>
              {activeSide === "all" ? "all" : sidePrefixes[activeSide]}
            </span>
            <button
              type="button"
              onClick={() =>
                onChange(
                  activeSide === "all"
                    ? setPaddingAll(value, "")
                    : setPaddingSide(value, activeSide, ""),
                )
              }
              disabled={readOnly}
              style={{
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                padding: "2px 6px",
                fontSize: 10,
                lineHeight: "12px",
                color: "#64748b",
                backgroundColor: "transparent",
                cursor: readOnly ? "not-allowed" : "pointer",
              }}
            >
              Clear
            </button>
          </div>
          <input
            aria-label={`${activeSide === "all" ? "all" : sidePrefixes[activeSide]} padding`}
            type="range"
            min={0}
            max={paddingSizeScale.length - 1}
            step={1}
            value={getPaddingSizeIndex(current)}
            onChange={(event) => {
              const index = Number(event.target.value);
              const size = paddingSizeScale[index] ?? "";
              onChange(
                activeSide === "all"
                  ? setPaddingAll(value, size)
                  : setPaddingSide(value, activeSide, size),
              );
            }}
            disabled={readOnly}
          />
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {current === ""
              ? "none"
              : activeSide === "all"
                ? `p-${current}`
                : `${sidePrefixes[activeSide]}-${current}`}
          </div>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {(
            [
              { label: "Top", side: "top" },
              { label: "Right", side: "right" },
              { label: "Bottom", side: "bottom" },
              { label: "Left", side: "left" },
            ] as const
          ).map(({ label: sideLabel, side }) => {
            const sideValue = sides[side];
            return (
              <div
                key={side}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  {sideLabel}
                </span>
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  {sideValue === ""
                    ? "none"
                    : `${sidePrefixes[side]}-${sideValue}`}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(setPaddingSide(value, side, ""))}
                  disabled={readOnly}
                  style={{
                    borderRadius: 6,
                    border: "1px solid #e5e7eb",
                    padding: "2px 6px",
                    fontSize: 10,
                    lineHeight: "12px",
                    color: "#64748b",
                    backgroundColor: "transparent",
                    cursor: readOnly ? "not-allowed" : "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: "#64748b" }}>
          {value || "no padding classes"}
        </div>
      </div>
    </div>
  );
};

const PaddingField = (label: string): CustomField<string> => ({
  type: "custom",
  label,
  render: ({ id, value, onChange, readOnly, field }) => (
    <PaddingFieldView
      id={id}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      label={label}
      fieldLabel={field.label}
    />
  ),
});

export default PaddingField;
