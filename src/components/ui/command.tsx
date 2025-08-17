"use client";

import * as React from "react";

export interface CommandProps {
  // Define props if needed, else remove interface
}

const Command = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    return <div ref={ref} {...props} />;
  }
);

Command.displayName = "Command";

export { Command };