import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-violet-500 via-violet-600 to-violet-700 text-white font-semibold border border-violet-400/40 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.4),inset_0_-2px_0_rgba(76,29,149,0.8),0_1px_3px_rgba(0,0,0,0.4),0_4px_14px_rgba(124,58,237,0.4)] hover:from-violet-400 hover:via-violet-500 hover:to-violet-600 hover:border-violet-300/60 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.55),inset_0_-2px_0_rgba(76,29,149,0.9),0_6px_20px_rgba(124,58,237,0.6)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(46,16,101,0.8)]",
        destructive:
          "bg-gradient-to-b from-rose-500/25 to-rose-600/35 text-rose-300 border border-rose-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1.5px_0_rgba(0,0,0,0.6),0_2px_6px_rgba(0,0,0,0.4)] hover:from-rose-500/35 hover:to-rose-600/45 hover:border-rose-400/50 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]",
        outline:
          "border border-white/10 bg-gradient-to-b from-[#22222b] to-[#141419] text-zinc-200 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.16),inset_0_-1.5px_0_rgba(0,0,0,0.75),0_1px_3px_rgba(0,0,0,0.6),0_4px_10px_rgba(0,0,0,0.35)] hover:from-[#2c2c37] hover:to-[#181820] hover:border-violet-500/40 hover:text-white hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.25),inset_0_-1.5px_0_rgba(0,0,0,0.85),0_4px_12px_rgba(0,0,0,0.7),0_6px_18px_rgba(124,58,237,0.18)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]",
        secondary:
          "bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-200 border border-zinc-700/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1.5px_0_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.3)] hover:from-zinc-750 hover:to-zinc-850 hover:text-white hover:-translate-y-0.5 active:translate-y-0.5",
        solid:
          "bg-gradient-to-b from-violet-500 via-violet-600 to-violet-700 text-white font-semibold border border-violet-400/45 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.42),inset_0_-2px_0_rgba(76,29,149,0.8),0_1px_3px_rgba(0,0,0,0.4),0_4px_16px_rgba(124,58,237,0.45)] hover:from-violet-400 hover:via-violet-500 hover:to-violet-600 hover:border-violet-300/60 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.55),inset_0_-2px_0_rgba(76,29,149,0.9),0_3px_8px_rgba(0,0,0,0.45),0_6px_22px_rgba(124,58,237,0.65)] active:translate-y-0.5 active:shadow-[inset_0_2px_5px_rgba(46,16,101,0.85)]",
        ghost: "text-zinc-300 hover:bg-zinc-800/60 hover:text-white",
        link: "text-violet-400 underline-offset-4 hover:underline",
        emergency:
          "relative overflow-hidden bg-gradient-to-r from-zinc-600 via-violet-600 to-zinc-600 text-white font-bold shadow-lg shadow-zinc-600/30 hover:brightness-110 border border-zinc-400/40 animate-pulse",
        cyber:
          "bg-gradient-to-r from-violet-500/20 to-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30 shadow-md shadow-violet-950",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base font-semibold",
        icon: "h-10 w-10 p-0",
        iconSm: "h-8 w-8 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
