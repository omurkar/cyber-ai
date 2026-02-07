import { HTMLAttributes } from 'react'

export function Spinner({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div 
            className={`animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-[#00f3ff] border-r-[#bc00ff] ${className}`} 
            {...props}
        />
    )
}