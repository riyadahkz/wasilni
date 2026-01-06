import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured, getCurrentUser, getUserProfile, signOut as supabaseSignOut } from '../config/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // If Supabase is not configured, just set loading to false
        if (!isSupabaseConfigured) {
            console.log('📦 Running in demo mode - Supabase not configured')
            setLoading(false)
            return
        }

        // Check active session
        checkUser()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user)
                loadUserProfile(session.user.id)
            } else {
                setUser(null)
                setProfile(null)
            }
            setLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const checkUser = async () => {
        try {
            const currentUser = await getCurrentUser()
            if (currentUser) {
                setUser(currentUser)
                await loadUserProfile(currentUser.id)
            }
        } catch (err) {
            console.error('Error checking user:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const loadUserProfile = async (userId) => {
        try {
            const userProfile = await getUserProfile(userId)
            setProfile(userProfile)
        } catch (err) {
            console.error('Error loading profile:', err)
        }
    }

    // Sign up new user (customer, driver, or company)
    const signUp = async (email, password, name, phone, userType = 'customer', additionalData = {}) => {
        try {
            setError(null)

            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            })

            if (authError) throw authError

            const isAutoApproved = userType === 'customer'

            // Create user profile
            const { error: profileError } = await supabase
                .from('users')
                .insert([{
                    user_id: authData.user.id,
                    name,
                    phone_number: phone,
                    email,
                    user_type: userType,
                    is_approved: isAutoApproved
                }])

            if (profileError) throw profileError

            // Create provider record if needed
            if (userType === 'driver') {
                const { error: driverError } = await supabase
                    .from('drivers')
                    .insert([{
                        user_id: authData.user.id,
                        name,
                        phone_number: phone,
                        vehicle_type: additionalData.vehicle_type || 'sedan',
                        vehicle_plate: additionalData.vehicle_plate || '',
                        is_approved: false,
                        is_active: false
                    }])

                if (driverError) throw driverError
            } else if (userType === 'company') {
                const { error: companyError } = await supabase
                    .from('companies')
                    .insert([{
                        user_id: authData.user.id,
                        name,
                        phone_number: phone,
                        type: additionalData.company_type || 'transport',
                        contact_info: additionalData.contact_info || {},
                        is_approved: false,
                        is_active: false
                    }])

                if (companyError) throw companyError
            }

            return { success: true }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        }
    }

    // Sign in
    const signIn = async (email, password) => {
        try {
            setError(null)
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            setUser(data.user)
            await loadUserProfile(data.user.id)

            return { success: true }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        }
    }

    // Sign out
    const signOut = async () => {
        try {
            await supabaseSignOut()
            setUser(null)
            setProfile(null)
            return { success: true }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        }
    }

    // Register driver/company (phone only, pending approval)
    const registerProvider = async (phone, type, additionalData = {}) => {
        try {
            setError(null)

            if (type === 'driver') {
                const { error } = await supabase
                    .from('drivers')
                    .insert([{
                        phone_number: phone,
                        name: additionalData.name || '',
                        vehicle_type: additionalData.vehicle_type,
                        vehicle_plate: additionalData.vehicle_plate,
                        is_approved: false,
                        is_active: false
                    }])

                if (error) throw error
            } else if (type === 'company') {
                const { error } = await supabase
                    .from('companies')
                    .insert([{
                        phone_number: phone,
                        name: additionalData.name || '',
                        type: additionalData.company_type,
                        contact_info: additionalData.contact_info,
                        is_approved: false,
                        is_active: false
                    }])

                if (error) throw error
            }

            return {
                success: true,
                message: 'تم إرسال طلبك بنجاح. سيتم التواصل معك قريباً من قبل الإدارة.'
            }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        }
    }

    const value = {
        user,
        profile,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        registerProvider,
        isAuthenticated: !!user,
        isCustomer: profile?.user_type === 'customer',
        isDriver: profile?.user_type === 'driver',
        isCompany: profile?.user_type === 'company',
        isAdmin: profile?.user_type === 'admin',
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
