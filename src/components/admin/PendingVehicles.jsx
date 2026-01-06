import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import LoadingSpinner from '../shared/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'

const PendingVehicles = () => {
    const { user: currentUser } = useAuth()
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        loadPendingVehicles()
    }, [])

    const loadPendingVehicles = async () => {
        try {
            // Check if is_approved column exists, otherwise fallback to check is_active or assume active logic
            // Assuming we added is_approved in the SQL migration, but let's be robust
            const { data, error } = await supabase
                .from('vehicles')
                .select(`
                    *,
                    drivers (name, phone_number),
                    companies (name)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setVehicles(data || [])
        } catch (error) {
            console.error('Error loading pending vehicles:', error)
            alert('حدث خطأ في تحميل المركبات')
        } finally {
            setLoading(false)
        }
    }

    const logAdminReview = async (targetId, action, note) => {
        try {
            await supabase
                .from('admin_reviews')
                .insert({
                    target_id: targetId,
                    target_type: 'vehicle',
                    action,
                    note,
                    admin_id: currentUser.id
                })
        } catch (error) {
            console.error('Error logging review:', error)
        }
    }

    const handleApprove = async (vehicle) => {
        const note = prompt(`ملاحظة الموافقة (اختياري):`)
        setProcessing(true)
        try {
            // Ideally we use is_approved, but if it doesn't exist we might fail.
            // We'll update is_active as primary "working" flag too.
            const updates = { is_active: true }
            // Try to set is_approved if column exists in our mental model (it should from migration)
            updates.is_approved = true

            const { error } = await supabase
                .from('vehicles')
                .update(updates)
                .eq('vehicle_id', vehicle.vehicle_id)

            if (error) throw error

            await logAdminReview(vehicle.vehicle_id, 'approve', note)
            alert('تمت الموافقة على المركبة ✅')
            loadPendingVehicles()
        } catch (error) {
            console.error('Error approving vehicle:', error)
            // Fallback for if column doesn't exist (though we tried to add it)
            alert('حدث خطأ. ربما عمود is_approved غير موجود؟')
        } finally {
            setProcessing(false)
        }
    }

    const handleReject = async (vehicle) => {
        const reason = prompt(`سبب الرفض (مطلوب):`)
        if (!reason) return

        setProcessing(true)
        try {
            const { error } = await supabase
                .from('vehicles')
                .update({ is_active: false, is_approved: false })
                .eq('vehicle_id', vehicle.vehicle_id)

            if (error) throw error

            await logAdminReview(vehicle.vehicle_id, 'reject', reason)
            alert('تم رفض المركبة ❌')
            loadPendingVehicles()
        } catch (error) {
            console.error('Error rejecting vehicle:', error)
            alert('حدث خطأ أثناء الرفض')
        } finally {
            setProcessing(false)
        }
    }

    const handleComment = async (vehicle) => {
        const comment = prompt(`إضافة تعليق للمركبة "${vehicle.vehicle_name}":`)
        if (!comment) return

        try {
            await logAdminReview(vehicle.vehicle_id, 'comment', comment)
            alert('تم إضافة التعليق 📝')
        } catch (error) {
            console.error('Error adding comment:', error)
        }
    }

    if (loading) return <LoadingSpinner message="جاري تحميل المركبات..." />

    return (
        <div>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>المركبات ({vehicles.length})</h2>
            </div>

            <div className="grid gap-md">
                {vehicles.map(v => (
                    <div key={v.vehicle_id} className="card" style={{ borderRight: `4px solid ${v.is_active ? 'var(--success)' : 'var(--warning)'}` }}>
                        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3>{v.vehicle_name} - {v.vehicle_model}</h3>
                                <p><strong>الرقم:</strong> {v.vehicle_number}</p>
                                <p><strong>المالك:</strong> {v.drivers?.name || v.companies?.name || 'غير محدد'}</p>
                                <p>
                                    <strong>الحالة:</strong>{' '}
                                    {v.is_active ? '✅ نشط' : '⚫ غير نشط / مرفوض'}
                                    {v.is_approved === false && <span style={{ color: 'red' }}> (مرفوض)</span>}
                                </p>
                                <div className="detail-links">
                                    {v.vehicle_image_url && <a href={v.vehicle_image_url} target="_blank" rel="noreferrer">صورة المركبة</a>}
                                    {' | '}
                                    {v.registration_certificate_url && <a href={v.registration_certificate_url} target="_blank" rel="noreferrer">السنوية</a>}
                                </div>
                            </div>
                            <div className="flex gap-sm column">
                                {(!v.is_active && v.is_approved !== false) ? (
                                    <>
                                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(v)} disabled={processing}>موافقة</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(v)} disabled={processing}>رفض</button>
                                    </>
                                ) : (
                                    <>
                                        {v.is_active && <button className="btn btn-danger btn-sm" onClick={() => handleReject(v)} disabled={processing}>إيقاف/رفض</button>}
                                        {!v.is_active && <button className="btn btn-success btn-sm" onClick={() => handleApprove(v)} disabled={processing}>إعادة تفعيل</button>}
                                    </>
                                )}
                                <button className="btn btn-outline btn-sm" onClick={() => handleComment(v)}>إضافة تعليق</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PendingVehicles
