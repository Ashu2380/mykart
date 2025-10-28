import React, { useState, useContext, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { userDataContext } from '../context/UserContext';
import { authDataContext } from '../context/authContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../component/Title';

function AccountSettings() {
  const { userData, setUserData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    alternateEmail: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    if (userData) {
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        alternateEmail: userData.alternateEmail || ''
      });
    }
  }, [userData]);

  const handleProfileUpdate = async (field, value) => {
    try {
      setLoading(true);
      const response = await axios.put(`${serverUrl}/api/user/profile`, {
        [field]: value
      }, { withCredentials: true });

      if (response.data.success) {
        setProfileData(prev => ({ ...prev, [field]: value }));
        setUserData(prev => ({ ...prev, [field]: value }));
        toast.success('Profile updated successfully');
        setEditingField(null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(`${serverUrl}/api/user/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, { withCredentials: true });

      if (response.data.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(profileData[field]);
  };

  const handleSave = (field) => {
    if (tempValue.trim() === '') {
      toast.error('Field cannot be empty');
      return;
    }
    handleProfileUpdate(field, tempValue);
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const deleteAccount = async () => {
    const confirmation = window.prompt(
      'Are you sure you want to delete your account? This action cannot be undone. Type "DELETE" to confirm:'
    );

    if (confirmation !== 'DELETE') {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${serverUrl}/api/user/delete-account`, { withCredentials: true });
      toast.success('Account deleted successfully');
      setUserData(null);
      // Redirect to login or home page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const ProfileField = ({ label, field, type = 'text', options = null }) => (
    <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
      <div className='flex items-center justify-between mb-4'>
        <label className='text-white font-semibold'>{label}</label>
        {editingField === field ? (
          <div className='flex gap-2'>
            <button
              onClick={() => handleSave(field)}
              disabled={loading}
              className='text-green-400 hover:text-green-300 p-2 disabled:opacity-50'
            >
              <FaSave />
            </button>
            <button
              onClick={handleCancel}
              className='text-red-400 hover:text-red-300 p-2'
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleEdit(field)}
            className='text-blue-400 hover:text-blue-300 p-2'
          >
            <FaEdit />
          </button>
        )}
      </div>

      {editingField === field ? (
        options ? (
          <select
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className='w-full p-3 rounded-lg bg-white/20 text-white border border-gray-600 focus:border-blue-500 focus:outline-none'
          >
            <option value='' className='text-black'>Select {label.toLowerCase()}</option>
            {options.map(option => (
              <option key={option} value={option} className='text-black'>{option}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
            placeholder={`Enter ${label.toLowerCase()}`}
            autoFocus
          />
        )
      ) : (
        <p className='text-gray-300'>
          {profileData[field] || `No ${label.toLowerCase()} provided`}
        </p>
      )}
    </div>
  );

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] pt-24 md:pt-20 lg:pt-24 px-4 md:px-6 lg:px-8 pb-20'>
      <div className='max-w-4xl mx-auto'>
        <Title text1={'ACCOUNT'} text2={'SETTINGS'} />

        {/* Profile Information Section */}
        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-white mb-6 flex items-center gap-2'>
            <FaUser className='text-blue-400' />
            Profile Information
          </h2>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <ProfileField label='Full Name' field='name' />
            <ProfileField label='Phone Number' field='phone' type='tel' />
            <ProfileField 
              label='Date of Birth' 
              field='dateOfBirth' 
              type='date' 
            />
            <ProfileField 
              label='Gender' 
              field='gender' 
              options={['Male', 'Female', 'Other', 'Prefer not to say']}
            />
            <div className='md:col-span-2'>
              <ProfileField label='Alternate Email' field='alternateEmail' type='email' />
            </div>
          </div>
        </div>

        {/* Email Settings Section */}
        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-white mb-6 flex items-center gap-2'>
            <FaEnvelope className='text-green-400' />
            Email Settings
          </h2>
          
          <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
            <div className='flex items-center justify-between mb-4'>
              <label className='text-white font-semibold'>Primary Email</label>
              <span className='bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>Primary</span>
            </div>
            <p className='text-gray-300 mb-4'>{profileData.email}</p>
            <div className='bg-yellow-500/20 border border-yellow-500 rounded-lg p-4'>
              <p className='text-yellow-300 text-sm'>
                <strong>Note:</strong> To change your primary email address, please contact customer support 
                for security verification.
              </p>
            </div>
          </div>
        </div>

        {/* Password Settings Section */}
        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-white mb-6 flex items-center gap-2'>
            <FaLock className='text-red-400' />
            Password & Security
          </h2>
          
          <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
            <form onSubmit={handlePasswordChange} className='space-y-4'>
              <div>
                <label className='block text-white mb-2'>Current Password</label>
                <div className='relative'>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className='w-full p-3 pr-12 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                    placeholder='Enter current password'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className='block text-white mb-2'>New Password</label>
                <div className='relative'>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className='w-full p-3 pr-12 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                    placeholder='Enter new password'
                    minLength='6'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className='block text-white mb-2'>Confirm New Password</label>
                <div className='relative'>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className='w-full p-3 pr-12 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                    placeholder='Confirm new password'
                    minLength='6'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300 disabled:opacity-50'
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Account Actions Section */}
        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-white mb-6'>Account Actions</h2>
          
          <div className='space-y-4'>
            {/* Download Data */}
            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
              <h3 className='text-white font-semibold mb-2'>Download Your Data</h3>
              <p className='text-gray-300 mb-4'>
                Download a copy of your account data including orders, addresses, and preferences.
              </p>
              <button className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-300'>
                Request Data Download
              </button>
            </div>

            {/* Deactivate Account */}
            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
              <h3 className='text-white font-semibold mb-2'>Deactivate Account</h3>
              <p className='text-gray-300 mb-4'>
                Temporarily deactivate your account. You can reactivate it anytime by logging in.
              </p>
              <button className='bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors duration-300'>
                Deactivate Account
              </button>
            </div>

            {/* Delete Account */}
            <div className='bg-red-500/20 border border-red-500 rounded-lg p-6'>
              <h3 className='text-red-300 font-semibold mb-2'>Delete Account</h3>
              <p className='text-red-200 mb-4'>
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button 
                onClick={deleteAccount}
                disabled={loading}
                className='bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-300 disabled:opacity-50'
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-white mb-6'>Privacy Settings</h2>
          
          <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-white font-semibold'>Email Notifications</h3>
                  <p className='text-gray-300 text-sm'>Receive emails about orders, offers, and updates</p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input type='checkbox' className='sr-only peer' defaultChecked />
                  <div className='w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600'></div>
                </label>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-white font-semibold'>SMS Notifications</h3>
                  <p className='text-gray-300 text-sm'>Receive SMS updates about your orders</p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input type='checkbox' className='sr-only peer' defaultChecked />
                  <div className='w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600'></div>
                </label>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-white font-semibold'>Marketing Communications</h3>
                  <p className='text-gray-300 text-sm'>Receive promotional offers and recommendations</p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input type='checkbox' className='sr-only peer' />
                  <div className='w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600'></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
