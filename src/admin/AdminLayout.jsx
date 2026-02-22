import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../services/auth'
import {
    LayoutDashboard, Package, Grid3X3, ShoppingCart,
    Calendar, Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: Grid3X3 },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { user, profile } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const Sidebar = ({ isMobile = false }) => (
        <nav className={`flex h-full flex-col bg-slate-900 text-slate-300 transition-all ${collapsed && !isMobile ? 'w-16' : 'w-64'}`}>
            {/* Branding */}
            <div className="flex h-16 items-center border-b border-slate-800 px-4 gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                    <span className="material-symbols-outlined filled text-[20px]">eyeglasses</span>
                </div>
                {(!collapsed || isMobile) && (
                    <div>
                        <span className="text-sm font-black text-white">SANYAM</span>
                        <span className="block text-[9px] font-bold tracking-widest text-slate-400">ADMIN PANEL</span>
                    </div>
                )}
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto py-4">
                {navItems.map(({ to, label, icon: Icon, exact }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={exact}
                        onClick={() => isMobile && setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? 'bg-primary/20 text-primary border-r-2 border-primary'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                        title={collapsed && !isMobile ? label : undefined}
                    >
                        <Icon size={18} className="flex-shrink-0" />
                        {(!collapsed || isMobile) && <span>{label}</span>}
                    </NavLink>
                ))}
            </div>

            {/* User footer */}
            <div className="border-t border-slate-800 p-4">
                <div className={`flex items-center gap-3 mb-3 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
                    <img
                        src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'A')}&background=b91c1c&color=fff&size=36`}
                        alt="Admin"
                        className="h-9 w-9 rounded-full flex-shrink-0 object-cover"
                    />
                    {(!collapsed || isMobile) && (
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{profile?.full_name || 'Admin'}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Link to="/" className={`flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors ${collapsed && !isMobile ? 'justify-center w-full' : ''}`} title="View Site">
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        {(!collapsed || isMobile) && 'View Site'}
                    </Link>
                    {(!collapsed || isMobile) && (
                        <button onClick={handleSignOut} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors">
                            <LogOut size={13} /> Sign Out
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex h-full flex-shrink-0">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
                    <div className="fixed left-0 top-0 z-50 h-full lg:hidden">
                        <Sidebar isMobile />
                    </div>
                </>
            )}

            {/* Main */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800">
                            <Menu size={22} />
                        </button>
                        <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex text-slate-400 hover:text-slate-700 transition-colors">
                            <ChevronRight size={18} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
                        </button>
                    </div>
                    <span className="text-sm font-medium text-slate-500">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
