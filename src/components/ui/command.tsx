"use client";

import * as React from "react";

const Command = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    return <div ref={ref} {...props} />;
  }
);

Command.displayName = "Command";

export { Command };