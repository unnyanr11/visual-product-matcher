export const config = {
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    baseUrl: "https://generativelanguage.googleapis.com/v1",
    model: "gemini-2.0-flash-lite", // updated model name
  },
  google: {
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    cx: import.meta.env.VITE_GOOGLE_CX,
  },
  isConfigured:
    !!import.meta.env.VITE_GEMINI_API_KEY &&
    !!import.meta.env.VITE_GOOGLE_API_KEY &&
    !!import.meta.env.VITE_GOOGLE_CX,
};
