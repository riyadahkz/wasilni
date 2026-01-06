import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// TODO: Replace with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'

if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase is not configured. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key')

export { isSupabaseConfigured }

// Helper function to get current user
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
        console.error('Error getting current user:', error)
        return null
    }
    return user
}

// Helper function to get user profile with role
export const getUserProfile = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error) {
        console.error('Error getting user profile:', error)
        return null
    }
    return data
}

// Helper function to sign out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error('Error signing out:', error)
        return false
    }
    return true
}
