"use client";
import { useId } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart,
} from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { chartDate } from "@/lib/dashboard-data";

const activityConfig = {
  cases: { label: "New cases", color: "#a78bfa" },
  reviews: { label: "Review leads", color: "#67d5e5" },
} satisfies ChartConfig;
function ActivityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: readonly {
    dataKey?: string | number;
    value?: number | string;
    color?: string;
  }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-40 rounded-xl border border-zinc-700/70 bg-[#18181d] p-3 shadow-xl">
      <p className="mb-2 text-[11px] text-zinc-400">
        {typeof label === "string" ? chartDate(label) : label}
      </p>
      {payload.map((item) => (
        <div
          key={String(item.dataKey)}
          className="flex items-center justify-between gap-6 py-1 text-xs"
        >
          <span className="flex items-center gap-2 text-zinc-300">
            <span
              className="size-2 rounded-sm"
              style={{ background: item.color }}
            />
            {activityConfig[item.dataKey as keyof typeof activityConfig]?.label}
          </span>
          <span className="font-mono text-zinc-100">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
export function ActivityChart({
  data,
}: {
  data: { date: string; cases: number; reviews: number }[];
}) {
  const id = useId().replaceAll(":", "");
  const reducedMotion = useReducedMotion();
  return (
    <>
      <ChartContainer
        config={activityConfig}
        className="h-[220px] w-full sm:h-[240px]"
      >
        <AreaChart
          data={data}
          accessibilityLayer={false}
          margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`${id}-cases`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id={`${id}-reviews`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#67d5e5" stopOpacity={0.14} />
              <stop offset="100%" stopColor="#67d5e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#ffffff0a"
            strokeDasharray="2 6"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickFormatter={chartDate}
            minTickGap={32}
            tickMargin={12}
            fontSize={10}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            fontSize={10}
            domain={[0, (max: number) => Math.max(1, max)]}
          />
          <Tooltip
            content={<ActivityTooltip />}
            cursor={{ stroke: "#a78bfa50", strokeDasharray: "3 4" }}
          />
          <Area
            type="monotone"
            dataKey="cases"
            stroke="var(--color-cases)"
            strokeWidth={2}
            fill={`url(#${id}-cases)`}
            activeDot={{ r: 4, stroke: "#111115", strokeWidth: 3 }}
            isAnimationActive={!reducedMotion}
            animationDuration={650}
          />
          <Area
            type="monotone"
            dataKey="reviews"
            stroke="var(--color-reviews)"
            strokeWidth={2}
            fill={`url(#${id}-reviews)`}
            activeDot={{ r: 4, stroke: "#111115", strokeWidth: 3 }}
            isAnimationActive={!reducedMotion}
            animationDuration={650}
          />
        </AreaChart>
      </ChartContainer>
      <div className="sr-only">
        <table>
          <caption>New records per day, Asia/Kolkata</caption>
          <thead>
            <tr>
              <th>Date</th>
              <th>New cases</th>
              <th>Review leads</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{row.cases}</td>
                <td>{row.reviews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export function ReviewOrbit({
  pending,
  verified,
  rejected,
}: {
  pending: number;
  verified: number;
  rejected: number;
}) {
  const reducedMotion = useReducedMotion();
  const total = pending + verified + rejected;
  const data = [
    { name: "Pending", value: pending, fill: "#fbbf24" },
    { name: "Verified", value: verified, fill: "#6ee7b7" },
    { name: "Rejected", value: rejected, fill: "#fb7185" },
  ].filter((item) => item.value > 0);
  if (!total)
    return (
      <div className="mx-auto flex size-[180px] flex-col items-center justify-center rounded-full border-[12px] border-zinc-800/60">
        <span className="text-3xl font-medium text-zinc-400">0</span>
        <span className="mt-1 text-[10px] text-zinc-500">
          No review leads yet
        </span>
      </div>
    );
  return (
    <ChartContainer
      className="mx-auto h-[180px] w-full max-w-[240px]"
      config={{
        pending: { label: "Pending", color: "#fbbf24" },
        verified: { label: "Verified", color: "#6ee7b7" },
        rejected: { label: "Rejected", color: "#fb7185" },
      }}
    >
      <PieChart accessibilityLayer={false}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={58}
          outerRadius={76}
          cornerRadius={4}
          paddingAngle={data.length > 1 ? 5 : 0}
          stroke="none"
          isAnimationActive={!reducedMotion}
          animationDuration={700}
        />
        <Tooltip
          contentStyle={{
            background: "#18181d",
            border: "1px solid #3f3f46",
            borderRadius: 12,
            color: "#fafafa",
            fontSize: 12,
          }}
          itemStyle={{ color: "#e4e4e7" }}
          formatter={(value, name) => [value, name]}
        />
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#f4f4f5"
          fontSize={28}
          fontWeight={500}
        >
          {total}
        </text>
        <text x="50%" y="62%" textAnchor="middle" fill="#71717a" fontSize={10}>
          review leads
        </text>
      </PieChart>
    </ChartContainer>
  );
}
