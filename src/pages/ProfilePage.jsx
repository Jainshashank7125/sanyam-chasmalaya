import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { User, ShoppingBag, Heart, Edit2, Check, Camera } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, uploadAvatar } from '../services/auth'
import { fetchUserOrders } from '../services/orders'
import { fetchUserAppointments } from '../services/appointments'

const TABS = [
    { id: 'profile', label: 'My Profile', icon: <User size={16} /> },
    { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={16} /> },
    { id: 'appointments', label: 'Appointments', icon: <span className="material-symbols-outlined text-[16px]">calendar_month</span> },
]

const ORDER_STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    dispatched: 'bg-purple-100 text-purple-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
}

export default function ProfilePage() {
    const { user, profile, refreshProfile } = useAuth()
    const navigate = useNavigate()
    const [tab, setTab] = useState('profile')
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ full_name: '', phone: '' })
    const [saving, setSaving] = useState(false)
    const [orders, setOrders] = useState([])
    const [appointments, setAppointments] = useState([])
    const [dataLoading, setDataLoading] = useState(false)

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        setForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' })
    }, [user, profile])

    useEffect(() => {
        if (tab === 'orders' && orders.length === 0) loadOrders()
        if (tab === 'appointments' && appointments.length === 0) loadAppointments()
    }, [tab])

    const loadOrders = async () => {
        setDataLoading(true)
        const { data } = await fetchUserOrders(user.id)
        setOrders(data || [])
        setDataLoading(false)
    }

    const loadAppointments = async () => {
        setDataLoading(true)
        const { data } = await fetchUserAppointments(user.id)
        setAppointments(data || [])
        setDataLoading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        await updateProfile(user.id, form)
        await refreshProfile()
        setSaving(false)
        setEditing(false)
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        await uploadAvatar(user.id, file)
        await refreshProfile()
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50">
            <div className="container-padding py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                            <div className="relative inline-block mb-4">
                                <img
                                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || user?.email || 'U')}&background=b91c1c&color=fff&size=80`}
                                    alt="Avatar"
                                    className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/20"
                                />
                                <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-dark transition-colors">
                                    <Camera size={14} />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <p className="font-bold text-slate-900">{profile?.full_name || 'My Account'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                            <div className="mt-6 flex flex-col gap-1">
                                {TABS.map(t => (
                                    <button key={t.id} onClick={() => setTab(t.id)}
                                        className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all text-left ${tab === t.id ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
                                            }`}>
                                        {t.icon} {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main */}
                    <div className="lg:col-span-3">
                        {/* Profile Tab */}
                        {tab === 'profile' && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>
                                    {!editing ? (
                                        <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-primary hover:text-primary">
                                            <Edit2 size={13} /> Edit
                                        </button>
                                    ) : (
                                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-60">
                                            {saving ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Check size={13} /> Save</>}
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Full Name', key: 'full_name', placeholder: 'Your full name' },
                                        { label: 'Phone', key: 'phone', placeholder: '+91 XXXXX XXXXX' },
                                    ].map(({ label, key, placeholder }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                                            {editing ? (
                                                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                    placeholder={placeholder}
                                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                                            ) : (
                                                <p className="text-sm font-medium text-slate-800">{profile?.[key] || <span className="text-slate-400">Not set</span>}</p>
                                            )}
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                                        <p className="text-sm font-medium text-slate-800">{user?.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Member Since</label>
                                        <p className="text-sm font-medium text-slate-800">{new Date(user?.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {tab === 'orders' && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900 mb-6">My Orders</h2>
                                {dataLoading ? (
                                    <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
                                ) : orders.length === 0 ? (
                                    <div className="flex flex-col items-center py-16 text-slate-400">
                                        <ShoppingBag size={48} className="mb-3 opacity-40" />
                                        <p className="font-medium">No orders yet</p>
                                        <button onClick={() => navigate('/products')} className="mt-4 btn-primary text-sm py-2">Start Shopping</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {orders.map(order => (
                                            <div key={order.id} className="rounded-xl border border-slate-200 p-4 hover:border-primary/30 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <span className="text-xs text-slate-400">Order #</span>
                                                        <span className="ml-1 font-bold text-slate-800">{order.id}</span>
                                                    </div>
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${ORDER_STATUS_COLORS[order.status]}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                                                    <span className="font-bold text-primary">₹{Number(order.total).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Appointments Tab */}
                        {tab === 'appointments' && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900 mb-6">My Appointments</h2>
                                {dataLoading ? (
                                    <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
                                ) : appointments.length === 0 ? (
                                    <div className="flex flex-col items-center py-16 text-slate-400">
                                        <span className="material-symbols-outlined text-5xl mb-3 opacity-40">calendar_month</span>
                                        <p className="font-medium">No appointments booked</p>
                                        <button onClick={() => navigate('/contact')} className="mt-4 btn-primary text-sm py-2">Book Eye Test</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {appointments.map(a => (
                                            <div key={a.id} className="rounded-xl border border-slate-200 p-4">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-slate-800 text-sm">{new Date(a.preferred_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${ORDER_STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                                                </div>
                                                <p className="text-xs text-slate-500">{a.preferred_time}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
