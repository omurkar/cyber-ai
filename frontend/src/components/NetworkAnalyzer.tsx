import { useState } from 'react'
import { api } from '../services/api'
import { Spinner } from './ui/Spinner'
import { useToast } from './ui/Toast'
import { Card } from './ui/Card'

export default function NetworkAnalyzer() {
	const [result, setResult] = useState<any | null>(null)
	const [loading, setLoading] = useState(false)
    const { show } = useToast()

	const run = async () => {
		setLoading(true)
        try {
            const data = await api.scanNetwork()
            setResult(data)
            show('Network scan complete')
        } catch (e) {
            show('Network scan failed', 'error')
        } finally { setLoading(false) }
	}

	return (
		<div className="space-y-3">
            <button className="btn-primary" onClick={run} disabled={loading}>{loading ? (<span className="inline-flex items-center gap-2"><Spinner size={16} /> Scanning...</span>) : 'Scan Network'}</button>
            {result && (
                <div className="grid md:grid-cols-2 gap-4">
                    <Card title="Overview">
                        <div className="text-sm space-y-1">
                            <div>Threat level: <span className={`px-2 py-0.5 rounded ${badge(result?.result?.threat_level)}`}>{result?.result?.threat_level || 'unknown'}</span></div>
                            <div>Suspicious connections: {result?.result?.suspicious_connections?.length ?? 0}</div>
                        </div>
                    </Card>
                    <Card title="Suspicious Connections">
                        <ul className="text-sm list-disc pl-5 space-y-1 max-h-48 overflow-auto">
                            {(result?.result?.suspicious_connections || []).map((c: any, i: number) => (
                                <li key={i}>{c?.remote_ip ?? 'unknown'}:{c?.port ?? ''} ({c?.protocol ?? 'tcp'})</li>
                            ))}
                        </ul>
                    </Card>
                </div>
            )}
		</div>
	)
}

function badge(level?: string) {
    switch ((level || '').toLowerCase()) {
        case 'high': return 'bg-red-600/30 text-red-200 border border-red-700'
        case 'medium': return 'bg-yellow-600/30 text-yellow-100 border border-yellow-700'
        case 'low': return 'bg-green-600/30 text-green-100 border border-green-700'
        default: return 'bg-gray-700 text-gray-200'
    }
}
