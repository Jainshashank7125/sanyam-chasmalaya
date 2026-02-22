import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ProtectedRoute } from './context/AuthContext'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppFAB from './components/WhatsAppFAB'

// Customer pages
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ContactPage from './pages/ContactPage'
import ProfilePage from './pages/ProfilePage'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Admin pages (lazy-loaded to keep customer bundle lean)
import { lazy, Suspense } from 'react'
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const DashboardPage = lazy(() => import('./admin/pages/DashboardPage'))
const AdminProductsPage = lazy(() => import('./admin/pages/ProductsPage'))
const ProductFormPage = lazy(() => import('./admin/pages/ProductFormPage'))
const AdminCategoriesPage = lazy(() => import('./admin/pages/CategoriesPage'))
const AdminOrdersPage = lazy(() => import('./admin/pages/OrdersPage'))
const AdminAppointmentsPage = lazy(() => import('./admin/pages/AppointmentsPage'))
const AdminSettingsPage = lazy(() => import('./admin/pages/SettingsPage'))

const AdminSuspense = ({ children }) => (
    <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    }>
        {children}
    </Suspense>
)

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <WishlistProvider>
                        <Routes>
                            {/* ── Admin routes (no global navbar/footer) ── */}
                            <Route path="/admin/*" element={
                                <ProtectedRoute adminOnly>
                                    <AdminSuspense>
                                        <AdminLayout>
                                            <Routes>
                                                <Route index element={<DashboardPage />} />
                                                <Route path="products" element={<AdminProductsPage />} />
                                                <Route path="products/new" element={<ProductFormPage />} />
                                                <Route path="products/:id/edit" element={<ProductFormPage />} />
                                                <Route path="categories" element={<AdminCategoriesPage />} />
                                                <Route path="orders" element={<AdminOrdersPage />} />
                                                <Route path="appointments" element={<AdminAppointmentsPage />} />
                                                <Route path="settings" element={<AdminSettingsPage />} />
                                            </Routes>
                                        </AdminLayout>
                                    </AdminSuspense>
                                </ProtectedRoute>
                            } />

                            {/* ── Customer routes (with Navbar + Footer) ── */}
                            <Route path="*" element={
                                <div className="flex min-h-screen flex-col">
                                    <Navbar />
                                    <main className="flex-1">
                                        <AnimatePresence mode="wait">
                                            <Routes>
                                                <Route path="/" element={<HomePage />} />
                                                <Route path="/products" element={<CatalogPage />} />
                                                <Route path="/products/:id" element={<ProductDetailPage />} />
                                                <Route path="/contact" element={<ContactPage />} />
                                                <Route path="/login" element={<LoginPage />} />
                                                <Route path="/register" element={<RegisterPage />} />
                                                <Route path="/profile" element={
                                                    <ProtectedRoute>
                                                        <ProfilePage />
                                                    </ProtectedRoute>
                                                } />
                                            </Routes>
                                        </AnimatePresence>
                                    </main>
                                    <Footer />
                                    <WhatsAppFAB />
                                </div>
                            } />
                        </Routes>
                    </WishlistProvider>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
