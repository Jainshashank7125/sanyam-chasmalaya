import { useState, useEffect } from 'react'
import { adminFetchAppointments, adminUpdateAppointment } from '../../services/admin'
import { Search, RefreshCw, MessageSquare } from 'lucide-react'

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled']
const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
}

export default function AppointmentsPage() {
    const [appts, setAppts] = useState([])
    const [total, setTotal] = useState(0)
    const [status, setStatus] = useState('all')
    const [date, setDate] = useState('')
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [notes, setNotes] = useState({}) // appt.id → note text
    const PER_PAGE = 20

    const load = async () => {
        setLoading(true)
        const { data, count } = await adminFetchAppointments({ status, date: date || undefined, page, perPage: PER_PAGE })
        setAppts(data || [])
        setTotal(count || 0)
        setLoading(false)
    }

    useEffect(() => { load() }, [status, date, page])

    const updateStatus = async (id, newStatus) => {
        await adminUpdateAppointment(id, { status: newStatus })
        load()
    }

    const saveNote = async (id) => {
        await adminUpdateAppointment(id, { admin_notes: notes[id] })
        load()
    }

    const whatsappLink = (phone, name, date, time) => {
        const msg = encodeURIComponent(`Hi ${name}! Your eye test appointment at Sanyam Chashmalaya is confirmed for ${date} at ${time}. Please arrive 5 minutes early. Thank you!`)
        return `https://wa.me/91${phone.replace(/\D/g, '')}?text=${msg}`
    }

    const totalPages = Math.ceil(total / PER_PAGE)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-900">Appointments</h1>
                <p className="text-sm text-slate-500">{total} appointments total</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                {STATUSES.map(s => (
                    <button key={s} onClick={() => { setStatus(s); setPage(1) }}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize ${status === s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {s}
                    </button>
                ))}
                <input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1) }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
                {date && <button onClick={() => setDate('')} className="text-xs text-primary hover:underline">Clear date</button>}
                <button onClick={load} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-primary hover:text-primary ml-auto">
                    <RefreshCw size={15} />
                </button>
            </div>

            {/* Appointments Cards (more information-dense for admin) */}
            <div className="space-y-3">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse"><div className="h-16 bg-slate-100 rounded" /></div>
                )) : appts.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-3 block opacity-40">calendar_month</span>
                        <p className="font-medium">No appointments</p>
                    </div>
                ) : appts.map(appt => (
                    <div key={appt.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="font-bold text-slate-900">{appt.name}</h3>
                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_COLORS[appt.status]}`}>{appt.status}</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-0.5">
                                    <strong>{new Date(appt.preferred_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong> · {appt.preferred_time}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">{appt.phone}{appt.email ? ` · ${appt.email}` : ''}</p>
                                {appt.notes && <p className="text-xs text-slate-500 mt-1 italic">"{appt.notes}"</p>}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Status update */}
                                <select value={appt.status} onChange={e => updateStatus(appt.id, e.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary capitalize">
                                    {STATUSES.filter(s => s !== 'all').map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                                </select>
                                {/* WhatsApp */}
                                <a href={whatsappLink(appt.phone, appt.name, appt.preferred_date, appt.preferred_time)}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
                                    <MessageSquare size={13} /> WhatsApp
                                </a>
                            </div>
                        </div>
                        {/* Admin note */}
                        <div className="mt-4 flex gap-2">
                            <input
                                value={notes[appt.id] ?? (appt.admin_notes || '')}
                                onChange={e => setNotes(prev => ({ ...prev, [appt.id]: e.target.value }))}
                                placeholder="Add admin notes…"
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                            />
                            <button onClick={() => saveNote(appt.id)}
                                className="rounded-xl border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors">
                                Save
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:border-primary disabled:opacity-40">← Previous</button>
                    <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:border-primary disabled:opacity-40">Next →</button>
                </div>
            )}
        </div>
    )
}
