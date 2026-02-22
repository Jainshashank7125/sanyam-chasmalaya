import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { signUp, signInWithGoogle } from '../../services/auth'

export default function RegisterPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' })
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
        setLoading(true)
        const { error: err } = await signUp({
            email: form.email,
            password: form.password,
            fullName: form.fullName,
            phone: form.phone,
        })
        setLoading(false)
        if (err) { setError(err.message); return }
        setSuccess(true)
    }

    const field = (key) => ({
        value: form[key],
        onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    })

    if (success) {
        return (
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center shadow-sm"
                >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                        <Check size={32} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">Account Created!</h2>
                    <p className="text-sm text-slate-600 mb-6">
                        We've sent a confirmation link to <strong>{form.email}</strong>. Please verify your email to sign in.
                    </p>
                    <Link to="/login" className="btn-primary">Go to Login →</Link>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 py-12">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-black text-slate-900">Create your account</h1>
                        <p className="mt-1 text-sm text-slate-500">Join Sanyam Chashmalaya for exclusive offers</p>
                    </div>

                    {/* Google */}
                    <button
                        onClick={() => signInWithGoogle()}
                        className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                    >
                        <svg viewBox="0 0 24 24" className="h-5 w-5">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                        <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-slate-400 font-medium">or register with email</span></div>
                    </div>

                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                            <AlertCircle size={16} className="flex-shrink-0" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                                <input {...field('fullName')} required placeholder="Rahul Sharma"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                                <div className="flex gap-1.5">
                                    <span className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-600 font-medium">+91</span>
                                    <input {...field('phone')} type="tel" maxLength={10} placeholder="98765 43210"
                                        className="flex-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                            <input {...field('email')} type="email" required placeholder="you@example.com"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input {...field('password')} type={showPwd ? 'text' : 'password'} required minLength={8} placeholder="Min. 8 characters"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5">At least 8 characters with a mix of letters and numbers</p>
                        </div>
                        <p className="text-xs text-slate-400">
                            By registering you agree to our <button type="button" className="text-primary hover:underline">Terms of Service</button> and <button type="button" className="text-primary hover:underline">Privacy Policy</button>.
                        </p>
                        <button type="submit" disabled={loading} className="btn-primary py-3.5 mt-1 disabled:opacity-70">
                            {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Create Account →'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
