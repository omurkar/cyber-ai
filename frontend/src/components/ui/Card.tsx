import React from 'react'

export function Card({ title, children }: { title?: string, children: React.ReactNode }) {
    return (
        <div className="card shadow-card">
            {title && <h2 className="card-title">{title}</h2>}
            {children}
        </div>
    )
}


