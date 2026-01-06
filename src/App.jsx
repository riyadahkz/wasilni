import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationManager } from './components/shared/Notification'
import Navbar from './components/shared/Navbar'
import LoadingSpinner from './components/shared/LoadingSpinner'

// Auth Components
import Login from './components/auth/Login'

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard'
import ApprovalManagement from './components/admin/ApprovalManagement'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, profile, loading } = useAuth()

    if (loading) {
        return <LoadingSpinner message="جاري التحميل..." />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Strict Admin Check
    if (profile?.user_type !== 'admin') {
        return (
            <div className="container mt-4">
                <div className="alert alert-error">
                    هذا النظام مخصص للمسؤولين فقط.
                </div>
            </div>
        )
    }

    return children
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <div className="app">
                    <Navbar />
                    <NotificationManager />

                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />

                        {/* Admin Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/approvals"
                            element={
                                <ProtectedRoute>
                                    <ApprovalManagement />
                                </ProtectedRoute>
                            }
                        />

                        {/* Fallback - Redirect to Login */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
