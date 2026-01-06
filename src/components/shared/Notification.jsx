import React, { useEffect, useState } from 'react'

const Notification = ({ type = 'info', message, duration = 5000, onClose }) => {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false)
            setTimeout(onClose, 300) // Wait for fade out animation
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const alertClass = `alert alert-${type}`

    return (
        <>
            {visible && (
                <div
                    className={alertClass}
                    style={{
                        position: 'fixed',
                        top: '100px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                        minWidth: '300px',
                        maxWidth: '600px',
                        animation: 'slideUp 0.3s ease'
                    }}
                >
                    <div className="flex-between">
                        <span>{message}</span>
                        <button
                            onClick={() => {
                                setVisible(false)
                                setTimeout(onClose, 300)
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                marginRight: '1rem'
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

// Notification Manager Component
export const NotificationManager = () => {
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        window.showNotification = (type, message, duration) => {
            const id = Date.now()
            setNotifications(prev => [...prev, { id, type, message, duration }])
        }

        return () => {
            delete window.showNotification
        }
    }, [])

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    return (
        <>
            {notifications.map(notif => (
                <Notification
                    key={notif.id}
                    type={notif.type}
                    message={notif.message}
                    duration={notif.duration}
                    onClose={() => removeNotification(notif.id)}
                />
            ))}
        </>
    )
}

export default Notification
