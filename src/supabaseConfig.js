// Supabase client configuration
// Replace these placeholders with your actual Supabase project credentials.
// Find them at: https://app.supabase.com → Project Settings → API
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co'; // Replace with your project URL
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'; // Replace with your project's anon/public key

// Import supabase-js from CDN when using this file as a module in a browser context,
// or install via: npm install @supabase/supabase-js
// This file is provided for modular setups; index.html uses an inline CDN build instead.
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
