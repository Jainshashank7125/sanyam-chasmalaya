import { createContext, useContext, useEffect, useState } from 'react'

const WishlistContext = createContext(null)
const WISHLIST_KEY = 'sc_wishlist'

export function WishlistProvider({ children }) {
    const [ids, setIds] = useState(() => {
        try { return new Set(JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []) }
        catch { return new Set() }
    })

    useEffect(() => {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify([...ids]))
    }, [ids])

    const toggle = (id) => {
        setIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const isWishlisted = (id) => ids.has(id)

    return (
        <WishlistContext.Provider value={{ ids, toggle, isWishlisted, count: ids.size }}>
            {children}
        </WishlistContext.Provider>
    )
}

export const useWishlist = () => {
    const ctx = useContext(WishlistContext)
    if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
    return ctx
}
