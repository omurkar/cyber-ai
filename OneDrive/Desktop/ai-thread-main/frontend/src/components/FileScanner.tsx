import { useState, ChangeEvent } from 'react'
import { api } from '../services/api'
import { Spinner } from './ui/Spinner'
import { useToast } from './ui/Toast'
import { Card } from './ui/Card'

export default function FileScanner() {
	const [file, setFile] = useState<File | null>(null)
	const [result, setResult] = useState<any | null>(null)
	const [loading, setLoading] = useState(false)
    const { show } = useToast()

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		setFile(e.target.files?.[0] ?? null)
	}

	const run = async () => {
		if (!file) return
		setLoading(true)
        try {
            const data = await api.scanFile(file)
            setResult(data)
            show('File scan complete', 'info')
        } catch (e) {
            show('File scan failed', 'error')
        } finally { setLoading(false) }
	}

	return (
		<div className="space-y-6">
            <div className="glass-card flex items-center gap-4">
			    <input 
                    type="file" 
                    onChange={onChange} 
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#00f3ff]/10 file:text-[#00f3ff] hover:file:bg-[#00f3ff]/20" 
                />
                <button 
                    className="btn-cyber whitespace-nowrap" 
                    onClick={run} 
                    disabled={!file || loading}
                >
                    {loading ? (<span className="inline-flex items-center gap-2"><Spinner className="w-4 h-4" /> Analyzing...</span>) : 'INITIATE SCAN'}
                </button>
            </div>

            {result && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card title="Artifact Analysis">
                        <div className="text-sm space-y-3 font-mono">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-gray-500">Threat Classification</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${badge(result?.result?.threat_level)}`}>
                                    {result?.result?.threat_level || 'unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-gray-500">Entropy Score</span>
                                <span className="text-white">{result?.result?.entropy?.toFixed(4) ?? 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">File Size</span>
                                <span className="text-[#00f3ff]">{result?.result?.size_bytes ?? '0'} bytes</span>
                            </div>
                        </div>
                    </Card>
                    <Card title="Signature Matches (YARA)">
                        <ul className="text-xs space-y-2 max-h-48 overflow-auto cyber-scrollbar">
                            {(result?.result?.yara_hits || []).length === 0 ? (
                                <li className="text-gray-600 italic">No signatures matched.</li>
                            ) : (
                                (result?.result?.yara_hits || []).map((y: any, i: number) => (
                                    <li key={i} className="bg-red-500/10 border border-red-500/20 p-2 rounded text-red-400 font-mono">
                                        {y?.rule ?? 'rule'} {y?.meta ? `- ${JSON.stringify(y.meta)}` : ''}
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