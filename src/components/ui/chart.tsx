"use client";
import { type CSSProperties, type ReactElement } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<string, { label: string; color: string }>;
export function ChartContainer({
  config,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
  children: ReactElement;
}) {
  const colors = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      `--color-${key}`,
      value.color,
    ]),
  ) as CSSProperties;
  return (
    <div
      data-slot="chart"
      className={cn(
        "min-w-0 text-xs [&_.recharts-cartesian-axis-tick_text]:fill-zinc-500 [&_.recharts-surface]:outline-none [&_.recharts-surface]:focus:outline-none [&_.recharts-surface]:focus-visible:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper]:focus:outline-none [&_.recharts-wrapper]:focus-visible:outline-none [&_svg]:outline-none [&_svg]:focus:outline-none [&_svg]:focus-visible:outline-none [&_*:focus]:outline-none [&_*:focus-visible]:outline-none [&_*:focus]:ring-0",
        className,
      )}
      style={colors}
      {...props}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        debounce={50}
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
}
