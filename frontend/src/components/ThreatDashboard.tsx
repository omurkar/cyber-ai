import { memo, useEffect, useMemo, useState } from 'react'
import { useThreatStore } from '../store/useThreatStore'
import { threatWS } from '../services/ws'
import { api } from '../services/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from './ui/Card'

function ThreatDashboardImpl() {
	const events = useThreatStore(s => s.liveEvents)
	const addEvent = useThreatStore(s => s.addEvent)
	const [progress, setProgress] = useState<Record<string, number>>({})
	const [alerts, setAlerts] = useState<string[]>([])
	const [wsStatus, setWsStatus] = useState('disconnected')

	useEffect(() => {
		threatWS.connect()
        const statusHandler = (s: string) => {
            console.log('[WS status]', s)
            setWsStatus(s)
        }
		const handler = (msg: any) => {
            console.log('[WS message]', msg)
			if (msg?.type === 'progress' && msg?.agent) {
				setProgress(p => ({ ...p, [msg.agent]: msg.percent }))
			}
			if ((msg?.type?.endsWith('_scan') || msg?.type === 'vuln_scan') && msg?.data?.threat_level === 'high') {
				setAlerts(a => [ `${msg.type} HIGH`, ...a].slice(0, 5))
			}
			addEvent(msg)
		}
		threatWS.on(handler)
        threatWS.onStatus(statusHandler)
        return () => { threatWS.off(handler); threatWS.offStatus(statusHandler) }
	}, [addEvent])

	const chartData = events.slice(0, 20).map((e, i) => ({ idx: 20 - i, sev: sevScore(e?.data?.threat_level) }))

	return (
		<div className="space-y-6">
			{alerts.length > 0 && (
				<div className="space-y-1">
					{alerts.map((a, i) => (
						<div key={i} className="alert-danger">{a}</div>
					))}
				</div>
			)}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card title="Connection">
                    <div className="text-sm">WebSocket: <span className={wsBadge(wsStatus)}>{wsStatus}</span></div>
                </Card>
                <Card title="Live Threat Level">
					<div className="h-48">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={chartData}>
								<XAxis dataKey="idx" hide />
								<YAxis domain={[0, 3]} tickFormatter={sevName} />
								<Tooltip formatter={(v) => sevName(Number(v))} />
								<Line type="monotone" dataKey="sev" stroke="#f87171" strokeWidth={2} dot={false} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</Card>
                <Card title="System Metrics">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <MetricGauge label="CPU" percent={Math.round((events.find(e => e.type==='system_metrics')?.data?.cpu) ?? 0)} />
                        <MetricGauge label="Memory" percent={Math.round((events.find(e => e.type==='system_metrics')?.data?.mem?.percent) ?? 0)} />
                        <MetricGauge label="Disk" percent={Math.round((events.find(e => e.type==='system_metrics')?.data?.disk?.percent) ?? 0)} />
                    </div>
                </Card>
                <Card title="Auto Scan">
                    <AutoScanControl />
                </Card>
                <Card title="Active Scans">
						<div className="space-y-2">
						{Object.entries(progress).map(([agent, pct]) => (
							<div key={agent}>
								<div className="text-xs text-gray-400 mb-1">{agent}</div>
									<div className="progress">
										<div className="progress-bar" style={{ width: `${pct}%` }}></div>
									</div>
							</div>
						))}
					</div>
				</Card>
                <Card title="Recent Events">
                    <VirtualEventList events={events} />
				</Card>
			</div>
		</div>
	)
}

export default memo(ThreatDashboardImpl)

function sevScore(level?: string) {
	switch(level) {
		case 'low': return 1
		case 'medium': return 2
		case 'high': return 3
		default: return 0
	}
}

function sevName(n: number) {
	return ['none','low','medium','high'][n] ?? 'none'
}

function sevColor(level?: string) {
	return level === 'high' ? 'bg-red-500' : level === 'medium' ? 'bg-yellow-400' : 'bg-green-500'
}

function MetricGauge({ label, percent }: { label: string, percent: number }) {
    const p = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0))
    return (
        <div>
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className="progress">
                <div className={`progress-bar ${p>80?'bg-red-500':p>60?'bg-yellow-400':'bg-green-500'}`} style={{ width: `${p}%` }} />
            </div>
            <div className="text-xs mt-1">{p}%</div>
        </div>
    )
}

function wsBadge(s: string) {
    const m = s || 'disconnected'
    if (m === 'connected') return 'px-2 py-0.5 rounded bg-green-600/30 text-green-100 border border-green-700'
    if (m === 'connecting') return 'px-2 py-0.5 rounded bg-yellow-600/30 text-yellow-100 border border-yellow-700'
    if (m === 'error' || m === 'disconnected') return 'px-2 py-0.5 rounded bg-red-600/30 text-red-100 border border-red-700'
    return 'px-2 py-0.5 rounded bg-gray-700 text-gray-200'
}

function AutoScanControl() {
    const [interval, setInterval] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)
    useEffect(() => { api.getAutoscan().then(d => setInterval(d.interval_minutes)) }, [])
    const save = async (val: number) => {
        setSaving(true)
        await api.setAutoscan(val)
        setInterval(val)
        setSaving(false)
    }
    return (
        <div className="flex items-center gap-3 text-sm">
            <div>Interval:</div>
            <select className="input !w-auto" value={interval ?? 0} onChange={e => save(parseInt(e.target.value))} disabled={saving}>
                <option value={0}>Disabled</option>
                <option value={1}>1 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={30}>30 min</option>
            </select>
        </div>
    )
}

function VirtualEventList({ events }: { events: any[] }) {
    const itemHeight = 40
    const containerHeight = 200
    const count = events.length
    const [scrollTop, setScrollTop] = useState(0)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 3)
    const endIndex = Math.min(count, startIndex + Math.ceil(containerHeight / itemHeight) + 6)
    const visible = events.slice(startIndex, endIndex)
    const topPadding = startIndex * itemHeight
    const bottomPadding = Math.max(0, (count - endIndex) * itemHeight)
    return (
        <div className="text-sm overflow-auto divide-y divide-gray-800" style={{ height: `${containerHeight}px` }} onScroll={e => setScrollTop((e.target as HTMLDivElement).scrollTop)}>
            <div style={{ paddingTop: `${topPadding}px`, paddingBottom: `${bottomPadding}px` }}>
                {visible.map((e, idx) => (
                    <div key={idx} className="py-2 flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${sevColor(e?.data?.threat_level)}`}></span>
                        {e.type} {e?.agent ? `(${e.agent})` : ''} {e?.percent !== undefined ? `- ${e.percent}%` : ''}
                    </div>
                ))}
            </div>
        </div>
    )
}
