"use client";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";
export const Drawer = DrawerPrimitive.Root;
export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerClose = DrawerPrimitive.Close;
export const DrawerTitle = DrawerPrimitive.Title;
export const DrawerDescription = DrawerPrimitive.Description;
export function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/65 backdrop-blur-sm" />
      <DrawerPrimitive.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-[90] flex max-h-[92dvh] flex-col rounded-t-2xl border border-zinc-700/70 bg-[#141418] px-5 pb-[max(20px,env(safe-area-inset-bottom))] text-zinc-100 outline-none",
          className,
        )}
        {...props}
      >
        <div
          className="mx-auto my-3 h-1 w-10 shrink-0 rounded-full bg-zinc-600"
          aria-hidden="true"
        />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}
