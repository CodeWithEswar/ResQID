export type AvatarTheme = {
  name: string;
  from: string;
  via: string;
  to: string;
  glow: string;
  border: string;
  specular: string;
  textColor: string;
  angle: number;
};

export const CURATED_AVATAR_THEMES = [
  {
    name: "Electric Violet",
    from: "#7c3aed",
    via: "#c026d3",
    to: "#3b82f6",
    glow: "rgba(124, 58, 237, 0.45)",
    border: "rgba(196, 181, 253, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Cyber Cyan",
    from: "#0284c7",
    via: "#06b6d4",
    to: "#3b82f6",
    glow: "rgba(6, 182, 212, 0.45)",
    border: "rgba(165, 243, 252, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Emerald Aurora",
    from: "#059669",
    via: "#10b981",
    to: "#06b6d4",
    glow: "rgba(16, 185, 129, 0.45)",
    border: "rgba(167, 243, 208, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Sunset Coral",
    from: "#e11d48",
    via: "#f43f5e",
    to: "#f97316",
    glow: "rgba(244, 63, 94, 0.45)",
    border: "rgba(254, 205, 211, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Solar Flame",
    from: "#ea580c",
    via: "#f59e0b",
    to: "#e11d48",
    glow: "rgba(234, 88, 12, 0.45)",
    border: "rgba(254, 215, 170, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Neon Fuchsia",
    from: "#db2777",
    via: "#9333ea",
    to: "#6366f1",
    glow: "rgba(219, 39, 119, 0.45)",
    border: "rgba(251, 207, 232, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Cosmic Ultramarine",
    from: "#4f46e5",
    via: "#7c3aed",
    to: "#06b6d4",
    glow: "rgba(79, 70, 229, 0.45)",
    border: "rgba(199, 210, 254, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Mint Turquoise",
    from: "#0d9488",
    via: "#14b8a6",
    to: "#10b981",
    glow: "rgba(20, 184, 166, 0.45)",
    border: "rgba(153, 246, 228, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Crimson Rose",
    from: "#be123c",
    via: "#e11d48",
    to: "#fb7185",
    glow: "rgba(190, 18, 60, 0.45)",
    border: "rgba(254, 205, 211, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Golden Amber",
    from: "#d97706",
    via: "#f59e0b",
    to: "#facc15",
    glow: "rgba(217, 119, 6, 0.45)",
    border: "rgba(253, 230, 138, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Electric Iris",
    from: "#6366f1",
    via: "#a855f7",
    to: "#ec4899",
    glow: "rgba(99, 102, 241, 0.45)",
    border: "rgba(199, 210, 254, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Lime Verdant",
    from: "#15803d",
    via: "#16a34a",
    to: "#84cc16",
    glow: "rgba(22, 163, 74, 0.45)",
    border: "rgba(187, 247, 208, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Dragonfruit Bloom",
    from: "#9d174d",
    via: "#db2777",
    to: "#c026d3",
    glow: "rgba(219, 39, 119, 0.45)",
    border: "rgba(251, 207, 232, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
  {
    name: "Glacier Azure",
    from: "#0369a1",
    via: "#0ea5e9",
    to: "#38bdf8",
    glow: "rgba(14, 165, 233, 0.45)",
    border: "rgba(186, 230, 253, 0.4)",
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
  },
] as const;

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAvatarTheme(seed: string): AvatarTheme {
  const cleanSeed = (seed || "case").trim().toLowerCase();
  const hash = hashString(cleanSeed);
  const index = hash % CURATED_AVATAR_THEMES.length;
  const base = CURATED_AVATAR_THEMES[index];
  const angle = 125 + (hash % 45); // Dynamic angle between 125deg and 170deg

  return {
    ...base,
    angle,
  };
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function createThemeFromRgb(r: number, g: number, b: number): AvatarTheme {
  const [h, s] = rgbToHsl(r, g, b);
  const safeSat = Math.max(s, 55); // Ensure rich vibrancy
  const hue1 = h;
  const hue2 = (h + 30) % 360;
  const hue3 = (h - 25 + 360) % 360;

  return {
    name: `Detected-${h}`,
    from: `hsl(${hue1}, ${safeSat}%, 48%)`,
    via: `hsl(${hue2}, ${safeSat}%, 54%)`,
    to: `hsl(${hue3}, ${safeSat}%, 50%)`,
    glow: `hsla(${hue1}, ${safeSat}%, 52%, 0.45)`,
    border: `hsla(${hue1}, ${safeSat}%, 75%, 0.4)`,
    specular: "rgba(255, 255, 255, 0.65)",
    textColor: "#ffffff",
    angle: 135,
  };
}

export function extractDominantColor(
  imgSrc: string,
): Promise<{ r: number; g: number; b: number } | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !imgSrc) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, 16, 16);
        const data = ctx.getImageData(0, 0, 16, 16).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 128) continue;
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];
          const brightness = (pr + pg + pb) / 3;
          // Filter out near-black or blown-out white pixels to capture actual hue
          if (brightness < 25 || brightness > 235) continue;
          r += pr;
          g += pg;
          b += pb;
          count++;
        }
        if (count === 0) return resolve(null);
        resolve({
          r: Math.round(r / count),
          g: Math.round(g / count),
          b: Math.round(b / count),
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imgSrc;
  });
}
