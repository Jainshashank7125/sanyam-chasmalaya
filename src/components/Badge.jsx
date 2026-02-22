const badgeConfig = {
    new: { label: 'New Arrival', className: 'bg-emerald-500 text-white' },
    bestseller: { label: 'Bestseller', className: 'bg-orange-500 text-white' },
    limited: { label: 'Limited Edition', className: 'bg-purple-600 text-white' },
    sale: { label: 'Sale', className: 'bg-primary text-white' },
}

export default function Badge({ type, className = '' }) {
    if (!type || !badgeConfig[type]) return null
    const { label, className: badgeClass } = badgeConfig[type]
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeClass} ${className}`}>
            {label}
        </span>
    )
}
