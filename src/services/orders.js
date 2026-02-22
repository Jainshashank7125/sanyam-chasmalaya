import { supabase } from '../lib/supabase'

// ── Create order + items (atomic via RPC or sequential) ───────
export const createOrder = async ({ orderData, items }) => {
    // 1. Insert order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

    if (orderError) return { error: orderError }

    // 2. Insert all order items
    const orderItems = items.map(item => ({ ...item, order_id: order.id }))
    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

    if (itemsError) return { error: itemsError }

    return { data: order, error: null }
}

// ── Update order with payment info ────────────────────────────
export const updateOrderPayment = async (orderId, { razorpayOrderId, paymentId, paymentStatus }) => {
    const { data, error } = await supabase
        .from('orders')
        .update({
            razorpay_order_id: razorpayOrderId,
            payment_id: paymentId,
            payment_status: paymentStatus,
            status: paymentStatus === 'paid' ? 'confirmed' : 'pending',
        })
        .eq('id', orderId)
        .select()
        .single()
    return { data, error }
}

// ── Fetch user's orders ───────────────────────────────────────
export const fetchUserOrders = async (userId) => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items(*, product_images(url, is_primary))
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    return { data, error }
}

// ── Fetch single order ────────────────────────────────────────
export const fetchOrderById = async (orderId) => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items(*)
    `)
        .eq('id', orderId)
        .single()
    return { data, error }
}

// ── Subscribe to order status changes (Realtime) ──────────────
export const subscribeToOrder = (orderId, callback) => {
    return supabase
        .channel(`order-${orderId}`)
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
            callback
        )
        .subscribe()
}

// ── Validate promo code ───────────────────────────────────────
export const validatePromoCode = async (code, orderSubtotal) => {
    const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single()

    if (error || !data) return { valid: false, message: 'Invalid promo code' }
    if (data.expires_at && new Date(data.expires_at) < new Date()) return { valid: false, message: 'Promo code expired' }
    if (data.max_uses && data.used_count >= data.max_uses) return { valid: false, message: 'Promo code limit reached' }
    if (orderSubtotal < data.min_order_value) return { valid: false, message: `Minimum order ₹${data.min_order_value} required` }

    const discountAmount = data.discount_type === 'percent'
        ? Math.round(orderSubtotal * data.discount_value / 100)
        : data.discount_value

    return { valid: true, discountAmount, promo: data }
}
