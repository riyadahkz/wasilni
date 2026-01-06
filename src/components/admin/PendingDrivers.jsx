import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import LoadingSpinner from '../shared/LoadingSpinner'

const PendingDrivers = () => {
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        loadPendingDrivers()
    }, [])

    const loadPendingDrivers = async () => {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .select(`
                    *,
                    users (name, phone_number, email, created_at)
                `)
                .order('is_approved', { ascending: true })
                .order('created_at', { ascending: false })

            if (error) throw error
            setDrivers(data || [])
        } catch (error) {
            console.error('Error loading pending drivers:', error)
            alert('حدث خطأ في تحميل السائقين المعلقين')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (driver) => {
        if (!confirm(`هل أنت متأكد من الموافقة على السائق "${driver.name}"؟`)) {
            return
        }

        if (!driver.user_id) {
            alert('خطأ: لا يوجد معرف مستخدم (User ID) مرتبط بهذا السائق. قد يكون السجل تالفاً.')
            console.error('Driver record missing user_id:', driver)
            return
        }

        setProcessing(true)
        try {
            console.log('Attempting to approve driver:', driver.driver_id, 'for user:', driver.user_id)

            // Update driver approval status
            const { error: driverError } = await supabase
                .from('drivers')
                .update({
                    is_approved: true,
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
                .eq('driver_id', driver.driver_id)

            if (driverError) {
                console.error('Error updating drivers table:', driverError)
                throw new Error(`Drivers table error: ${driverError.message}`)
            }

            console.log('Driver table updated. Updating users table:', driver.user_id)

            // Update user approval status
            const { error: userError } = await supabase
                .from('users')
                .update({
                    is_approved: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', driver.user_id)

            if (userError) {
                console.error('Error updating users table:', userError)
                throw new Error(`Users table error: ${userError.message}`)
            }

            // Send notification
            await supabase
                .from('notifications')
                .insert({
                    user_id: driver.user_id,
                    title: 'تمت الموافقة على حسابك',
                    message: `مرحباً ${driver.name}، تمت الموافقة على حسابك كسائق. يمكنك الآن البدء بقبول الطلبات.`,
                    type: 'approval'
                })

            alert('تمت الموافقة على السائق بنجاح ✅')
            loadPendingDrivers()
        } catch (error) {
            console.error('Error approving driver details:', error)
            alert(`حدث خطأ أثناء الموافقة على السائق: ${error.message}`)
        } finally {
            setProcessing(false)
        }
    }

    const handleReject = async (driver) => {
        const reason = prompt(`سبب رفض السائق "${driver.name}" (اختياري):`)
        if (reason === null) return

        setProcessing(true)
        try {
            // Delete driver record
            const { error: driverError } = await supabase
                .from('drivers')
                .delete()
                .eq('driver_id', driver.driver_id)

            if (driverError) throw driverError

            // Send rejection notification
            if (reason) {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: driver.user_id,
                        title: 'تم رفض طلب التسجيل',
                        message: `عذراً ${driver.name}، تم رفض طلب تسجيلك كسائق. السبب: ${reason}`,
                        type: 'rejection'
                    })
            }

            alert('تم رفض السائق ❌')
            loadPendingDrivers()
        } catch (error) {
            console.error('Error rejecting driver:', error)
            alert('حدث خطأ أثناء رفض السائق')
        } finally {
            setProcessing(false)
        }
    }

    const handleSuspend = async (driver) => {
        if (!confirm(`هل أنت متأكد من تعليق حساب السائق "${driver.name}" مؤقتاً؟`)) {
            return
        }

        setProcessing(true)
        try {
            const { error: driverError } = await supabase
                .from('drivers')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('driver_id', driver.driver_id)

            if (driverError) throw driverError

            // Sync with users table
            const { error: userError } = await supabase
                .from('users')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', driver.user_id)

            if (userError) throw userError

            alert('تم تعليق حساب السائق مؤقتاً ⏸️')
            loadPendingDrivers()
        } catch (error) {
            console.error('Error suspending driver:', error)
            alert('حدث خطأ أثناء تعليق الحساب')
        } finally {
            setProcessing(false)
        }
    }

    const handleActivate = async (driver) => {
        setProcessing(true)
        try {
            const { error: driverError } = await supabase
                .from('drivers')
                .update({
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
                .eq('driver_id', driver.driver_id)

            if (driverError) throw driverError

            // Sync with users table
            const { error: userError } = await supabase
                .from('users')
                .update({
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', driver.user_id)

            if (userError) throw userError

            alert('تم إعادة تفعيل السائق بنجاح ▶️')
            loadPendingDrivers()
        } catch (error) {
            console.error('Error activating driver:', error)
            alert('حدث خطأ أثناء تفعيل الحساب')
        } finally {
            setProcessing(false)
        }
    }

    const handleRevoke = async (driver) => {
        if (!confirm(`هل أنت متأكد من إلغاء الموافقة نهائياً على السائق "${driver.name}"؟\nسيتحول الحساب إلى حالة "مرفوض/معلق للمراجعة".`)) {
            return
        }

        setProcessing(true)
        try {
            const { error: driverError } = await supabase
                .from('drivers')
                .update({
                    is_approved: false,
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('driver_id', driver.driver_id)

            if (driverError) throw driverError

            const { error: userError } = await supabase
                .from('users')
                .update({
                    is_approved: false,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', driver.user_id)

            if (userError) throw userError

            alert('تم إلغاء الموافقة على السائق ⚠️')
            loadPendingDrivers()
        } catch (error) {
            console.error('Error revoking driver approval:', error)
            alert('حدث خطأ أثناء إلغاء الموافقة')
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return <LoadingSpinner message="جاري تحميل السائقين..." />
    }

    if (drivers.length === 0) {
        return (
            <div className="card text-center" style={{ padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                <h3>لا يوجد سائقون مسجلون</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    جميع طلبات السائقين تمت مراجعتها
                </p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>جميع السائقين ({drivers.length})</h2>
            </div>

            <div className="grid gap-md">
                {drivers.map(driver => (
                    <div key={driver.driver_id} className="card" style={{
                        borderRight: '4px solid var(--primary)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div className="flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ fontSize: '2rem' }}>🚗</div>
                                    <h3 style={{ margin: 0 }}>{driver.name}</h3>
                                    {driver.is_approved ? (
                                        driver.is_active ? (
                                            <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>
                                                ✅ نشط
                                            </span>
                                        ) : (
                                            <span className="badge" style={{ background: 'var(--text-secondary)', color: 'white' }}>
                                                ⏸️ معلق مؤقتاً
                                            </span>
                                        )
                                    ) : (
                                        <span className="badge" style={{ background: 'var(--warning)', color: 'white' }}>
                                            ⏳ بانتظار الموافقة
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-2 gap-sm" style={{ marginTop: '1rem' }}>
                                    <div>
                                        <strong>رقم الهاتف:</strong> {driver.phone_number}
                                    </div>
                                    {driver.users?.email && (
                                        <div>
                                            <strong>البريد:</strong> {driver.users.email}
                                        </div>
                                    )}
                                    <div>
                                        <strong>نوع المركبة:</strong>{' '}
                                        <span className="badge" style={{ background: 'var(--primary)' }}>
                                            {driver.vehicle_type || 'غير محدد'}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>رقم اللوحة:</strong>{' '}
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: 'var(--primary)',
                                            fontFamily: 'monospace',
                                            fontSize: '1.1rem'
                                        }}>
                                            {driver.vehicle_plate || 'غير محدد'}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>تاريخ التسجيل:</strong>{' '}
                                        {new Date(driver.created_at).toLocaleDateString('ar-IQ')}
                                    </div>
                                    <div>
                                        <strong>الحالة:</strong>{' '}
                                        <span style={{
                                            color: driver.is_active ? 'var(--success)' : 'var(--text-secondary)',
                                            fontWeight: 'bold'
                                        }}>
                                            {driver.is_active ? '🟢 نشط' : '⚫ غير نشط'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-sm" style={{ flexDirection: 'column' }}>
                                {!driver.is_approved ? (
                                    <>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleApprove(driver)}
                                            disabled={processing}
                                            style={{ minWidth: '120px' }}
                                        >
                                            ✅ موافقة
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleReject(driver)}
                                            disabled={processing}
                                            style={{ minWidth: '120px' }}
                                        >
                                            ❌ رفض
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {driver.is_active ? (
                                            <button
                                                className="btn"
                                                onClick={() => handleSuspend(driver)}
                                                disabled={processing}
                                                style={{ minWidth: '120px', background: 'var(--warning)', color: 'black' }}
                                            >
                                                ⏸️ تعليق
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleActivate(driver)}
                                                disabled={processing}
                                                style={{ minWidth: '120px' }}
                                            >
                                                ▶️ تفعيل
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleRevoke(driver)}
                                            disabled={processing}
                                            style={{ minWidth: '120px' }}
                                        >
                                            ⚠️ إلغاء الموافقة
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PendingDrivers
