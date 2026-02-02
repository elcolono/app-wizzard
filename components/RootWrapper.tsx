import React from "react";

type RootWrapperProps = {
  children: React.ReactNode;
};

export default function RootWrapper({ children }: RootWrapperProps) {
  return <div className="puck-root">{children}</div>;
}
