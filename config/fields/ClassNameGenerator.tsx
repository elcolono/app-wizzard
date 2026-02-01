import React from "react";
import { CustomField } from "@puckeditor/core";

type ToolsConfig = {
  alignment?: boolean;
  padding?: boolean;
  margin?: boolean;
  text?: boolean;
};

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

const textSizeOptions = [
  { label: "XS", value: "text-xs" },
  { label: "SM", value: "text-sm" },
  { label: "Base", value: "text-base" },
  { label: "LG", value: "text-lg" },
  { label: "XL", value: "text-xl" },
  { label: "2XL", value: "text-2xl" },
  { label: "3XL", value: "text-3xl" },
  { label: "4XL", value: "text-4xl" },
  { label: "5XL", value: "text-5xl" },
  { label: "6XL", value: "text-6xl" },
  { label: "7XL", value: "text-7xl" },
  { label: "8XL", value: "text-8xl" },
  { label: "9XL", value: "text-9xl" },
];

const textWeightOptions = [
  { label: "Thin", value: "font-thin" },
  { label: "Extra Light", value: "font-extralight" },
  { label: "Light", value: "font-light" },
  { label: "Normal", value: "font-normal" },
  { label: "Medium", value: "font-medium" },
  { label: "Semibold", value: "font-semibold" },
  { label: "Bold", value: "font-bold" },
  { label: "Extra Bold", value: "font-extrabold" },
  { label: "Black", value: "font-black" },
];

const textAlignOptions = [
  { label: "Left", value: "text-left" },
  { label: "Center", value: "text-center" },
  { label: "Right", value: "text-right" },
  { label: "Justify", value: "text-justify" },
];

const textStyleOptions = [
  { label: "Italic", value: "italic" },
  { label: "Underline", value: "underline" },
  { label: "Line Through", value: "line-through" },
];

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

const marginSizeScale = paddingSizeScale;

type PaddingSide = "top" | "right" | "bottom" | "left" | "all";

type PaddingSides = Record<Exclude<PaddingSide, "all">, string>;

type MarginSide = "top" | "right" | "bottom" | "left" | "all";

type MarginSides = Record<Exclude<MarginSide, "all">, string>;

const splitTokens = (value?: string) =>
  (value ?? "").split(/\s+/).filter(Boolean);

const mergeTokens = (tokens: string[]) => tokens.join(" ").trim();

const removeTokens = (
  tokens: string[],
  predicate: (token: string) => boolean,
) => tokens.filter((token) => !predicate(token));

