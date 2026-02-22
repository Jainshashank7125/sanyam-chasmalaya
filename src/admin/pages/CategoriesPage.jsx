import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import { adminFetchCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../services/admin'
import { supabase } from '../../lib/supabase'

export default function CategoriesPage() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(null)
    const [adding, setAdding] = useState(false)
    const [form, setForm] = useState({ name: '', slug: '', description: '', is_active: true })
    const [saving, setSaving] = useState(false)

    const load = async () => {
        setLoading(true)
        const { data } = await adminFetchCategories()
        setCategories(data || [])
        setLoading(false)
    }
    useEffect(() => { load() }, [])

    const startEdit = (cat) => {
        setEditing(cat.id)
        setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', is_active: cat.is_active })
        setAdding(false)
    }
    const startAdd = () => { setAdding(true); setEditing(null); setForm({ name: '', slug: '', description: '', is_active: true }) }
    const cancel = () => { setAdding(false); setEditing(null) }

    const save = async () => {
        setSaving(true)
        if (editing) await adminUpdateCategory(editing, form)
        else await adminCreateCategory(form)
        setSaving(false); cancel(); load()
    }

    const remove = async (id) => {
        if (!window.confirm('Delete this category? Products will become uncategorised.')) return
        await adminDeleteCategory(id); load()
    }

    const inputClass = "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
    const SaveCancel = () => (
        <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60">
                {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Check size={14} />} Save
            </button>
            <button onClick={cancel} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <X size={14} /> Cancel
            </button>
        </div>
    )

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Categories</h1>
                    <p className="text-sm text-slate-500">{categories.length} categories</p>
                </div>
                <button onClick={startAdd} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark">
                    <Plus size={16} /> Add Category
                </button>
            </div>

            {adding && (
                <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 space-y-4">
                    <h3 className="font-bold text-slate-900">New Category</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Name *</label>
                            <input value={form.name} onChange={e => {
                                const v = e.target.value
                                setForm(f => ({ ...f, name: v, slug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }))
                            }} placeholder="e.g. Sunglasses" className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Slug</label>
                            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={inputClass} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Description</label>
                            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputClass} />
                        </div>
                    </div>
                    <SaveCancel />
                </div>
            )}

            <div className="space-y-3">
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse"><div className="h-12 bg-slate-100 rounded" /></div>
                )) : categories.map(cat => (
                    <div key={cat.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                        {editing === cat.id ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className={inputClass} />
                                    <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="Slug" className={inputClass} />
                                    <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className={`${inputClass} col-span-2`} />
                                </div>
                                <SaveCancel />
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <img src={cat.image_url || 'https://via.placeholder.com/56'} alt={cat.name} className="h-14 w-14 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-900">{cat.name}</p>
                                        <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${cat.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {cat.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-mono">/{cat.slug}</p>
                                    {cat.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{cat.description}</p>}
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => startEdit(cat)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-primary hover:text-primary"><Edit2 size={14} /></button>
                                    <button onClick={() => remove(cat.id)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
