import React from "react";

export type CalendarProps = React.HTMLAttributes<HTMLDivElement> & {
  mode?: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
};

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`border rounded-lg p-4 ${className}`}
      {...props}
    >
      <div className="text-center text-sm text-muted-foreground">
        Calendar component (placeholder)
      </div>
    </div>
  )
);
Calendar.displayName = "Calendar";