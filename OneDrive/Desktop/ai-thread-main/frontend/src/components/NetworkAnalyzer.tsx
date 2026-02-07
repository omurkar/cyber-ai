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
            show('Network scan complete', 'info')
        } catch (e) {
            show('Network scan failed', 'error')
        } finally { setLoading(false) }
	}

	return (
		<div className="space-y-6">
            <div className="glass-card flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Network Traffic Analysis</h3>
                    <p className="text-[10px] text-gray-500">Scan local ports and active connections</p>
                </div>
                <button className="btn-cyber" onClick={run} disabled={loading}>
                    {loading ? (<span className="inline-flex items-center gap-2"><Spinner className="w-4 h-4" /> Scanning...</span>) : 'START MONITORING'}
                </button>
            </div>
            
            {result && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card title="Traffic Overview">
                        <div className="text-sm space-y-3 font-mono">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-gray-500">Overall Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${badge(result?.result?.threat_level)}`}>
                                    {result?.result?.threat_level || 'unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Flagged Connections</span>
                                <span className="text-[#ff0055] font-bold">{result?.result?.suspicious_connections?.length ?? 0}</span>
                            </div>
                        </div>
                    </Card>
                    <Card title="Anomalous Connections">
                        <ul className="text-xs space-y-2 max-h-64 overflow-auto cyber-scrollbar">
                            {(result?.result?.suspicious_connections || []).length === 0 ? (
                                <li className="text-gray-600 italic p-2">No suspicious traffic detected.</li>
                            ) : (
                                (result?.result?.suspicious_connections || []).map((c: any, i: number) => (
                                    <li key={i} className="bg-red-500/5 border border-red-500/10 p-2 rounded flex justify-between items-center group hover:bg-red-500/10 transition-colors">
                                        <span className="text-gray-300 font-mono">{c?.remote_ip ?? 'unknown'}:{c?.port ?? ''}</span>
                                        <span className="text-[#ff0055] text-[10px] font-bold uppercase">{c?.protocol ?? 'tcp'}</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </Card>
                </div>
            )}
		</div>
	)
}

function badge(level?: string) {
    switch ((level || '').toLowerCase()) {
        case 'high': return 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/50 shadow-[0_0_10px_#ff0055]'
        case 'medium': return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
        case 'low': return 'bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/50'
        default: return 'bg-gray-700 text-gray-200'
    }
}