import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getProfile } from '../services/auth'
import { checkIsAdmin } from '../services/admin'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user)
                loadProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    setUser(session.user)
                    await loadProfile(session.user.id)
                } else {
                    setUser(null)
                    setProfile(null)
                    setIsAdmin(false)
                    setLoading(false)
                }
            }
        )
        return () => subscription.unsubscribe()
    }, [])

    const loadProfile = async (userId) => {
        const [{ data: prof }, adminCheck] = await Promise.all([
            getProfile(userId),
            checkIsAdmin(),
        ])
        setProfile(prof)
        setIsAdmin(adminCheck)
        setLoading(false)
    }

    const refreshProfile = async () => {
        if (user) await loadProfile(user.id)
    }

    return (
        <AuthContext.Provider value={{ user, profile, isAdmin, loading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

// ── Protected Route ────────────────────────────────────────────
export function ProtectedRoute({ children, adminOnly = false }) {
    const { user, isAdmin, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading) {
            if (!user) navigate('/login', { replace: true })
            else if (adminOnly && !isAdmin) navigate('/', { replace: true })
        }
    }, [user, isAdmin, loading, adminOnly, navigate])

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-slate-500">Loading…</p>
            </div>
        </div>
    )

    if (!user) return null
    if (adminOnly && !isAdmin) return null
    return children
}
