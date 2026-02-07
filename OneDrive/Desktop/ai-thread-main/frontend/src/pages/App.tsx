import { Routes, Route, NavLink } from 'react-router-dom'
import { lazy, Suspense, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { motion } from 'framer-motion'

const ThreatDashboard = lazy(() => import('../components/ThreatDashboard'))
const URLScanner = lazy(() => import('../components/URLScanner'))
const DeviceMonitor = lazy(() => import('../components/DeviceMonitor'))
const NetworkAnalyzer = lazy(() => import('../components/NetworkAnalyzer'))
const FileScanner = lazy(() => import('../components/FileScanner'))
const AgentStatus = lazy(() => import('../components/AgentStatus'))
const ThreatIntelligence = lazy(() => import('../components/ThreatIntelligence'))
const ScanHistory = lazy(() => import('../components/ScanHistory'))

export default function App() {
    const [isNavOpen, setIsNavOpen] = useState(false)

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00f3ff] selection:text-black overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-[#1a1a1a] bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                    <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-[#00f3ff] to-[#bc00ff] bg-clip-text text-transparent">
                        CYBER THREAD
                    </h1>
                    <Button variant="ghost" onClick={() => setIsNavOpen(!isNavOpen)} className="text-[#00f3ff]">
                        {isNavOpen ? '✕' : '☰'}
                    </Button>
                </header>

                <div className="grid grid-cols-12 min-h-screen">
                    {/* Interactive Sidebar */}
                    <aside className={`${isNavOpen ? 'fixed inset-0 z-40 bg-black/95' : 'hidden'} md:block md:sticky md:top-0 md:h-screen col-span-12 md:col-span-2 border-r border-[#1a1a1a] p-6 space-y-8 transition-all duration-300`}>
                        <div className="hidden md:block">
                            <h1 className="text-2xl font-black tracking-tighter leading-none mb-1 text-white">
                                CYBER <span className="text-[#00f3ff]">THREAD</span>
                            </h1>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Multi-Agent Intelligence</p>
                        </div>

                        <nav className="flex flex-col gap-2">
                            {[
                                { path: "/", label: "Dashboard", icon: "📊" },
                                { path: "/url", label: "URL Scanner", icon: "🔗" },
                                { path: "/device", label: "Device Monitor", icon: "💻" },
                                { path: "/network", label: "Network Analyzer", icon: "🌐" },
                                { path: "/file", label: "File Scanner", icon: "📁" },
                                { path: "/agents", label: "Agent Status", icon: "🤖" },
                                { path: "/intel", label: "Threat Intel", icon: "⚡" },
                                { path: "/history", label: "Scan History", icon: "📜" },
                            ].map((link) => (
                                <NavLink 
                                    key={link.path}
                                    to={link.path} 
                                    end={link.path === "/"}
                                    onClick={() => setIsNavOpen(false)}
                                    className={({isActive}) => `
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                        ${isActive ? 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20 shadow-[0_0_20px_rgba(0,243,255,0.1)]' : 'hover:bg-white/5 text-gray-400'}
                                    `}
                                >
                                    <span className="text-lg group-hover:scale-125 transition-transform">{link.icon}</span>
                                    <span className="font-semibold tracking-wide uppercase text-xs">{link.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                        
                        <div className="absolute bottom-8 left-6 right-6 p-4 rounded-2xl bg-[#bc00ff]/5 border border-[#bc00ff]/20">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-[#bc00ff] uppercase tracking-tighter">System Protected</span>
                            </div>
                            <div className="text-[9px] text-gray-400 font-medium">Uptime: 99.9% | Agents: Active</div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="col-span-12 md:col-span-10 p-4 md:p-10 relative">
                        {/* Background Gradients */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_#1a1a1a_0%,_#050505_40%)] -z-10" />
                        
                        <Suspense fallback={
                            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                                <Spinner className="w-12 h-12" />
                                <p className="text-[#00f3ff] text-xs font-bold animate-pulse tracking-widest uppercase">Initializing Interface...</p>
                            </div>
                        }>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Routes>
                                    <Route path="/" element={<ThreatDashboard />} />
                                    <Route path="/url" element={<URLScanner />} />
                                    <Route path="/device" element={<DeviceMonitor />} />
                                    <Route path="/network" element={<NetworkAnalyzer />} />
                                    <Route path="/file" element={<FileScanner />} />
                                    <Route path="/agents" element={<AgentStatus />} />
                                    <Route path="/intel" element={<ThreatIntelligence />} />
                                    <Route path="/history" element={<ScanHistory />} />
                                </Routes>
                            </motion.div>
                        </Suspense>
                    </main>
                </div>
            </div>
    )
}