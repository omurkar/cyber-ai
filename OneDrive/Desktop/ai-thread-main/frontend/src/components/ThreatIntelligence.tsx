import { useState } from 'react'
import { api } from '../services/api'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Spinner } from './ui/Spinner'
import { useToast } from './ui/Toast'
import { Input } from './ui/Input'

type Vulnerability = {
	id: string
	severity: string
	summary: string
}

export default function ThreatIntelligence() {
	const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
	const [loading, setLoading] = useState(false)
	const [product, setProduct] = useState('')
	const { toast } = useToast()

	const scanVulnerabilities = async () => {
		setLoading(true)
		try {
			const result = await api.scanVulnerability(product || undefined)
			setVulnerabilities(result.result.items || [])
			toast({ 
				title: "Scan Complete", 
				description: `Identified ${result.result.count} vulnerabilities.` 
			})
		} catch (error: any) {
			toast({ 
				title: "Scan Failed", 
				description: error?.message ?? 'Connection error', 
				variant: "destructive" 
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="space-y-6">
			<Card title="Global Intelligence Scanner">
				<div className="flex gap-4 items-end">
					<div className="flex-1 space-y-2">
						<label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
							Target Component / CVE
						</label>
						<Input
							value={product}
							onChange={(e) => setProduct(e.target.value)}
							placeholder="e.g., nginx, apache, openssl"
						/>
					</div>
					<Button variant="primary" onClick={scanVulnerabilities} disabled={loading} className="mb-[1px]">
						{loading ? <Spinner className="w-4 h-4" /> : 'SEARCH CVE DB'}
					</Button>
				</div>
			</Card>

			{vulnerabilities.length > 0 && (
				<Card title={`Vulnerabilities Detected (${vulnerabilities.length})`}>
					<div className="space-y-3 max-h-[500px] overflow-auto cyber-scrollbar pr-2">
					{vulnerabilities.map((vuln, index) => (
						<div key={vuln.id || index} className="border border-white/5 rounded-lg p-4 bg-black/40 hover:border-white/10 transition-colors">
								<div className="flex justify-between items-start mb-2">
                                    <span className="text-[#00f3ff] font-mono text-sm font-bold">{vuln.id || 'UNKNOWN-ID'}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        vuln.severity === 'HIGH' ? 'bg-red-500 text-white shadow-[0_0_10px_red]' : 
                                        vuln.severity === 'MEDIUM' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-black'
                                    }`}>
                                        {vuln.severity || 'UNKNOWN'}
                                    </span>
                                </div>
								<p className="text-gray-400 text-xs leading-relaxed">
                                    {vuln.summary || 'No summary available.'}
                                </p>
							</div>
						))}
					</div>
				</Card>
			)}
		</div>
	)
}