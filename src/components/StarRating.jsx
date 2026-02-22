import { Star } from 'lucide-react'

export default function StarRating({ rating, reviews, size = 14, showCount = true }) {
    const fullStars = Math.floor(rating)
    const hasHalf = rating - fullStars >= 0.5

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        size={size}
                        className={
                            i < fullStars
                                ? 'fill-amber-400 text-amber-400'
                                : i === fullStars && hasHalf
                                    ? 'fill-amber-200 text-amber-400'
                                    : 'text-slate-300'
                        }
                    />
                ))}
            </div>
            {showCount && (
                <span className="text-xs text-slate-500">
                    {rating.toFixed(1)} ({reviews.toLocaleString()})
                </span>
            )}
        </div>
    )
}
