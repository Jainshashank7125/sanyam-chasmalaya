import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, ChevronRight, Upload, PenLine, Minus, Plus, Ruler } from 'lucide-react'
import { products, getLensTypePrice } from '../data/products'
import StarRating from '../components/StarRating'
import Badge from '../components/Badge'

const LENS_TYPES = [
    { id: 'zeroPower', label: 'Zero Power (Fashion/Protection)', desc: 'Includes anti-glare coating', price: 0 },
    { id: 'singleVision', label: 'Single Vision', desc: 'For Distance or Reading', price: 500 },
    { id: 'bifocal', label: 'Bifocal / Progressive', desc: 'For both Distance & Reading', price: 1200 },
]

const ADDONS = [
    { id: 'blueCut', label: 'Blue Cut (Anti-glare)', price: 300 },
    { id: 'photochromic', label: 'Photochromic', price: 800 },
    { id: 'antiFog', label: 'Anti-Fog', price: 200 },
]

const SPEC_TABS = ['Specifications', 'Delivery Info', 'Warranty Policy']

const deliveryInfo = `• Standard delivery in 5–7 working days.\n• Express delivery (2–3 days) available for an additional ₹99.\n• Free delivery on orders above ₹1,499.\n• We deliver PAN India.`
const warrantyInfo = `• 1-year warranty against manufacturing defects.\n• Frame replacement for any structural breakage within 6 months.\n• Lenses covered for 6 months against scratches (anti-scratch coating).\n• Warranty does not cover accidental damage or misuse.`

