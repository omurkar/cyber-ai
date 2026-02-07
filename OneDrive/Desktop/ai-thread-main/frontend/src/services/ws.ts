type Listener = (data: any) => void

class ThreatWS {
	private socket: WebSocket | null = null
	private listeners: Set<Listener> = new Set()
    private heartbeatTimer: any = null
    private lastPong: number = 0
    private statusListeners: Set<(status: string) => void> = new Set()
    private backoffMs = 1000
    private sendQueue: any[] = []

	connect() {
		if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return
        const proto = location.protocol === 'https:' ? 'wss' : 'ws'
        const url = `${proto}://${location.host}/ws/threats`
		this.socket = new WebSocket(url)
        this.emitStatus('connecting')
		this.socket.onmessage = (evt) => {
			try {
				const data = JSON.parse(evt.data)
                if (data?.type === 'heartbeat') {
                    this.lastPong = Date.now()
                    return
                }
				this.listeners.forEach(l => l(data))
			} catch {}
		}
        this.socket.onclose = () => {
            this.emitStatus('disconnected')
            setTimeout(() => { this.connect(); this.backoffMs = Math.min(this.backoffMs * 2, 30000) }, this.backoffMs)
		}
        this.socket.onopen = () => {
            this.lastPong = Date.now()
            clearInterval(this.heartbeatTimer)
            this.emitStatus('connected')
            this.backoffMs = 1000
            // flush queue
            while (this.sendQueue.length && this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(this.sendQueue.shift()))
            }
            this.heartbeatTimer = setInterval(() => {
                try {
                    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return
                    this.socket.send(JSON.stringify({ type: 'ping', ts: Date.now() }))
                    // If no pong/heartbeat for 20s, reconnect
                    if (Date.now() - this.lastPong > 20000) {
                        this.socket.close()
                    }
                } catch {}
            }, 5000)
        }
        this.socket.onerror = () => this.emitStatus('error')
	}

	on(fn: Listener) { this.listeners.add(fn) }
	off(fn: Listener) { this.listeners.delete(fn) }

    onStatus(fn: (status: string) => void) { this.statusListeners.add(fn) }
    offStatus(fn: (status: string) => void) { this.statusListeners.delete(fn) }
    private emitStatus(s: string) { this.statusListeners.forEach(l => l(s)) }

    send(obj: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(obj))
        } else {
            this.sendQueue.push(obj)
        }
    }
}

export const threatWS = new ThreatWS()
