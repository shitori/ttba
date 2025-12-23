import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { nojekyllPlugin } from './vite-plugin-nojekyll.js'

export default defineConfig({
  base: '/ttba/',
  plugins: [vue(), nojekyllPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  }
})

