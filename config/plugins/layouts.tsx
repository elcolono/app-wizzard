import React from "react";
import type { Plugin } from "@puckeditor/core";

const LAYOUT_PATHS = {
  header: "/_layout/header",
  footer: "/_layout/footer",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "white",
  cursor: "pointer",
  fontSize: 14,
  textAlign: "left",
};

const containerStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  padding: 12,
};

export function layoutPlugin(): Plugin {
  return {
    name: "layouts",
    label: "Layouts",
    render: () => {
      const go = (path: string) => {
        window.location.href = `/puck${path}`;
      };

      return (
        <div style={containerStyle}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Global Header/Footer
          </div>
          <button style={buttonStyle} onClick={() => go(LAYOUT_PATHS.header)}>
            Edit Header
          </button>
          <button style={buttonStyle} onClick={() => go(LAYOUT_PATHS.footer)}>
            Edit Footer
          </button>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            Diese Bereiche gelten für alle Seiten.
          </div>
        </div>
      );
    },
  };
}
