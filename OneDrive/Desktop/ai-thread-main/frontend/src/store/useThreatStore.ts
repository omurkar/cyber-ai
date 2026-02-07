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
    // TIMER STATE: Persisted so it survives page navigation
    autoscanInterval: number
    autoscanStartTime: number
    
    addEvent: (e: ThreatEvent) => void
    setLastResult: (key: string, data: any) => void
    setAutoscanParams: (interval: number, startTime: number) => void
}

export const useThreatStore = create<State>()(persist((set) => ({
    liveEvents: [],
    lastResults: {},
    autoscanInterval: 0,
    autoscanStartTime: 0,

    addEvent: (e) => set(s => ({ liveEvents: [{...e, timestamp: Date.now()}, ...s.liveEvents].slice(0, 100) })),
    setLastResult: (key, data) => set(s => ({ lastResults: { ...s.lastResults, [key]: data } })),
    setAutoscanParams: (interval, startTime) => set({ autoscanInterval: interval, autoscanStartTime: startTime })
}), { name: 'threat-store' }))