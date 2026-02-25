import React, { useContext, useEffect, useState } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaMapMarker, FaEdit, FaTrash, FaEye } from 'react-icons/fa'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const { serverUrl } = useContext(authDataContext)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const result = await axios.get(`${serverUrl}/api/user/all`, { withCredentials: true })
      setUsers(result.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewUserDetails = (user) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  const closeUserDetails = () => {
    setSelectedUser(null)
    setShowUserDetails(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className='w-full min-h-[100vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-[black] overflow-x-hidden relative'>
      <Nav />
      <Sidebar />
      <div className='w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]'>
        <div className='w-full md:w-[90%] h-full mt-0 md:mt-[70px] flex flex-col gap-[20px] md:gap-[30px] py-[20px] md:py-[90px] px-[15px] md:px-[60px] animate-fade-in'>
          <div className='w-full md:w-auto text-[24px] md:text-[40px] mb-[20px] text-gray-800 font-bold animate-fade-in'>All Users</div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up'>
            <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white group cursor-pointer'>
              <div className='flex items-center gap-4'>
                <FaUser className='text-3xl text-blue-500 group-hover:scale-110 transition-transform duration-300' />
                <div>
                  <p className='text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300'>Total Users</p>
                  <p className='text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300'>{users.length}</p>
                </div>
              </div>
            </div>
            <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white group cursor-pointer'>
              <div className='flex items-center gap-4'>
                <FaEnvelope className='text-3xl text-green-500 group-hover:scale-110 transition-transform duration-300' />
                <div>
                  <p className='text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300'>Active Users</p>
                  <p className='text-2xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300'>{users.filter(u => u.email).length}</p>
                </div>
              </div>
            </div>
            <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white group cursor-pointer'>
              <div className='flex items-center gap-4'>
                <FaCalendar className='text-3xl text-purple-500 group-hover:scale-110 transition-transform duration-300' />
                <div>
                  <p className='text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300'>Recent Signups</p>
                  <p className='text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300'>
                    {users.filter(u => {
                      const userDate = new Date(u.createdAt)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return userDate > weekAgo
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Users List */}
          {loading ? (
            <div className='text-center py-12 animate-fade-in'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <div className='text-gray-800 font-medium'>Loading users...</div>
            </div>
          ) : users.length > 0 ? (
            <div className='space-y-4 animate-fade-in-up'>
              {users.map((user, index) => (
                <div key={user._id} className='bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg hover:border-blue-500 transition-all duration-300 h-auto hover:scale-[1.01] hover:shadow-xl group cursor-pointer' style={{animationDelay: `${index * 0.05}s`}}>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300'>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h3 className='text-gray-800 font-semibold text-lg group-hover:text-blue-600 transition-colors duration-300'>{user.name || 'Unnamed User'}</h3>
                        <p className='text-gray-600 flex items-center gap-2 group-hover:text-gray-700 transition-colors duration-300'>
                          <FaEnvelope className='text-sm' />
                          {user.email}
                        </p>
                        <p className='text-gray-500 text-sm group-hover:text-gray-600 transition-colors duration-300'>
                          Joined: {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() => viewUserDetails(user)}
                        className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95'
                      >
                        <FaEye /> View Details
                      </button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className='mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                    <div className='flex items-center gap-2 group-hover:scale-105 transition-transform duration-300'>
                      <FaPhone className='text-green-500' />
                      <span className='text-gray-600 group-hover:text-gray-700 transition-colors duration-300'>{user.phone || 'Not provided'}</span>
                    </div>
                    <div className='flex items-center gap-2 group-hover:scale-105 transition-transform duration-300'>
                      <FaMapMarker className='text-red-500' />
                      <span className='text-gray-600 group-hover:text-gray-700 transition-colors duration-300'>{user.addresses?.length || 0} addresses</span>
                    </div>
                    <div className='flex items-center gap-2 group-hover:scale-105 transition-transform duration-300'>
                      <FaCalendar className='text-purple-500' />
                      <span className='text-gray-600 group-hover:text-gray-700 transition-colors duration-300'>Last login: {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</span>
                    </div>
                    <div className='flex items-center gap-2 group-hover:scale-105 transition-transform duration-300'>
                      <span className={`px-2 py-1 rounded-full text-xs ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} group-hover:scale-110 transition-transform duration-300`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12 animate-fade-in'>
              <FaUser className='text-6xl text-gray-400 mx-auto mb-4 animate-pulse' />
              <p className='text-gray-800 text-xl mb-4 font-semibold'>No users found</p>
              <p className='text-gray-500'>Users will appear here once they register</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>User Details</h2>
                <button
                  onClick={closeUserDetails}
                  className='text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-300 hover:scale-110'
                >
                  ×
                </button>
              </div>

              <div className='space-y-6'>
                {/* Basic Info */}
                <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>Basic Information</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-gray-500 text-sm'>Name</label>
                      <p className='text-gray-800 font-medium'>{selectedUser.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className='text-gray-500 text-sm'>Email</label>
                      <p className='text-gray-800 font-medium'>{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className='text-gray-500 text-sm'>Phone</label>
                      <p className='text-gray-800 font-medium'>{selectedUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className='text-gray-500 text-sm'>Date of Birth</label>
                      <p className='text-gray-800 font-medium'>{selectedUser.dateOfBirth ? formatDate(selectedUser.dateOfBirth) : 'Not provided'}</p>
                    </div>
                    <div>
                      <label className='text-gray-500 text-sm'>Gender</label>
                      <p className='text-gray-800 font-medium'>{selectedUser.gender || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className='text-gray-500 text-sm'>Alternate Email</label>
                      <p className='text-gray-800 font-medium'>{selectedUser.alternateEmail || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>Account Information</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-gray-500 text-sm'>User ID</label>
                      <p className='text-gray-800 font-medium font-mono text-sm'>{selectedUser._id}</p>
                    </div>
                    <div>
                      <label className='text-gray-500 text-sm'>Account Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm ${selectedUser.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div>
                      <label className='text-gray-500 text-sm'>Registration Date</label>
                      <p className='text-gray-800 font-medium'>{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div>
                      <label className='text-gray-500 text-sm'>Last Updated</label>
                      <p className='text-gray-800 font-medium'>{formatDate(selectedUser.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                  <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>Addresses ({selectedUser.addresses.length})</h3>
                    <div className='space-y-3'>
                      {selectedUser.addresses.map((address) => (
                        <div key={address._id} className='bg-white rounded-lg p-3 border border-gray-200 shadow-sm'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-gray-800 font-medium'>{address.type}</span>
                            {address.isDefault && (
                              <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium'>Default</span>
                            )}
                          </div>
                          <p className='text-gray-600 text-sm'>
                            {address.firstName} {address.lastName}<br />
                            {address.street}, {address.city}, {address.state} {address.pinCode}<br />
                            {address.country} • {address.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Login History (if available) */}
                <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>Login Information</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-gray-500 text-sm'>Last Login</label>
                      <p className='text-gray-800 font-medium'>{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never logged in'}</p>
                    </div>
                    <div>
                      <label className='text-gray-500 text-sm'>Login Count</label>
                      <p className='text-gray-800 font-medium'>{selectedUser.loginCount || 0} times</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users