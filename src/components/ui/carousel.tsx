import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
};

export const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative", className)}
    {...props}
  >
    {children}
  </div>
));
Carousel.displayName = "Carousel";

export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex overflow-hidden", className)}
    {...props}
  >
    {children}
  </div>
));
CarouselContent.displayName = "CarouselContent";

export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
    {...props}
  >
    {children}
  </div>
));
CarouselItem.displayName = "CarouselItem";

export const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => (
  <Button
    ref={ref}
    variant={variant}
    size={size}
    className={cn("absolute -left-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full", className)}
    {...props}
  >
    <ArrowLeft className="h-4 w-4" />
  </Button>
));
CarouselPrevious.displayName = "CarouselPrevious";

export const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => (
  <Button
    ref={ref}
    variant={variant}
    size={size}
    className={cn("absolute -right-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full", className)}
    {...props}
  >
    <ArrowRight className="h-4 w-4" />
  </Button>
));
CarouselNext.displayName = "CarouselNext";