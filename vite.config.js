import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Optimize images during build
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  // Image optimization recommendations:
  // - Use WebP format for better compression
  // - Implement responsive images with srcset
  // - Add lazy loading attributes
  // - Consider using picture elements for art direction
})
