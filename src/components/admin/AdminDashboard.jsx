import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import LoadingSpinner from '../shared/LoadingSpinner'

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDrivers: 0,
        totalCompanies: 0,
        activeRequests: 0,
        completedRequests: 0,
        totalRevenue: 0,
        pendingCompanies: 0,
        pendingDrivers: 0,
        pendingTrips: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            // Get users count
            const { count: usersCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })

            // Get drivers count
            const { count: driversCount } = await supabase
                .from('drivers')
                .select('*', { count: 'exact', head: true })

            // Get companies count
            const { count: companiesCount } = await supabase
                .from('companies')
                .select('*', { count: 'exact', head: true })

            // Get active requests
            const { count: activeCount } = await supabase
                .from('requests')
                .select('*', { count: 'exact', head: true })
                .in('status', ['pending', 'accepted'])

            // Get completed requests
            const { count: completedCount } = await supabase
                .from('requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'completed')

            // Get total revenue (simplified)
            const { data: payments } = await supabase
                .from('payments')
                .select('amount')
                .eq('payment_status', 'completed')

            const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

            // Get pending approvals
            const { count: pendingCompaniesCount } = await supabase
                .from('companies')
                .select('*', { count: 'exact', head: true })
                .eq('is_approved', false)

            const { count: pendingDriversCount } = await supabase
                .from('drivers')
                .select('*', { count: 'exact', head: true })
                .eq('is_approved', false)

            const { count: pendingTripsCount } = await supabase
                .from('trips')
                .select('*', { count: 'exact', head: true })
                .in('status', ['pending', 'active'])

            setStats({
                totalUsers: usersCount || 0,
                totalDrivers: driversCount || 0,
                totalCompanies: companiesCount || 0,
                activeRequests: activeCount || 0,
                completedRequests: completedCount || 0,
                totalRevenue,
                pendingCompanies: pendingCompaniesCount || 0,
                pendingDrivers: pendingDriversCount || 0,
                pendingTrips: pendingTripsCount || 0
            })
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const totalPending = stats.pendingCompanies + stats.pendingDrivers + stats.pendingTrips

    if (loading) {
        return <LoadingSpinner message="جاري تحميل لوحة الإدارة..." />
    }

    return (
        <div className="page">
            <div className="container">
                <div className="card" style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: 'white' }}>
                    <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>
                        لوحة تحكم المدير 👨‍💼
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                        إدارة شاملة لجميع عمليات التطبيق
                    </p>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-3 gap-lg mt-4">
                    <div className="card text-center" style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)' }}>
                        <div className="icon icon-xl" style={{ color: 'white', margin: '0 auto' }}>👥</div>
                        <h2 style={{ color: 'white', marginTop: '0.5rem' }}>{stats.totalUsers}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.1rem' }}>
                            إجمالي المستخدمين
                        </p>
                    </div>

                    <div className="card text-center" style={{ background: 'linear-gradient(135deg, #9b59b6, #8e44ad)' }}>
                        <div className="icon icon-xl" style={{ color: 'white', margin: '0 auto' }}>🚗</div>
                        <h2 style={{ color: 'white', marginTop: '0.5rem' }}>{stats.totalDrivers}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.1rem' }}>
                            السائقون
                        </p>
                    </div>

                    <div className="card text-center" style={{ background: 'linear-gradient(135deg, #e67e22, #d35400)' }}>
                        <div className="icon icon-xl" style={{ color: 'white', margin: '0 auto' }}>🏢</div>
                        <h2 style={{ color: 'white', marginTop: '0.5rem' }}>{stats.totalCompanies}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.1rem' }}>
                            الشركات
                        </p>
                    </div>

                    <div className="card text-center" style={{ background: 'linear-gradient(135deg, #f39c12, #e67e22)' }}>
                        <div className="icon icon-xl" style={{ color: 'white', margin: '0 auto' }}>📋</div>
                        <h2 style={{ color: 'white', marginTop: '0.5rem' }}>{stats.activeRequests}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.1rem' }}>
                            طلبات نشطة
                        </p>
                    </div>

                    <div className="card text-center" style={{ background: 'linear-gradient(135deg, #27ae60, #229954)' }}>
                        <div className="icon icon-xl" style={{ color: 'white', margin: '0 auto' }}>✅</div>
                        <h2 style={{ color: 'white', marginTop: '0.5rem' }}>{stats.completedRequests}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.1rem' }}>
                            رحلات مكتملة
                        </p>
                    </div>

                    <div className="card text-center" style={{ background: 'linear-gradient(135deg, #16a085, #138d75)' }}>
                        <div className="icon icon-xl" style={{ color: 'white', margin: '0 auto' }}>💰</div>
                        <h2 style={{ color: 'white', marginTop: '0.5rem' }}>{stats.totalRevenue.toLocaleString()}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.1rem' }}>
                            الإيرادات (دينار)
                        </p>
                    </div>

                    <div className="card text-center" style={{ background: 'linear-gradient(135deg, #f39c12, #d68910)' }}>
                        <div className="icon icon-xl" style={{ color: 'white', margin: '0 auto' }}>⏳</div>
                        <h2 style={{ color: 'white', marginTop: '0.5rem' }}>{stats.pendingCompanies}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.1rem' }}>
                            شركات معلقة
                        </p>
                    </div>

                    <div className="card text-center" style={{ background: 'linear-gradient(135deg, #e67e22, #ca6510)' }}>
                        <div className="icon icon-xl" style={{ color: 'white', margin: '0 auto' }}>⏳</div>
                        <h2 style={{ color: 'white', marginTop: '0.5rem' }}>{stats.pendingDrivers}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.1rem' }}>
                            سائقون معلقون
                        </p>
                    </div>

                    <div className="card text-center" style={{ background: 'linear-gradient(135deg, #d35400, #a04000)' }}>
                        <div className="icon icon-xl" style={{ color: 'white', margin: '0 auto' }}>⏳</div>
                        <h2 style={{ color: 'white', marginTop: '0.5rem' }}>{stats.pendingTrips}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.1rem' }}>
                            رحلات معلقة
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4">
                    <h2>إدارة سريعة</h2>
                    <div className="grid grid-2 gap-lg">
                        <Link to="/admin/approvals" className="card service-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="service-card-icon">📋</div>
                            <h3 className="service-card-title">إدارة الموافقات</h3>
                            <p className="service-card-description">مراجعة الشركات والسائقين والرحلات</p>
                        </Link>

                        <Link to="/admin/approvals?tab=drivers" className="card service-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="service-card-icon">👥</div>
                            <h3 className="service-card-title">إدارة المستخدمين</h3>
                            <p className="service-card-description">عرض وإدارة الحسابات المسجلة</p>
                        </Link>

                        <Link to="/admin/approvals?tab=requests" className="card service-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="service-card-icon">🗒️</div>
                            <h3 className="service-card-title">إدارة الطلبات</h3>
                            <p className="service-card-description">متابعة وتعيين الطلبات</p>
                        </Link>

                        <div className="card service-card" style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                            <div className="service-card-icon">📊</div>
                            <h3 className="service-card-title">التحليلات والتقارير</h3>
                            <p className="service-card-description">قريباً...</p>
                        </div>
                    </div>
                </div>

                {/* Quick Action Banner */}
                <Link to="/admin/approvals" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card mt-4" style={{
                        background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }}>
                        <div>
                            <h3 style={{ margin: 0, color: 'white' }}>إدارة الموافقات 📋</h3>
                            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>يوجد {totalPending} عنصر بحاجة للمراجعة</p>
                        </div>
                        <div className="badge" style={{ background: 'white', color: '#c0392b', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {totalPending}
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default AdminDashboard
