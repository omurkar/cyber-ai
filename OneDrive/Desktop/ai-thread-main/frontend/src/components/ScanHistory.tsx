import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Skeleton } from './ui/Skeleton'

type Item = {
    id: number
    agent: string
    category: string
    threat_level: string
    created_at: string
}

export default function ScanHistory() {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasNext, setHasNext] = useState(false)
    const [filter, setFilter] = useState('')
    const [agent, setAgent] = useState('')

    const fetchPage = async (p: number) => {
        setLoading(true)
        const data = agent ? await api.scanHistoryByAgent(agent, p, 20) : await api.scanResults(p, 20)
        setItems(data.items)
        setHasNext(data.has_next)
        setLoading(false)
    }

    useEffect(() => { fetchPage(page) }, [page, agent])

    const filtered = useMemo(() => {
        const f = filter.trim().toLowerCase()
        if (!f) return items
        return items.filter(i => i.agent.toLowerCase().includes(f) || i.category.toLowerCase().includes(f) || i.threat_level.toLowerCase().includes(f))
    }, [items, filter])

    return (
        <div className="space-y-6">
            <Card title="Archived Scan Logs">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Input placeholder="Filter logs..." value={filter} onChange={e => setFilter(e.target.value)} className="flex-1" />
                    <Input placeholder="Filter by Agent..." value={agent} onChange={e => setAgent(e.target.value)} className="flex-1" />
                    <Button variant="ghost" onClick={() => window.open('/api/scan/results.csv', '_blank')}>EXPORT CSV</Button>
                </div>

                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-white/5">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-gray-400 font-mono text-xs uppercase">
                                <tr>
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Agent</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Threat</th>
                                    <th className="p-3">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map((i) => (
                                    <tr key={i.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 text-gray-500 font-mono">#{i.id}</td>
                                        <td className="p-3 text-[#00f3ff]">{i.agent}</td>
                                        <td className="p-3 text-gray-300">{i.category}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                i.threat_level === 'high' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 
                                                i.threat_level === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                                            }`}>
                                                {i.threat_level}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-500 text-xs">{new Date(i.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>PREV</Button>
                    <Button variant="ghost" onClick={() => setPage(p => p + 1)} disabled={!hasNext}>NEXT</Button>
                </div>
            </Card>
        </div>
    )
}