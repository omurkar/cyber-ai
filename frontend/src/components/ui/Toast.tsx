import React, { createContext, useContext, useRef, useState } from 'react'

type ToastItem = { id: number, message: string, type?: 'info'|'warn'|'error', title?: string, description?: string }

type ToastProps = { title?: string, description?: string, variant?: 'default' | 'destructive' }

type ToastContextValue = {
    show: (message: string, type?: ToastItem['type']) => void,
    toast: (props: ToastProps) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('ToastProvider missing')
    return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<ToastItem[]>([])
    const idRef = useRef(1)
    const show = (message: string, type: ToastItem['type'] = 'info') => {
        const id = idRef.current++
        setItems(list => [{ id, message, type }, ...list].slice(0, 5))
        setTimeout(() => setItems(list => list.filter(x => x.id !== id)), 3000)
    }
    const toast = (props: ToastProps) => {
        const message = props.title ? `${props.title}${props.description ? ': ' + props.description : ''}` : props.description || ''
        const type = props.variant === 'destructive' ? 'error' : 'info'
        show(message, type)
    }
    return (
        <ToastContext.Provider value={{ show, toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
                {items.map(t => (
                    <div key={t.id} className={
                        t.type === 'error' ? 'alert-danger' : t.type === 'warn' ? 'alert-warn' : 'alert-info'
                    }>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}


