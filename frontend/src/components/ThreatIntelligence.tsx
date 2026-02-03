import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Spinner } from './ui/Spinner'
import { useToast } from './ui/Toast'

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
				title: "Vulnerability Scan Complete", 
				description: `Found ${result.result.count} vulnerabilities` 
			})
		} catch (error: any) {
			toast({ 
				title: "Error", 
				description: error?.message ?? 'Failed to scan vulnerabilities', 
				variant: "destructive" 
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="space-y-4">
			<Card title="Vulnerability Scanner">
				<div className="space-y-3">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Product/Component to scan (optional)
						</label>
						<input
							type="text"
							value={product}
							onChange={(e) => setProduct(e.target.value)}
							placeholder="e.g., nginx, apache, openssl"
							className="input w-full"
						/>
					</div>
					<Button onClick={scanVulnerabilities} disabled={loading}>
						{loading ? <Spinner size="sm" /> : 'Scan Vulnerabilities'}
					</Button>
				</div>
			</Card>

			{vulnerabilities.length > 0 && (
				<Card title={`Found ${vulnerabilities.length} Vulnerabilities`}>
					<div className="space-y-3">
						{vulnerabilities.map((vuln, index) => (
							<div key={vuln.id || index} className="border border-gray-800 rounded p-3 bg-gray-900/40">
								<div className="text-sm text-gray-400">{vuln.id || 'Unknown ID'}</div>
								<div className="flex items-center gap-2">
									<span className={`inline-block w-2 h-2 rounded-full ${
										vuln.severity === 'HIGH' ? 'bg-red-500' : 
										vuln.severity === 'MEDIUM' ? 'bg-yellow-400' : 
										'bg-green-500'
									}`}></span>
									<div className="font-medium">{vuln.summary || 'No summary available'}</div>
								</div>
								<div className="text-xs text-gray-500 mt-1">
									Severity: {vuln.severity || 'UNKNOWN'}
								</div>
							</div>
						))}
					</div>
				</Card>
			)}

			{vulnerabilities.length === 0 && !loading && (
				<Card title="No Vulnerabilities Found">
					<div className="text-center text-gray-500 py-8">
						Run a vulnerability scan to check for CVEs in specific products or components.
					</div>
				</Card>
			)}
		</div>
	)
}
