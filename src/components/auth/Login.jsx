import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const { signIn, error } = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [localError, setLocalError] = useState('')

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setLocalError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setLocalError('')

        const result = await signIn(formData.email, formData.password)

        if (result.success) {
            navigate('/dashboard')
        } else {
            setLocalError(result.error || 'حدث خطأ أثناء تسجيل الدخول')
        }

        setLoading(false)
    }

    return (
        <div className="page flex-center" style={{ background: 'linear-gradient(135deg, #1e73be 0%, #2ecc71 100%)' }}>
            <div className="card" style={{ maxWidth: '450px', width: '90%' }}>
                <div className="card-header text-center">
                    <h2 className="card-title">تسجيل الدخول</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        مرحباً بك في وصّلني
                    </p>
                </div>

                {(localError || error) && (
                    <div className="alert alert-error">
                        {localError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">البريد الإلكتروني</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="أدخل بريدك الإلكتروني"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">كلمة المرور</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="أدخل كلمة المرور"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block btn-lg"
                        disabled={loading}
                    >
                        {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                    </button>
                </form>

                <div className="text-center mt-3">
                    <p style={{ color: 'var(--text-secondary)' }}>
                        ليس لديك حساب؟{' '}
                        <a
                            href="/register"
                            style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}
                        >
                            سجل الآن
                        </a>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        هل أنت سائق أو شركة؟{' '}
                        <a
                            href="/driver-register"
                            style={{ color: 'var(--secondary-color)', fontWeight: 'bold', textDecoration: 'none' }}
                        >
                            سجل هنا
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
