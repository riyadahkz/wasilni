import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import LoadingSpinner from '../shared/LoadingSpinner'

const PendingRequests = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        loadPendingRequests()
    }, [])

    const loadPendingRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    users!inner(name, phone_number, email)
                `)
                .order('status', { ascending: true })
                .order('created_at', { ascending: false })

            if (error) throw error

            // جلب معلومات السائق أو الشركة المخصصة لكl طلب
            const requestsWithProviders = await Promise.all(
                (data || []).map(async (request) => {
                    let providerInfo = null

                    if (request.assigned_to && request.assigned_type) {
                        if (request.assigned_type === 'driver') {
                            const { data: driverData } = await supabase
                                .from('drivers')
                                .select('name, phone_number, vehicle_type, vehicle_plate, rating')
                                .eq('driver_id', request.assigned_to)
                                .single()
                            providerInfo = { ...driverData, type: 'driver' }
                        } else if (request.assigned_type === 'company') {
                            const { data: companyData } = await supabase
                                .from('companies')
                                .select(`
                                    name,
                                    type,
                                    rating,
                                    users (phone_number)
                                `)
                                .eq('company_id', request.assigned_to)
                                .single()

                            // Flatten structure for easier usage
                            const phone_number = companyData?.users?.phone_number
                            providerInfo = {
                                ...companyData,
                                phone_number,
                                type: 'company'
                            }
                        }
                    }

                    return { ...request, providerInfo }
                })
            )

            setRequests(requestsWithProviders)
        } catch (error) {
            console.error('Error loading requests:', error)
            alert('حدث خطأ في تحميل الطلبات')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (request) => {
        if (!confirm(`هل أنت متأكد من الموافقة على طلب "${request.service_type}" من ${request.origin} إلى ${request.destination}؟`)) {
            return
        }

        setProcessing(true)
        try {
            const { error } = await supabase
                .from('requests')
                .update({
                    status: 'accepted',
                    updated_at: new Date().toISOString()
                })
                .eq('request_id', request.request_id)

            if (error) throw error

            // إرسال إشعار للعميل
            await supabase
                .from('notifications')
                .insert({
                    user_id: request.user_id,
                    title: 'تمت الموافقة على طلبك',
                    message: `تمت الموافقة على طلب الرحلة من ${request.origin} إلى ${request.destination}`,
                    type: 'request_approved',
                    related_id: request.request_id
                })

            alert('تمت الموافقة على الطلب بنجاح ✅')
            loadPendingRequests()
        } catch (error) {
            console.error('Error approving request:', error)
            alert('حدث خطأ أثناء الموافقة على الطلب')
        } finally {
            setProcessing(false)
        }
    }

    const handleReject = async (request) => {
        const reason = prompt(`سبب رفض الطلب (اختياري):`)
        if (reason === null) return

        setProcessing(true)
        try {
            const { error } = await supabase
                .from('requests')
                .update({
                    status: 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('request_id', request.request_id)

            if (error) throw error

            // إرسال إشعار بالرفض
            if (reason) {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: request.user_id,
                        title: 'تم رفض طلبك',
                        message: `تم رفض طلب الرحلة من ${request.origin} إلى ${request.destination}. السبب: ${reason}`,
                        type: 'request_rejected',
                        related_id: request.request_id
                    })
            }

            alert('تم رفض الطلب ❌')
            loadPendingRequests()
        } catch (error) {
            console.error('Error rejecting request:', error)
            alert('حدث خطأ أثناء رفض الطلب')
        } finally {
            setProcessing(false)
        }
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { text: '⏳ معلق', color: 'var(--warning)' },
            'accepted': { text: '✅ مقبول', color: 'var(--success)' },
            'rejected': { text: '❌ مرفوض', color: 'var(--error)' },
            'completed': { text: '✔️ مكتمل', color: 'var(--info)' },
            'cancelled': { text: '🚫 ملغي', color: 'var(--text-secondary)' }
        }
        const statusInfo = statusMap[status] || { text: status, color: 'var(--text-secondary)' }
        return (
            <span className="badge" style={{ background: statusInfo.color, color: 'white' }}>
                {statusInfo.text}
            </span>
        )
    }

    const getServiceTypeBadge = (type) => {
        const typeMap = {
            'trip': '🚌 رحلة',
            'tourism': '✈️ سياحة',
            'private': '🚗 خاص',
            'fixed_line': '🚌 خط ثابت',
            'taxi': '🚖 تاكسي'
        }
        return typeMap[type] || type
    }

    if (loading) {
        return <LoadingSpinner message="جاري تحميل الطلبات..." />
    }

    if (requests.length === 0) {
        return (
            <div className="card text-center" style={{ padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                <h3>لا توجد طلبات</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    لا توجد طلبات رحلات في النظام
                </p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>جميع طلبات الرحلات ({requests.length})</h2>
            </div>

            <div className="grid gap-md">
                {requests.map(request => (
                    <div key={request.request_id} className="card" style={{
                        borderRight: `4px solid ${request.status === 'pending' ? 'var(--warning)' :
                            request.status === 'accepted' ? 'var(--success)' :
                                request.status === 'rejected' ? 'var(--error)' : 'var(--info)'}`,
                        transition: 'all 0.3s ease'
                    }}>
                        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                {/* معلومات الطلب */}
                                <div className="flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                    <h3 style={{ margin: 0 }}>
                                        {request.origin} ← {request.destination}
                                    </h3>
                                    {getStatusBadge(request.status)}
                                    <span className="badge" style={{ background: 'var(--primary)' }}>
                                        {getServiceTypeBadge(request.service_type)}
                                    </span>
                                </div>

                                {/* معلومات العميل */}
                                <div style={{
                                    background: 'var(--background-primary)',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--border-radius-sm)',
                                    marginTop: '1rem'
                                }}>
                                    <strong>👤 معلومات العميل:</strong>
                                    <div className="grid grid-2 gap-sm" style={{ marginTop: '0.5rem' }}>
                                        <div><strong>الاسم:</strong> {request.users?.name}</div>
                                        <div><strong>الهاتف:</strong> {request.users?.phone_number}</div>
                                        {request.users?.email && (
                                            <div><strong>البريد:</strong> {request.users.email}</div>
                                        )}
                                    </div>
                                </div>

                                {/* تفاصيل الطلب */}
                                <div className="grid grid-2 gap-sm" style={{ marginTop: '1rem' }}>
                                    {request.scheduled_time && (
                                        <div>
                                            <strong>🕐 الوقت المجدول:</strong>
                                            <div>{new Date(request.scheduled_time).toLocaleString('ar-IQ')}</div>
                                        </div>
                                    )}
                                    {request.passenger_count && (
                                        <div>
                                            <strong>👥 عدد الركاب:</strong> {request.passenger_count}
                                        </div>
                                    )}
                                    {request.price && (
                                        <div>
                                            <strong>💰 السعر:</strong>{' '}
                                            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                                                {request.price.toLocaleString()} دينار
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <strong>📅 تاريخ الطلب:</strong>{' '}
                                        {new Date(request.created_at).toLocaleDateString('ar-IQ')}
                                    </div>
                                </div>

                                {/* معلومات مزود الخدمة المخصص */}
                                {request.providerInfo && (
                                    <div style={{
                                        background: 'var(--card-bg)',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--border-radius-sm)',
                                        marginTop: '1rem',
                                        border: '2px solid var(--primary)'
                                    }}>
                                        <strong>
                                            {request.providerInfo.type === 'driver' ? '🚗 السائق المخصص:' : '🏢 الشركة المخصصة:'}
                                        </strong>
                                        <div className="grid grid-2 gap-sm" style={{ marginTop: '0.5rem' }}>
                                            <div><strong>الاسم:</strong> {request.providerInfo.name}</div>
                                            <div><strong>الهاتف:</strong> {request.providerInfo.phone_number}</div>
                                            {request.providerInfo.type === 'driver' && (
                                                <>
                                                    <div><strong>نوع المركبة:</strong> {request.providerInfo.vehicle_type}</div>
                                                    <div><strong>رقم اللوحة:</strong> {request.providerInfo.vehicle_plate}</div>
                                                </>
                                            )}
                                            {request.providerInfo.rating > 0 && (
                                                <div>
                                                    <strong>التقييم:</strong>{' '}
                                                    <span style={{ color: 'var(--accent)' }}>
                                                        ⭐ {request.providerInfo.rating.toFixed(1)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ملاحظات */}
                                {request.notes && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <strong>📝 ملاحظات:</strong>
                                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>
                                            {request.notes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* أزرار الإجراءات */}
                            <div className="flex gap-sm" style={{ flexDirection: 'column' }}>
                                {request.status === 'pending' ? (
                                    <>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleApprove(request)}
                                            disabled={processing}
                                            style={{ minWidth: '120px' }}
                                        >
                                            ✅ قبول
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleReject(request)}
                                            disabled={processing}
                                            style={{ minWidth: '120px' }}
                                        >
                                            ❌ رفض
                                        </button>
                                    </>
                                ) : (
                                    <div style={{
                                        padding: '0.5rem',
                                        background: 'var(--background-primary)',
                                        borderRadius: 'var(--border-radius-sm)',
                                        textAlign: 'center',
                                        minWidth: '120px'
                                    }}>
                                        {getStatusBadge(request.status)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PendingRequests
