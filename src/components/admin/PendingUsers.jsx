import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import LoadingSpinner from '../shared/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'

const PendingUsers = () => {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        loadPendingUsers()
    }, [])

    const loadPendingUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('is_approved', { ascending: true })
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Error loading pending users:', error)
            alert('حدث خطأ في تحميل المستخدمين')
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
                    target_type: 'user',
                    action,
                    note,
                    admin_id: currentUser.id
                })
        } catch (error) {
            console.error('Error logging review:', error)
        }
    }

    const handleApprove = async (user) => {
        const note = prompt(`إضافة ملاحظة للموافقة على "${user.name}" (اختياري):`)

        setProcessing(true)
        try {
            const { error } = await supabase
                .from('users')
                .update({ is_approved: true, is_active: true })
                .eq('user_id', user.user_id)

            if (error) throw error

            await logAdminReview(user.user_id, 'approve', note)
            alert('تمت الموافقة على المستخدم بنجاح ✅')
            loadPendingUsers()
        } catch (error) {
            console.error('Error approving user:', error)
            alert('حدث خطأ أثناء الموافقة')
        } finally {
            setProcessing(false)
        }
    }

    const handleReject = async (user) => {
        const reason = prompt(`سبب رفض المستخدم "${user.name}" (مطلوب):`)
        if (!reason) return

        setProcessing(true)
        try {
            // We can decide to either delete or just mark as disapproved
            // Requirement says "Reject", usually means soft delete or status update
            // Here we'll update status to rejected (is_approved=false, is_active=false)

            const { error } = await supabase
                .from('users')
                .update({ is_approved: false, is_active: false })
                .eq('user_id', user.user_id)

            if (error) throw error

            await logAdminReview(user.user_id, 'reject', reason)
            alert('تم رفض المستخدم ❌')
            loadPendingUsers()
        } catch (error) {
            console.error('Error rejecting user:', error)
            alert('حدث خطأ أثناء الرفض')
        } finally {
            setProcessing(false)
        }
    }

    const handleComment = async (user) => {
        const comment = prompt(`إضافة تعليق للمستخدم "${user.name}":`)
        if (!comment) return

        try {
            await logAdminReview(user.user_id, 'comment', comment)
            alert('تم إضافة التعليق 📝')
        } catch (error) {
            console.error('Error adding comment:', error)
        }
    }

    if (loading) return <LoadingSpinner message="جاري تحميل المستخدمين..." />

    return (
        <div>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>المستخدمون ({users.length})</h2>
            </div>

            <div className="grid gap-md">
                {users.map(u => (
                    <div key={u.user_id} className="card" style={{ borderRight: `4px solid ${u.is_approved ? 'var(--success)' : 'var(--warning)'}` }}>
                        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3>{u.name}</h3>
                                <p><strong>النوع:</strong> {u.user_type}</p>
                                <p><strong>الهاتف:</strong> {u.phone_number}</p>
                                <p><strong>البريد:</strong> {u.email || '-'}</p>
                                <p>
                                    <strong>الحالة:</strong>{' '}
                                    {u.is_approved ? '✅ موافق عليه' : '⏳ بانتظار الموافقة'}
                                    {' | '}
                                    {u.is_active ? '🟢 نشط' : '⚫ غير نشط'}
                                </p>
                            </div>
                            <div className="flex gap-sm column">
                                {!u.is_approved ? (
                                    <>
                                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(u)} disabled={processing}>موافقة</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(u)} disabled={processing}>رفض</button>
                                    </>
                                ) : (
                                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(u)} disabled={processing}>إلغاء الموافقة</button>
                                )}
                                <button className="btn btn-outline btn-sm" onClick={() => handleComment(u)}>إضافة تعليق</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PendingUsers
