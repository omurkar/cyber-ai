import { memo, useEffect, useState } from 'react'
import { useThreatStore } from '../store/useThreatStore'
import { threatWS } from '../services/ws'
import { api } from '../services/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from './ui/Card'

function ThreatDashboardImpl() {
	const events = useThreatStore(s => s.liveEvents)
	const addEvent = useThreatStore(s => s.addEvent)
	const [progress, setProgress] = useState<Record<string, number>>({})
	const [alerts, setAlerts] = useState<string[]>([])
	const [wsStatus, setWsStatus] = useState('disconnected')

	useEffect(() => {
		threatWS.connect()
        const statusHandler = (s: string) => setWsStatus(s)
		const handler = (msg: any) => {
			if (msg?.type === 'progress' && msg?.agent) {
				setProgress(p => ({ ...p, [msg.agent]: msg.percent }))
			}
			if ((msg?.type?.endsWith('_scan') || msg?.type === 'vuln_scan') && msg?.data?.threat_level === 'high') {
				setAlerts(a => [ `${msg.type.toUpperCase()} THREAT`, ...a].slice(0, 5))
			}
			addEvent(msg)
		}
		threatWS.on(handler)
        threatWS.onStatus(statusHandler)
        return () => { threatWS.off(handler); threatWS.offStatus(statusHandler) }
	}, [addEvent])

    // Cyberpunk Chart Data
	const chartData = events.slice(0, 20).map((e, i) => ({ 
        idx: 20 - i, 
        val: e?.data?.threat_level === 'high' ? 3 : e?.data?.threat_level === 'medium' ? 2 : 1 
    })).reverse()

	return (
		<div className="space-y-6">
            {/* Alert Banner */}
			{alerts.length > 0 && (
				<div className="space-y-2">
					{alerts.map((a, i) => (
						<div key={i} className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg font-bold tracking-wider animate-pulse flex items-center gap-3">
                            <span>⚠</span> {a}
                        </div>
					))}
				</div>
			)}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* WebSocket Status */}
                <Card title="System Uplink">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs uppercase">Status</span>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                            wsStatus === 'connected' ? 'bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/50' : 'bg-red-500/20 text-red-500 border border-red-500/50'
                        }`}>
                            {wsStatus}
                        </span>
                    </div>
                </Card>

                {/* Threat Graph */}
                <div className="md:col-span-3 glass-card p-6 h-64">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Live Threat Signature</h3>
					<ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="idx" hide />
                            <YAxis domain={[0, 4]} hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#000', borderColor: '#333' }}
                                itemStyle={{ color: '#00f3ff' }}
                            />
                            <Area type="monotone" dataKey="val" stroke="#00f3ff" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                    </ResponsiveContainer>
				</div>

                {/* System Metrics */}
                <Card title="Core Vitals">
                    <div className="space-y-4">
                        <MetricGauge label="CPU LOAD" percent={Math.round((events.find(e => e.type==='system_metrics')?.data?.cpu) ?? 0)} color="#bc00ff" />
                        <MetricGauge label="RAM USAGE" percent={Math.round((events.find(e => e.type==='system_metrics')?.data?.mem?.percent) ?? 0)} color="#00f3ff" />
                    </div>
                </Card>

                {/* Active Scans */}
                <Card title="Agent Activity">
                    <div className="space-y-3">
                        {Object.entries(progress).length === 0 && <div className="text-gray-600 italic text-xs">No active agents...</div>}
						{Object.entries(progress).map(([agent, pct]) => (
							<div key={agent}>
								<div className="flex justify-between text-[10px] text-gray-400 mb-1 uppercase tracking-wider">
                                    <span>{agent}</span>
                                    <span>{pct}%</span>
                                </div>
								<div className="h-1 bg-gray-800 rounded-full overflow-hidden">
									<div className="h-full bg-[#00ff9d] shadow-[0_0_10px_#00ff9d]" style={{ width: `${pct}%` }}></div>
								</div>
							</div>
						))}
					</div>
				</Card>

                {/* Auto Scan Controls */}
                <Card title="Sentinel Config">
                    <AutoScanControl />
                </Card>

                {/* Event Feed */}
                <div className="md:col-span-4 glass-card p-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Neural Event Log</h3>
                    <VirtualEventList events={events} />
				</div>
			</div>
		</div>
	)
}

export default memo(ThreatDashboardImpl)

function MetricGauge({ label, percent, color }: { label: string, percent: number, color: string }) {
    return (
        <div>
            <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-500 font-bold">{label}</span>
                <span className="text-white font-mono">{percent}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
            </div>
        </div>
    )
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
        <div className="flex items-center gap-3">
            <select 
                className="bg-black/40 border border-[#ff0055]/30 text-[#ff0055] text-xs rounded px-2 py-1 w-full focus:outline-none focus:border-[#ff0055]" 
                value={interval ?? 0} 
                onChange={e => save(parseInt(e.target.value))} 
                disabled={saving}
            >
                <option value={0}>MANUAL MODE</option>
                <option value={1}>EVERY 1 MIN</option>
                <option value={5}>EVERY 5 MIN</option>
                <option value={10}>EVERY 10 MIN</option>
            </select>
        </div>
    )
}

function VirtualEventList({ events }: { events: any[] }) {
    return (
        <div className="h-48 overflow-auto cyber-scrollbar space-y-2 pr-2">
            {events.map((e, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded bg-white/5 border border-white/5">
                    <span className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${
                        e?.data?.threat_level === 'high' ? 'text-red-500 bg-red-500' : 
                        e?.data?.threat_level === 'medium' ? 'text-yellow-400 bg-yellow-400' : 'text-green-500 bg-green-500'
                    }`} />
                    <span className="text-xs font-mono text-gray-300">
                        {e.type.toUpperCase()}
                    </span>
                    {e?.agent && <span className="text-[10px] text-gray-500 bg-black/50 px-1 rounded">{e.agent}</span>}
                </div>
            ))}
        </div>
    )
}