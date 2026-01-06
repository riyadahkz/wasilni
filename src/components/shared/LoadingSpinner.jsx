import React from 'react'

const LoadingSpinner = ({ message = 'جاري التحميل...' }) => {
    return (
        <div className="flex-center" style={{ padding: '3rem' }}>
            <div className="flex-column flex-center gap-md">
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                    {message}
                </p>
            </div>
        </div>
    )
}

export default LoadingSpinner
