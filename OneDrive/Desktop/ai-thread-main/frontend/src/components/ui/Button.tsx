import { forwardRef, ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost' | 'danger'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className = '', variant = 'primary', ...props }, ref
) {
    const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
        primary: 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/50 hover:bg-[#00f3ff] hover:text-black hover:shadow-[0_0_20px_#00f3ff] focus:ring-[#00f3ff]',
        ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border border-transparent',
        danger: 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_#ff0000] focus:ring-red-500'
    }

    return (
        <button 
            ref={ref} 
            className={`${base} ${variants[variant]} ${className}`} 
            {...props} 
        />
    )
})