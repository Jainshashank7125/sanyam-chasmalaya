import { supabase } from '../lib/supabase'

// ── Fetch products (with filters) ────────────────────────────
export const fetchProducts = async ({
    category,    // slug: 'frames' | 'lenses' | 'sunglasses'
    gender,      // array of gender values
    shapes,      // array of frame_shape values
    maxPrice,
    search,      // full-text search query
    sortBy = 'created_at',
    sortDir = 'desc',
    page = 1,
    perPage = 12,
} = {}) => {
    let query = supabase
        .from('products')
        .select(`
      *,
      categories!inner(slug, name),
      product_images(url, sort_order, is_primary),
      product_colors(hex_code, label)
    `, { count: 'exact' })
        .eq('is_active', true)

    if (category) {
        query = query.eq('categories.slug', category)
    }
    if (gender?.length) {
        query = query.in('gender', [...gender, 'unisex'])
    }
    if (shapes?.length) {
        query = query.in('frame_shape', shapes)
    }
    if (maxPrice) {
        query = query.lte('price', maxPrice)
    }
    if (search) {
        query = query.textSearch('search_vector', search, { type: 'websearch' })
    }

    // Sorting
    if (sortBy === 'price-asc') query = query.order('price', { ascending: true })
    else if (sortBy === 'price-desc') query = query.order('price', { ascending: false })
    else if (sortBy === 'rating') query = query.order('avg_rating', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    // Pagination
    const from = (page - 1) * perPage
    query = query.range(from, from + perPage - 1)

    const { data, error, count } = await query
    return { data, error, count }
}

// ── Fetch single product by ID ────────────────────────────────
export const fetchProductById = async (id) => {
    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      categories(slug, name),
      product_images(url, sort_order, is_primary),
      product_colors(hex_code, label)
    `)
        .eq('id', id)
        .eq('is_active', true)
        .single()
    return { data, error }
}

// ── Fetch products by badge (for homepage bestsellers) ────────
export const fetchFeaturedProducts = async (badge = 'bestseller', limit = 4) => {
    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      categories(slug, name),
      product_images(url, sort_order, is_primary),
      product_colors(hex_code, label)
    `)
        .eq('is_active', true)
        .eq('badge', badge)
        .order('avg_rating', { ascending: false })
        .limit(limit)
    return { data, error }
}

// ── Full-text search (for search bar) ─────────────────────────
export const searchProducts = async (query, limit = 8) => {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, price, product_images(url, is_primary), categories(name)')
        .eq('is_active', true)
        .textSearch('search_vector', query, { type: 'websearch' })
        .limit(limit)
    return { data, error }
}

// ── Fetch categories ──────────────────────────────────────────
export const fetchCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
    return { data, error }
}
