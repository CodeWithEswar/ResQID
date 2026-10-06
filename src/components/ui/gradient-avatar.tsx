"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/dashboard-data";
import {
  getAvatarTheme,
  createThemeFromRgb,
  extractDominantColor,
  type AvatarTheme,
} from "@/lib/avatar-theme";

export type GradientAvatarProps = {
  name: string;
  id?: string;
  photo?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "squircle" | "circle";
  glow?: boolean;
};

const sizeClasses = {
  xs: "size-6 text-[9px] rounded-md",
  sm: "size-8 text-[11px] rounded-lg",
  md: "size-10 text-xs rounded-xl",
  lg: "size-12 text-sm rounded-xl",
  xl: "size-16 text-lg rounded-2xl",
};

export function GradientAvatar({
  name,
  id,
  photo,
  className,
  size = "md",
  shape = "squircle",
  glow = true,
}: GradientAvatarProps) {
  const seed = useMemo(() => name || id || "Case", [name, id]);
  const defaultTheme = useMemo(() => getAvatarTheme(seed), [seed]);
  const [photoTheme, setPhotoTheme] = useState<{ source: string; theme: AvatarTheme } | null>(null);
  const theme = photo && photoTheme?.source === photo ? photoTheme.theme : defaultTheme;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Auto-detect color from photo if provided
  useEffect(() => {
    let active = true;
    if (photo) {
      extractDominantColor(photo).then((rgb) => {
        if (active && rgb) {
          setPhotoTheme({ source: photo, theme: createThemeFromRgb(rgb.r, rgb.g, rgb.b) });
        }
      });
    }
    return () => {
      active = false;
    };
  }, [photo]);

  const roundedClass = shape === "circle" ? "rounded-full" : "";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden font-bold select-none",
        "transition-all duration-300 ease-out",
        sizeClasses[size],
        roundedClass,
        className,
      )}
      style={{
        background: `linear-gradient(${theme.angle}deg, ${theme.from} 0%, ${theme.via} 52%, ${theme.to} 100%)`,
        boxShadow: glow
          ? `
            0 4px 14px -2px ${theme.glow},
            0 2px 4px -1px rgba(0, 0, 0, 0.45),
            inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.55),
            inset 0 -2px 3px 0 rgba(0, 0, 0, 0.45)
          `
          : `
            0 1px 3px 0 rgba(0, 0, 0, 0.4),
            inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.55),
            inset 0 -2px 3px 0 rgba(0, 0, 0, 0.45)
          `,
        border: `1px solid ${theme.border}`,
      }}
    >
      {/* 3D Convex Dome / Specular Glare (Top-Left 3D lighting) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background:
            "radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.15) 35%, transparent 68%)",
        }}
      />

      {/* 3D Occlusion Vignette (Curved depth from bottom) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background:
            "linear-gradient(to top, rgba(0, 0, 0, 0.34) 0%, rgba(0, 0, 0, 0.08) 25%, transparent 55%)",
        }}
      />

      {/* 3D Diagonal Glass Highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, transparent 45%, rgba(0, 0, 0, 0.15) 100%)",
        }}
      />

      {/* Optional Photo Image */}
      {photo && !imageError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={name}
          className={cn(
            "absolute inset-0 size-full object-cover object-top rounded-[inherit] transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}

      {/* 3D Embossed Initials */}
      <span
        className={cn(
          "relative z-10 font-bold tracking-tight select-none",
          photo && imageLoaded ? "opacity-0" : "opacity-100",
        )}
        style={{
          color: theme.textColor,
          textShadow:
            "0 1px 2px rgba(0, 0, 0, 0.75), 0 -0.5px 0.5px rgba(255, 255, 255, 0.4)",
          filter: "drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.45))",
        }}
      >
        {initials(name)}
      </span>
    </div>
  );
}

// CaseAvatar drop-in component with full backward compatibility
export function CaseAvatar({
  name,
  id,
  photo,
  className,
  size = "md",
}: {
  name: string;
  id?: string;
  photo?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  return (
    <GradientAvatar
      name={name}
      id={id}
      photo={photo}
      className={className}
      size={size}
    />
  );
}
