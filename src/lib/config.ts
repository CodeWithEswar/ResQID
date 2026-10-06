export const configuration = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  apiUrl: (process.env.NEXT_PUBLIC_MODEL_API_URL ?? "").replace(/\/$/, ""),
};
export const configured = Boolean(
  /^https:\/\//.test(configuration.supabaseUrl) &&
  configuration.supabaseKey &&
  /^https?:\/\//.test(configuration.apiUrl) &&
  !Object.values(configuration).some((value) => value.includes("YOUR_")),
);
