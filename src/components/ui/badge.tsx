import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-violet-500/30 bg-violet-500/15 text-violet-300 shadow-sm",
        secondary: "border border-zinc-700 bg-zinc-800/80 text-zinc-300",
        destructive: "border border-rose-400/25 bg-rose-400/10 text-rose-300",
        outline: "border border-zinc-700 text-zinc-300",
        success:
          "border border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
        warning: "border border-amber-400/25 bg-amber-400/10 text-amber-300",
        cyan: "border border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
        live: "border border-zinc-500/50 bg-zinc-600/20 text-zinc-300 animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full bg-current")} />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
