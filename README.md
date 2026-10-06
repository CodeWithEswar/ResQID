# ResQID — Biometric Face Search & Lead Verification Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Storage-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **ResQID** is an end-to-end mission-critical biometric search and lead verification web application. Built with Next.js 16 (App Router), it connects field incident data, neural facial recognition inference (YOLOv8 + OpenCV YuNet + SFace), and human-in-the-loop forensic audit workflows into a unified, responsive workspace.

---

## Features

- **Biometric Face Search & Quality Filter**:
  - Live camera, photo, and video frame face analysis.
  - Neural alignment and SFace deep feature vector comparison.
  - Strict pose, illumination, and blur suitability filters to eliminate low-quality matches.
- **Unified Case Management**:
  - Comprehensive registry of missing persons with status tracking (`active`, `review`, `matched`, `resolved`, `closed`).
  - Search, status filters, age group filters, and urgent priority sorting.
  - Full case details with signed reference photos, metadata, and ear evidence.
- **Independent Team Review Queue**:
  - Dual-operator verification protocol before leads are marked resolved.
  - Forensic lead timelines, visual side-by-side comparison drawers, and audit notes.
- **High-Performance Midnight UI**:
  - Pure solid purple action design system (`#7c3aed`), dark obsidian surfaces (`#09090b`), and subtle zinc borders.
  - Mobile-responsive drawer navigation, sheets, and alert dialogs.
  - Dynamic Open Graph (`1200x630`) and Twitter preview cards with vector branding.

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/CodeWithEswar/ResQID.git
cd ResQID

# Install dependencies
npm install

# Setup local environment
cp .env.example .env.local
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.example` to `.env.local` (or configure in Vercel Project Settings):

```env
# Supabase Project Configuration
NEXT_PUBLIC_SUPABASE_URL=https://exeeiqkfrswhlipsucit.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_uN-i671xFsf8Nn9NVzzfyQ_yLyrNGj3

# Biometric Model Service (FastAPI)
NEXT_PUBLIC_MODEL_API_URL=https://resqbackend-t1wv.onrender.com

# Canonical Application URL
NEXT_PUBLIC_APP_URL=https://resqid.vercel.app
```

---

## Deploying to Vercel

1. Import this repository into [Vercel](https://vercel.com).
2. Set Framework Preset to **Next.js**.
3. Add the 4 environment variables from above:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_MODEL_API_URL`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!
5. In your **Supabase Dashboard** → **Authentication** → **URL Configuration** → **Redirect URLs**, add:
   ```text
   https://resqid.vercel.app/auth/callback
   ```

---

## Verification & Testing

```bash
# Run unit & API adapter test suites
npm test

# Run TypeScript typecheck
npm run typecheck

# Run production build
npm run build
```

---

## License

This project is licensed under the [MIT License](LICENSE).
