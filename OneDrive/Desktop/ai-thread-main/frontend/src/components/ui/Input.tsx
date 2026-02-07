import { InputHTMLAttributes, forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`input-cyber w-full bg-black/40 border border-white/10 text-white placeholder:text-gray-600 focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff] rounded-lg px-3 py-2 text-sm transition-all ${className}`}
        {...props}
      />
    )
  }
)