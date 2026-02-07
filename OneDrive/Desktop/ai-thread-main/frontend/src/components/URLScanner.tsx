import { useState, FormEvent } from 'react'
import { api } from '../services/api'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { useToast } from './ui/Toast'
import { Spinner } from './ui/Spinner'
import { Card } from './ui/Card'
import { motion, AnimatePresence } from 'framer-motion'

export default function URLScanner() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any | null>(null)
    const { show } = useToast()

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        if (!url) return
        
        setLoading(true)
        setResult(null) 
        try {
            const response = await api.scanUrl(url)
            // FIX: The API returns { agent: "...", result: { ... } }
            // We must set 'result' to the inner object to match our UI code.
            if (response && response.result) {
                setResult(response.result)
                show('Analysis complete', 'info')
            } else {
                throw new Error("Invalid response format")
            }
        } catch (e: any) {
            show(e?.message ?? 'Failed to scan URL', 'error')
        } finally {
            setLoading(false)
        }
    }

    const getThreatColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'high': return 'text-[#ff0055] drop-shadow-[0_0_8px_rgba(255,0,85,0.8)]'
            case 'medium': return 'text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]'
            case 'low': return 'text-[#00ff9d] drop-shadow-[0_0_8px_rgba(0,255,157,0.6)]'
            default: return 'text-gray-400'
        }
    }

    const getBorderColor = (level: string) => {
         switch (level?.toLowerCase()) {
            case 'high': return 'border-[#ff0055]/50'
            case 'medium': return 'border-[#ffd700]/50'
            case 'low': return 'border-[#00ff9d]/50'
            default: return 'border-white/10'
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card title="URL Threat Vector Analysis">
                <form onSubmit={submit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            Target Endpoint / Domain
                        </label>
                        <Input 
                            value={url} 
                            onChange={e => setUrl(e.target.value)} 
                            placeholder="https://example.com" 
                            className="w-full font-mono text-sm"
                        />
                    </div>
                    <Button disabled={loading} className="w-full md:w-auto min-w-[140px]">
                        {loading ? <Spinner className="w-4 h-4" /> : 'INITIATE SCAN'}
                    </Button>
                </form>
            </Card>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`glass-card p-6 border ${getBorderColor(result.threat_level)}`}
                    >
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 mb-4">
                            <div className="overflow-hidden w-full md:w-2/3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Analysis</h3>
                                <div className="text-lg md:text-xl font-mono text-white truncate" title={result.url}>
                                    {result.url}
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 text-right">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Threat Classification</div>
                                <div className={`text-3xl font-black uppercase tracking-tighter ${getThreatColor(result.threat_level)}`}>
                                    {result.threat_level || 'UNKNOWN'}
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Risk Score */}
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase text-gray-500 font-bold">Risk Score</div>
                                <div className="text-2xl font-mono text-white">
                                    {result.score ?? 0} <span className="text-sm text-gray-600">/ 100</span>
                                </div>
                            </div>
                            
                            {/* Domain Identity */}
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase text-gray-500 font-bold">Domain Identity</div>
                                <div className="text-sm font-mono text-[#00f3ff]">
                                    {result.domain || 'N/A'}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                    {result.dns && !result.dns.error ? 'DNS Resolved' : 'DNS Unresolved'}
                                </div>
                            </div>

                            {/* SSL Status */}
                             <div className="space-y-1">
                                <div className="text-[10px] uppercase text-gray-500 font-bold">SSL Certificate</div>
                                <div className={`text-sm font-mono ${result.ssl && !result.ssl.error && !result.ssl.skipped ? 'text-[#00ff9d]' : 'text-gray-400'}`}>
                                    {result.ssl && !result.ssl.error && !result.ssl.skipped ? 'VALID / ENCRYPTED' : 'UNSECURED / MISSING'}
                                </div>
                                {result.ssl && result.ssl.issuer && (
                                    <div className="text-[10px] text-gray-500 truncate" title={JSON.stringify(result.ssl.issuer)}>
                                        Issued by: {Object.values(result.ssl.issuer)[0] || 'Unknown'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Heuristic Hits */}
                        {(result.pattern_hits && result.pattern_hits.length > 0) && (
                            <div className="mt-6 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                                <div className="text-[10px] uppercase text-red-400 font-bold mb-2">Heuristic Anomalies Detected</div>
                                <ul className="list-disc list-inside text-xs text-red-300 font-mono">
                                    {result.pattern_hits.map((hit: string, i: number) => (
                                        <li key={i}>Pattern match: "{hit}"</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}