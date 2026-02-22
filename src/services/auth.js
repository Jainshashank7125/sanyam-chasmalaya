import { supabase } from '../lib/supabase'

// ── Auth ──────────────────────────────────────────────────────

export const signUp = async ({ email, password, fullName, phone }) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName, phone },
        },
    })
    return { data, error }
}

export const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
}

export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    return { data, error }
}

export const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
}

export const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    return { data, error }
}

export const updateProfile = async (userId, updates) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
    return { data, error }
}

// ── Avatar upload ──────────────────────────────────────────────
export const uploadAvatar = async (userId, file) => {
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
    if (uploadError) return { error: uploadError }

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

    const { data, error } = await updateProfile(userId, { avatar_url: publicUrl })
    return { data, error, publicUrl }
}
