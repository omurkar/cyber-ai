export function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-white/5 rounded-lg border border-white/5 ${className}`} />
}