import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Card } from './ui/Card'
import { Spinner } from './ui/Spinner'
import { useToast } from './ui/Toast'

export default function ScanHistory() {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { show } = useToast()

    // Derived Stats
    const totalScans = history.length
    const threatsFound = history.filter(h => h.threat_level === 'high' || h.threat_level === 'medium').length

    useEffect(() => {
        loadHistory()
    }, [])

    const loadHistory = async () => {
        try {
            // Fetch a large page size to get all history
            const data = await api.getScanHistory(1, 100)
            setHistory(data.items)
        } catch (e) {
            show('Failed to load history', 'error')
        } finally {
            setLoading(false)
        }
    }

    const getThreatBadge = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'high': return 'bg-red-500/20 text-red-500 border-red-500/50'
            case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
            case 'low': return 'bg-[#00ff9d]/20 text-[#00ff9d] border-[#00ff9d]/50'
            default: return 'bg-gray-500/20 text-gray-500 border-gray-500/50'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header Cards (Synced with Data) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Total Scans Performed</p>
                            <h2 className="text-3xl font-black text-white mt-1">{totalScans}</h2>
                        </div>
                        <div className="p-3 bg-[#00f3ff]/10 rounded-lg">
                            <svg className="w-6 h-6 text-[#00f3ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Threats Detected</p>
                            <h2 className="text-3xl font-black text-[#ff0055] mt-1">{threatsFound}</h2>
                        </div>
                        <div className="p-3 bg-[#ff0055]/10 rounded-lg">
                            <svg className="w-6 h-6 text-[#ff0055]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Database Status</p>
                            <h2 className="text-xl font-black text-[#00ff9d] mt-2">ONLINE / SYNCED</h2>
                        </div>
                        <div className="p-3 bg-[#00ff9d]/10 rounded-lg animate-pulse">
                            <svg className="w-6 h-6 text-[#00ff9d]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Data Table */}
            <div className="glass-card overflow-hidden border border-white/10 rounded-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/40">
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Agent</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Threat Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Spinner className="w-4 h-4"/> Loading records...
                                        </div>
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No records found</td>
                                </tr>
                            ) : (
                                history.map((row) => (
                                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-gray-500">#{row.id}</td>
                                        <td className="p-4 text-white">
                                            {new Date(row.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-[#00f3ff]">{row.agent}</td>
                                        <td className="p-4 uppercase text-gray-400">{row.category}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getThreatBadge(row.threat_level)}`}>
                                                {row.threat_level}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}