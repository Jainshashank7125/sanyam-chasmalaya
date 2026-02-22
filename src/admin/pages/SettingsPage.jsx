import { useState, useEffect } from 'react'
import { Save, Check } from 'lucide-react'
import { fetchSettings, updateSettings } from '../../services/admin'
import { adminFetchPromoCodes, adminCreatePromoCode, adminDeletePromoCode } from '../../services/admin'
import { Plus, Trash2 } from 'lucide-react'

const SECTIONS = [
    {
        key: 'store_info', label: 'Store Information', fields: [
            { name: 'name', label: 'Store Name' },
            { name: 'phone', label: 'Phone Number' },
            { name: 'email', label: 'Email Address' },
            { name: 'address', label: 'Address', multiline: true },
            { name: 'hours', label: 'Business Hours' },
        ]
    },
    {
        key: 'delivery', label: 'Delivery Settings', fields: [
            { name: 'free_above', label: 'Free Delivery Above (₹)', type: 'number' },
            { name: 'standard_charge', label: 'Standard Delivery (₹)', type: 'number' },
            { name: 'express_charge', label: 'Express Delivery (₹)', type: 'number' },
        ]
    },
    {
        key: 'social', label: 'Social Media Links', fields: [
            { name: 'facebook', label: 'Facebook URL' },
            { name: 'instagram', label: 'Instagram URL' },
            { name: 'twitter', label: 'Twitter URL' },
            { name: 'whatsapp', label: 'WhatsApp Number (e.g. 919876543210)' },
        ]
    },
]

export default function SettingsPage() {
    const [settings, setSettings] = useState({})
    const [loading, setLoading] = useState(true)
    const [saved, setSaved] = useState(null)
    const [promos, setPromos] = useState([])
    const [promoForm, setPromoForm] = useState({ code: '', discount_type: 'percent', discount_value: '', min_order_value: '', max_uses: '', expires_at: '' })
    const [addingPromo, setAddingPromo] = useState(false)

    useEffect(() => {
        const load = async () => {
            const results = await Promise.all(SECTIONS.map(s => fetchSettings(s.key)))
            const byKey = {}
            SECTIONS.forEach((s, i) => { byKey[s.key] = results[i].data || {} })
            setSettings(byKey)
            const { data: p } = await adminFetchPromoCodes()
            setPromos(p || [])
            setLoading(false)
        }
        load()
    }, [])

    const handleSave = async (key) => {
        await updateSettings(key, settings[key])
        setSaved(key)
        setTimeout(() => setSaved(null), 2000)
    }

    const updateField = (sectionKey, fieldName, value) => {
        setSettings(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey], [fieldName]: value } }))
    }

    const savePromo = async () => {
        await adminCreatePromoCode({
            code: promoForm.code.toUpperCase(),
            discount_type: promoForm.discount_type,
            discount_value: Number(promoForm.discount_value),
            min_order_value: Number(promoForm.min_order_value) || 0,
            max_uses: promoForm.max_uses ? Number(promoForm.max_uses) : null,
            expires_at: promoForm.expires_at || null,
            is_active: true,
        })
        const { data: p } = await adminFetchPromoCodes()
        setPromos(p || [])
        setAddingPromo(false)
        setPromoForm({ code: '', discount_type: 'percent', discount_value: '', min_order_value: '', max_uses: '', expires_at: '' })
    }

    const deletePromo = async (id) => {
        if (!window.confirm('Delete this promo code?')) return
        await adminDeletePromoCode(id)
        const { data: p } = await adminFetchPromoCodes()
        setPromos(p || [])
    }

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    )

    const inputClass = "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h1 className="text-2xl font-black text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500">Manage store information, delivery charges, and promo codes</p>
            </div>

            {/* Settings sections */}
            {SECTIONS.map(section => (
                <div key={section.key} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-900">{section.label}</h3>
                        <button onClick={() => handleSave(section.key)}
                            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all ${saved === section.key ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:bg-primary-dark'}`}>
                            {saved === section.key ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save</>}
                        </button>
                    </div>
                    <div className="space-y-3">
                        {section.fields.map(field => (
                            <div key={field.name}>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">{field.label}</label>
                                {field.multiline ? (
                                    <textarea value={settings[section.key]?.[field.name] || ''} onChange={e => updateField(section.key, field.name, e.target.value)}
                                        rows={3} className={`${inputClass} resize-none`} />
                                ) : (
                                    <input type={field.type || 'text'} value={settings[section.key]?.[field.name] || ''} onChange={e => updateField(section.key, field.name, e.target.type === 'number' ? Number(e.target.value) : e.target.value)}
                                        className={inputClass} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Promo codes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900">Promo Codes</h3>
                    <button onClick={() => setAddingPromo(true)} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark">
                        <Plus size={14} /> Add Code
                    </button>
                </div>

                {addingPromo && (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Code</label>
                                <input value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Type</label>
                                <select value={promoForm.discount_type} onChange={e => setPromoForm(f => ({ ...f, discount_type: e.target.value }))} className={inputClass}>
                                    <option value="percent">Percent (%)</option>
                                    <option value="fixed">Fixed (₹)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Value</label>
                                <input type="number" value={promoForm.discount_value} onChange={e => setPromoForm(f => ({ ...f, discount_value: e.target.value }))} placeholder={promoForm.discount_type === 'percent' ? '20' : '200'} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Min Order (₹)</label>
                                <input type="number" value={promoForm.min_order_value} onChange={e => setPromoForm(f => ({ ...f, min_order_value: e.target.value }))} placeholder="0" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Max Uses</label>
                                <input type="number" value={promoForm.max_uses} onChange={e => setPromoForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="Unlimited" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Expires</label>
                                <input type="date" value={promoForm.expires_at} onChange={e => setPromoForm(f => ({ ...f, expires_at: e.target.value }))} className={inputClass} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={savePromo} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"><Check size={14} /> Create</button>
                            <button onClick={() => setAddingPromo(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {promos.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">No promo codes yet</p>
                    ) : promos.map(promo => (
                        <div key={promo.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-slate-900">{promo.code}</span>
                                    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${promo.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {promo.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {promo.discount_type === 'percent' ? `${promo.discount_value}% off` : `₹${promo.discount_value} off`}
                                    {promo.min_order_value > 0 ? ` · Min ₹${promo.min_order_value}` : ''}
                                    {promo.max_uses ? ` · ${promo.used_count}/${promo.max_uses} used` : ''}
                                    {promo.expires_at ? ` · Expires ${new Date(promo.expires_at).toLocaleDateString('en-IN')}` : ''}
                                </p>
                            </div>
                            <button onClick={() => deletePromo(promo.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
