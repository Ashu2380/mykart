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
    <div className='w-[100vw] min-h-[100vh] bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 text-[white]'>
      <Nav />
      <div className='w-[100%] h-[100%] flex items-center justify-start'>
        <Sidebar />

        <div className='w-[82%] h-[100%] lg:ml-[320px] md:ml-[230px] mt-[70px] flex flex-col gap-[30px] overflow-x-hidden py-[50px] ml-[100px]'>
          <div className='w-[400px] h-[50px] text-[28px] md:text-[40px] mb-[20px] text-white'>All Users</div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
              <div className='flex items-center gap-4'>
                <FaUser className='text-3xl text-blue-400' />
                <div>
                  <p className='text-gray-300 text-sm'>Total Users</p>
                  <p className='text-2xl font-bold text-white'>{users.length}</p>
                </div>
              </div>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
              <div className='flex items-center gap-4'>
                <FaEnvelope className='text-3xl text-green-400' />
                <div>
                  <p className='text-gray-300 text-sm'>Active Users</p>
                  <p className='text-2xl font-bold text-white'>{users.filter(u => u.email).length}</p>
                </div>
              </div>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
              <div className='flex items-center gap-4'>
                <FaCalendar className='text-3xl text-purple-400' />
                <div>
                  <p className='text-gray-300 text-sm'>Recent Signups</p>
                  <p className='text-2xl font-bold text-white'>
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
            <div className='text-center py-12'>
              <div className='text-white text-xl'>Loading users...</div>
            </div>
          ) : users.length > 0 ? (
            <div className='space-y-4'>
              {users.map((user, index) => (
                <div key={user._id} className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600 hover:border-blue-500 transition-all duration-300'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg'>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h3 className='text-white font-semibold text-lg'>{user.name || 'Unnamed User'}</h3>
                        <p className='text-gray-300 flex items-center gap-2'>
                          <FaEnvelope className='text-sm' />
                          {user.email}
                        </p>
                        <p className='text-gray-400 text-sm'>
                          Joined: {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() => viewUserDetails(user)}
                        className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300'
                      >
                        <FaEye /> View Details
                      </button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className='mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                    <div className='flex items-center gap-2'>
                      <FaPhone className='text-green-400' />
                      <span className='text-gray-300'>{user.phone || 'Not provided'}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <FaMapMarker className='text-red-400' />
                      <span className='text-gray-300'>{user.addresses?.length || 0} addresses</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <FaCalendar className='text-purple-400' />
                      <span className='text-gray-300'>Last login: {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className={`px-2 py-1 rounded-full text-xs ${user.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <FaUser className='text-6xl text-gray-500 mx-auto mb-4' />
              <p className='text-white text-xl mb-4'>No users found</p>
              <p className='text-gray-400'>Users will appear here once they register</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-white'>User Details</h2>
                <button
                  onClick={closeUserDetails}
                  className='text-gray-400 hover:text-white text-2xl'
                >
                  ×
                </button>
              </div>

              <div className='space-y-6'>
                {/* Basic Info */}
                <div className='bg-white/5 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-white mb-4'>Basic Information</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-gray-400 text-sm'>Name</label>
                      <p className='text-white font-medium'>{selectedUser.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className='text-gray-400 text-sm'>Email</label>
                      <p className='text-white font-medium'>{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className='text-gray-400 text-sm'>Phone</label>
                      <p className='text-white font-medium'>{selectedUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className='text-gray-400 text-sm'>Date of Birth</label>
                      <p className='text-white font-medium'>{selectedUser.dateOfBirth ? formatDate(selectedUser.dateOfBirth) : 'Not provided'}</p>
                    </div>
                    <div>
                      <label className='text-gray-400 text-sm'>Gender</label>
                      <p className='text-white font-medium'>{selectedUser.gender || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className='text-gray-400 text-sm'>Alternate Email</label>
                      <p className='text-white font-medium'>{selectedUser.alternateEmail || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className='bg-white/5 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-white mb-4'>Account Information</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-gray-400 text-sm'>User ID</label>
                      <p className='text-white font-medium font-mono text-sm'>{selectedUser._id}</p>
                    </div>
                    <div>
                      <label className='text-gray-400 text-sm'>Account Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm ${selectedUser.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div>
                      <label className='text-gray-400 text-sm'>Registration Date</label>
                      <p className='text-white font-medium'>{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div>
                      <label className='text-gray-400 text-sm'>Last Updated</label>
                      <p className='text-white font-medium'>{formatDate(selectedUser.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                  <div className='bg-white/5 rounded-lg p-4'>
                    <h3 className='text-lg font-semibold text-white mb-4'>Addresses ({selectedUser.addresses.length})</h3>
                    <div className='space-y-3'>
                      {selectedUser.addresses.map((address, index) => (
                        <div key={index} className='bg-white/10 rounded-lg p-3'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-white font-medium'>{address.type}</span>
                            {address.isDefault && (
                              <span className='bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs'>Default</span>
                            )}
                          </div>
                          <p className='text-gray-300 text-sm'>
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
                <div className='bg-white/5 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-white mb-4'>Login Information</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-gray-400 text-sm'>Last Login</label>
                      <p className='text-white font-medium'>{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never logged in'}</p>
                    </div>
                    <div>
                      <label className='text-gray-400 text-sm'>Login Count</label>
                      <p className='text-white font-medium'>{selectedUser.loginCount || 0} times</p>
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