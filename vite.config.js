import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const blockRobots = env.VITE_BLOCK_ROBOTS === 'true'

  return {
    server: { port: 3000 },
    plugins: [
      vue(),
      {
        name: 'portal-robots',
        transformIndexHtml() {
          return blockRobots
            ? [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' }]
            : []
        },
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'robots.txt',
            source: `User-agent: *\nDisallow: ${blockRobots ? '/' : ''}\n`
          })
        }
      }
    ]
  }
})
