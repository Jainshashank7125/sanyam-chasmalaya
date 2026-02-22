import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { adminFetchProducts, adminDeleteProduct, adminToggleProductActive, adminFetchCategories } from '../../services/admin'

const BADGE_COLORS = {
    new: 'bg-emerald-100 text-emerald-700',
    bestseller: 'bg-orange-100 text-orange-700',
    limited: 'bg-purple-100 text-purple-700',
}

export default function ProductsPage() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [filterActive, setFilterActive] = useState('')
    const [selected, setSelected] = useState(new Set())
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const PER_PAGE = 15

    const load = useCallback(async () => {
        setLoading(true)
        const [{ data, count }, { data: cats }] = await Promise.all([
            adminFetchProducts({ search, categoryId: filterCategory || undefined, isActive: filterActive === '' ? undefined : filterActive === 'true', page, perPage: PER_PAGE }),
            adminFetchCategories(),
        ])
        setProducts(data || [])
        setTotal(count || 0)
        setCategories(cats || [])
        setLoading(false)
    }, [search, filterCategory, filterActive, page])

    useEffect(() => { load() }, [load])

    const handleToggle = async (id, isActive) => {
        await adminToggleProductActive(id, isActive)
        load()
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product? This cannot be undone.')) return
        await adminDeleteProduct(id)
        load()
    }

    const handleBulkToggle = async (isActive) => {
        await Promise.all([...selected].map(id => adminToggleProductActive(id, isActive)))
        setSelected(new Set())
        load()
    }

    const toggleSelect = (id) => setSelected(prev => {
        const n = new Set(prev)
        n.has(id) ? n.delete(id) : n.add(id)
        return n
    })

    const totalPages = Math.ceil(total / PER_PAGE)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Products</h1>
                    <p className="text-sm text-slate-500">{total} products total</p>
                </div>
                <Link to="/admin/products/new" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark">
                    <Plus size={16} /> Add Product
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                        placeholder="Search products..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1) }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(1) }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary">
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
                <button onClick={load} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-primary hover:text-primary">
                    <RefreshCw size={15} />
                </button>
            </div>

            {/* Bulk actions */}
            {selected.size > 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                    <span className="text-sm font-medium text-primary">{selected.size} selected</span>
                    <button onClick={() => handleBulkToggle(true)} className="text-xs rounded-lg bg-emerald-500 text-white px-3 py-1.5 font-medium hover:bg-emerald-600">Activate</button>
                    <button onClick={() => handleBulkToggle(false)} className="text-xs rounded-lg bg-slate-500 text-white px-3 py-1.5 font-medium hover:bg-slate-600">Deactivate</button>
                    <button onClick={() => setSelected(new Set())} className="text-xs text-slate-500 hover:text-slate-800 ml-auto">Clear</button>
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="w-10 px-4 py-3">
                                    <input type="checkbox"
                                        checked={selected.size === products.length && products.length > 0}
                                        onChange={e => setSelected(e.target.checked ? new Set(products.map(p => p.id)) : new Set())}
                                        className="rounded border-slate-300"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}><td colSpan={7} className="px-4 py-4">
                                        <div className="h-8 bg-slate-100 rounded animate-pulse" />
                                    </td></tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr><td colSpan={7} className="py-16 text-center text-slate-400">
                                    <p className="font-medium">No products found</p>
                                    <Link to="/admin/products/new" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"><Plus size={14} /> Add your first product</Link>
                                </td></tr>
                            ) : products.map(p => {
                                const image = p.product_images?.find(i => i.is_primary)?.url || p.product_images?.[0]?.url
                                const discount = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0
                                return (
                                    <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${selected.has(p.id) ? 'bg-primary/5' : ''}`}>
                                        <td className="px-4 py-3">
                                            <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded border-slate-300" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={image || 'https://via.placeholder.com/48'} alt={p.name} className="h-12 w-12 rounded-lg object-cover flex-shrink-0 bg-slate-100" />
                                                <div>
                                                    <p className="font-semibold text-slate-900 max-w-[180px] truncate">{p.name}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        {p.badge && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${BADGE_COLORS[p.badge] || 'bg-slate-100 text-slate-600'}`}>{p.badge}</span>}
                                                        <span className="text-[10px] text-slate-400 capitalize">{p.gender}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 capitalize">{p.categories?.name || '—'}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-bold text-primary">₹{Number(p.price).toLocaleString()}</p>
                                            {discount > 0 && <p className="text-[10px] text-slate-400 line-through">₹{Number(p.mrp).toLocaleString()} ({discount}% off)</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-bold text-sm ${p.stock_qty < 5 ? 'text-red-600' : p.stock_qty < 20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {p.stock_qty}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleToggle(p.id, !p.is_active)}
                                                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${p.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                                {p.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                                                {p.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Link to={`/admin/products/${p.id}/edit`}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition-colors">
                                                    <Edit2 size={14} />
                                                </Link>
                                                <button onClick={() => handleDelete(p.id)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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
        </div>
    )
}
