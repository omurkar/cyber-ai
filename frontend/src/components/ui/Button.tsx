import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className = '', variant = 'primary', ...props }, ref
) {
    const base = 'btn'
    const variants: Record<string, string> = {
        primary: 'btn-primary',
        ghost: 'btn-ghost',
    }
    return <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props} />
})


