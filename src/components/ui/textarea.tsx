"use client";

import * as React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  return <textarea ref={ref} {...props} />;
});

Textarea.displayName = "Textarea";

export { Textarea };