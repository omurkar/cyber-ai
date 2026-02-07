import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged, User, signOut } from 'firebase/auth'
import { Spinner } from '../components/ui/Spinner'

type AuthContextType = {
    user: User | null
    loading: boolean
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within an AuthProvider')
    return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)
        })
        return unsubscribe
    }, [])

    const logout = async () => {
        await signOut(auth)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center gap-3">
                <Spinner className="w-8 h-8" />
                <span className="text-[#00f3ff] text-xs font-bold uppercase tracking-widest animate-pulse">Authenticating Neural Link...</span>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}