import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
    { className = '', ...props }, ref
) {
    return <input ref={ref} className={`input ${className}`} {...props} />
})


