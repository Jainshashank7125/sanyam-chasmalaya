import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Heart, ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { signOut } from '../services/auth'
import CartDrawer from './CartDrawer'

const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products?category=frames', label: 'Frames' },
    { to: '/products?category=lenses', label: 'Lenses' },
    { to: '/products?category=sunglasses', label: 'Sunglasses' },
    { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const navigate = useNavigate()
    const { user, profile, isAdmin } = useAuth()
    const { itemCount } = useCart()
    const { count: wishlistCount } = useWishlist()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
        setProfileOpen(false)
    }

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="container-padding flex h-20 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                            <span className="material-symbols-outlined filled text-[22px]">eyeglasses</span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-black tracking-tight text-primary">SANYAM</span>
                            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-600">CHASHMALAYA</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map(({ to, label }) => (
                            <NavLink key={to} to={to}
                                className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Wishlist */}
                        <Link to="/wishlist" aria-label="Wishlist" className="relative hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-red-50 hover:text-primary transition-colors">
                            <Heart size={20} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{wishlistCount}</span>
                            )}
                        </Link>

                        {/* Cart */}
                        <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-red-50 hover:text-primary transition-colors">
                            <ShoppingBag size={20} />
                            {itemCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{itemCount}</span>
                            )}
                        </button>

                        {/* User Profile Dropdown / Login */}
                        {user ? (
                            <div className="relative hidden sm:block">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 rounded-full border border-slate-200 pl-1 pr-3 py-1 hover:border-primary/30 transition-colors"
                                >
                                    <img
                                        src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || user.email || 'U')}&background=b91c1c&color=fff&size=32`}
                                        alt="Avatar"
                                        className="h-7 w-7 rounded-full object-cover"
                                    />
                                    <span className="text-xs font-medium text-slate-700 max-w-[80px] truncate">{profile?.full_name?.split(' ')[0] || 'Account'}</span>
                                </button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-slate-100">
                                                <p className="text-sm font-bold text-slate-900 truncate">{profile?.full_name || 'My Account'}</p>
                                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                            </div>
                                            {[
                                                { to: '/profile', icon: <User size={15} />, label: 'My Profile' },
                                                { to: '/profile?tab=orders', icon: <ShoppingBag size={15} />, label: 'My Orders' },
                                                ...(isAdmin ? [{ to: '/admin', icon: <LayoutDashboard size={15} />, label: 'Admin Panel' }] : []),
                                            ].map(({ to, icon, label }) => (
                                                <Link key={to} to={to} onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                                                    {icon} {label}
                                                </Link>
                                            ))}
                                            <button onClick={handleSignOut}
                                                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100">
                                                <LogOut size={15} /> Sign Out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {/* Close dropdown when clicking outside */}
                                {profileOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setProfileOpen(false)} />}
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link to="/login" className="btn-outline text-sm py-2.5 px-4">Sign In</Link>
                                <button onClick={() => navigate('/contact')} className="btn-primary text-sm py-2.5 px-4">
                                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                    Book Test
                                </button>
                            </div>
                        )}

                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                            className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
                        >
                            <nav className="container-padding flex flex-col py-4 gap-1">
                                {navLinks.map(({ to, label }) => (
                                    <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                                        className={({ isActive }) => `rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-50 hover:text-primary'}`}
                                    >
                                        {label}
                                    </NavLink>
                                ))}
                                <div className="border-t border-slate-100 mt-2 pt-3 flex flex-col gap-2">
                                    <button onClick={() => { setCartOpen(true); setMobileOpen(false) }} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                        <ShoppingBag size={17} /> Cart {itemCount > 0 && `(${itemCount})`}
                                    </button>
                                    {user ? (
                                        <>
                                            <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                                <User size={17} /> My Profile
                                            </Link>
                                            {isAdmin && (
                                                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-primary bg-primary/5">
                                                    <LayoutDashboard size={17} /> Admin Panel
                                                </Link>
                                            )}
                                            <button onClick={async () => { await handleSignOut(); setMobileOpen(false) }} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                                                <LogOut size={17} /> Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline text-sm">Sign In</Link>
                                            <button onClick={() => { navigate('/contact'); setMobileOpen(false) }} className="btn-primary text-sm">
                                                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                                Book Free Eye Test
                                            </button>
                                        </>
                                    )}
                                </div>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Cart Drawer */}
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    )
}
