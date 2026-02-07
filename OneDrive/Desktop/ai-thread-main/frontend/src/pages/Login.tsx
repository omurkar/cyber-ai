import { useState, FormEvent } from 'react'
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'
import { Spinner } from '../components/ui/Spinner'

export default function Login() {
    const [isRegister, setIsRegister] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { show } = useToast()

    const handleGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (error: any) {
            show(error.message || 'Google Auth Failed', 'error')
        }
    }

    const handleEmail = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (isRegister) {
                await createUserWithEmailAndPassword(auth, email, password)
            } else {
                await signInWithEmailAndPassword(auth, email, password)
            }
        } catch (error: any) {
            show(error.message || 'Authentication Failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#050505_70%)] -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00f3ff]/5 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-md glass-card p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-[#00f3ff] to-[#bc00ff] bg-clip-text text-transparent mb-2">
                        CYBER THREAD
                    </h1>
                    <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">
                        {isRegister ? 'Initialize New Operator' : 'Identify Yourself'}
                    </p>
                </div>

                <form onSubmit={handleEmail} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Frequency</label>
                        <Input 
                            type="email" 
                            required 
                            placeholder="agent@cyberthread.net"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-black/50 border-white/10 focus:border-[#00f3ff]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Passcode</label>
                        <Input 
                            type="password" 
                            required 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-black/50 border-white/10 focus:border-[#bc00ff]"
                        />
                    </div>

                    <Button className="w-full mt-4" disabled={loading}>
                        {loading ? <Spinner className="w-4 h-4" /> : (isRegister ? 'ESTABLISH LINK' : 'ACCESS TERMINAL')}
                    </Button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0a0a0a] px-2 text-gray-500 font-bold">Or Connect Via</span></div>
                </div>

                <Button 
                    variant="ghost" 
                    type="button" 
                    onClick={handleGoogle}
                    className="w-full flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 hover:border-[#00f3ff]/50"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                    Google Neural Net
                </Button>

                <div className="mt-6 text-center">
                    <button 
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-xs text-[#00f3ff] hover:text-[#bc00ff] transition-colors font-bold uppercase tracking-wider"
                    >
                        {isRegister ? 'Already have a signal? Login' : 'Need credentials? Register'}
                    </button>
                </div>
            </div>
        </div>
    )
}