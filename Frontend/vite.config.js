import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	base: '/',
	server: {
		proxy: {
		  '/api': {
			target: 'https://sdk.piteas.io',
			changeOrigin: true,
			rewrite: path => path.replace(/^\/api/, ''),
		  }
		}
	  }
	// esbuild: {
	// 	drop: ['console']
	// }
})
