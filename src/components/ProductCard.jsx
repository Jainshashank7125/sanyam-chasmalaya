import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import Badge from './Badge'
import StarRating from './StarRating'

export default function ProductCard({ product }) {
    const [wishlisted, setWishlisted] = useState(false)
    const [imgIdx, setImgIdx] = useState(0)

    const hasDiscount = product.discount > 0

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="card group relative flex flex-col overflow-hidden"
        >
            {/* Image */}
            <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                    src={product.images[imgIdx]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Badge */}
                {product.badge && (
                    <div className="absolute top-3 left-3">
                        <Badge type={product.badge} />
                    </div>
                )}
                {/* Wishlist */}
                <button
                    onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted) }}
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-red-50"
                    aria-label="Add to wishlist"
                >
                    <Heart
                        size={16}
                        className={wishlisted ? 'fill-primary text-primary' : 'text-slate-400'}
                    />
                </button>
            </Link>

            {/* Color dots */}
            <div className="flex gap-1.5 px-4 pt-3">
                {product.colors.map((c) => (
                    <button
                        key={c}
                        onClick={() => { }}
                        style={{ background: c }}
                        className="h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 hover:ring-primary transition-all"
                        aria-label={`Color ${c}`}
                    />
                ))}
            </div>

            {/* Info */}
            <Link to={`/products/${product.id}`} className="flex flex-col gap-1.5 px-4 pb-4 pt-2">
                <h3 className="font-semibold text-slate-900 text-sm leading-snug hover:text-primary transition-colors">
                    {product.name}
                </h3>
                <p className="text-xs text-slate-500">{product.material} · {product.gender}</p>

                <StarRating rating={product.rating} reviews={product.reviews} size={12} />

                <div className="flex items-center gap-2 mt-1">
                    <span className="text-primary font-bold text-base">₹{product.price.toLocaleString()}</span>
                    {hasDiscount && (
                        <>
                            <span className="text-slate-400 text-xs line-through">₹{product.mrp.toLocaleString()}</span>
                            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                {product.discount}% OFF
                            </span>
                        </>
                    )}
                </div>
            </Link>
        </motion.div>
    )
}
