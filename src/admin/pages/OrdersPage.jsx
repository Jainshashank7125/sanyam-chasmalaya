import { useState, useEffect } from 'react'
import { adminFetchOrders, adminUpdateOrderStatus, adminFetchOrderById } from '../../services/admin'
import { X, Search, RefreshCw } from 'lucide-react'

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled']
const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700', dispatched: 'bg-purple-100 text-purple-700',
    delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
    const [orders, setOrders] = useState([])
    const [total, setTotal] = useState(0)
    const [status, setStatus] = useState('all')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [selected, setSelected] = useState(null) // order for detail drawer
    const [selectedDetail, setSelectedDetail] = useState(null)
    const [loading, setLoading] = useState(true)
    const PER_PAGE = 15

    const load = async () => {
        setLoading(true)
        const { data, count } = await adminFetchOrders({ status, search, page, perPage: PER_PAGE })
        setOrders(data || [])
        setTotal(count || 0)
        setLoading(false)
    }
    useEffect(() => { load() }, [status, search, page])

    const openOrder = async (id) => {
        setSelected(id)
        const { data } = await adminFetchOrderById(id)
        setSelectedDetail(data)
    }

    const handleStatusUpdate = async (id, newStatus) => {
        await adminUpdateOrderStatus(id, newStatus)
        load()
        if (selectedDetail?.id === id) setSelectedDetail(d => ({ ...d, status: newStatus }))
    }

    const totalPages = Math.ceil(total / PER_PAGE)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-900">Orders</h1>
                <p className="text-sm text-slate-500">{total} orders total</p>
            </div>

            {/* Status tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
                {STATUSES.map(s => (
                    <button key={s} onClick={() => { setStatus(s); setPage(1) }}
                        className={`flex-shrink-0 rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-all ${status === s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Search + Refresh */}
            <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name or phone…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <button onClick={load} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-primary hover:text-primary">
                    <RefreshCw size={15} />
                </button>
            </div>

            {/* Orders table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-slate-100 bg-slate-50">
                        {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Action'].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                        ))}
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? Array.from({ length: 6 }).map((_, i) => (
                            <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td></tr>
                        )) : orders.length === 0 ? (
                            <tr><td colSpan={7} className="py-16 text-center text-slate-400 font-medium">No orders found</td></tr>
                        ) : orders.map(o => (
                            <tr key={o.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => openOrder(o.id)}>
                                <td className="px-5 py-3 font-mono text-xs font-bold text-slate-600">#{o.id}</td>
                                <td className="px-5 py-3">
                                    <p className="font-semibold text-slate-900">{o.shipping_name}</p>
                                    <p className="text-xs text-slate-400">{o.shipping_phone}</p>
                                </td>
                                <td className="px-5 py-3 text-slate-500 text-xs">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                                <td className="px-5 py-3 text-slate-600">{o.order_items?.length || '—'}</td>
                                <td className="px-5 py-3 font-bold text-primary">₹{Number(o.total).toLocaleString()}</td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                                </td>
                                <td className="px-5 py-3">
                                    <select value={o.status} onChange={e => { e.stopPropagation(); handleStatusUpdate(o.id, e.target.value) }}
                                        onClick={e => e.stopPropagation()}
                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-primary capitalize">
                                        {STATUSES.filter(s => s !== 'all').map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                        <span className="text-xs text-slate-500">Showing {Math.min((page - 1) * PER_PAGE + 1, total)}–{Math.min(page * PER_PAGE, total)} of {total}</span>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-primary disabled:opacity-40">← Prev</button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-primary disabled:opacity-40">Next →</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Detail Drawer */}
            {selected && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/40" onClick={() => { setSelected(null); setSelectedDetail(null) }} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h3 className="font-bold text-slate-900">Order #{selected}</h3>
                            <button onClick={() => { setSelected(null); setSelectedDetail(null) }}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"><X size={16} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {!selectedDetail ? (
                                <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Status update */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-slate-700">Update Status:</span>
                                        <select value={selectedDetail.status} onChange={e => handleStatusUpdate(selectedDetail.id, e.target.value)}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary capitalize flex-1">
                                            {STATUSES.filter(s => s !== 'all').map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                                        </select>
                                    </div>
                                    {/* Customer */}
                                    <div className="rounded-xl bg-slate-50 p-4 space-y-1">
                                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Shipping Details</p>
                                        <p className="font-semibold text-slate-900">{selectedDetail.shipping_name}</p>
                                        <p className="text-sm text-slate-600">{selectedDetail.shipping_phone}</p>
                                        <p className="text-sm text-slate-600">{selectedDetail.shipping_address}</p>
                                        <p className="text-sm text-slate-600">{selectedDetail.shipping_pincode}{selectedDetail.shipping_city ? `, ${selectedDetail.shipping_city}` : ''}</p>
                                    </div>
                                    {/* Items */}
                                    <div>
                                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Order Items</p>
                                        {selectedDetail.order_items?.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-slate-900">{item.product_name}</p>
                                                    <p className="text-xs text-slate-400">Lens: {item.lens_type} · Qty: {item.qty}</p>
                                                </div>
                                                <p className="font-bold text-primary text-sm">₹{Number(item.line_total).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Totals */}
                                    <div className="rounded-xl bg-slate-50 p-4 space-y-1.5 text-sm">
                                        <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{Number(selectedDetail.subtotal).toLocaleString()}</span></div>
                                        {selectedDetail.discount_amount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-₹{Number(selectedDetail.discount_amount).toLocaleString()}</span></div>}
                                        <div className="flex justify-between text-slate-600"><span>Delivery</span><span>{Number(selectedDetail.delivery_charge) === 0 ? 'FREE' : `₹${selectedDetail.delivery_charge}`}</span></div>
                                        <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2"><span>Total</span><span className="text-primary">₹{Number(selectedDetail.total).toLocaleString()}</span></div>
                                    </div>
                                    {/* Payment */}
                                    <div className="rounded-xl bg-slate-50 p-4 text-sm">
                                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Payment</p>
                                        <p><span className="text-slate-500">Status:</span> <span className="font-semibold capitalize">{selectedDetail.payment_status}</span></p>
                                        {selectedDetail.payment_id && <p className="text-xs text-slate-400 mt-1 font-mono">{selectedDetail.payment_id}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
