import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import LoadingSpinner from '../shared/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'

const PendingCompanies = () => {
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        loadPendingCompanies()
    }, [])

    const loadPendingCompanies = async () => {
        try {
            const { data, error } = await supabase
                .from('companies')
                .select(`
                    *,
                    users (name, phone_number, email, created_at)
                `)
                .order('is_approved', { ascending: true })
                .order('created_at', { ascending: false })

            if (error) throw error
            setCompanies(data || [])
        } catch (error) {
            console.error('Error loading pending companies:', error)
            alert('حدث خطأ في تحميل الشركات المعلقة')
        } finally {
            setLoading(false)
        }
    }

    const { user: currentUser } = useAuth()

    const logAdminReview = async (targetId, action, note) => {
        try {
            await supabase
                .from('admin_reviews')
                .insert({
                    target_id: targetId,
                    target_type: 'company',
                    action,
                    note,
                    admin_id: currentUser.id
                })
        } catch (error) {
            console.error('Error logging review:', error)
        }
    }

    const handleApprove = async (company) => {
        const note = prompt(`إضافة ملاحظة للموافقة على "${company.name}" (اختياري):`)

        setProcessing(true)
        try {
            // Update company approval status
            const { error: companyError } = await supabase
                .from('companies')
                .update({
                    is_approved: true,
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
                .eq('company_id', company.company_id)

            if (companyError) throw companyError

            // Update user approval status
            const { error: userError } = await supabase
                .from('users')
                .update({
                    is_approved: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', company.user_id)

            if (userError) throw userError

            await logAdminReview(company.company_id, 'approve', note)

            // Send notification (optional)
            await supabase
                .from('notifications')
                .insert({
                    user_id: company.user_id,
                    title: 'تمت الموافقة على حسابك',
                    message: `مرحباً ${company.name}، تمت الموافقة على حساب شركتك. يمكنك الآن البدء بتقديم الخدمات.`,
                    type: 'approval'
                })

            alert('تمت الموافقة على الشركة بنجاح ✅')
            loadPendingCompanies() // Reload list
            setSelectedCompany(null)
        } catch (error) {
            console.error('Error approving company:', error)
            alert('حدث خطأ أثناء الموافقة على الشركة')
        } finally {
            setProcessing(false)
        }
    }

    const handleReject = async (company) => {
        const reason = prompt(`سبب رفض شركة "${company.name}" (اختياري):`)
        if (reason === null) return // User cancelled

        setProcessing(true)
        try {
            // Instead of deleting, we should probably mark as disapproved to keep history, or delete if it's junk.
            // Requirement: "Use same database rules for approval and rejection".
            // Let's set is_approved = false.
            const { error: companyError } = await supabase
                .from('companies')
                .update({ is_approved: false, is_active: false })
                .eq('company_id', company.company_id)

            if (companyError) throw companyError

            await logAdminReview(company.company_id, 'reject', reason)

            // Send rejection notification
            if (reason) {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: company.user_id,
                        title: 'تم رفض طلب التسجيل',
                        message: `عذراً ${company.name}، تم رفض طلب تسجيل شركتك. السبب: ${reason}`,
                        type: 'rejection'
                    })
            }

            alert('تم رفض الشركة ❌')
            loadPendingCompanies()
            setSelectedCompany(null)
        } catch (error) {
            console.error('Error rejecting company:', error)
            alert('حدث خطأ أثناء رفض الشركة')
        } finally {
            setProcessing(false)
        }
    }

    const handleSuspend = async (company) => {
        const reason = prompt('سبب التعليق:')

        setProcessing(true)
        try {
            const { error: companyError } = await supabase
                .from('companies')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('company_id', company.company_id)

            if (companyError) throw companyError

            await logAdminReview(company.company_id, 'comment', `تم التعليق: ${reason}`)

            // Sync with users table
            const { error: userError } = await supabase
                .from('users')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', company.user_id)

            if (userError) throw userError

            alert('تم تعليق حساب الشركة مؤقتاً ⏸️')
            loadPendingCompanies()
        } catch (error) {
            console.error('Error suspending company:', error)
            alert('حدث خطأ أثناء تعليق الحساب')
        } finally {
            setProcessing(false)
        }
    }

    const handleActivate = async (company) => {
        setProcessing(true)
        try {
            const { error: companyError } = await supabase
                .from('companies')
                .update({
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
                .eq('company_id', company.company_id)

            if (companyError) throw companyError

            // Sync with users table
            const { error: userError } = await supabase
                .from('users')
                .update({
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', company.user_id)

            if (userError) throw userError

            alert('تم إعادة تفعيل الشركة بنجاح ▶️')
            loadPendingCompanies()
        } catch (error) {
            console.error('Error activating company:', error)
            alert('حدث خطأ أثناء تفعيل الحساب')
        } finally {
            setProcessing(false)
        }
    }

    const handleRevoke = async (company) => {
        if (!confirm(`هل أنت متأكد من إلغاء الموافقة نهائياً على شركة "${company.name}"؟\nسيتحول الحساب إلى حالة "مرفوض/معلق للمراجعة".`)) {
            return
        }

        setProcessing(true)
        try {
            const { error: companyError } = await supabase
                .from('companies')
                .update({
                    is_approved: false,
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('company_id', company.company_id)

            if (companyError) throw companyError

            const { error: userError } = await supabase
                .from('users')
                .update({
                    is_approved: false,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', company.user_id)

            if (userError) throw userError

            alert('تم إلغاء الموافقة على الشركة ⚠️')
            loadPendingCompanies()
        } catch (error) {
            console.error('Error revoking company approval:', error)
            alert('حدث خطأ أثناء إلغاء الموافقة')
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return <LoadingSpinner message="جاري تحميل الشركات..." />
    }

    if (companies.length === 0) {
        return (
            <div className="card text-center" style={{ padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                <h3>لا توجد شركات مسجلة</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    جميع طلبات الشركات تمت مراجعتها
                </p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>جميع الشركات ({companies.length})</h2>
            </div>

            <div className="grid gap-md">
                {companies.map(company => (
                    <div key={company.company_id} className="card" style={{
                        borderRight: '4px solid var(--accent)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div className="flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ fontSize: '2rem' }}>🏢</div>
                                    <h3 style={{ margin: 0 }}>{company.name}</h3>
                                    {company.is_approved ? (
                                        company.is_active ? (
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
                                        <strong>النوع:</strong>{' '}
                                        <span className="badge" style={{
                                            background: company.type === 'tourism' ? 'var(--accent)' :
                                                company.type === 'transport' ? 'var(--primary)' : 'var(--success)'
                                        }}>
                                            {company.type === 'tourism' ? '🏖️ سياحة' :
                                                company.type === 'transport' ? '🚌 نقل' : '🌟 كلاهما'}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>رقم الهاتف:</strong> {company.users?.phone_number}
                                    </div>
                                    {company.users?.email && (
                                        <div>
                                            <strong>البريد:</strong> {company.users.email}
                                        </div>
                                    )}
                                    <div>
                                        <strong>تاريخ التسجيل:</strong>{' '}
                                        {new Date(company.created_at).toLocaleDateString('ar-IQ')}
                                    </div>
                                    <div>
                                        <strong>الحالة:</strong>{' '}
                                        <span style={{
                                            color: company.is_active ? 'var(--success)' : 'var(--text-secondary)',
                                            fontWeight: 'bold'
                                        }}>
                                            {company.is_active ? '🟢 نشط' : '⚫ غير نشط'}
                                        </span>
                                    </div>
                                </div>

                                {company.contact_info && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--card-bg)', borderRadius: '8px' }}>
                                        <strong>معلومات إضافية:</strong>
                                        <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                                            {JSON.stringify(company.contact_info, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-sm" style={{ flexDirection: 'column' }}>
                                {!company.is_approved ? (
                                    <>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleApprove(company)}
                                            disabled={processing}
                                            style={{ minWidth: '120px' }}
                                        >
                                            ✅ موافقة
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleReject(company)}
                                            disabled={processing}
                                            style={{ minWidth: '120px' }}
                                        >
                                            ❌ رفض
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {company.is_active ? (
                                            <button
                                                className="btn"
                                                onClick={() => handleSuspend(company)}
                                                disabled={processing}
                                                style={{ minWidth: '120px', background: 'var(--warning)', color: 'black' }}
                                            >
                                                ⏸️ تعليق
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleActivate(company)}
                                                disabled={processing}
                                                style={{ minWidth: '120px' }}
                                            >
                                                ▶️ تفعيل
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleRevoke(company)}
                                            disabled={processing}
                                            style={{ minWidth: '120px' }}
                                        >
                                            ⚠️ إلغاء الموافقة
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            onClick={async () => {
                                                const comment = prompt('أضف تعليق:');
                                                if (comment) {
                                                    await logAdminReview(company.company_id, 'comment', comment);
                                                    alert('تم الحفظ');
                                                }
                                            }}
                                            disabled={processing}
                                            style={{ minWidth: '120px' }}
                                        >
                                            📝 تعليق
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

export default PendingCompanies
