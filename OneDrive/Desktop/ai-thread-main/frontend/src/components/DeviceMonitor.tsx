import { useState } from 'react'
import { api } from '../services/api'
import { Spinner } from './ui/Spinner'
import { Card } from './ui/Card'
import { useToast } from './ui/Toast'

export default function DeviceMonitor() {
	const [result, setResult] = useState<any | null>(null)
	const [loading, setLoading] = useState(false)
    const { show } = useToast()

	const run = async () => {
		setLoading(true)
        try {
            const data = await api.scanDevice()
            setResult(data)
            show('Device scan complete', 'info')
        } catch (e) {
            show('Device scan failed', 'error')
        } finally { setLoading(false) }
	}

	return (
		<div className="space-y-6">
            <div className="glass-card flex justify-between items-center">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Endpoint Security</h3>
                    <p className="text-[10px] text-gray-500">Monitor active processes and ports</p>
                </div>
                <button className="btn-cyber" onClick={run} disabled={loading}>
                    {loading ? (<span className="inline-flex items-center gap-2"><Spinner className="w-4 h-4" /> SCANNING...</span>) : 'SCAN DEVICE'}
                </button>
            </div>

            {result && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card title="System Overview">
                        <div className="text-sm space-y-3 font-mono">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-gray-500">Threat Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                    result?.result?.threat_level === 'high' ? 'text-red-500 bg-red-500/10 border border-red-500/50' : 'text-[#00ff9d] bg-[#00ff9d]/10 border border-[#00ff9d]/50'
                                }`}>
                                    {result?.result?.threat_level || 'unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Suspicious Processes</span>
                                <span className="text-[#ff0055] font-bold">{result?.result?.suspicious_processes?.length ?? 0}</span>
                            </div>
                        </div>
                    </Card>

                    <Card title="Process Watchlist">
                        <ul className="space-y-2 max-h-48 overflow-auto cyber-scrollbar">
                            {(result?.result?.suspicious_processes || []).map((p: any, i: number) => (
                                <li key={i} className="flex justify-between items-center bg-red-500/5 p-2 rounded border border-red-500/10">
                                    <span className="text-red-400 text-xs font-bold">{p?.name ?? 'unknown'}</span>
                                    <span className="text-[10px] text-gray-500 font-mono">PID: {p?.pid}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card title="Open Ports">
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-auto cyber-scrollbar">
                            {(result?.result?.open_ports || []).map((prt: any, i: number) => (
                                <span key={i} className="px-2 py-1 bg-[#00f3ff]/10 text-[#00f3ff] text-xs font-mono rounded border border-[#00f3ff]/30">
                                    {prt}
                                </span>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
		</div>
	)
}