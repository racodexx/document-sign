import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  // plugins: [
  //   react({
  //     babel: {
  //       plugins: [['babel-plugin-react-compiler']],
  //     },
  //   }),
  // ],
  plugins: [react(), cloudflare()], // Try standard react plugin first
  server: {
    host: true, // Listen on all local IPs so ngrok can find the port
    allowedHosts: ['288b-178-132-108-95.ngrok-free.app'],
    hmr: {
      host: '288b-178-132-108-95.ngrok-free.app', // Explicitly tell HMR to use the tunnel URL
      clientPort: 443,
      protocol: 'wss', // Use secure web sockets
    },
  },
})