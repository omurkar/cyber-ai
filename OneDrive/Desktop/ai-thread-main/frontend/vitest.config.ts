import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:8000'
	
	return {
		plugins: [react()],
		resolve: {
            // CRITICAL: Forces a single React instance
			dedupe: ['react', 'react-dom'],
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
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