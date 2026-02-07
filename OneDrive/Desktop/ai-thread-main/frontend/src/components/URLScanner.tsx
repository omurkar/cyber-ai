import { useMemo, useState, FormEvent } from 'react'
import { api } from '../services/api'
import { useThreatStore } from '../store/useThreatStore'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { useToast } from './ui/Toast'

export default function URLScanner() {
	const [url, setUrl] = useState('')
	const setLast = useThreatStore(s => s.setLastResult)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
    const { show } = useToast()

    const debouncedUrl = useDebounced(url, 250)

	const submit = async (e: FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)
		try {
            const data = await api.scanUrl(debouncedUrl || url)
			setLast('url', data)
            show('URL scanned successfully', 'info')
		} catch (e: any) {
			setError(e?.message ?? 'Failed to scan URL')
            show('Failed to scan URL', 'error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="max-w-xl space-y-6">
            <div className="glass-card">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Target Verification</h3>
                <form onSubmit={submit} className="flex gap-3">
                    <Input 
                        value={url} 
                        onChange={e => setUrl(e.target.value)} 
                        placeholder="https://example.com" 
                        className="flex-1" 
                    />
                    <Button disabled={loading} className="min-w-[100px]">
                        {loading ? 'SCANNING' : 'SCAN'}
                    </Button>
                </form>
            </div>
			{error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-bold flex items-center gap-2">
                    <span>⚠</span> {error}
                </div>
            )}
		</div>
	)
}

function useDebounced<T>(value: T, delay = 250) {
    const [v, setV] = useState(value)
    useMemo(() => {
        const t = setTimeout(() => setV(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return v
}