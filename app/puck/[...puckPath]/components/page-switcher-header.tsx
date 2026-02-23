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
  const [newPageName, setNewPageName] = React.useState("");
  const [selectedParent, setSelectedParent] = React.useState("/");
  const [isCreating, setIsCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [deletingPath, setDeletingPath] = React.useState<string | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const parentOptions = React.useMemo(() => {
    const rootOption: PageSummary = {
      path: "/",
      title: "Home",
      isLayout: false,
    };
    const withoutRoot = pages.filter((item) => item.path !== "/");
    return [rootOption, ...withoutRoot];
  }, [pages]);

  React.useEffect(() => {
    setIsOpen(false);
  }, [path]);

  React.useEffect(() => {
    if (!isOpen) return;
    setCreateError(null);
    setDeleteError(null);
  }, [isOpen]);

  const getParentPath = (pagePath: string): string => {
    if (pagePath === "/") return "/";
    const segments = pagePath.split("/").filter(Boolean);
    if (segments.length <= 1) return "/";
    return `/${segments.slice(0, -1).join("/")}`;
  };

  const createPage = async () => {
    const trimmedName = newPageName.trim();
    if (!trimmedName || isCreating) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await fetch("/puck/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          parentPath: selectedParent,
        }),
      });
      const result = await response.json();

      if (!response.ok || result?.status !== "ok" || !result?.path) {
        setCreateError(
          typeof result?.message === "string"
            ? result.message
            : "Seite konnte nicht erstellt werden."
        );
        return;
      }

      setIsOpen(false);
      setNewPageName("");
      setSelectedParent("/");
      onNavigate(result.path);
    } catch {
      setCreateError("Unerwarteter Fehler beim Erstellen der Seite.");
    } finally {
      setIsCreating(false);
    }
  };

  const deletePage = async (targetPath: string) => {
    if (targetPath === "/" || deletingPath || isCreating) return;

    const confirmed = window.confirm(
      `Seite "${targetPath}" wirklich löschen?`
    );
    if (!confirmed) return;

    setDeletingPath(targetPath);
    setDeleteError(null);

    try {
      const response = await fetch("/puck/api/pages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: targetPath }),
      });
      const result = await response.json();

      if (!response.ok || result?.status !== "ok") {
        setDeleteError(
          typeof result?.message === "string"
            ? result.message
            : "Seite konnte nicht gelöscht werden."
        );
        return;
      }

      if (targetPath === path) {
        onNavigate(getParentPath(targetPath));
      } else {
        onNavigate(path);
      }
    } catch {
      setDeleteError("Unerwarteter Fehler beim Löschen der Seite.");
    } finally {
      setDeletingPath(null);
    }
  };

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
    withTopBorder = false,
    deletable = false
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
          const canDelete = deletable && item.path !== "/";
          const isDeleting = deletingPath === item.path;
          return (
            <div
              key={item.path}
              style={{
                display: "flex",
                alignItems: "stretch",
                background: active ? "#f3f4f6" : "transparent",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (item.path !== path) onNavigate(item.path);
                }}
                style={{
                  flex: 1,
                  textAlign: "left",
                  border: "none",
                  background: "transparent",
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
              {canDelete ? (
                <button
                  type="button"
                  onClick={() => void deletePage(item.path)}
                  disabled={isDeleting || Boolean(deletingPath) || isCreating}
                  title="Delete page"
                  style={{
                    width: 66,
                    border: "none",
                    borderLeft: "1px solid #e5e7eb",
                    background: "transparent",
                    color: "#b91c1c",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor:
                      isDeleting || Boolean(deletingPath) || isCreating
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isDeleting ? "..." : "Delete"}
                </button>
              ) : null}
            </div>
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
            <div
              style={{
                padding: "10px 12px 12px",
                borderBottom: "1px solid #e5e7eb",
                background: "#f9fafb",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: "#111827",
                }}
              >
                Add page
              </div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#6b7280",
                  marginBottom: 4,
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={newPageName}
                onChange={(event) => setNewPageName(event.target.value)}
                placeholder="Team"
                style={{
                  width: "100%",
                  height: 32,
                  marginBottom: 8,
                  padding: "0 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  background: "#fff",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#6b7280",
                  marginBottom: 4,
                }}
              >
                Subpage von
              </label>
              <select
                value={selectedParent}
                onChange={(event) => setSelectedParent(event.target.value)}
                style={{
                  width: "100%",
                  height: 32,
                  marginBottom: 8,
                  padding: "0 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  background: "#fff",
                }}
              >
                {parentOptions.map((item) => (
                  <option key={item.path} value={item.path}>
                    {item.title} ({item.path})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={createPage}
                disabled={isCreating || newPageName.trim().length === 0}
                style={{
                  width: "100%",
                  height: 32,
                  border: "none",
                  borderRadius: 6,
                  background:
                    isCreating || newPageName.trim().length === 0
                      ? "#9ca3af"
                      : "#111827",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    isCreating || newPageName.trim().length === 0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isCreating ? "Creating..." : "Create page"}
              </button>

              {createError ? (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#b91c1c",
                  }}
                >
                  {createError}
                </div>
              ) : null}
            </div>
            {renderGroup("Pages", pages, false, true)}
            {deleteError ? (
              <div
                style={{
                  padding: "0 12px 8px",
                  fontSize: 12,
                  color: "#b91c1c",
                }}
              >
                {deleteError}
              </div>
            ) : null}
            {renderGroup("Layouts", layouts, pages.length > 0)}
          </div>,
          document.body
        )}
    </>
  );
}
