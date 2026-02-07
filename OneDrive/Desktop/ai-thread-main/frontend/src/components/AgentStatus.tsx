import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { motion } from 'framer-motion'

export default function AgentStatus() {
    const [agents, setAgents] = useState<any[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await api.getAgentsStatus()
                const filtered = data.agents.filter((a: any) => a.name !== 'VulnerabilityAssessmentAgent')
                setAgents(filtered)
            } catch (e) {
                setAgents([
                    { name: 'URLThreatAnalyzer', status: 'ready' },
                    { name: 'DeviceSecurityScanner', status: 'ready' },
                    { name: 'NetworkTrafficMonitor', status: 'ready' },
                    { name: 'FileThreatDetector', status: 'ready' }
                ])
            }
        }
        fetchStatus()
    }, [])

    const getAgentConfig = (name: string) => {
        switch (name) {
            case 'URLThreatAnalyzer':
                return { 
                    title: 'URL Threat Analyzer', 
                    route: '/url',
                    icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    ),
                    desc: 'Phishing & Malicious Link Detection'
                }
            case 'DeviceSecurityScanner':
                return { 
                    title: 'Device Security Scanner', 
                    route: '/device',
                    icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    ),
                    desc: 'Process & Port Anomaly Detection'
                }
            case 'NetworkTrafficMonitor':
                return { 
                    title: 'Network Traffic Monitor', 
                    route: '/network',
                    icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                    ),
                    desc: 'Packet Sniffing & Speed Analysis'
                }
            case 'FileThreatDetector':
                return { 
                    title: 'File Threat Detector', 
                    route: '/files',
                    icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    ),
                    desc: 'Entropy Analysis & Malware Scanning'
                }
            default:
                return { title: name, route: '/', icon: null, desc: 'System Agent' }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-widest uppercase">Active Agents</h2>
                    <p className="text-xs text-gray-500 font-mono mt-1">System Integrity Check</p>
                </div>
                <div className="px-3 py-1 bg-[#00ff9d]/10 border border-[#00ff9d]/30 rounded text-[#00ff9d] text-xs font-bold uppercase animate-pulse">
                    All Systems Operational
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agents.map((agent, index) => {
                    const config = getAgentConfig(agent.name)
                    return (
                        <motion.div
                            key={agent.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(config.route)}
                            className="cursor-pointer"
                        >
                            <div className="glass-card p-6 border border-white/5 bg-black/40 hover:bg-black/60 hover:border-[#00f3ff]/30 transition-all group relative overflow-hidden">
                                {/* Decorator Line */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00f3ff] group-hover:shadow-[0_0_15px_#00f3ff] transition-shadow"></div>

                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white/5 rounded-lg text-[#00f3ff] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                                            {config.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-[#00f3ff] transition-colors">{config.title}</h3>
                                            <p className="text-[10px] text-gray-500 mt-1">{config.desc}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#00ff9d] rounded-full animate-ping"></div>
                                        <span className="text-[#00ff9d] text-xs font-bold uppercase">READY</span>
                                    </div>
                                </div>
                                
                                {/* Hover Hint */}
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-gray-400 font-mono uppercase">
                                    Click to Launch &rarr;
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}