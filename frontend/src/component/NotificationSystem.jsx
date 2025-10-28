import React, { useState, useEffect, useContext } from 'react'
import { FaBell, FaTimes, FaMapMarkerAlt, FaCloudRain, FaTag, FaTruck } from 'react-icons/fa'
import { userDataContext } from '../context/UserContext'

function NotificationSystem() {
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { userData } = useContext(userDataContext)

  // Mock notifications - in real app, these would come from backend
  useEffect(() => {
    if (userData) {
      const mockNotifications = [
        {
          id: 1,
          type: 'location',
          title: 'Rainy Day Offer!',
          message: 'Get 20% off on raincoats in your area. Perfect weather for shopping!',
          icon: <FaCloudRain className='text-blue-400' />,
          time: '2 hours ago',
          read: false
        },
        {
          id: 2,
          type: 'interest',
          title: 'New Electronics Arrivals',
          message: 'Check out the latest smartphones and laptops that match your interests!',
          icon: <FaTag className='text-green-400' />,
          time: '5 hours ago',
          read: false
        },
        {
          id: 3,
          type: 'delivery',
          title: 'Order Update',
          message: 'Your recent order is out for delivery. Track it now!',
          icon: <FaTruck className='text-purple-400' />,
          time: '1 day ago',
          read: true
        },
        {
          id: 4,
          type: 'location',
          title: 'Local Store Event',
          message: 'Fashion show at the mall near you! 30% off on featured items.',
          icon: <FaMapMarkerAlt className='text-red-400' />,
          time: '2 days ago',
          read: true
        }
      ]
      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter(n => !n.read).length)
    }
  }, [userData])

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
    setUnreadCount(0)
  }

  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (!notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  if (!userData) return null

  return (
    <>
      {/* Notification Bell */}
      <div className='relative'>
        <button
          onClick={() => setShowPanel(!showPanel)}
          className='relative p-2 text-white hover:text-purple-300 transition-colors duration-300'
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
            {notifications.length === 0 ? (
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