import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getProfile } from '../services/auth'
import { checkIsAdmin } from '../services/admin'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null)
    const [profile, setProfile] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    // ─── load profile + admin flag ─────────────────────────────
    // IMPORTANT: never call supabase.auth.* inside this function when
    // it's triggered from an onAuthStateChange handler — that causes
    // an internal auth-lock deadlock. We pass userId explicitly instead.
    const loadProfile = async (userId) => {
        try {
            const [{ data: prof }, adminFlag] = await Promise.all([
                getProfile(userId),
                checkIsAdmin(userId),   // userId passed directly — no auth call inside
            ])
            setProfile(prof)
            setIsAdmin(adminFlag)
        } catch (err) {
            console.error('[AuthContext] loadProfile error:', err)
            setProfile(null)
            setIsAdmin(false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Step 1: resolve the initial session (synchronous cache read, no network)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user)
                loadProfile(session.user.id)   // sets loading=false when done
            } else {
                setLoading(false)              // no session → done immediately
            }
        }).catch(() => {
            setLoading(false)
        })

        // Step 2: listen for subsequent auth events (sign-in, sign-out, token refresh)
        // We do NOT make DB calls here — only update React user state.
        // DB calls happen in the useEffect below that watches `user`.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    // Step 3: whenever user changes (sign-in / sign-out after initial load),
    // reload their profile. Skip on first mount — getSession() already handles it.
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        if (!mounted) { setMounted(true); return }   // skip first render

        if (user) {
            setLoading(true)
            loadProfile(user.id)
        } else {
            setProfile(null)
            setIsAdmin(false)
        }
    }, [user?.id])  // only fires when the actual user id changes

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