const parsePaddingValue = (value?: string): PaddingSides => {
  const sides: PaddingSides = {
    top: "",
    right: "",
    bottom: "",
    left: "",
  };
  const tokens = splitTokens(value);

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

const parseMarginValue = (value?: string): MarginSides => {
  const sides: MarginSides = {
    top: "",
    right: "",
    bottom: "",
    left: "",
  };
  const tokens = splitTokens(value);

  for (const token of tokens) {
    if (token.startsWith("m-")) {
      const size = token.slice(2);
      sides.top = size;
      sides.right = size;
      sides.bottom = size;
      sides.left = size;
      continue;
    }
    if (token.startsWith("mx-")) {
      const size = token.slice(3);
      sides.left = size;
      sides.right = size;
      continue;
    }
    if (token.startsWith("my-")) {
      const size = token.slice(3);
      sides.top = size;
      sides.bottom = size;
      continue;
    }
    if (token.startsWith("mt-")) {
      sides.top = token.slice(3);
      continue;
    }
    if (token.startsWith("mr-")) {
      sides.right = token.slice(3);
      continue;
    }
    if (token.startsWith("mb-")) {
      sides.bottom = token.slice(3);
      continue;
    }
    if (token.startsWith("ml-")) {
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

const buildMarginClasses = (sides: MarginSides) => {
  const { top, right, bottom, left } = sides;
  const allEqual =
    top !== "" && top === right && top === bottom && top === left;

  if (allEqual) {
    return `m-${top}`;
  }

  const classes = [];
  if (top !== "") classes.push(`mt-${top}`);
  if (right !== "") classes.push(`mr-${right}`);
  if (bottom !== "") classes.push(`mb-${bottom}`);
  if (left !== "") classes.push(`ml-${left}`);

  return classes.join(" ");
};

const getPaddingSizeIndex = (size?: string) => {
  const index = paddingSizeScale.indexOf(
    (size ?? "") as (typeof paddingSizeScale)[number],
  );
  return index >= 0 ? index : 0;
};

const getMarginSizeIndex = (size?: string) => {
  const index = marginSizeScale.indexOf(
    (size ?? "") as (typeof marginSizeScale)[number],
  );
  return index >= 0 ? index : 0;
};

const stripPaddingTokens = (value?: string) =>
  mergeTokens(
    removeTokens(splitTokens(value), (token) =>
      /^(p|px|py|pt|pr|pb|pl)-/.test(token),
    ),
  );

const stripMarginTokens = (value?: string) =>
  mergeTokens(
    removeTokens(splitTokens(value), (token) =>
      /^(m|mx|my|mt|mr|mb|ml)-/.test(token),
    ),
  );

const setPaddingSide = (
  value: string | undefined,
  side: PaddingSide,
  size: string,
) => {
  const sides = parsePaddingValue(value);
  if (side === "all") {
    sides.top = size;
    sides.right = size;
    sides.bottom = size;
    sides.left = size;
  } else {
    sides[side] = size;
  }
  const classes = buildPaddingClasses(sides);
  const base = stripPaddingTokens(value);
  return mergeTokens([base, classes].filter(Boolean));
};

const setMarginSide = (
  value: string | undefined,
  side: MarginSide,
  size: string,
) => {
  const sides = parseMarginValue(value);
  if (side === "all") {
    sides.top = size;
    sides.right = size;
    sides.bottom = size;
    sides.left = size;
  } else {
    sides[side] = size;
  }
  const classes = buildMarginClasses(sides);
  const base = stripMarginTokens(value);
  return mergeTokens([base, classes].filter(Boolean));
};

const getAlignmentValue = (value?: string) => {
  const tokens = splitTokens(value);
  return (
    alignmentOptions.find((option) =>
      option.value.split(/\s+/).every((token) => tokens.includes(token)),
    )?.value ?? ""
  );
};

const applyAlignment = (value: string | undefined, alignment: string) => {
  const tokens = removeTokens(splitTokens(value), (token) => {
    if (token === "flex") return true;
    if (token.startsWith("items-")) return true;
    if (token.startsWith("justify-")) return true;
    return false;
  });
  if (alignment) {
    tokens.push(...alignment.split(/\s+/));
  }
  return mergeTokens(tokens);
};

const replaceTokenFromSet = (
  value: string | undefined,
  tokenSet: Set<string>,
  nextToken: string,
) => {
  const tokens = removeTokens(splitTokens(value), (token) =>
    tokenSet.has(token),
  );
  if (nextToken) {
    tokens.push(nextToken);
  }
  return mergeTokens(tokens);
};

const toggleToken = (value: string | undefined, token: string) => {
  const tokens = splitTokens(value);
  const next = tokens.includes(token)
    ? tokens.filter((t) => t !== token)
    : [...tokens, token];
  return mergeTokens(next);
};

const TextTool = ({
  value,
  onChange,
  readOnly,
}: {
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) => {
  const sizeSet = new Set(textSizeOptions.map((option) => option.value));
  const weightSet = new Set(textWeightOptions.map((option) => option.value));
  const alignSet = new Set(textAlignOptions.map((option) => option.value));

  const tokens = splitTokens(value);
  const size = tokens.find((token) => sizeSet.has(token)) ?? "";
  const weight = tokens.find((token) => weightSet.has(token)) ?? "";
  const align = tokens.find((token) => alignSet.has(token)) ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Size</span>
          <select
            value={size}
            onChange={(event) =>
              onChange(replaceTokenFromSet(value, sizeSet, event.target.value))
            }
            disabled={readOnly}
          >
            <option value="">Default</option>
            {textSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Weight</span>
          <select
            value={weight}
            onChange={(event) =>
              onChange(
                replaceTokenFromSet(value, weightSet, event.target.value),
              )
            }
            disabled={readOnly}
          >
            <option value="">Default</option>
            {textWeightOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Align</span>
          <select
            value={align}
            onChange={(event) =>
              onChange(replaceTokenFromSet(value, alignSet, event.target.value))
            }
            disabled={readOnly}
          >
            <option value="">Default</option>
            {textAlignOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {textStyleOptions.map((option) => (
          <label
            key={option.value}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <input
              type="checkbox"
              checked={tokens.includes(option.value)}
              onChange={() => onChange(toggleToken(value, option.value))}
              disabled={readOnly}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const AlignmentTool = ({
  value,
  onChange,
  readOnly,
}: {
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) => (
  <div
    role="group"
    aria-label="Alignment"
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 28px)",
      gridAutoRows: "28px",
      gap: 6,
    }}
  >
    {alignmentOptions.map((option) => {
      const isSelected = option.value === getAlignmentValue(value);
      return (
        <button
          key={option.label}
          type="button"
          title={option.label}
          aria-pressed={isSelected}
          onClick={() => onChange(applyAlignment(value, option.value))}
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
);

const PaddingTool = ({
  value,
  onChange,
  readOnly,
}: {
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) => {
  const [activeSide, setActiveSide] = React.useState<PaddingSide>("top");
  const sides = parsePaddingValue(value);
  const sidePrefixes: Record<Exclude<PaddingSide, "all">, string> = {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        role="group"
        aria-label="Padding"
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
            onClick={() => onChange(setPaddingSide(value, activeSide, ""))}
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
          aria-label={`${activeSide} padding`}
          type="range"
          min={0}
          max={paddingSizeScale.length - 1}
          step={1}
          value={getPaddingSizeIndex(current)}
          onChange={(event) => {
            const index = Number(event.target.value);
            const size = paddingSizeScale[index] ?? "";
            onChange(setPaddingSide(value, activeSide, size));
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
    </div>
  );
};

const MarginTool = ({
  value,
  onChange,
  readOnly,
}: {
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) => {
  const [activeSide, setActiveSide] = React.useState<MarginSide>("top");
  const sides = parseMarginValue(value);
  const sidePrefixes: Record<Exclude<MarginSide, "all">, string> = {
    top: "mt",
    right: "mr",
    bottom: "mb",
    left: "ml",
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
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        role="group"
        aria-label="Margin"
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
            onClick={() => onChange(setMarginSide(value, activeSide, ""))}
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
          aria-label={`${activeSide} margin`}
          type="range"
          min={0}
          max={marginSizeScale.length - 1}
          step={1}
          value={getMarginSizeIndex(current)}
          onChange={(event) => {
            const index = Number(event.target.value);
            const size = marginSizeScale[index] ?? "";
            onChange(setMarginSide(value, activeSide, size));
          }}
          disabled={readOnly}
        />
        <div style={{ fontSize: 11, color: "#64748b" }}>
          {current === ""
            ? "none"
            : activeSide === "all"
              ? `m-${current}`
              : `${sidePrefixes[activeSide]}-${current}`}
        </div>
      </div>
    </div>
  );
};

type ClassNameGeneratorViewProps = {
  id: string;
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly: boolean | undefined;
  label: string;
  fieldLabel?: string;
  tools: ToolsConfig;
};

const ClassNameGeneratorView = ({
  id,
  value,
  onChange,
  readOnly,
  label,
  fieldLabel,
  tools,
}: ClassNameGeneratorViewProps) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 10,
      fontSize: 12,
      lineHeight: "16px",
    }}
  >
    <span id={`${id}-label`}>{fieldLabel ?? label}</span>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {tools.alignment ? (
        <div>
          <div style={{ marginBottom: 6 }}>Alignment</div>
          <AlignmentTool
            value={value}
            onChange={onChange}
            readOnly={readOnly}
          />
        </div>
      ) : null}
      {tools.padding ? (
        <div>
          <div style={{ marginBottom: 6 }}>Padding</div>
          <PaddingTool value={value} onChange={onChange} readOnly={readOnly} />
        </div>
      ) : null}
      {tools.margin ? (
        <div>
          <div style={{ marginBottom: 6 }}>Margin</div>
          <MarginTool value={value} onChange={onChange} readOnly={readOnly} />
        </div>
      ) : null}
      {tools.text ? (
        <div>
          <div style={{ marginBottom: 6 }}>Text</div>
          <TextTool value={value} onChange={onChange} readOnly={readOnly} />
        </div>
      ) : null}
    </div>
    <div style={{ fontSize: 11, color: "#64748b" }}>
      {value || "no classes"}
    </div>
  </div>
);

const ClassNameGeneratorField = (
  label: string,
  tools: ToolsConfig,
): CustomField<string> => ({
  type: "custom",
  label,
  ai: {
    instructions: "Generate Tailwind css classes for the component.",
    schema: {
      type: "string",
    },
  },
  render: ({ id, value, onChange, readOnly, field }) => (
    <ClassNameGeneratorView
      id={id}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      label={label}
      fieldLabel={field.label}
      tools={tools}
    />
  ),
});

export default ClassNameGeneratorField;
