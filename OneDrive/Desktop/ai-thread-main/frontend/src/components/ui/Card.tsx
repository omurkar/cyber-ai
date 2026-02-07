import { ReactNode } from 'react'

export function Card({ title, children, className = '' }: { title?: string, children: ReactNode, className?: string }) {
    return (
        <div className={`glass-card p-6 ${className}`}>
            {title && (
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                    <span className="w-1 h-3 bg-[#00f3ff]"></span>
                    {title}
                </h2>
            )}
            {children}
        </div>
    )
}