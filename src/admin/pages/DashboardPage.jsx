import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import { fetchDashboardStats, adminFetchOrders, adminFetchAppointments } from '../../services/admin'
import { TrendingUp, ShoppingCart, Calendar, AlertTriangle, Plus } from 'lucide-react'

const SAMPLE_REVENUE = [
    { month: 'Sep', revenue: 18000 },
    { month: 'Oct', revenue: 25400 },
    { month: 'Nov', revenue: 31200 },
    { month: 'Dec', revenue: 43800 },
    { month: 'Jan', revenue: 38600 },
    { month: 'Feb', revenue: 52100 },
]

const COLORS = ['#b91c1c', '#ef4444', '#fca5a5', '#fecaca']

export default function DashboardPage() {
    const [stats, setStats] = useState(null)
    const [recentOrders, setRecentOrders] = useState([])
    const [todayAppts, setTodayAppts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const [statsData, { data: orders }, { data: appts }] = await Promise.all([
                fetchDashboardStats(),
                adminFetchOrders({ page: 1, perPage: 5 }),
                adminFetchAppointments({ date: new Date().toISOString().split('T')[0] }),
            ])
            setStats(statsData)
            setRecentOrders(orders || [])
            setTodayAppts(appts || [])
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    )

    const kpiCards = [
        { label: "Today's Revenue", value: `₹${(stats?.todayRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-600', change: '+12%' },
        { label: 'Month Revenue', value: `₹${(stats?.monthRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', change: '+23%' },
        { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: ShoppingCart, color: 'bg-amber-50 text-amber-600', change: 'needs action' },
        { label: "Today's Appointments", value: stats?.todayAppointments || 0, icon: Calendar, color: 'bg-purple-50 text-purple-600', change: 'scheduled' },
        { label: 'Low Stock Alert', value: stats?.lowStockProducts || 0, icon: AlertTriangle, color: 'bg-red-50 text-red-600', change: 'items < 5 units' },
    ]

    const ORDER_STATUS_COLORS = {
        pending: 'bg-amber-100 text-amber-700',
        confirmed: 'bg-blue-100 text-blue-700',
        processing: 'bg-indigo-100 text-indigo-700',
        dispatched: 'bg-purple-100 text-purple-700',
        delivered: 'bg-emerald-100 text-emerald-700',
        cancelled: 'bg-red-100 text-red-700',
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500">Welcome back! Here's what's happening today.</p>
                </div>
                <Link to="/admin/products/new" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all">
                    <Plus size={16} /> Add Product
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                {kpiCards.map(({ label, value, icon: Icon, color, change }) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                            <Icon size={20} />
                        </div>
                        <p className="text-xs font-medium text-slate-500">{label}</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
                        <p className="text-xs text-slate-400 mt-1">{change}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Revenue Trend (Sample)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={SAMPLE_REVENUE}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#b91c1c" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#b91c1c" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                            <Area type="monotone" dataKey="revenue" stroke="#b91c1c" fill="url(#revGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick Stats Pie */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Category Split</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={[
                                { name: 'Frames', value: 45 },
                                { name: 'Lenses', value: 30 },
                                { name: 'Sunglasses', value: 18 },
                                { name: 'Contact', value: 7 },
                            ]} dataKey="value" innerRadius={50} outerRadius={80}>
                                {[0, 1, 2, 3].map(i => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Tooltip formatter={v => [`${v}%`, '']} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                        {['Frames', 'Lenses', 'Sunglasses', 'Contact'].map((l, i) => (
                            <div key={l} className="flex items-center gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                                <span className="text-slate-600">{l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom: Recent Orders + Today's Appointments */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Orders */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">Recent Orders</h3>
                        <Link to="/admin/orders" className="text-xs text-primary hover:underline">View all</Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentOrders.length === 0 ? (
                            <p className="px-6 py-8 text-sm text-slate-400 text-center">No orders yet</p>
                        ) : recentOrders.map(order => (
                            <div key={order.id} className="flex items-center justify-between px-6 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">#{order.id} · {order.shipping_name}</p>
                                    <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${ORDER_STATUS_COLORS[order.status]}`}>{order.status}</span>
                                    <span className="text-sm font-bold text-primary">₹{Number(order.total).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Today's Appointments */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">Today's Appointments</h3>
                        <Link to="/admin/appointments" className="text-xs text-primary hover:underline">View all</Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {todayAppts.length === 0 ? (
                            <p className="px-6 py-8 text-sm text-slate-400 text-center">No appointments today</p>
                        ) : todayAppts.map(appt => (
                            <div key={appt.id} className="flex items-center justify-between px-6 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{appt.name}</p>
                                    <p className="text-xs text-slate-400">{appt.preferred_time} · {appt.phone}</p>
                                </div>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>{appt.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
