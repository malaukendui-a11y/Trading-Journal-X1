import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'

const securityHeaders = JSON.parse(
  fs.readFileSync(new URL('./security-headers.json', import.meta.url), 'utf-8')
)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    headers: securityHeaders,
  },
})