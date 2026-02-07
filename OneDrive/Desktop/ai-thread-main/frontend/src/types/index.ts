export type ThreatLevel = 'low' | 'medium' | 'high' | 'none'

export type ThreatEvent = {
	type: string
	data: any
	timestamp?: number
}
