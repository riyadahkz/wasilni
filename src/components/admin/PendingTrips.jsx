import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import LoadingSpinner from '../shared/LoadingSpinner'

const PendingTrips = () => {
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        loadPendingTrips()
    }, [])

    const loadPendingTrips = async () => {
        try {
            // Load trips that are pending approval (status = 'pending')
            // Or we can show all trips with 'active' status for review
            const { data, error } = await supabase
                .from('trips')
                .select(`
                    *
                `)
                .in('status', ['pending', 'active'])
                .order('created_at', { ascending: false })

            if (error) throw error

            // Get provider details for each trip
            const tripsWithProviders = await Promise.all(
                (data || []).map(async (trip) => {
                    let providerName = 'غير معروف'

                    if (trip.provider_type === 'driver') {
                        const { data: driverData } = await supabase
                            .from('drivers')
                            .select('name')
                            .eq('driver_id', trip.provider_id)
                            .single()
                        providerName = driverData?.name || 'غير معروف'
                    } else if (trip.provider_type === 'company') {
                        const { data: companyData } = await supabase
                            .from('companies')
                            .select('name')
                            .eq('company_id', trip.provider_id)
                            .single()
                        providerName = companyData?.name || 'غير معروف'
                    }

                    return { ...trip, providerName }
                })
            )

            setTrips(tripsWithProviders)
        } catch (error) {
            console.error('Error loading pending trips:', error)
            alert('حدث خطأ في تحميل الرحلات المعلقة')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (trip) => {
        if (!confirm(`هل أنت متأكد من الموافقة على الرحلة من "${trip.origin}" إلى "${trip.destination}"؟`)) {
            return
        }

        setProcessing(true)
        try {
            const { error } = await supabase
                .from('trips')
                .update({
                    status: 'active',
                    updated_at: new Date().toISOString()
                })
                .eq('trip_id', trip.trip_id)

            if (error) throw error

            // Get provider user_id for notification
            let userId = null
            if (trip.provider_type === 'driver') {
                const { data } = await supabase
                    .from('drivers')
                    .select('user_id')
                    .eq('driver_id', trip.provider_id)
                    .single()
                userId = data?.user_id
            } else if (trip.provider_type === 'company') {
                const { data } = await supabase
                    .from('companies')
                    .select('user_id')
                    .eq('company_id', trip.provider_id)
                    .single()
                userId = data?.user_id
            }

            // Send notification
            if (userId) {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: userId,
                        title: 'تمت الموافقة على الرحلة',
                        message: `تمت الموافقة على رحلتك من ${trip.origin} إلى ${trip.destination}. الرحلة الآن متاحة للحجز.`,
                        type: 'approval',
                        related_id: trip.trip_id
                    })
            }

            alert('تمت الموافقة على الرحلة بنجاح ✅')
            loadPendingTrips()
        } catch (error) {
            console.error('Error approving trip:', error)
            alert('حدث خطأ أثناء الموافقة على الرحلة')
        } finally {
            setProcessing(false)
        }
    }

    const handleReject = async (trip) => {
        const reason = prompt(`سبب رفض الرحلة (اختياري):`)
        if (reason === null) return

        setProcessing(true)
        try {
            // Update trip status to cancelled
            const { error: tripError } = await supabase
                .from('trips')
                .update({
                    status: 'cancelled',
                    updated_at: new Date().toISOString()
                })
                .eq('trip_id', trip.trip_id)

            if (tripError) throw tripError

            // Get provider user_id for notification
            let userId = null
            if (trip.provider_type === 'driver') {
                const { data } = await supabase
                    .from('drivers')
                    .select('user_id')
                    .eq('driver_id', trip.provider_id)
                    .single()
                userId = data?.user_id
            } else if (trip.provider_type === 'company') {
                const { data } = await supabase
                    .from('companies')
                    .select('user_id')
                    .eq('company_id', trip.provider_id)
                    .single()
                userId = data?.user_id
            }

            // Send rejection notification
            if (userId && reason) {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: userId,
                        title: 'تم رفض الرحلة',
                        message: `تم رفض رحلتك من ${trip.origin} إلى ${trip.destination}. السبب: ${reason}`,
                        type: 'rejection',
                        related_id: trip.trip_id
                    })
            }

            alert('تم رفض الرحلة ❌')
            loadPendingTrips()
        } catch (error) {
            console.error('Error rejecting trip:', error)
            alert('حدث خطأ أثناء رفض الرحلة')
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return <LoadingSpinner message="جاري تحميل الرحلات المعلقة..." />
    }

    if (trips.length === 0) {
        return (
            <div className="card text-center" style={{ padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h3>لا توجد رحلات معلقة</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    جميع الرحلات تمت مراجعتها
                </p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>الرحلات المعلقة ({trips.length})</h2>
            </div>

            <div className="grid gap-md">
                {trips.map(trip => (
                    <div key={trip.trip_id} className="card" style={{
                        borderRight: '4px solid var(--success)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div className="flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ fontSize: '2rem' }}>🚌</div>
                                    <h3 style={{ margin: 0 }}>
                                        {trip.origin} ← {trip.destination}
                                    </h3>
                                </div>

                                <div className="grid grid-2 gap-sm" style={{ marginTop: '1rem' }}>
                                    <div>
                                        <strong>مزود الخدمة:</strong>{' '}
                                        <span className="badge" style={{
                                            background: trip.provider_type === 'driver' ? 'var(--primary)' : 'var(--accent)'
                                        }}>
                                            {trip.provider_type === 'driver' ? '🚗 سائق' : '🏢 شركة'} - {trip.providerName}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>وقت المغادرة:</strong>{' '}
                                        {new Date(trip.departure_time).toLocaleString('ar-IQ', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </div>
                                    <div>
                                        <strong>السعر:</strong>{' '}
                                        <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {trip.price.toLocaleString()} دينار
                                        </span>
                                    </div>
                                    <div>
                                        <strong>المقاعد:</strong>{' '}
                                        {trip.available_seats} / {trip.total_seats} متاح
                                    </div>
                                    {trip.vehicle_type && (
                                        <div>
                                            <strong>نوع المركبة:</strong> {trip.vehicle_type}
                                        </div>
                                    )}
                                    <div>
                                        <strong>الحالة:</strong>{' '}
                                        <span className="badge" style={{
                                            background: trip.status === 'active' ? 'var(--success)' : 'var(--warning)'
                                        }}>
                                            {trip.status === 'active' ? 'نشط' : 'معلق'}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>تاريخ الإنشاء:</strong>{' '}
                                        {new Date(trip.created_at).toLocaleDateString('ar-IQ')}
                                    </div>
                                </div>

                                {trip.amenities && trip.amenities.length > 0 && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <strong>المرافق:</strong>
                                        <div className="flex gap-sm" style={{ marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                            {trip.amenities.map((amenity, idx) => (
                                                <span key={idx} className="badge" style={{ background: 'var(--card-bg)' }}>
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-sm" style={{ flexDirection: 'column' }}>
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleApprove(trip)}
                                    disabled={processing || trip.status === 'active'}
                                    style={{ minWidth: '100px' }}
                                >
                                    {trip.status === 'active' ? '✅ موافق' : '✅ موافقة'}
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleReject(trip)}
                                    disabled={processing}
                                    style={{ minWidth: '100px' }}
                                >
                                    ❌ رفض
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PendingTrips
