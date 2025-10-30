import React, { useState, useEffect, useContext } from 'react'
import { FaBell, FaTimes, FaMapMarkerAlt, FaCloudRain, FaTag, FaTruck, FaSearch, FaHeart, FaShoppingCart } from 'react-icons/fa'
import { userDataContext } from '../context/UserContext'
import { toast } from 'react-toastify'

function NotificationSystem() {
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { userData, token } = useContext(userDataContext)

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!userData || !token) return

    try {
      setLoading(true)
      const response = await fetch('http://localhost:4000/api/user/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        // Transform backend notifications to frontend format
        const transformedNotifications = data.notifications.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          productId: notification.productId,
          metadata: notification.metadata,
          time: notification.timeAgo,
          read: notification.isRead,
          icon: getNotificationIcon(notification.type)
        }))

        setNotifications(transformedNotifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  // Get appropriate icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'price_alert':
        return <FaTag className='text-green-400' />
      case 'restock':
        return <FaShoppingCart className='text-blue-400' />
      case 'deal':
        return <FaTag className='text-red-400' />
      case 'recommendation':
        return <FaSearch className='text-purple-400' />
      case 'order_update':
        return <FaTruck className='text-orange-400' />
      case 'system':
        return <FaBell className='text-gray-400' />
      default:
        return <FaBell className='text-gray-400' />
    }
  }

  useEffect(() => {
    if (userData && token) {
      fetchNotifications()
    }
  }, [userData, token])

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (!userData || !token) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [userData, token])

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/user/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } else {
        toast.error('Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
    setUnreadCount(0)
  }

  const deleteNotification = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/user/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        const notification = notifications.find(n => n.id === id)
        setNotifications(prev => prev.filter(n => n.id !== id))
        if (!notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        toast.success('Notification deleted')
      } else {
        toast.error('Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  if (!userData) return null

  return (
    <>
      {/* Notification Bell */}
      <div className='relative'>
        <button
          onClick={() => setShowPanel(!showPanel)}
          className='relative p-2 text-gray-700 hover:text-blue-600 transition-colors duration-300'
          title="Notifications"
        >
          <FaBell className='text-xl' />
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <div className='absolute right-0 top-12 w-80 max-h-96 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-white/20 z-50 overflow-hidden'>
          {/* Header */}
          <div className='bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between'>
            <h3 className='font-semibold flex items-center gap-2'>
              <FaBell />
              Smart Notifications
            </h3>
            <button
              onClick={() => setShowPanel(false)}
              className='text-white/80 hover:text-white'
            >
              <FaTimes />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className='p-3 border-b border-gray-200'>
              <button
                onClick={markAllAsRead}
                className='text-sm text-purple-600 hover:text-purple-800 font-medium'
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className='max-h-80 overflow-y-auto'>
            {loading ? (
              <div className='p-6 text-center text-gray-500'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2'></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className='p-6 text-center text-gray-500'>
                <FaBell className='text-3xl mx-auto mb-2 text-gray-300' />
                <p>No notifications yet</p>
                <p className='text-sm'>We'll notify you about relevant offers and updates!</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 mt-1'>
                      {notification.icon}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between'>
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className='text-gray-400 hover:text-red-500 ml-2 flex-shrink-0'
                          title="Delete notification"
                        >
                          <FaTimes className='text-xs' />
                        </button>
                      </div>
                      <p className='text-sm text-gray-600 mt-1'>
                        {notification.message}
                      </p>
                      <div className='flex items-center justify-between mt-2'>
                        <span className='text-xs text-gray-500'>
                          {notification.time}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className='text-xs text-purple-600 hover:text-purple-800 font-medium'
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className='p-3 bg-gray-50 text-center'>
            <p className='text-xs text-gray-500'>
              Get personalized notifications based on your location and interests
            </p>
          </div>
        </div>
      )}

      {/* Overlay to close panel when clicking outside */}
      {showPanel && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setShowPanel(false)}
        />
      )}
    </>
  )
}

export default NotificationSystem