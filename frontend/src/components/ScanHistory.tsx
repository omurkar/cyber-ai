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
        <div className="space-y-4">
            <Card title="Scan History">
                <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
                    <div className="flex gap-2">
                        <Input placeholder="Filter..." value={filter} onChange={e => setFilter(e.target.value)} style={{ maxWidth: 240 }} />
                        <Input placeholder="Agent (optional)" value={agent} onChange={e => setAgent(e.target.value)} style={{ maxWidth: 240 }} />
                        <Button onClick={() => window.open('/api/scan/results.csv', '_blank')}>Export CSV</Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                        <Button variant="ghost" onClick={() => setPage(p => p + 1)} disabled={!hasNext}>Next</Button>
                    </div>
                </div>
                {loading ? (
                    <Skeleton className="h-40 mt-4" />
                ) : (
                    <div className="mt-4 overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400">
                                    <th className="py-2">ID</th>
                                    <th className="py-2">Agent</th>
                                    <th className="py-2">Category</th>
                                    <th className="py-2">Threat</th>
                                    <th className="py-2">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtered.map((i) => (
                                    <tr key={i.id}>
                                        <td className="py-2">{i.id}</td>
                                        <td className="py-2">{i.agent}</td>
                                        <td className="py-2">{i.category}</td>
                                        <td className="py-2"><span className={`px-2 py-0.5 rounded ${badge(i.threat_level)}`}>{i.threat_level}</span></td>
                                        <td className="py-2">{new Date(i.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
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


