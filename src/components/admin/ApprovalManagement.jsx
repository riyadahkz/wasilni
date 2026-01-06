import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PendingCompanies from './PendingCompanies'
import PendingDrivers from './PendingDrivers'
import PendingTrips from './PendingTrips'
import PendingRequests from './PendingRequests'
import PendingUsers from './PendingUsers'
import PendingVehicles from './PendingVehicles'

const ApprovalManagement = () => {
    const [searchParams] = useSearchParams()
    const [activeTab, setActiveTab] = useState('companies')

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && ['companies', 'drivers', 'trips', 'requests', 'users', 'vehicles'].includes(tab)) {
            setActiveTab(tab)
        }
    }, [searchParams])

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                    color: 'white',
                    marginBottom: '2rem'
                }}>
                    <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>
                        إدارة الموافقات 📋
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                        راجع ووافق على طلبات الشركات والسائقين والرحلات الجديدة
                    </p>
                </div>

                {/* Tabs */}
                <div className="card" style={{ padding: '0', marginBottom: '2rem', overflow: 'hidden' }}>
                    <div className="flex" style={{
                        borderBottom: '2px solid var(--border-color)',
                        background: 'var(--card-bg)',
                        overflowX: 'auto',
                        whiteSpace: 'nowrap'
                    }}>
                        {['companies', 'drivers', 'users', 'vehicles', 'trips', 'requests'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={activeTab === tab ? 'tab-active' : 'tab'}
                                style={{
                                    flex: 1,
                                    minWidth: '120px',
                                    padding: '1rem 1.5rem',
                                    border: 'none',
                                    background: activeTab === tab ?
                                        (tab === 'companies' ? 'var(--accent)' :
                                            tab === 'drivers' ? 'var(--primary)' :
                                                tab === 'users' ? '#9b59b6' :
                                                    tab === 'vehicles' ? '#34495e' :
                                                        tab === 'trips' ? 'var(--success)' : '#e67e22')
                                        : 'transparent',
                                    color: activeTab === tab ? 'white' : 'var(--text-primary)',
                                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontSize: '1rem',
                                    borderBottom: activeTab === tab ? `3px solid ${tab === 'companies' ? 'var(--accent)' :
                                        tab === 'drivers' ? 'var(--primary)' :
                                            tab === 'users' ? '#9b59b6' :
                                                tab === 'vehicles' ? '#34495e' :
                                                    tab === 'trips' ? 'var(--success)' : '#e67e22'
                                        }` : 'none'
                                }}
                            >
                                {tab === 'companies' && '🏢 الشركات'}
                                {tab === 'drivers' && '🚗 السائقون'}
                                {tab === 'users' && '👥 المستخدمون'}
                                {tab === 'vehicles' && '🚙 المركبات'}
                                {tab === 'trips' && '🚌 الرحلات'}
                                {tab === 'requests' && '📋 الطلبات'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'companies' && <PendingCompanies />}
                    {activeTab === 'drivers' && <PendingDrivers />}
                    {activeTab === 'users' && <PendingUsers />}
                    {activeTab === 'vehicles' && <PendingVehicles />}
                    {activeTab === 'trips' && <PendingTrips />}
                    {activeTab === 'requests' && <PendingRequests />}
                </div>
            </div>
        </div>
    )
}

export default ApprovalManagement
