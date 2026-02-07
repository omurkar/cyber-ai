import { ReactNode } from 'react'

type ModalProps = {
    open: boolean
    onClose: () => void
    title?: string
    children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="absolute inset-0 bg-black/80" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg glass-card border-none shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {title && (
                    <div className="text-lg font-black tracking-tighter text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
                        <span className="text-[#00f3ff]">▌</span> {title}
                    </div>
                )}
                <div>{children}</div>
            </div>
        </div>
    )
}