// Supabase client configuration
// ⚠️  DO NOT commit real credentials to version control.
// Replace the placeholders below before deploying:
//   SUPABASE_URL      → Project Settings → API → Project URL
//   SUPABASE_ANON_KEY → Project Settings → API → anon/public key
// For production, load from environment variables via your build tool
// (e.g. Vite: import.meta.env.VITE_SUPABASE_URL) and add .env to .gitignore.
const SUPABASE_URL      = 'https://YOUR_PROJECT_REF.supabase.co'; // Replace
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';                        // Replace

// Import supabase-js from CDN when using this file as a module in a browser context,
// or install via: npm install @supabase/supabase-js
// This file is provided for modular setups; index.html uses an inline CDN build instead.
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
