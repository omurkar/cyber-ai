import React from 'react'

type ModalProps = {
    open: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg mx-4 card">
                {title && <div className="card-title">{title}</div>}
                <div>{children}</div>
            </div>
        </div>
    )
}


