// Supabase client configuration
// ⚠️  DO NOT commit real credentials to version control.
// Replace the placeholders below before deploying:
//   SUPABASE_URL      → Project Settings → API → Project URL
//   SUPABASE_ANON_KEY → Project Settings → API → anon/public key
// For production, load from environment variables via your build tool
// (e.g. Vite: import.meta.env.VITE_SUPABASE_URL) and add .env to .gitignore.
const SUPABASE_URL      = 'https://ufgnzifsekbfcnjgugpa.supabase.co'; // Replace
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZ256aWZzZWtiZmNuamd1Z3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTk1MzYsImV4cCI6MjA4Nzk5NTUzNn0.38U8bHYTFeMvXF0wJ77coqt_l2UfZwGGuseF_jpXlOs';                        // Replace

// Import supabase-js from CDN when using this file as a module in a browser context,
// or install via: npm install @supabase/supabase-js
// This file is provided for modular setups; index.html uses an inline CDN build instead.
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
