import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.jpg'],
      manifest: {
        name: 'Document Sign',
        short_name: 'Document Sign',
        description: 'Sign documents and images securely, no account needed.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4f46e5',
        icons: [
          {
            src: '/icon.jpg',
            sizes: 'any',
            type: 'image/jpeg',
            purpose: 'any',
          },
          {
            src: '/icon.jpg',
            sizes: 'any',
            type: 'image/jpeg',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
