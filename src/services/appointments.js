import { supabase } from '../lib/supabase'

// ── Book appointment ──────────────────────────────────────────
export const bookAppointment = async (appointmentData) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
        .from('appointments')
        .insert({ ...appointmentData, user_id: user?.id || null })
        .select()
        .single()
    return { data, error }
}

// ── Fetch user's appointments ─────────────────────────────────
export const fetchUserAppointments = async (userId) => {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('preferred_date', { ascending: true })
    return { data, error }
}

// ── Cancel appointment ────────────────────────────────────────
export const cancelAppointment = async (appointmentId) => {
    const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .select()
        .single()
    return { data, error }
}
