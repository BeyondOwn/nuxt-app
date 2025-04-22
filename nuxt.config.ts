// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['@/assets/styles/globals.css'],
  plugins: ['~/plugins/process', '~/plugins/apexCharts.client'],
  vite: {
    plugins: [tailwindcss()],
  },
  colorMode: {
    preference: 'system',
    dataValue: 'theme',
    classSuffix: '',
  },
  fonts: {
    provider: 'google',
    families: [
      {
        name: 'Poppins',
        weights: [100, 200, 300, 400, 500, 600, 700, 800],
        fallbacks: ['Arial'],
      },
      {
        name: 'Montserrat',
        weights: [400, 500, 600, 700, 800],
        fallbacks: ['Arial'],
      },
    ],
  },
  supabase: {
    redirectOptions: {
      login: '/login', // Path to redirect user to for login
      callback: 'https://fcfxbrlvhdcsqawzbvej.supabase.co/auth/v1/callback', // Path Supabase redirects back to after auth
      exclude: [
        // Paths excluded from automatic auth redirection // Example: Don't protect homepage
        '/stats',
        '/',
        '/register', // Example: Allow access to registration page
        '/api/*', // IMPORTANT: Exclude API routes from CLIENT-SIDE redirect checks
        // We handle API auth on the server-side (middleware/route handler)
      ],
    },

    // Configuration for the authentication cookie
    cookieOptions: {
      maxAge: 60 * 60 * 8, // Cookie expiry time in seconds (e.g., 8 hours)
      sameSite: 'lax', // 'lax' is generally recommended for OAuth redirects
      // Automatically sets 'secure' to true in production based on NODE_ENV
      // Secure: process.env.NODE_ENV === 'production', // You can be explicit if needed
    },
  },
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    public: {},
  },

  hooks: {
    'nitro:config': (nitroConfig) => {
      // console.log("process.env.NUXT_SUPABASE_URL:", process.env.SUPABASE_URL);
      // console.log("process.env.NUXT_SUPABASE_KEY:", process.env.SUPABASE_KEY);
      // console.log("process.env.NUXT_GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
    },
  },
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error'],
    },
  },
  modules: ['@nuxt/eslint', '@nuxt/content', '@nuxt/fonts', '@nuxt/icon', '@nuxt/image', '@nuxt/scripts', '@nuxt/test-utils', '@nuxt/ui', '@nuxtjs/supabase'],
})
