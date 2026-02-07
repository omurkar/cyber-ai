import { useState } from 'react'
import { api } from '../services/api'
import { Spinner } from './ui/Spinner'
import { Card } from './ui/Card'
import { useToast } from './ui/Toast'

export default function DeviceMonitor() {
    const [scanData, setScanData] = useState<any | null>(null)
    const [loading, setLoading] = useState(false)
    const { show } = useToast()

    const run = async () => {
        setLoading(true)
        try {
            const response = await api.scanDevice()
            // Handle backend response format
            const actualResult = response.result || response
            setScanData(actualResult)
            show('System scan complete', 'info')
        } catch (e) {
            show('Scan failed', 'error')
        } finally { setLoading(false) }
    }

    // --- LOGIC: FORCE THREAT LEVEL BASED ON COUNTS ---
    const suspiciousCount = scanData?.suspicious_processes?.length || 0
    
    let threatLevel = 'LOW'
    let statusColor = 'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/50' // Green

    if (loading) {
        threatLevel = 'SCANNING...'
        statusColor = 'text-[#00f3ff] bg-[#00f3ff]/10 border-[#00f3ff]/50' // Blue
    } else if (scanData) {
        if (suspiciousCount === 0) {
            threatLevel = 'LOW'
            statusColor = 'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/50' // Green
        } else if (suspiciousCount <= 5) {
            threatLevel = 'MEDIUM'
            statusColor = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/50' // Yellow
        } else {
            threatLevel = 'HIGH'
            statusColor = 'text-red-500 bg-red-500/10 border-red-500/50' // Red
        }
    } else {
        // Default state before scan
        threatLevel = 'SYSTEM SECURE' 
        statusColor = 'text-gray-400 bg-gray-500/10 border-gray-500/50'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card flex justify-between items-center">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Endpoint Security</h3>
                    <p className="text-[10px] text-gray-500">Monitor active processes and system files</p>
                </div>
                <button className="btn-cyber min-w-[160px]" onClick={run} disabled={loading}>
                    {loading ? (
                        <span className="inline-flex items-center gap-2">
                            <Spinner className="w-4 h-4" /> ANALYZING...
                        </span>
                    ) : 'INITIATE SCAN'}
                </button>
            </div>

            {/* MAIN RESULT - Single Card View */}
            <div className="max-w-2xl mx-auto">
                <Card title="System Overview">
                    <div className="p-4 space-y-6">
                        
                        {/* Threat Status Badge */}
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Current Threat Status</span>
                            <span className={`px-6 py-2 rounded text-2xl font-black uppercase border-2 ${statusColor} shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
                                {threatLevel}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/5 w-full"></div>

                        {/* Counts */}
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-white/5 rounded border border-white/5">
                                <div className="text-3xl font-bold text-white mb-1">
                                    {scanData ? suspiciousCount : '-'}
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase">Suspicious Processes</div>
                            </div>
                            
                            <div className="p-3 bg-white/5 rounded border border-white/5">
                                <div className="text-3xl font-bold text-white mb-1">
                                    {scanData?.open_ports?.length ?? '-'}
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase">Open Ports</div>
                            </div>
                        </div>

                        {/* Helper Message */}
                        <div className="text-center pt-2">
                             {suspiciousCount === 0 && scanData && (
                                <p className="text-[#00ff9d] text-xs font-mono">
                                    ✓ No threats detected. System is clean.
                                </p>
                            )}
                             {suspiciousCount > 0 && (
                                <p className="text-[#ff0055] text-xs font-mono animate-pulse">
                                    ⚠ {suspiciousCount} potential threats identified. Immediate action recommended.
                                </p>
                            )}
                        </div>

                    </div>
                </Card>
            </div>
        </div>
    )
}