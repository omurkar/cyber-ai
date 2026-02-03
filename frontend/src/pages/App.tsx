import { Routes, Route, NavLink } from 'react-router-dom'
import { lazy, Suspense, useState } from 'react'
import { Button } from '../components/ui/Button'
import { ToastProvider } from '../components/ui/Toast'
import { Spinner } from '../components/ui/Spinner'

const ThreatDashboard = lazy(() => import('../components/ThreatDashboard'))
const URLScanner = lazy(() => import('../components/URLScanner'))
const DeviceMonitor = lazy(() => import('../components/DeviceMonitor'))
const NetworkAnalyzer = lazy(() => import('../components/NetworkAnalyzer'))
const FileScanner = lazy(() => import('../components/FileScanner'))
const AgentStatus = lazy(() => import('../components/AgentStatus'))
const ThreatIntelligence = lazy(() => import('../components/ThreatIntelligence'))
const ScanHistory = lazy(() => import('../components/ScanHistory'))

export default function App() {
    const [open, setOpen] = useState(false)
    return (
        <ToastProvider>
            <div className="min-h-screen grid grid-cols-12 md:grid-cols-12">
                <header className="col-span-12 md:hidden flex items-center justify-between p-3 border-b border-gray-800">
                    <h1 className="text-lg font-semibold">AI Threat Detector</h1>
                    <Button variant="ghost" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation">☰</Button>
                </header>
                <aside className={`${open ? 'block' : 'hidden'} md:block col-span-12 md:col-span-2 border-r border-gray-800 p-4 space-y-2`}> 
                    <nav className="flex flex-col gap-1">
                        <NavLink to="/" end className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-800' : 'hover:bg-gray-900'}`}>Dashboard</NavLink>
                        <NavLink to="/url" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-800' : 'hover:bg-gray-900'}`}>URL Scanner</NavLink>
                        <NavLink to="/device" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-800' : 'hover:bg-gray-900'}`}>Device Monitor</NavLink>
                        <NavLink to="/network" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-800' : 'hover:bg-gray-900'}`}>Network Analyzer</NavLink>
                        <NavLink to="/file" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-800' : 'hover:bg-gray-900'}`}>File Scanner</NavLink>
                        <NavLink to="/agents" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-800' : 'hover:bg-gray-900'}`}>Agents</NavLink>
                        <NavLink to="/intel" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-800' : 'hover:bg-gray-900'}`}>Threat Intel</NavLink>
                        <NavLink to="/history" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-800' : 'hover:bg-gray-900'}`}>Scan History</NavLink>
                    </nav>
                </aside>
                <main className="col-span-12 md:col-span-10 p-4 md:p-6">
                    <Suspense fallback={<div className="flex items-center gap-2"><Spinner /> Loading...</div>}>
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
                    </Suspense>
                </main>
            </div>
        </ToastProvider>
    )
}
