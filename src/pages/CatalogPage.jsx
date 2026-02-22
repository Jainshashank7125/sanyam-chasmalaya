import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal, LayoutGrid, List, X, ChevronDown, ChevronUp } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

const SHAPES = ['aviator', 'rectangle', 'round', 'square']
const COLORS = [
    { hex: '#1a1a1a', label: 'Black' },
    { hex: '#8B4513', label: 'Brown' },
    { hex: '#808080', label: 'Grey' },
    { hex: '#003366', label: 'Blue' },
    { hex: '#d4d4d4', label: 'Clear' },
]

const SORT_OPTIONS = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
]

const TABS = [
    { value: 'frames', label: 'Frames' },
    { value: 'lenses', label: 'Lenses / Glasses' },
    { value: 'sunglasses', label: 'Sunglasses' },
]

export default function CatalogPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [viewMode, setViewMode] = useState('grid')
    const [sortBy, setSortBy] = useState('featured')
    const [genders, setGenders] = useState([])
    const [shapes, setShapes] = useState([])
    const [priceMax, setPriceMax] = useState(10000)
    const [selectedColors, setSelectedColors] = useState([])
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [page, setPage] = useState(1)
    const PER_PAGE = 6

    const activeCategory = searchParams.get('category') || 'frames'

    const setCategory = (cat) => {
        setSearchParams({ category: cat })
        setPage(1)
    }

    const toggleGender = (g) => setGenders(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
    const toggleShape = (s) => setShapes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
    const toggleColor = (c) => setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

    const clearAll = () => { setGenders([]); setShapes([]); setSelectedColors([]); setPriceMax(10000) }

    const activeFilters = [
        ...genders.map(g => ({ label: g, remove: () => toggleGender(g) })),
        ...shapes.map(s => ({ label: s, remove: () => toggleShape(s) })),
    ]

    const filtered = useMemo(() => {
        let list = products.filter(p => p.category === activeCategory)
        if (genders.length) list = list.filter(p => genders.includes(p.gender) || p.gender === 'unisex')
        if (shapes.length) list = list.filter(p => shapes.includes(p.shape))
        if (selectedColors.length) list = list.filter(p => p.colors.some(c => selectedColors.includes(c)))
        list = list.filter(p => p.price <= priceMax)
        if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
        else if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
        else if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
        return list
    }, [activeCategory, genders, shapes, selectedColors, priceMax, sortBy])

    const totalPages = Math.ceil(filtered.length / PER_PAGE)
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    useEffect(() => { setPage(1) }, [activeCategory, genders, shapes, selectedColors, priceMax, sortBy])

    const FilterPanel = () => (
        <div className="flex flex-col gap-6">
            {/* Gender */}
            <div>
                <h4 className="font-semibold text-slate-800 mb-3 text-sm">Gender</h4>
                {['men', 'women', 'kids'].map(g => (
                    <label key={g} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={genders.includes(g)}
                            onChange={() => toggleGender(g)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-600 capitalize group-hover:text-primary transition-colors">{g}</span>
                    </label>
                ))}
            </div>

            {/* Shape */}
            <div>
                <h4 className="font-semibold text-slate-800 mb-3 text-sm">Shape</h4>
                <div className="grid grid-cols-2 gap-2">
                    {SHAPES.map(s => (
                        <button
                            key={s}
                            onClick={() => toggleShape(s)}
                            className={`rounded-xl border-2 py-2 text-xs font-medium capitalize transition-all ${shapes.includes(s) ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:border-primary/40'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-slate-800 text-sm">Price</h4>
                    <span className="text-xs text-slate-500">up to ₹{priceMax.toLocaleString()}</span>
                </div>
                <input
                    type="range"
                    min={500}
                    max={10000}
                    step={100}
                    value={priceMax}
                    onChange={e => setPriceMax(Number(e.target.value))}
                    className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>₹500</span><span>₹10,000+</span>
                </div>
            </div>

            {/* Color */}
            <div>
                <h4 className="font-semibold text-slate-800 mb-3 text-sm">Color</h4>
                <div className="flex gap-2 flex-wrap">
                    {COLORS.map(({ hex, label }) => (
                        <button
                            key={hex}
                            aria-label={label}
                            onClick={() => toggleColor(hex)}
                            style={{ background: hex }}
                            className={`h-7 w-7 rounded-full border-2 transition-all ${selectedColors.includes(hex) ? 'border-primary ring-2 ring-primary ring-offset-1 scale-110' : 'border-white shadow ring-1 ring-slate-200'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white">
            <div className="container-padding py-8">
                {/* Category tabs */}
                <div className="flex items-center justify-between border-b border-slate-200 mb-6">
                    <div className="flex gap-0">
                        {TABS.map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setCategory(tab.value)}
                                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${activeCategory === tab.value
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-slate-500 hidden sm:block">
                        Showing <strong>{filtered.length}</strong> results
                    </span>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar — desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-slate-900">Filters</h3>
                            {activeFilters.length > 0 && (
                                <button onClick={clearAll} className="text-xs font-medium text-primary hover:text-primary-dark">Clear All</button>
                            )}
                        </div>
                        <FilterPanel />
                    </aside>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                            {/* Active filter chips */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setMobileFiltersOpen(true)}
                                    className="lg:hidden flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-primary hover:text-primary"
                                >
                                    <SlidersHorizontal size={13} /> Filters
                                </button>
                                {activeFilters.map(({ label, remove }) => (
                                    <span key={label} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                        {label} <button onClick={remove}><X size={12} /></button>
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 ml-auto">
                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                {/* View toggle */}
                                <div className="flex gap-1 rounded-lg border border-slate-200 p-1">
                                    <button onClick={() => setViewMode('grid')} className={`rounded p-1 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary'}`}>
                                        <LayoutGrid size={16} />
                                    </button>
                                    <button onClick={() => setViewMode('list')} className={`rounded p-1 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary'}`}>
                                        <List size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Product grid */}
                        {paginated.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                                <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                                <p className="text-lg font-medium">No products match your filters</p>
                                <button onClick={clearAll} className="mt-4 btn-primary text-sm py-2">Clear Filters</button>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5' : 'flex flex-col gap-4'}>
                                {paginated.map((p, i) => (
                                    <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                        {viewMode === 'grid' ? (
                                            <ProductCard product={p} />
                                        ) : (
                                            <Link
                                                to={`/products/${p.id}`}
                                                className="card flex gap-4 p-4 hover:border-primary/30 transition-colors"
                                            >
                                                <img src={p.images[0]} alt={p.name} className="h-24 w-24 rounded-xl object-cover flex-shrink-0" />
                                                <div className="flex flex-col justify-center gap-1">
                                                    <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                                                    <p className="text-xs text-slate-500">{p.material} · {p.gender}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="font-bold text-primary">₹{p.price.toLocaleString()}</span>
                                                        {p.discount > 0 && <span className="text-xs text-slate-400 line-through">₹{p.mrp.toLocaleString()}</span>}
                                                    </div>
                                                </div>
                                            </Link>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ← Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setPage(n)}
                                        className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${n === page ? 'bg-primary text-white' : 'border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                                            }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Overlay */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Filters</h3>
                            <button onClick={() => setMobileFiltersOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="p-5">
                            <FilterPanel />
                            <button onClick={() => { setMobileFiltersOpen(false) }} className="btn-primary w-full mt-6">
                                Apply Filters ({filtered.length} results)
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    )
}
