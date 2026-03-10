import React, { useState, useEffect, useContext, useRef } from 'react'
import { FaBell, FaTimes, FaTag, FaTruck, FaCheck, FaShippingFast } from 'react-icons/fa'
import { userDataContext } from '../context/UserContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

function NotificationSystem() {
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [debug, setDebug] = useState('')
  const { userData, token } = useContext(userDataContext)
  const navigate = useNavigate()
  const audioRef = useRef(null)

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    console.log('fetchNotifications called, userData:', userData, 'token:', token ? 'exists' : 'missing')
    
    if (!userData || !token) {
      console.log('User not logged in, returning')
      return
    }

    try {
      setLoading(true)
      console.log('Calling API...')
      const response = await fetch('http://localhost:8000/api/user/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('API Response:', data)

      if (data.success && data.notifications) {
        // Transform notifications
        const transformed = data.notifications.map(n => ({
          id: n._id || n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          productId: n.productId?._id || n.productId,
          isRead: n.isRead || false,
          createdAt: n.createdAt,
          timeAgo: getTimeAgo(n.createdAt)
        }))
        
        console.log('Notifications fetched:', transformed)
        setNotifications(transformed)
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get time ago string
  const getTimeAgo = (date) => {
    if (!date) return 'Just now'
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now - notifDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return notifDate.toLocaleDateString()
  }

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'price_alert':
        return <FaTag className="text-green-500" />
      case 'order_update':
        return <FaTruck className="text-blue-500" />
      case 'order_placed':
        return <FaCheck className="text-green-500" />
      case 'order_shipped':
        return <FaShippingFast className="text-purple-500" />
      default:
        return <FaBell className="text-gray-500" />
    }
  }

  // Get notification color based on type
  const getBgColor = (type) => {
    switch (type) {
      case 'price_alert':
        return 'bg-green-50 border-l-green-500'
      case 'order_update':
      case 'order_placed':
      case 'order_shipped':
        return 'bg-blue-50 border-l-blue-500'
      default:
        return 'bg-gray-50 border-l-gray-300'
    }
  }

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/user/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      for (const notif of notifications) {
        if (!notif.isRead) {
          await markAsRead(notif.id)
        }
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    // Navigate based on type
    if (notification.productId) {
      navigate(`/productdetail/${notification.productId}`)
      setShowPanel(false)
    } else if (notification.type === 'order_update' || notification.type.startsWith('order_')) {
      navigate('/order')
      setShowPanel(false)
    }
  }

  // Fetch on mount and when userData/token changes
  useEffect(() => {
    console.log('useEffect triggered, userData type:', typeof userData, 'value:', userData)
    
    if (userData && token) {
      console.log('Calling fetchNotifications because userData and token exist')
      fetchNotifications()
    } else {
      console.log('Not calling fetchNotifications - userData or token missing')
    }
  }, [userData, token])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!userData || !token) return
    
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [userData, token])

  if (!userData) {
    console.log('NotificationSystem returning null, userData:', userData)
    // Show bell anyway for debugging
    return (
      <div className="relative">
        <button className="relative p-2 text-gray-700">
          <FaBell className="text-xl text-red-500" />
          <span className="absolute text-xs text-red-500">{debug}</span>
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Bell Icon */}
      <div className="relative">
        <button
          onClick={() => {
            setShowPanel(!showPanel)
            if (!showPanel) fetchNotifications()
          }}
          className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors"
        >
          <FaBell className="text-xl" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPanel(false)} 
          />
          <div className="absolute right-0 top-12 w-80 max-h-96 bg-white rounded-lg shadow-xl border z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-purple-600 text-white p-3 flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <button onClick={() => setShowPanel(false)}>
                <FaTimes />
              </button>
            </div>

            {/* Mark all read button */}
            {unreadCount > 0 && (
              <div className="p-2 border-b bg-gray-50">
                <button 
                  onClick={markAllAsRead}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  Mark all as read ({unreadCount})
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <FaBell className="text-4xl mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                  <p className="text-sm mt-1">You'll see order updates and price drops here</p>
                  
                  {/* Test buttons - for debugging */}
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch('http://localhost:8000/api/user/notifications/test', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                          credentials: 'include'
                        })
                        const data = await res.json()
                        console.log('Test notification created:', data)
                        fetchNotifications()
                      } catch(e) { console.error(e) }
                    }}
                    className="mt-3 px-3 py-1 bg-green-500 text-white text-xs rounded"
                  >
                    Create Test Notification
                  </button>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${getBgColor(notification.type)} ${!notification.isRead ? 'font-medium' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.timeAgo}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <audio ref={audioRef} preload="auto" />
    </>
  )
}

export default NotificationSystem
