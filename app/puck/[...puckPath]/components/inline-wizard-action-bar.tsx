"use client";

import { ActionBar, usePuck } from "@puckeditor/core";
import { WandSparkles } from "lucide-react";
import React from "react";

type InlineActionBarProps = {
  label?: string;
  children: React.ReactNode;
  parentAction?: React.ReactNode;
};

export function InlineWizardActionBar({
  label,
  children,
  parentAction,
}: InlineActionBarProps) {
  const { selectedItem } = usePuck();
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");

  const onOpenInlineWizard = React.useCallback(() => {
    setIsWizardOpen((open) => !open);
  }, []);

  const onRunInlineWizard = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const id =
      typeof selectedItem?.props?.id === "string"
        ? selectedItem.props.id
        : "unknown";
    const type = selectedItem?.type ?? "unknown";
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      window.alert("Bitte gib zuerst eine Anweisung ein.");
      return;
    }

    window.alert(
      `Inline Wizard (next step)\nComponent: ${type}\nID: ${id}\nPrompt: ${trimmedPrompt}`
    );
  }, [prompt, selectedItem]);

  const onWizardInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Keep editor-level shortcuts from firing while typing in the wizard.
      event.stopPropagation();
    },
    []
  );

  const actions = React.useMemo(() => {
    const items = React.Children.toArray(children);
    const duplicateIndex = items.findIndex((item) => {
      if (!React.isValidElement<{ label?: string }>(item)) return false;
      return item.props.label === "Duplicate";
    });

    const wizardAction = (
      <ActionBar.Action
        key="inline-wizard-action"
        onClick={onOpenInlineWizard}
        label="Inline Wizard"
      >
        <WandSparkles size={16} />
      </ActionBar.Action>
    );

    if (duplicateIndex === -1) {
      return [...items, wizardAction];
    }

    return [
      ...items.slice(0, duplicateIndex + 1),
      wizardAction,
      ...items.slice(duplicateIndex + 1),
    ];
  }, [children, onOpenInlineWizard]);

  return (
    <div style={{ position: "relative" }}>
      <ActionBar label={label}>
        {parentAction}
        {parentAction ? <ActionBar.Separator /> : null}
        {actions}
      </ActionBar>
      {isWizardOpen ? (
        <div
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 280,
            padding: 10,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: "#ffffff",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
            zIndex: 20,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 6,
              color: "#111827",
            }}
          >
            Inline Wizard
          </div>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={onWizardInputKeyDown}
            placeholder="z.B. Mache diesen Button primär und größer"
            rows={4}
            style={{
              width: "100%",
              resize: "vertical",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "8px 10px",
              fontSize: 12,
              outline: "none",
              marginBottom: 8,
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => setIsWizardOpen(false)}
              style={{
                height: 28,
                padding: "0 10px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                background: "#fff",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Schließen
            </button>
            <button
              type="button"
              onClick={onRunInlineWizard}
              style={{
                height: 28,
                padding: "0 10px",
                border: "1px solid #111827",
                borderRadius: 6,
                background: "#111827",
                color: "#fff",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Ausführen
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