export default function ProductDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const product = products.find(p => p.id === Number(id))

    const [imgIdx, setImgIdx] = useState(0)
    const [lensType, setLensType] = useState('zeroPower')
    const [addons, setAddons] = useState([])
    const [powerTab, setPowerTab] = useState('upload')
    const [qty, setQty] = useState(1)
    const [specTab, setSpecTab] = useState(0)
    const [wishlisted, setWishlisted] = useState(false)
    const [addedToCart, setAddedToCart] = useState(false)

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                <p className="text-lg font-medium">Product not found</p>
                <button onClick={() => navigate('/products')} className="mt-4 btn-primary text-sm">Back to Products</button>
            </div>
        )
    }

    const toggleAddon = (id) => setAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

    const totalPrice = (product.price + getLensTypePrice(lensType) + addons.reduce((s, a) => s + (ADDONS.find(x => x.id === a)?.price || 0), 0)) * qty

    const handleAddToCart = () => {
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2000)
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white min-h-screen">
            <div className="container-padding py-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <ChevronRight size={13} />
                    <Link to="/products" className="hover:text-primary">Products</Link>
                    <ChevronRight size={13} />
                    <span className="text-slate-700 font-medium">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    {/* ── Left: Images ── */}
                    <div className="flex flex-col gap-4">
                        <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square shadow-sm">
                            {product.badge && (
                                <div className="absolute top-4 left-4 z-10">
                                    <Badge type={product.badge} className="text-sm px-3 py-1" />
                                </div>
                            )}
                            <button
                                onClick={() => setWishlisted(!wishlisted)}
                                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:bg-red-50 transition-colors"
                            >
                                <Heart size={18} className={wishlisted ? 'fill-primary text-primary' : 'text-slate-400'} />
                            </button>
                            <motion.img
                                key={imgIdx}
                                initial={{ opacity: 0.6, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={product.images[imgIdx]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        {/* Thumbnails */}
                        <div className="flex gap-3">
                            {product.images.map((src, i) => (
                                <button
                                    key={i}
                                    onClick={() => setImgIdx(i)}
                                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${imgIdx === i ? 'border-primary shadow-md' : 'border-transparent hover:border-slate-300'
                                        }`}
                                >
                                    <img src={src} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Right: Details ── */}
                    <div className="flex flex-col gap-5">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 leading-tight">{product.name}</h1>
                            <p className="text-sm text-slate-500 mt-1">{product.material} · {product.gender}</p>
                            <div className="mt-2">
                                <StarRating rating={product.rating} reviews={product.reviews} />
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-end gap-3 flex-wrap">
                            <span className="text-3xl font-black text-primary">₹{totalPrice.toLocaleString()}</span>
                            {product.discount > 0 && (
                                <>
                                    <span className="text-base text-slate-400 line-through mb-0.5">₹{(product.mrp * qty).toLocaleString()}</span>
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700 mb-0.5">
                                        {product.discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-slate-400">Inclusive of all taxes</p>

                        {/* Lens Type */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Choose Lens Type</h3>
                                <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                                    <span className="material-symbols-outlined text-[14px]">help_outline</span>
                                    Help me choose
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {LENS_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setLensType(type.id)}
                                        className={`flex items-center justify-between rounded-xl border-2 p-3.5 text-left transition-all ${lensType === type.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-slate-200 hover:border-primary/40'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${lensType === type.id ? 'border-primary bg-primary' : 'border-slate-300'
                                                }`}>
                                                {lensType === type.id && <div className="h-full w-full rounded-full bg-white scale-50" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{type.label}</p>
                                                <p className="text-xs text-slate-500">{type.desc}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 flex-shrink-0">
                                            {type.price === 0 ? 'Free' : `+ ₹${type.price}`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Lens Add-ons */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Lens Add-ons</h3>
                            <div className="flex flex-wrap gap-2">
                                {ADDONS.map(addon => (
                                    <button
                                        key={addon.id}
                                        onClick={() => toggleAddon(addon.id)}
                                        className={`rounded-full border-2 px-4 py-1.5 text-xs font-semibold transition-all ${addons.includes(addon.id)
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                                            }`}
                                    >
                                        {addons.includes(addon.id) && '✓ '}{addon.label} {addon.price > 0 && `(+₹${addon.price})`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Power */}
                        {lensType !== 'zeroPower' && (
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <h3 className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-50 border-b border-slate-200">Submit Power</h3>
                                {/* Tabs */}
                                <div className="flex border-b border-slate-200">
                                    {[{ id: 'upload', icon: <Upload size={13} />, label: 'Upload Photo' }, { id: 'manual', icon: <PenLine size={13} />, label: 'Enter Manually' }].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setPowerTab(t.id)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${powerTab === t.id ? 'bg-white text-primary border-b-2 border-primary -mb-px' : 'bg-slate-50 text-slate-500'
                                                }`}
                                        >
                                            {t.icon} {t.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-4">
                                    {powerTab === 'upload' ? (
                                        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 cursor-pointer hover:border-primary/50 hover:bg-red-50/30 transition-all">
                                            <Upload size={24} className="text-slate-400" />
                                            <p className="text-xs font-medium text-slate-600">Click to upload prescription</p>
                                            <p className="text-xs text-slate-400">Supported formats: JPG, PNG, PDF</p>
                                            <input type="file" accept=".jpg,.png,.pdf" className="hidden" />
                                        </label>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            {['Right Eye (SPH)', 'Left Eye (SPH)', 'Right Eye (CYL)', 'Left Eye (CYL)'].map(field => (
                                                <div key={field}>
                                                    <label className="text-slate-500 mb-1 block">{field}</label>
                                                    <input type="number" step="0.25" placeholder="0.00" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Qty + Actions */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-0 rounded-xl border border-slate-200 overflow-hidden">
                                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
                                    <Minus size={16} />
                                </button>
                                <span className="w-10 text-center text-sm font-bold text-slate-900">{qty}</span>
                                <button onClick={() => setQty(q => q + 1)} className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                                <Ruler size={14} /> Frame Size Guide
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleAddToCart} className={`btn-outline py-3.5 text-sm ${addedToCart ? 'bg-primary text-white' : ''}`}>
                                <ShoppingBag size={16} />
                                {addedToCart ? 'Added!' : 'Add to Cart'}
                            </button>
                            <button className="btn-primary py-3.5 text-sm">
                                Buy Now
                            </button>
                        </div>

                        {/* Trust badges */}
                        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-1">
                            {['Authorized Dealer', 'Secure Checkout', '1 Year Warranty'].map(t => (
                                <span key={t} className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-emerald-500 text-[14px]">verified</span> {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Spec Tabs ── */}
                <div className="mt-12 rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="flex border-b border-slate-200">
                        {SPEC_TABS.map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => setSpecTab(i)}
                                className={`px-6 py-4 text-sm font-semibold transition-colors ${specTab === i ? 'border-b-2 border-primary text-primary bg-white -mb-px' : 'text-slate-500 bg-slate-50 hover:text-slate-800'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="p-6">
                        {specTab === 0 && (
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                                {Object.entries(product.specs).map(([key, val]) => (
                                    <div key={key}>
                                        <p className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{val}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {specTab === 1 && (
                            <pre className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{deliveryInfo}</pre>
                        )}
                        {specTab === 2 && (
                            <pre className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{warrantyInfo}</pre>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
