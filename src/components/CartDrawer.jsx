import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer({ open, onClose }) {
    const { items, removeItem, updateQty, subtotal, clearCart } = useCart()
    const navigate = useNavigate()
    const deliveryFree = subtotal >= 1499
    const deliveryCharge = deliveryFree ? 0 : 99
    const total = subtotal + deliveryCharge

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    />
                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={20} className="text-primary" />
                                <h2 className="font-bold text-slate-900">Cart ({items.length})</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {items.length > 0 && (
                                    <button onClick={clearCart} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                                        Clear all
                                    </button>
                                )}
                                <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto py-4 px-5">
                            {items.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-slate-400 gap-3">
                                    <ShoppingBag size={48} className="opacity-30" />
                                    <p className="font-medium">Your cart is empty</p>
                                    <button onClick={() => { navigate('/products'); onClose() }} className="btn-primary text-sm">
                                        Browse Products
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {items.map(item => (
                                        <div key={item.key} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-20 w-20 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                                            />
                                            <div className="flex flex-1 flex-col justify-between min-w-0">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                                                    {item.lensType !== 'zeroPower' && (
                                                        <p className="text-xs text-slate-500 capitalize">{item.lensType.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                    )}
                                                    {item.addons?.length > 0 && (
                                                        <p className="text-xs text-slate-400">{item.addons.map(a => a.label).join(', ')}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-primary text-sm">
                                                        ₹{((item.price + item.lensTypePrice + item.addonsPrice) * item.qty).toLocaleString()}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => item.qty === 1 ? removeItem(item.key) : updateQty(item.key, item.qty - 1)}
                                                            className={`flex h-7 w-7 items-center justify-center rounded-full border text-slate-600 transition-colors ${item.qty === 1 ? 'hover:border-red-200 hover:text-red-500' : 'hover:border-primary hover:text-primary'}`}>
                                                            {item.qty === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                                                        </button>
                                                        <span className="w-5 text-center text-sm font-bold text-slate-800">{item.qty}</span>
                                                        <button onClick={() => updateQty(item.key, item.qty + 1)}
                                                            className="flex h-7 w-7 items-center justify-center rounded-full border text-slate-600 hover:border-primary hover:text-primary transition-colors">
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                                <div className="flex flex-col gap-1.5 mb-4 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Delivery</span>
                                        <span className={deliveryFree ? 'text-emerald-600 font-medium' : ''}>
                                            {deliveryFree ? 'FREE' : `₹${deliveryCharge}`}
                                        </span>
                                    </div>
                                    {!deliveryFree && (
                                        <p className="text-xs text-emerald-600">Add ₹{(1499 - subtotal).toLocaleString()} more for free delivery!</p>
                                    )}
                                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2 mt-1">
                                        <span>Total</span>
                                        <span className="text-primary text-base">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { navigate('/checkout'); onClose() }}
                                    className="btn-primary w-full py-3.5"
                                >
                                    Proceed to Checkout →
                                </button>
                                <button onClick={onClose} className="mt-2 w-full text-center text-xs text-slate-500 hover:text-primary">
                                    Continue Shopping
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
