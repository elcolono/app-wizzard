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
    top !== "" &&
    top === right &&
    top === bottom &&
    top === left;

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

const PaddingField = (label: string): CustomField<string> => ({
  type: "custom",
  label,
  render: ({ id, value, onChange, readOnly, field }) => {
    const sides = parsePaddingValue(value);
    const sidePrefixes: Record<PaddingSide, string> = {
      top: "pt",
      right: "pr",
      bottom: "pb",
      left: "pl",
    };
    const allEqual =
      sides.top !== "" &&
      sides.top === sides.right &&
      sides.top === sides.bottom &&
      sides.top === sides.left;
    const allSize = allEqual ? sides.top : "";

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
        <span id={`${id}-label`}>{field.label ?? label}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            role="group"
            aria-labelledby={`${id}-label`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gridTemplateRows: "auto auto auto",
              gap: 6,
              alignItems: "center",
            }}
          >
            <div />
            <div>
              <input
                aria-label="Top padding"
                type="range"
                min={0}
                max={paddingSizeScale.length - 1}
                step={1}
                value={getPaddingSizeIndex(sides.top)}
                onChange={(event) => {
                  const index = Number(event.target.value);
                  const size = paddingSizeScale[index] ?? "";
                  onChange(setPaddingSide(value, "top", size));
                }}
                disabled={readOnly}
              />
            </div>
            <div />
            <div>
              <input
                aria-label="Left padding"
                type="range"
                min={0}
                max={paddingSizeScale.length - 1}
                step={1}
                value={getPaddingSizeIndex(sides.left)}
                onChange={(event) => {
                  const index = Number(event.target.value);
                  const size = paddingSizeScale[index] ?? "";
                  onChange(setPaddingSide(value, "left", size));
                }}
                disabled={readOnly}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <input
                aria-label="All padding"
                type="range"
                min={0}
                max={paddingSizeScale.length - 1}
                step={1}
                value={getPaddingSizeIndex(allSize)}
                onChange={(event) => {
                  const index = Number(event.target.value);
                  const size = paddingSizeScale[index] ?? "";
                  onChange(setPaddingAll(value, size));
                }}
                disabled={readOnly}
              />
              <div style={{ fontSize: 10, color: "#64748b" }}>
                {allSize === "" ? "all: none" : `p-${allSize}`}
              </div>
            </div>
            <div>
              <input
                aria-label="Right padding"
                type="range"
                min={0}
                max={paddingSizeScale.length - 1}
                step={1}
                value={getPaddingSizeIndex(sides.right)}
                onChange={(event) => {
                  const index = Number(event.target.value);
                  const size = paddingSizeScale[index] ?? "";
                  onChange(setPaddingSide(value, "right", size));
                }}
                disabled={readOnly}
              />
            </div>
            <div />
            <div>
              <input
                aria-label="Bottom padding"
                type="range"
                min={0}
                max={paddingSizeScale.length - 1}
                step={1}
                value={getPaddingSizeIndex(sides.bottom)}
                onChange={(event) => {
                  const index = Number(event.target.value);
                  const size = paddingSizeScale[index] ?? "";
                  onChange(setPaddingSide(value, "bottom", size));
                }}
                disabled={readOnly}
              />
            </div>
            <div />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              Verwende die Slider oben, um jede Seite zu setzen.
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
              const current = sides[side];
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
                    {current === "" ? "none" : `${sidePrefixes[side]}-${current}`}
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
  },
});

export default PaddingField;
