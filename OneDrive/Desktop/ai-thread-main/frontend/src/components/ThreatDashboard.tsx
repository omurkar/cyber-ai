import { memo, useMemo, useState, useEffect, useRef } from 'react'
import { useThreatStore } from '../store/useThreatStore'
import { Card } from './ui/Card'
import { motion } from 'framer-motion'
import { api } from '../services/api'

// Define the shape of an event for type safety
interface ThreatEvent {
    type: string;
    data: {
        threat_level?: string;
        cpu?: number;
        mem?: { percent: number };
        disk?: { percent: number };
        [key: string]: any;
    };
}

function ThreatDashboardImpl() {
    // Correctly typed selector
    const events = useThreatStore(s => s.liveEvents) as ThreatEvent[]
    const [isBoosting, setIsBoosting] = useState(false)

    // Calculate Metrics based on history
    const stats = useMemo(() => {
        let total = 0
        let blocked = 0
        
        events.forEach(e => {
            if (e.data && e.data.threat_level) {
                total++
                if (e.data.threat_level === 'high') {
                    blocked++
                }
            }
        })
        return { total, blocked }
    }, [events])

    // Get latest system metrics
    const systemMetrics = events.find(e => e.type === 'system_metrics')?.data

    // TRIGGER BOOST: This function is called when timer hits 0
    const triggerBoost = () => {
        setIsBoosting(true)
        // Effect lasts 1.5 seconds then returns to normal
        setTimeout(() => setIsBoosting(false), 1500)
    }

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-4xl font-black tracking-tighter text-white mb-1">
                    COMMAND <span className="text-[#00f3ff] neon-text">CENTER</span>
                </h2>
                <p className="text-gray-400 font-mono text-xs tracking-widest uppercase">
                    Session Metrics & Threat Containment
                </p>
            </header>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. TOTAL SCANS CARD */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-8 relative overflow-hidden group min-h-[200px] flex flex-col justify-center"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-32 h-32 text-[#00f3ff]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    </div>
                    
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#00f3ff]"></span> Total Scans Performed
                    </h3>
                    <div className="text-7xl font-black text-white tracking-tighter z-10">
                        {stats.total.toLocaleString()}
                    </div>
                    <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden w-full max-w-xs">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-[#00f3ff] shadow-[0_0_15px_#00f3ff]" 
                        />
                    </div>
                    <p className="text-[#00f3ff] text-xs font-mono mt-2 uppercase tracking-wider">
                        Active Scanners: URL, File, Network, Device
                    </p>
                </motion.div>

                {/* 2. THREATS BLOCKED CARD */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-8 relative overflow-hidden group min-h-[200px] flex flex-col justify-center border-red-500/30"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-32 h-32 text-[#ff0055]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>

                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#ff0055]"></span> Threats Neutralized
                    </h3>
                    <div className="text-7xl font-black text-[#ff0055] tracking-tighter z-10 drop-shadow-[0_0_10px_rgba(255,0,85,0.5)]">
                        {stats.blocked.toLocaleString()}
                    </div>
                      <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden w-full max-w-xs">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.total > 0 ? (stats.blocked / stats.total) * 100 : 0}%` }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-[#ff0055] shadow-[0_0_15px_#ff0055]" 
                        />
                    </div>
                    <p className="text-[#ff0055] text-xs font-mono mt-2 uppercase tracking-wider">
                        High Severity Threats Blocked
                    </p>
                </motion.div>
            </div>

            {/* Secondary Info Row (Vitals & Timer) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Core Vitals">
                    <div className="space-y-4">
                        <MetricGauge label="CPU LOAD" percent={Math.round(systemMetrics?.cpu ?? 0)} color="#bc00ff" boosting={isBoosting} />
                        <MetricGauge label="RAM USAGE" percent={Math.round(systemMetrics?.mem?.percent ?? 0)} color="#00f3ff" boosting={isBoosting} />
                        <MetricGauge label="STORAGE" percent={Math.round(systemMetrics?.disk?.percent ?? 0)} color="#00ff9d" boosting={isBoosting} />
                    </div>
                </Card>

                <Card title="Auto Scan Timer">
                    <div className="flex flex-col justify-center h-full">
                          <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Next System Refresh Cycle</p>
                        <AutoScanTimer onRefresh={triggerBoost} />
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default memo(ThreatDashboardImpl)

// --- Helper Components ---

function MetricGauge({ label, percent, color, boosting }: { label: string, percent: number, color: string, boosting?: boolean }) {
    // SHOOT EFFECT: If boosting, value spikes to 100% immediately
    const displayPercent = boosting ? 100 : percent
    
    return (
        <div>
            <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-500 font-bold">{label}</span>
                <span className={`font-mono transition-colors duration-200 ${boosting ? 'text-white font-black text-shadow-glow' : 'text-gray-300'}`}>
                    {displayPercent}%
                </span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden relative">
                {/* Flash White Overlay when Boosting */}
                {boosting && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-white shadow-[0_0_15px_white]"
                    />
                )}
                <motion.div 
                    initial={false}
                    animate={{ width: `${displayPercent}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }} // High stiffness for "Shoot" effect
                    className="h-full relative z-10" 
                    style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} 
                />
            </div>
        </div>
    )
}

function AutoScanTimer({ onRefresh }: { onRefresh: () => void }) {
    const { autoscanInterval, autoscanStartTime, setAutoscanParams } = useThreatStore()
    const [timeLeft, setTimeLeft] = useState<number>(0)
    const [saving, setSaving] = useState(false)
    const timerRef = useRef<number | null>(null)

    // Sync timer with Persistent Store + Real Time
    useEffect(() => {
        if (autoscanInterval === 0) {
            setTimeLeft(0)
            return
        }

        const tick = () => {
            const now = Date.now()
            // Calculate relative to the stored START TIME
            const elapsedSeconds = Math.floor((now - autoscanStartTime) / 1000)
            const cycleSeconds = autoscanInterval * 60
            let remaining = cycleSeconds - (elapsedSeconds % cycleSeconds)
            
            // Handle edge case where remaining is negative or 0 improperly
            if (remaining <= 0) remaining = cycleSeconds

            // Trigger Boost at the end of cycle (when remaining hits 1 or exactly cycleSeconds on wrap)
            // We use a small window to ensure it fires
            if (remaining <= 1) {
                 onRefresh()
            }
            
            setTimeLeft(remaining)
        }

        // Run immediately then interval
        tick()
        timerRef.current = window.setInterval(tick, 1000)
        
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [autoscanInterval, autoscanStartTime, onRefresh])

    const handleIntervalChange = async (val: number) => {
        setSaving(true)
        try {
            await api.setAutoscan(val)
            // CRITICAL: Save new start time to Store so it persists
            setAutoscanParams(val, Date.now())
        } catch(e) {
            console.error("Failed to set autoscan", e)
        }
        setSaving(false)
    }

    const formatTime = (seconds: number) => {
        if (seconds <= 0) return "00:00"
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-black/40 border border-[#00f3ff]/20 rounded-lg p-4">
                <div className="text-[#00f3ff] font-mono text-4xl font-black tracking-widest drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                    {autoscanInterval === 0 ? "OFF" : formatTime(timeLeft)}
                </div>
                <div className={`w-3 h-3 rounded-full ${autoscanInterval > 0 ? 'bg-[#00f3ff] animate-pulse shadow-[0_0_10px_#00f3ff]' : 'bg-gray-800'}`} />
            </div>

            <div className="flex items-center gap-3">
                <select 
                    className="bg-black/40 border border-[#00f3ff]/30 text-[#00f3ff] text-xs rounded px-3 py-2 w-full focus:outline-none focus:border-[#00f3ff] hover:bg-[#00f3ff]/5 cursor-pointer transition-colors"
                    value={autoscanInterval} 
                    onChange={e => handleIntervalChange(parseInt(e.target.value))} 
                    disabled={saving}
                >
                    <option value={0}>TIMER DISABLED</option>
                    <option value={1}>1 MINUTE CYCLE</option>
                    <option value={5}>5 MINUTE CYCLE</option>
                    <option value={10}>10 MINUTE CYCLE</option>
                    <option value={30}>30 MINUTE CYCLE</option>
                </select>
                {saving && <span className="text-[#00f3ff] text-[10px] animate-spin">⟳</span>}
            </div>
        </div>
    )
}