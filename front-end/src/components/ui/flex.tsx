import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const flexComponents = cva("flex items-center justify-center", {
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
    },
    wrap: {
      noWrap: "flex-nowrap",
      wrap: "flex-wrap",
      wrapReverse: "flex-wrap-reverse",
    },
    justify: {
      start: "justify-start",
      end: "justify-end",
      center: "justify-center",
      between: "justify-between",
      around: "justify-around",
    },
    align: {
      start: "items-start",
      end: "items-end",
      center: "items-center",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
  },
});

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexComponents> {}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction, wrap, justify, align, ...props }, ref) => {
    return (
      <div
        className={cn(
          flexComponents({ direction, wrap, justify, align }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Flex.displayName = "Flex";

export { Flex, flexComponents };
