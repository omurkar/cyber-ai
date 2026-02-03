import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThreatEvent = {
    type: string
    data: any
    timestamp?: number
    agent?: string
    percent?: number
}

type State = {
	liveEvents: ThreatEvent[]
	lastResults: Record<string, any>
	addEvent: (e: ThreatEvent) => void
	setLastResult: (key: string, data: any) => void
}

export const useThreatStore = create<State>()(persist((set) => ({
    liveEvents: [],
    lastResults: {},
    addEvent: (e) => set(s => ({ liveEvents: [{...e, timestamp: Date.now()}, ...s.liveEvents].slice(0, 100) })),
    setLastResult: (key, data) => set(s => ({ lastResults: { ...s.lastResults, [key]: data } }))
}), { name: 'threat-store' }))
