// vite.config.js
export default {
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Don't polyfill Node.js modules in browser
      buffer: 'buffer',
      process: 'process/browser',
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
}
