import { useState } from 'react'
import { api } from '../services/api'
import { Spinner } from './ui/Spinner'
import { Card } from './ui/Card'
import { useToast } from './ui/Toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function FileScanner() {
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<any | null>(null)
    const [loading, setLoading] = useState(false)
    const { show } = useToast()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setResult(null) // Reset previous result
        }
    }

    const scan = async () => {
        if (!file) return
        setLoading(true)
        try {
            const data = await api.scanFile(file)
            // Handle wrapper { agent:..., result: ... }
            setResult(data.result || data)
            show('File analysis complete', 'info')
        } catch (e: any) {
            show(e.message || 'Scan failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    // Helper for threat color
    const getThreatColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'high': return 'text-[#ff0055] drop-shadow-[0_0_8px_rgba(255,0,85,0.8)]'
            case 'medium': return 'text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]'
            case 'low': return 'text-[#00ff9d] drop-shadow-[0_0_8px_rgba(0,255,157,0.6)]'
            default: return 'text-gray-400'
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Upload Section */}
            <div className="glass-card p-8 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center hover:border-[#00f3ff]/30 transition-colors">
                <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={handleFileChange} 
                />
                <label htmlFor="file-upload" className="cursor-pointer space-y-4 w-full h-full flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#00f3ff]/10 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#00f3ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">
                            {file ? file.name : 'Upload Artifact'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {file ? `${(file.size / 1024).toFixed(2)} KB` : 'Drag & drop or click to select binary/script'}
                        </p>
                    </div>
                </label>
                
                {file && (
                    <button 
                        onClick={scan} 
                        disabled={loading}
                        className="mt-6 btn-cyber min-w-[200px]"
                    >
                        {loading ? <span className="flex items-center gap-2 justify-center"><Spinner className="w-4 h-4"/> ANALYZING...</span> : 'INITIATE DEEP SCAN'}
                    </button>
                )}
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* 1. Artifact Analysis (Threat Results) */}
                        <Card title="Artifact Analysis">
                            <div className="p-4 space-y-6">
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <div className="text-gray-400 text-xs uppercase tracking-wider">Threat Classification</div>
                                    <div className={`text-2xl font-black uppercase tracking-tighter ${getThreatColor(result.threat_level)}`}>
                                        {result.threat_level || 'UNKNOWN'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/40 p-3 rounded border border-white/5">
                                        <div className="text-gray-500 text-[10px] uppercase font-bold">Risk Score</div>
                                        <div className="text-2xl font-mono text-white">
                                            {result.score || 0}<span className="text-gray-600 text-sm">/100</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 p-3 rounded border border-white/5">
                                        <div className="text-gray-500 text-[10px] uppercase font-bold">File Signature</div>
                                        <div className="text-sm font-mono text-[#00f3ff] truncate" title={result.sha256}>
                                            {result.sha256 ? result.sha256.substring(0, 8) + '...' : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* YARA/Heuristic Hits */}
                                {result.yara_hits && result.yara_hits.length > 0 && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded">
                                        <div className="text-[10px] text-red-400 font-bold mb-2 uppercase">Detected Anomalies</div>
                                        <ul className="text-xs text-red-300 space-y-1 list-disc list-inside">
                                            {result.yara_hits.map((hit: string, i: number) => (
                                                <li key={i}>{hit}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* 2. Entropy Analysis (Educational Card) */}
                        <Card title="Entropy Analysis">
                            <div className="p-4 space-y-6">
                                {/* Current Value Display */}
                                <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded border border-white/5 relative overflow-hidden">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Shannon Entropy</div>
                                    <div className="text-4xl font-black text-white z-10">
                                        {result.entropy ? result.entropy.toFixed(3) : '0.000'}
                                    </div>
                                    {/* Visual Bar */}
                                    <div className="w-full h-1.5 bg-gray-700 rounded-full mt-3 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((result.entropy || 0) / 8) * 100}%` }}
                                            className={`h-full ${
                                                (result.entropy || 0) > 7 ? 'bg-[#ff0055] shadow-[0_0_10px_#ff0055]' : 
                                                (result.entropy || 0) > 5 ? 'bg-yellow-400' : 'bg-[#00ff9d]'
                                            }`}
                                        />
                                    </div>
                                </div>

                                {/* Entropy Legend / Education */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-1">Understanding Entropy</h4>
                                    
                                    <div className="flex items-start gap-3 text-xs">
                                        <div className="w-2 h-2 mt-1 rounded-full bg-[#00ff9d] shadow-[0_0_5px_#00ff9d] flex-shrink-0"></div>
                                        <div>
                                            <span className="text-white font-bold">Low (0.0 - 5.0):</span>
                                            <p className="text-gray-500 mt-0.5">Standard text files, source code, or simple executables. Low randomness suggests readable content.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-xs">
                                        <div className="w-2 h-2 mt-1 rounded-full bg-yellow-400 shadow-[0_0_5px_#fbbf24] flex-shrink-0"></div>
                                        <div>
                                            <span className="text-white font-bold">Medium (5.0 - 7.0):</span>
                                            <p className="text-gray-500 mt-0.5">Typical compressed data (images, archives) or standard compiled code.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-xs">
                                        <div className="w-2 h-2 mt-1 rounded-full bg-[#ff0055] shadow-[0_0_5px_#ff0055] flex-shrink-0"></div>
                                        <div>
                                            <span className="text-white font-bold">High (7.0 - 8.0):</span>
                                            <p className="text-gray-500 mt-0.5">
                                                Highly suspicious. Indicates <strong className="text-red-400">Packed</strong>, <strong className="text-red-400">Encrypted</strong>, or <strong className="text-red-400">Obfuscated</strong> code often used to hide malware payloads.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}