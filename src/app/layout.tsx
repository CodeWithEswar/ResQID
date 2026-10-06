import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://resq.vercel.app",
  ),
  title: {
    default: "ResQ — Biometric Face Search & Lead Verification",
    template: "%s | ResQ",
  },
  description:
    "Bring missing-person registry cases, YuNet face alignment, pretrained SFace biometrics, and verified human audit workflows together in one workspace.",
  applicationName: "ResQ",
  keywords: [
    "ResQ",
    "biometric face search",
    "missing persons",
    "reunification platform",
    "SFace",
    "YuNet",
    "forensic leads",
    "independent review",
  ],
  authors: [{ name: "ResQ Team" }],
  icons: {
    icon: "/assets/resq-favicon.png",
    shortcut: "/assets/resq-favicon.png",
    apple: "/assets/resq-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://resq.vercel.app",
    siteName: "ResQ",
    title: "ResQ — Biometric Face Search & Lead Verification",
    description:
      "Bring missing-person cases, face search, evidence, and independent team review together in one workspace.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResQ — Biometric Face Search & Lead Verification",
    description:
      "Bring missing-person cases, face search, evidence, and independent team review together in one workspace.",
    creator: "@resq",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
