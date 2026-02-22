import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'sc_cart'

const loadCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] }
}

export function CartProvider({ children }) {
    const [items, setItems] = useState(loadCart)

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(items))
    }, [items])

    const addItem = useCallback((product, config = {}) => {
        setItems(prev => {
            const key = `${product.id}-${config.lensType || 'zeroPower'}`
            const existing = prev.find(i => i.key === key)
            if (existing) {
                return prev.map(i => i.key === key ? { ...i, qty: i.qty + (config.qty || 1) } : i)
            }
            return [...prev, {
                key,
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.product_images?.find(i => i.is_primary)?.url || product.product_images?.[0]?.url || product.images?.[0],
                lensType: config.lensType || 'zeroPower',
                lensTypePrice: config.lensTypePrice || 0,
                addons: config.addons || [],
                addonsPrice: config.addonsPrice || 0,
                qty: config.qty || 1,
            }]
        })
    }, [])

    const removeItem = useCallback((key) => {
        setItems(prev => prev.filter(i => i.key !== key))
    }, [])

    const updateQty = useCallback((key, qty) => {
        if (qty < 1) return
        setItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i))
    }, [])

    const clearCart = useCallback(() => setItems([]), [])

    const itemCount = items.reduce((s, i) => s + i.qty, 0)
    const subtotal = items.reduce((s, i) => s + (i.price + i.lensTypePrice + i.addonsPrice) * i.qty, 0)

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, itemCount, subtotal }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used within CartProvider')
    return ctx
}
