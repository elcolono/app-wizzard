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
      <span className="grid grid-cols-2 gap-0.5">
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
      </span>
    </div>
  );
};

export default EditorDragHandle;
