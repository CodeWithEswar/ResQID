"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ArrowDown01Icon, ArrowUp01Icon, Tick02Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-11 min-h-11 w-full min-w-0 shrink-0 items-center justify-between gap-3 rounded-[10px] border border-zinc-700 bg-zinc-900 px-3.5 py-0 text-sm text-zinc-100 transition-colors hover:border-zinc-600 focus-visible:border-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0f] data-[placeholder]:text-zinc-500 data-[state=open]:border-violet-400/70 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:min-w-0 [&>span]:truncate",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ArrowDown01Icon
          size={16}
          className="shrink-0 text-zinc-400"
          aria-hidden="true"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(
          "relative z-[120] max-h-[min(320px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-zinc-700/80 bg-[#19191f] text-zinc-100 shadow-[0_16px_48px_#00000066] data-[state=open]:animate-[select-enter_120ms_ease-out] motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center text-zinc-400">
          <ArrowUp01Icon size={15} aria-hidden="true" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1.5">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center text-zinc-400">
          <ArrowDown01Icon size={15} aria-hidden="true" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-10 w-full cursor-default select-none items-center rounded-lg py-2 pr-9 pl-3 text-sm outline-none data-[highlighted]:bg-violet-400/10 data-[highlighted]:text-violet-100 data-[state=checked]:text-violet-200 data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-3 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Tick02Icon
            size={16}
            className="text-violet-300"
            aria-hidden="true"
          />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

export function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn("px-3 py-2 text-xs font-medium text-zinc-500", className)}
      {...props}
    />
  );
}

export function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn("my-1 h-px bg-zinc-800", className)}
      {...props}
    />
  );
}
