import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, MapPin, Phone, Clock } from 'lucide-react'

const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'All Products' },
    { to: '/products?category=frames', label: 'Frames' },
    { to: '/products?category=sunglasses', label: 'Sunglasses' },
    { to: '/contact', label: 'Contact Us' },
]

const services = [
    'Eye Testing',
    'Lens Fitting',
    'Frame Repair',
    'Contact Lens Consultation',
    'Pediatric Eye Care',
]

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 border-t-4 border-primary">
            <div className="container-padding pt-16 pb-8">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <Link to="/" className="flex items-center gap-2.5 text-white">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                                <span className="material-symbols-outlined filled text-[20px]">eyeglasses</span>
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-lg font-black">SANYAM</span>
                                <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400">CHASHMALAYA</span>
                            </div>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Providing the best vision care solutions with advanced technology and premium eyewear brands. Your vision is our mission.
                        </p>
                        <div className="flex gap-3 mt-1">
                            <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-primary hover:text-white">
                                <Facebook size={16} />
                            </a>
                            <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-primary hover:text-white">
                                <Instagram size={16} />
                            </a>
                            <a href="#" aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-primary hover:text-white">
                                <Twitter size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-5 text-base font-bold text-white border-b border-slate-700 pb-2 inline-block">Quick Links</h3>
                        <ul className="flex flex-col gap-2.5 text-sm">
                            {quickLinks.map(({ to, label }) => (
                                <li key={to}>
                                    <Link to={to} className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="mb-5 text-base font-bold text-white border-b border-slate-700 pb-2 inline-block">Services</h3>
                        <ul className="flex flex-col gap-2.5 text-sm">
                            {services.map((s) => (
                                <li key={s} className="hover:text-primary transition-colors cursor-pointer hover:translate-x-1 inline-block transform duration-200">{s}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Visit Us */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-base font-bold text-white border-b border-slate-700 pb-2 inline-block w-fit">Visit Us</h3>
                        <div className="flex items-start gap-3 text-sm">
                            <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                            <span>Shop No. 12, Main Market Road,<br />City Center, New Delhi, India – 110054</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone size={16} className="flex-shrink-0 text-primary" />
                            <a href="tel:+919340016492" className="hover:text-primary transition-colors">+91 98765 43210</a>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Clock size={16} className="flex-shrink-0 text-primary" />
                            <span>10 AM – 9 PM (Daily)</span>
                        </div>
                        {/* Static map thumbnail */}
                        <div className="mt-1 h-28 w-full overflow-hidden rounded-xl bg-slate-800 border border-slate-700 cursor-pointer group relative">
                            <img
                                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=60"
                                alt="Store location map"
                                className="h-full w-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-500"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-lg">
                                    Open in Maps
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-2">
                    <p>© {new Date().getFullYear()} Sanyam Chashmalaya. All rights reserved.</p>
                    <p>Designed with <span className="text-primary">♥</span> for better vision.</p>
                </div>
            </div>
        </footer>
    )
}
