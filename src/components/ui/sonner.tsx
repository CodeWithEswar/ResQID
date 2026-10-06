"use client";
import { Toaster as Sonner } from "sonner";
export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: "!border-zinc-700 !bg-[#19191f] !text-zinc-100 !shadow-xl",
          description: "!text-zinc-400",
          success: "!border-emerald-400/25",
          error: "!border-rose-400/30",
        },
      }}
    />
  );
}
