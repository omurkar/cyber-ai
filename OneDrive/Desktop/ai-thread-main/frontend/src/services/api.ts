import axios from 'axios'

const client = axios.create({
	baseURL: '/api',
	withCredentials: false,
})

export const api = {
	scanUrl: (url: string) => client.post('/scan/url', { url }).then(r => r.data),
	scanDevice: () => client.post('/scan/device').then(r => r.data),
	scanNetwork: () => client.post('/scan/network').then(r => r.data),
	scanFile: (file: File) => {
		const formData = new FormData()
		formData.append('file', file)
		return client.post('/scan/file', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		}).then(r => r.data)
	},
	scanVulnerability: (product?: string) => client.post('/scan/vulnerability', { product }).then(r => r.data),
	agentsStatus: () => client.get('/agents/status').then(r => r.data),
    // New retrieval APIs
    scanResults: (page = 1, pageSize = 20) => client.get(`/scan/results`, { params: { page, page_size: pageSize } }).then(r => r.data),
    scanResultById: (scanId: number) => client.get(`/scan/results/${scanId}`).then(r => r.data),
    scanHistoryByAgent: (agentType: string, page = 1, pageSize = 20) => client.get(`/scan/history/${agentType}`, { params: { page, page_size: pageSize } }).then(r => r.data),
    getAutoscan: () => client.get('/autoscan').then(r => r.data),
    setAutoscan: (intervalMinutes: number) => client.post('/autoscan', { interval_minutes: intervalMinutes }).then(r => r.data),
}
