"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cancel01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;
export function SheetContent({
  className,
  children,
  side = "left",
  closeLabel = "Close navigation",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "left" | "right";
  closeLabel?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm data-[state=open]:animate-[sheet-fade_180ms_ease-out] motion-reduce:animate-none" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 z-[80] flex flex-col border-zinc-800 bg-[#101014] shadow-2xl motion-reduce:animate-none",
          side === "right"
            ? "right-0 w-[min(384px,100vw)] border-l p-6 data-[state=open]:animate-[sheet-enter-right_220ms_ease-out]"
            : "left-0 w-[min(300px,88vw)] border-r px-3 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] data-[state=open]:animate-[sheet-enter_220ms_ease-out]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute top-[max(18px,env(safe-area-inset-top))] right-3 z-30 flex size-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label={closeLabel}
        >
          <Cancel01Icon size={18} aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
