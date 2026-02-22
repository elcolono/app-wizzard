import React from "react";

type EditorDragHandleProps = {
  className?: string;
};

// Shared editor-only drag affordance for slot wrappers.
const EditorDragHandle = ({ className = "" }: EditorDragHandleProps) => {
  const mergedClassName = [
    "absolute right-2 top-2 z-50 cursor-move rounded border border-outline-300 bg-background-0 p-1.5 text-typography-700 shadow",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={mergedClassName} aria-hidden>
      <svg viewBox="0 0 20 20" width="12" fill="currentColor">
        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
      </svg>
    </div>
  );
};

export default EditorDragHandle;
