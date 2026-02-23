"use client";

import React from "react";
import { createPortal } from "react-dom";
import type { PageSummary } from "../../../../lib/get-page-summaries";

type PageSwitcherHeaderProps = {
  path: string;
  pageTitle: string;
  pages: PageSummary[];
  layouts: PageSummary[];
  onNavigate: (path: string) => void;
  children: React.ReactNode;
};

const MENU_WIDTH = 320;
const MENU_OFFSET = 8;
const VIEWPORT_PADDING = 8;
const MENU_Z_INDEX = 5000;

export function PageSwitcherHeader({
  path,
  pageTitle,
  pages,
  layouts,
  onNavigate,
  children,
}: PageSwitcherHeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setIsOpen(false);
  }, [path]);

  const updateMenuPosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const maxLeft = window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING;
    const left = Math.max(VIEWPORT_PADDING, Math.min(rect.left, maxLeft));
    setMenuPosition({
      top: rect.bottom + MENU_OFFSET,
      left,
    });
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const handleReposition = () => {
      updateMenuPosition();
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, updateMenuPosition]);

  const renderGroup = (
    title: string,
    items: PageSummary[],
    withTopBorder = false
  ) => {
    if (items.length === 0) return null;

    return (
      <div
        style={{
          padding: "6px 0",
          borderTop: withTopBorder ? "1px solid #e5e7eb" : undefined,
        }}
      >
        <div
          style={{
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            color: "#6b7280",
          }}
        >
          {title}
        </div>
        {items.map((item) => {
          const active = item.path === path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (item.path !== path) onNavigate(item.path);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                background: active ? "#f3f4f6" : "transparent",
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                {item.title}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  color: "#6b7280",
                }}
              >
                {item.path}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const replaceTitleNode = (node: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(node)) return node;

    const element = node as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
      style?: React.CSSProperties;
    }>;

    const className =
      typeof element.props.className === "string" ? element.props.className : "";

    if (className.includes("PuckHeader-title")) {
      return React.cloneElement(element, {
        style: { ...element.props.style, zIndex: 10 },
        children: (
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            style={{
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
              {pageTitle}
            </span>
            <code
              style={{
                fontSize: 12,
                color: "#6b7280",
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            >
              {path}
            </code>
          </button>
        ),
      });
    }

    if (!element.props.children) return element;

    return React.cloneElement(element, {
      children: React.Children.map(element.props.children, replaceTitleNode),
    });
  };

  return (
    <>
      {replaceTitleNode(children)}
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: MENU_WIDTH,
              maxHeight: 360,
              overflowY: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "#ffffff",
              boxShadow:
                "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
              zIndex: MENU_Z_INDEX,
            }}
          >
            {renderGroup("Pages", pages)}
            {renderGroup("Layouts", layouts, pages.length > 0)}
          </div>,
          document.body
        )}
    </>
  );
}
