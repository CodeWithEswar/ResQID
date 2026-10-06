import { cn } from "@/lib/utils";
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-zinc-800/60 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
