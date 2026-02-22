import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload, X, GripVertical, Plus, Save } from 'lucide-react'
import {
    adminFetchCategories, adminCreateProduct, adminUpdateProduct,
    uploadProductImage, deleteProductImage
} from '../../services/admin'
import { supabase } from '../../lib/supabase'

const BADGE_OPTIONS = [{ value: '', label: 'None' }, { value: 'new', label: 'New Arrival' }, { value: 'bestseller', label: 'Bestseller' }, { value: 'limited', label: 'Limited Edition' }]
const GENDER_OPTIONS = ['men', 'women', 'kids', 'unisex']
const SHAPE_OPTIONS = ['aviator', 'rectangle', 'round', 'square', 'cat-eye', 'other']

export default function ProductFormPage() {
    const { id } = useParams()
    const isEdit = !!id
    const navigate = useNavigate()

    const [form, setForm] = useState({
        name: '', slug: '', description: '', category_id: '',
        price: '', mrp: '', stock_qty: '', is_active: true,
        badge: '', gender: 'unisex', frame_shape: '', frame_material: '',
        lens_width_mm: '', bridge_size_mm: '', temple_length_mm: '',
        weight_g: '', country_of_origin: 'India',
    })
    const [categories, setCategories] = useState([])
    const [images, setImages] = useState([]) // { url, is_primary, id? }
    const [colors, setColors] = useState([]) // { hex_code, label }
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const fileRef = useRef(null)

    useEffect(() => {
        adminFetchCategories().then(({ data }) => setCategories(data || []))
        if (isEdit) {
            supabase.from('products').select('*, product_images(*), product_colors(*)').eq('id', id).single()
                .then(({ data }) => {
                    if (!data) return
                    const { product_images, product_colors, ...rest } = data
                    setForm({ ...rest, badge: rest.badge || '', category_id: rest.category_id || '' })
                    setImages(product_images || [])
                    setColors(product_colors || [])
                })
        }
    }, [id])

    const field = (key) => ({
        value: form[key] ?? '',
        onChange: e => {
            const val = e.target.value
            setForm(f => ({ ...f, [key]: val }))
            if (key === 'name' && !isEdit) {
                setForm(f => ({ ...f, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }))
            }
        },
    })

    // Image upload
    const handleFiles = async (files) => {
        if (!files?.length) return
        const productId = isEdit ? id : `temp-${Date.now()}`
        setUploading(true)
        for (const file of Array.from(files)) {
            const ext = file.name.split('.').pop()
            const path = `${productId}/${Date.now()}.${ext}`
            const { error: err } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
            if (!err) {
                const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
                setImages(prev => [...prev, { url: publicUrl, is_primary: prev.length === 0, storagePath: path }])
            }
        }
        setUploading(false)
    }

    const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx))
    const setPrimary = (idx) => setImages(prev => prev.map((img, i) => ({ ...img, is_primary: i === idx })))

    const addColor = () => setColors(prev => [...prev, { hex_code: '#000000', label: '' }])
    const removeColor = (i) => setColors(prev => prev.filter((_, j) => j !== i))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        const productData = {
            ...form,
            price: Number(form.price),
            mrp: Number(form.mrp),
            stock_qty: Number(form.stock_qty),
            badge: form.badge || null,
            category_id: form.category_id ? Number(form.category_id) : null,
            lens_width_mm: form.lens_width_mm ? Number(form.lens_width_mm) : null,
            bridge_size_mm: form.bridge_size_mm ? Number(form.bridge_size_mm) : null,
            temple_length_mm: form.temple_length_mm ? Number(form.temple_length_mm) : null,
            weight_g: form.weight_g ? Number(form.weight_g) : null,
            frame_shape: form.frame_shape || null,
        }
        delete productData.product_images
        delete productData.product_colors

        let productId = isEdit ? Number(id) : null
        if (isEdit) {
            const { error: err } = await adminUpdateProduct(productId, productData)
            if (err) { setError(err.message); setSaving(false); return }
        } else {
            const { data, error: err } = await adminCreateProduct(productData)
            if (err) { setError(err.message); setSaving(false); return }
            productId = data.id
        }

        // Save images
        await supabase.from('product_images').delete().eq('product_id', productId)
        if (images.length > 0) {
            await supabase.from('product_images').insert(
                images.map((img, i) => ({ product_id: productId, url: img.url, is_primary: img.is_primary, sort_order: i }))
            )
        }

        // Save colors
        await supabase.from('product_colors').delete().eq('product_id', productId)
        if (colors.length > 0) {
            await supabase.from('product_colors').insert(colors.map(c => ({ product_id: productId, ...c })))
        }

        setSaving(false)
        navigate('/admin/products')
    }

    const inputClass = "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white"
    const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => navigate('/admin/products')} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-primary hover:text-primary">
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
                        <p className="text-sm text-slate-500">{isEdit ? `Editing product #${id}` : 'Fill in the details to create a new product'}</p>
                    </div>
                </div>
                <button type="submit" disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark disabled:opacity-60">
                    {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={15} />}
                    {saving ? 'Saving…' : 'Save Product'}
                </button>
            </div>

            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left: main info */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Basic Info */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h3>
                        <div>
                            <label className={labelClass}>Product Name *</label>
                            <input {...field('name')} required placeholder="e.g. Urban Retro Round Titanium" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>URL Slug</label>
                            <input {...field('slug')} required placeholder="auto-generated" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea {...field('description')} rows={4} placeholder="Describe the product, its unique features, and what makes it special..." className={inputClass + ' resize-none'} />
                        </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Pricing & Inventory</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Selling Price (₹) *</label>
                                <input {...field('price')} type="number" min={0} required placeholder="2499" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>MRP (₹) *</label>
                                <input {...field('mrp')} type="number" min={0} required placeholder="3999" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Stock Qty *</label>
                                <input {...field('stock_qty')} type="number" min={0} required placeholder="50" className={inputClass} />
                            </div>
                        </div>
                        {form.price && form.mrp && Number(form.mrp) > Number(form.price) && (
                            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-2 text-sm text-emerald-700">
                                Discount: <strong>{Math.round((1 - Number(form.price) / Number(form.mrp)) * 100)}% off</strong> shown to customers
                            </div>
                        )}
                    </div>

                    {/* Frame Specifications */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Frame Specifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Frame Material</label>
                                <input {...field('frame_material')} placeholder="e.g. Titanium, Acetate" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Country of Origin</label>
                                <input {...field('country_of_origin')} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Lens Width (mm)</label>
                                <input {...field('lens_width_mm')} type="number" step={0.1} placeholder="52.0" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Bridge Size (mm)</label>
                                <input {...field('bridge_size_mm')} type="number" step={0.1} placeholder="18.0" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Temple Length (mm)</label>
                                <input {...field('temple_length_mm')} type="number" step={0.1} placeholder="140.0" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Weight (g)</label>
                                <input {...field('weight_g')} type="number" step={0.1} placeholder="18.0" className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-900">Colour Swatches</h3>
                            <button type="button" onClick={addColor} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={12} /> Add colour</button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {colors.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2">
                                    <input type="color" value={c.hex_code} onChange={e => setColors(prev => prev.map((x, j) => j === i ? { ...x, hex_code: e.target.value } : x))}
                                        className="h-8 w-8 cursor-pointer rounded-lg border-0 p-0.5" />
                                    <input value={c.label} onChange={e => setColors(prev => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                                        placeholder="Label" className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-primary" />
                                    <button type="button" onClick={() => removeColor(i)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                                </div>
                            ))}
                            {colors.length === 0 && <p className="text-xs text-slate-400">No colours added. Click "Add colour" to add colour swatches.</p>}
                        </div>
                    </div>
                </div>

                {/* Right: Images + Meta */}
                <div className="space-y-5">
                    {/* Images */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Product Images</h3>
                        {/* Upload zone */}
                        <label
                            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 cursor-pointer transition-all ${uploading ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-red-50/20'}`}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                        >
                            <Upload size={24} className={uploading ? 'text-primary animate-bounce' : 'text-slate-400'} />
                            <p className="text-xs font-medium text-slate-600">{uploading ? 'Uploading…' : 'Drag & drop or click to upload'}</p>
                            <p className="text-[11px] text-slate-400">JPG, PNG, WebP – max 5 MB each</p>
                            <input type="file" multiple accept="image/*" className="hidden" ref={fileRef} onChange={e => handleFiles(e.target.files)} />
                        </label>
                        {/* Image grid */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {images.map((img, i) => (
                                    <div key={i} className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${img.is_primary ? 'border-primary' : 'border-transparent hover:border-slate-300'}`}>
                                        <img src={img.url} alt="" className="h-24 w-full object-cover" onClick={() => setPrimary(i)} />
                                        <button type="button" onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600">
                                            <X size={12} />
                                        </button>
                                        {img.is_primary && <span className="absolute bottom-1 left-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">Primary</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Organisation */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Organisation</h3>
                        <div>
                            <label className={labelClass}>Category</label>
                            <select {...field('category_id')} className={inputClass}>
                                <option value="">Select category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Badge</label>
                            <select {...field('badge')} className={inputClass}>
                                {BADGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Gender</label>
                            <select {...field('gender')} className={inputClass}>
                                {GENDER_OPTIONS.map(g => <option key={g} value={g} className="capitalize">{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Frame Shape</label>
                            <select {...field('frame_shape')} className={inputClass}>
                                <option value="">Not specified</option>
                                {SHAPE_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Active / Visible</p>
                                <p className="text-xs text-slate-500">Customers can see this product</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-primary' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
