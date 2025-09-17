import React from "react";

export const AspectRatio = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { ratio?: number }
>(({ className, ratio = 1, children, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    style={{ aspectRatio: ratio }}
    {...props}
  >
    {children}
  </div>
));
AspectRatio.displayName = "AspectRatio";