import { useMemo, useState } from 'react'
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

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)
		try {
            const data = await api.scanUrl(debouncedUrl || url)
			setLast('url', data)
            show('URL scanned successfully')
		} catch (e: any) {
			setError(e?.message ?? 'Failed to scan URL')
            show('Failed to scan URL', 'error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="max-w-xl space-y-4">
            <form onSubmit={submit} className="flex gap-2">
                <Input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com" className="flex-1" />
                <Button disabled={loading}>Scan</Button>
			</form>
			{error && <div className="alert-danger">{error}</div>}
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
