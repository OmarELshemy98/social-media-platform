/**
 * @file vite.config.js
 * @description الفايل ده هو "إعدادات المحرك" (Vite Config).
 * هنا بنعرف إننا شغالين بـ React وبنحدد الإضافات (Plugins) اللي محتاجينها عشان الموقع يشتغل ويتعمل له Build صح.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
  },
})
