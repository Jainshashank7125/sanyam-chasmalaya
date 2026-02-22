import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Star } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

const features = [
    { icon: 'visibility', title: 'Free Eye Testing', desc: 'Comprehensive computerized eye exams at absolutely no cost to you.' },
    { icon: 'eyeglasses', title: 'Branded Frames', desc: 'Explore a wide range of top international and Indian brands.' },
    { icon: 'auto_awesome', title: 'Premium Lenses', desc: 'High-quality, scratch-resistant lenses for crystal clear vision.' },
    { icon: 'currency_rupee', title: 'Affordable Pricing', desc: 'Honest pricing that fits your budget without compromising quality.' },
]

const categories = [
    {
        label: 'Frames',
        sub: 'Stylish & Durable',
        image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80',
        to: '/products?category=frames',
    },
    {
        label: 'Prescription',
        sub: 'Custom Lenses',
        image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=600&q=80',
        to: '/products?category=lenses',
    },
    {
        label: 'Contact Lenses',
        sub: 'Daily & Monthly',
        image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80',
        to: '/products?category=lenses',
    },
    {
        label: 'Sunglasses',
        sub: 'UV Protection',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
        to: '/products?category=sunglasses',
    },
]

const testimonials = [
    {
        name: 'Rahul Sharma',
        rating: 5,
        text: '"The service at Sanyam Chashmalaya is exceptional. I got my eyes tested for free and found the perfect frame within my budget. Highly recommended!"',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
    },
    {
        name: 'Priya Patel',
        rating: 4.5,
        text: '"Great collection of sunglasses. I was looking for polarized lenses for driving and found exactly what I needed. The staff is very knowledgeable."',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
    },
    {
        name: 'Amit Verma',
        rating: 5,
        text: '"I\'ve been visiting them for 5 years now. Their prescription accuracy is spot on. The new store layout is very modern and clean."',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80',
    },
]

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
}

export default function HomePage() {
    const navigate = useNavigate()
    const featured = products.filter(p => p.badge === 'bestseller').slice(0, 4)

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* ── HERO ── */}
            <section className="relative overflow-hidden bg-white py-12 lg:py-24">
                {/* Background decoration */}
                <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-red-50 to-transparent" />
                <div className="container-padding relative">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        {/* Left */}
                        <motion.div
                            className="flex flex-col gap-6 text-center lg:text-left"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="mx-auto lg:mx-0 inline-flex w-fit items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary ring-1 ring-red-100">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                Premium Quality Assured
                            </span>
                            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                                See the World<br className="hidden lg:block" />{' '}
                                <span className="relative text-primary">
                                    Clearly
                                    <svg className="absolute -bottom-2 left-0 w-full text-red-200 opacity-70" viewBox="0 0 200 9" fill="none">
                                        <path d="M2 7C26 3 87 -2 198 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                </span>{' '}
                                with Sanyam
                            </h1>
                            <p className="mx-auto max-w-xl text-lg text-slate-600 lg:mx-0">
                                Discover premium yet affordable eyewear and expert eye care services. From trendy frames to precision lenses, we bring clarity to your vision.
                            </p>
                            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                                <button onClick={() => navigate('/products')} className="btn-primary h-12 px-8 text-base w-full sm:w-auto">
                                    Shop Now
                                </button>
                                <button onClick={() => navigate('/contact')} className="btn-outline h-12 px-8 text-base w-full sm:w-auto">
                                    Book Free Eye Test
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-6 lg:justify-start text-sm font-medium text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 size={16} className="text-primary" /> Free Eye Test
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 size={16} className="text-primary" /> 1 Year Warranty
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Hero Image */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-red-100/40 rounded-[2rem] -rotate-3 scale-95 opacity-60" />
                            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?w=700&q=80"
                                    alt="Happy person wearing stylish glasses"
                                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                            {/* Social Proof chip */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="absolute -bottom-5 -left-4 hidden lg:flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl border border-slate-100"
                            >
                                <div className="flex -space-x-2">
                                    {['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&q=80',
                                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&q=80',
                                        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&q=80'].map((src, i) => (
                                            <img key={i} src={src} alt="" className="h-9 w-9 rounded-full ring-2 ring-white object-cover" />
                                        ))}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">10k+ Happy Customers</p>
                                    <div className="flex gap-0.5 mt-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── WHY CHOOSE US ── */}
            <section className="section-padding bg-white">
                <div className="container-padding">
                    <motion.div className="mb-12 text-center" {...fadeUp} viewport={{ once: true }}>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Why Choose Us</span>
                        <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Experience Eye Care Excellence</h2>
                    </motion.div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map(({ icon, title, desc }, i) => (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group rounded-2xl border border-slate-100 bg-slate-50 p-8 transition-all hover:bg-white hover:shadow-xl hover:border-primary/20"
                            >
                                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                                    <span className="material-symbols-outlined text-3xl">{icon}</span>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURED CATEGORIES ── */}
            <section className="section-padding bg-slate-50">
                <div className="container-padding">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900">Featured Categories</h2>
                            <p className="mt-2 text-slate-600">Find the perfect match for your style and vision needs.</p>
                        </div>
                        <Link to="/products" className="group flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark">
                            View All Categories
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
                        {categories.map(({ label, sub, image, to }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <Link to={to} className="group relative flex aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                                    <img
                                        src={image}
                                        alt={label}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-4">
                                        <span className="block text-base font-bold text-white group-hover:text-red-200 transition-colors">{label}</span>
                                        <span className="text-xs text-white/75">{sub}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BESTSELLERS ── */}
            {featured.length > 0 && (
                <section className="section-padding bg-white">
                    <div className="container-padding">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900">Bestsellers</h2>
                                <p className="mt-2 text-slate-600">Our most loved products, top-rated by customers.</p>
                            </div>
                            <Link to="/products" className="group flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark">
                                View All <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
                            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* ── TESTIMONIALS ── */}
            <section className="section-padding bg-slate-50">
                <div className="container-padding">
                    <motion.div
                        className="mb-12 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-black text-slate-900">What Our Customers Say</h2>
                    </motion.div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {testimonials.map(({ name, rating, text, avatar }, i) => (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="rounded-2xl bg-white p-8 border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="mb-4 flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <Star key={j} size={16} className={j < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                                    ))}
                                </div>
                                <p className="mb-6 text-slate-600 italic leading-relaxed">{text}</p>
                                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                                    <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20" />
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{name}</p>
                                        <p className="text-xs text-primary font-medium">Verified Customer</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section className="bg-primary py-16">
                <div className="container-padding text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-black text-white mb-4">Ready for Crystal Clear Vision?</h2>
                        <p className="text-red-100 mb-8 max-w-xl mx-auto">Book your free eye test today and let our certified optometrists help you find the perfect eyewear.</p>
                        <button onClick={() => navigate('/contact')} className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-primary shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl">
                            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                            Book Free Eye Test Now
                        </button>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    )
}
