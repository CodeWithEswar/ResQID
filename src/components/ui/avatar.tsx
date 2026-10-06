"use client";
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex size-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-900",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square size-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, children, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "relative flex size-full items-center justify-center font-bold text-white text-xs select-none overflow-hidden",
      "bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600",
      "shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.55),inset_0_-2px_3px_rgba(0,0,0,0.45)]",
      className,
    )}
    {...props}
  >
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.12)_35%,transparent_65%)]"
    />
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(to_top,rgba(0,0,0,0.3)_0%,transparent_50%)]"
    />
    <span className="relative z-10 [text-shadow:0_1px_2px_rgba(0,0,0,0.7),0_-0.5px_0.5px_rgba(255,255,255,0.35)]">
      {children}
    </span>
  </AvatarPrimitive.Fallback>
));
AvatarFallback.displayName = "AvatarFallback";
export { Avatar, AvatarImage, AvatarFallback };
export { GradientAvatar, CaseAvatar } from "./gradient-avatar";
