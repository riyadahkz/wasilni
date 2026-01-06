import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

const Navbar = () => {
    const { user, profile, signOut, isAuthenticated } = useAuth()

    const handleSignOut = async () => {
        await signOut()
        window.location.href = '/'
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span style={{ fontSize: '2rem' }}>🛡️</span>
                    <span>وصّلني - الإدارة</span>
                </Link>

                <ul className="navbar-menu">
                    {!isAuthenticated ? (
                        <li>
                            <Link to="/login" className="navbar-link">
                                تسجيل الدخول
                            </Link>
                        </li>
                    ) : (
                        <>
                            <li>
                                <Link to="/dashboard" className="navbar-link">
                                    لوحة التحكم
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/approvals" className="navbar-link">
                                    الموافقات
                                </Link>
                            </li>
                            <li>
                                <span className="navbar-link" style={{ cursor: 'default' }}>
                                    {profile?.name || 'المدير'}
                                </span>
                            </li>
                            <li>
                                <button onClick={handleSignOut} className="btn btn-outline btn-sm">
                                    تسجيل الخروج
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    )
}

export default Navbar
