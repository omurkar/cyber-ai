import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Skeleton } from './ui/Skeleton'

export default function AgentStatus() {
    const [data, setData] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        api.agentsStatus().then(d => setData(d)).finally(() => setLoading(false))
    }, [])
    if (loading) return <Skeleton className="h-40" />
    if (!data) return <div className="alert-warn">No data</div>
    return (
        <div>
            <pre className="code-block">{JSON.stringify(data, null, 2)}</pre>
        </div>
    )
}
