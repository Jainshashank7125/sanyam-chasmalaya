import { supabase } from '../lib/supabase'

// ────────────────────────────────────────────────────────────
// PRODUCTS CRUD
// ────────────────────────────────────────────────────────────
export const adminFetchProducts = async ({ search, categoryId, isActive, page = 1, perPage = 20 } = {}) => {
    let query = supabase
        .from('products')
        .select('*, categories(name), product_images(url, is_primary)', { count: 'exact' })

    if (search) query = query.ilike('name', `%${search}%`)
    if (categoryId) query = query.eq('category_id', categoryId)
    if (isActive !== undefined) query = query.eq('is_active', isActive)

    const from = (page - 1) * perPage
    query = query.range(from, from + perPage - 1).order('created_at', { ascending: false })

    const { data, error, count } = await query
    return { data, error, count }
}

export const adminCreateProduct = async (productData) => {
    const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()
    return { data, error }
}

export const adminUpdateProduct = async (id, productData) => {
    const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single()
    return { data, error }
}

export const adminDeleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    return { error }
}

export const adminToggleProductActive = async (id, isActive) =>
    adminUpdateProduct(id, { is_active: isActive })

// ── Product Images ────────────────────────────────────────────
export const uploadProductImage = async (productId, file, isPrimary = false) => {
    const ext = file.name.split('.').pop()
    const path = `${productId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file)
    if (uploadError) return { error: uploadError }

    const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

    const { data, error } = await supabase
        .from('product_images')
        .insert({ product_id: productId, url: publicUrl, is_primary: isPrimary, sort_order: Date.now() })
        .select()
        .single()

    return { data, error, publicUrl }
}

export const deleteProductImage = async (imageId, storagePath) => {
    await supabase.storage.from('product-images').remove([storagePath])
    const { error } = await supabase.from('product_images').delete().eq('id', imageId)
    return { error }
}

// ── Categories ────────────────────────────────────────────────
export const adminFetchCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')
    return { data, error }
}

export const adminCreateCategory = async (catData) => {
    const { data, error } = await supabase.from('categories').insert(catData).select().single()
    return { data, error }
}

export const adminUpdateCategory = async (id, catData) => {
    const { data, error } = await supabase.from('categories').update(catData).eq('id', id).select().single()
    return { data, error }
}

export const adminDeleteCategory = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    return { error }
}

// ────────────────────────────────────────────────────────────
// ORDERS
// ────────────────────────────────────────────────────────────
export const adminFetchOrders = async ({ status, search, page = 1, perPage = 20 } = {}) => {
    let query = supabase
        .from('orders')
        .select('*, order_items(id)', { count: 'exact' })
        .order('created_at', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)
    if (search) query = query.or(`shipping_name.ilike.%${search}%,shipping_phone.ilike.%${search}%`)

    const from = (page - 1) * perPage
    query = query.range(from, from + perPage - 1)

    const { data, error, count } = await query
    return { data, error, count }
}

export const adminFetchOrderById = async (id) => {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single()
    return { data, error }
}

export const adminUpdateOrderStatus = async (id, status) => {
    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
    return { data, error }
}

// ────────────────────────────────────────────────────────────
// APPOINTMENTS
// ────────────────────────────────────────────────────────────
export const adminFetchAppointments = async ({ status, date, page = 1, perPage = 20 } = {}) => {
    let query = supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .order('preferred_date', { ascending: true })

    if (status && status !== 'all') query = query.eq('status', status)
    if (date) query = query.eq('preferred_date', date)

    const from = (page - 1) * perPage
    query = query.range(from, from + perPage - 1)

    const { data, error, count } = await query
    return { data, error, count }
}

export const adminUpdateAppointment = async (id, updates) => {
    const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    return { data, error }
}

// ────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ────────────────────────────────────────────────────────────
export const fetchDashboardStats = async () => {
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    const [
        { data: todayOrders },
        { data: monthOrders },
        { data: pendingOrders, count: pendingCount },
        { data: todayAppts, count: todayApptCount },
        { count: lowStockCount },
    ] = await Promise.all([
        supabase.from('orders').select('total').gte('created_at', today),
        supabase.from('orders').select('total').gte('created_at', monthStart).eq('payment_status', 'paid'),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('appointments').select('*', { count: 'exact' }).eq('preferred_date', today),
        supabase.from('products').select('id', { count: 'exact' }).lt('stock_qty', 5).eq('is_active', true),
    ])

    return {
        todayRevenue: todayOrders?.reduce((s, o) => s + Number(o.total), 0) || 0,
        monthRevenue: monthOrders?.reduce((s, o) => s + Number(o.total), 0) || 0,
        pendingOrders: pendingCount || 0,
        todayAppointments: todayApptCount || 0,
        lowStockProducts: lowStockCount || 0,
    }
}

// ────────────────────────────────────────────────────────────
// SETTINGS
// ────────────────────────────────────────────────────────────
export const fetchSettings = async (key) => {
    const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', key)
        .single()
    return { data: data?.value, error }
}

export const updateSettings = async (key, value) => {
    const { data, error } = await supabase
        .from('store_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })
        .select()
        .single()
    return { data, error }
}

// ── Promo codes ───────────────────────────────────────────────
export const adminFetchPromoCodes = async () => {
    const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false })
    return { data, error }
}

export const adminCreatePromoCode = async (promoData) => {
    const { data, error } = await supabase.from('promo_codes').insert(promoData).select().single()
    return { data, error }
}

export const adminDeletePromoCode = async (id) => {
    const { error } = await supabase.from('promo_codes').delete().eq('id', id)
    return { error }
}

// ── Check admin access ─────────────────────────────────────────
export const checkIsAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await supabase.from('admin_users').select('role').eq('id', user.id).single()
    return !!data
}
