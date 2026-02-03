import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:8000'
	// For WS proxy, Vite ignores protocol and derives ws based on request
	return {
		plugins: [react()],
		server: {
			port: 5173,
			proxy: {
				'/api': {
					target: backendUrl,
					changeOrigin: true,
					secure: false,
				},
				'/ws': {
					target: backendUrl,
					ws: true,
					changeOrigin: true,
					secure: false,
				}
			}
		}
	}
})
