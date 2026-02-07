import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Skeleton } from './ui/Skeleton'
import { Card } from './ui/Card'

export default function AgentStatus() {
    const [data, setData] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.agentsStatus().then(d => setData(d)).finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    )

    if (!data) return <div className="text-red-500 font-bold border border-red-500/50 p-4 rounded bg-red-500/10">No agent data available.</div>

    return (
        <Card title="Agent Diagnostics">
            <div className="bg-black/50 p-4 rounded-lg border border-white/5 font-mono text-xs text-[#00ff9d] overflow-auto max-h-[500px]">
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        </Card>
    )
}