import React, { useState, useContext, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaHome, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import { userDataContext } from '../context/UserContext';
import { authDataContext } from '../context/authContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../component/Title';

function ManageAddresses() {
  const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: 'home', // home, office, other
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    phone: '',
    landmark: '',
    isDefault: false
  });

  // Load addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverUrl}/api/user/addresses`, { withCredentials: true });
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India',
      phone: '',
      landmark: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.street || !formData.city || !formData.state || !formData.pinCode || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (editingAddress) {
        // Update existing address
        await axios.put(`${serverUrl}/api/user/addresses/${editingAddress._id}`, formData, { withCredentials: true });
        toast.success('Address updated successfully');
      } else {
        // Add new address
        await axios.post(`${serverUrl}/api/user/addresses`, formData, { withCredentials: true });
        toast.success('Address added successfully');
      }
      
      loadAddresses();
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(editingAddress ? 'Failed to update address' : 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${serverUrl}/api/user/addresses/${addressId}`, { withCredentials: true });
      toast.success('Address deleted successfully');
      loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const setAsDefault = async (addressId) => {
    try {
      setLoading(true);
      await axios.put(`${serverUrl}/api/user/addresses/${addressId}/default`, {}, { withCredentials: true });
      toast.success('Default address updated');
      loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    } finally {
      setLoading(false);
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case 'home': return <FaHome className="text-green-500" />;
      case 'office': return <FaBuilding className="text-blue-500" />;
      default: return <FaMapMarkerAlt className="text-gray-500" />;
    }
  };

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] pt-24 md:pt-20 lg:pt-24 px-4 md:px-6 lg:px-8 pb-20'>
      <div className='max-w-6xl mx-auto'>
        <Title text1={'MANAGE'} text2={'ADDRESSES'} />
        
        {/* Add New Address Button */}
        <div className='mb-6'>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-300'
          >
            <FaPlus /> Add New Address
          </button>
        </div>

        {/* Add/Edit Address Form */}
        {showAddForm && (
          <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6'>
            <h3 className='text-xl font-semibold text-white mb-4'>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            
            <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Address Type */}
              <div className='md:col-span-2'>
                <label className='block text-white mb-2'>Address Type</label>
                <div className='flex gap-4'>
                  {['home', 'office', 'other'].map(type => (
                    <label key={type} className='flex items-center gap-2 text-white cursor-pointer'>
                      <input
                        type='radio'
                        name='type'
                        value={type}
                        checked={formData.type === type}
                        onChange={handleInputChange}
                        className='text-blue-600'
                      />
                      <span className='capitalize'>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Name Fields */}
              <div>
                <label className='block text-white mb-2'>First Name *</label>
                <input
                  type='text'
                  name='firstName'
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                  placeholder='Enter first name'
                  required
                />
              </div>

              <div>
                <label className='block text-white mb-2'>Last Name *</label>
                <input
                  type='text'
                  name='lastName'
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                  placeholder='Enter last name'
                  required
                />
              </div>

              {/* Address Fields */}
              <div className='md:col-span-2'>
                <label className='block text-white mb-2'>Street Address *</label>
                <input
                  type='text'
                  name='street'
                  value={formData.street}
                  onChange={handleInputChange}
                  className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                  placeholder='House no, Building name, Street name'
                  required
                />
              </div>

              <div>
                <label className='block text-white mb-2'>City *</label>
                <input
                  type='text'
                  name='city'
                  value={formData.city}
                  onChange={handleInputChange}
                  className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                  placeholder='Enter city'
                  required
                />
              </div>

              <div>
                <label className='block text-white mb-2'>State *</label>
                <input
                  type='text'
                  name='state'
                  value={formData.state}
                  onChange={handleInputChange}
                  className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                  placeholder='Enter state'
                  required
                />
              </div>

              <div>
                <label className='block text-white mb-2'>PIN Code *</label>
                <input
                  type='text'
                  name='pinCode'
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                  placeholder='Enter PIN code'
                  pattern='[0-9]{6}'
                  required
                />
              </div>

              <div>
                <label className='block text-white mb-2'>Phone Number *</label>
                <input
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                  placeholder='Enter phone number'
                  pattern='[0-9]{10}'
                  required
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-white mb-2'>Landmark (Optional)</label>
                <input
                  type='text'
                  name='landmark'
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                  placeholder='Nearby landmark'
                />
              </div>

              {/* Default Address Checkbox */}
              <div className='md:col-span-2'>
                <label className='flex items-center gap-2 text-white cursor-pointer'>
                  <input
                    type='checkbox'
                    name='isDefault'
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className='text-blue-600'
                  />
                  <span>Set as default address</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className='md:col-span-2 flex gap-4'>
                <button
                  type='submit'
                  disabled={loading}
                  className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-300 disabled:opacity-50'
                >
                  {loading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
                </button>
                <button
                  type='button'
                  onClick={resetForm}
                  className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-300'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {addresses.map((address) => (
            <div key={address._id} className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  {getAddressIcon(address.type)}
                  <span className='text-white font-semibold capitalize'>{address.type}</span>
                  {address.isDefault && (
                    <span className='bg-green-500 text-white text-xs px-2 py-1 rounded-full'>Default</span>
                  )}
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => handleEdit(address)}
                    className='text-blue-400 hover:text-blue-300 p-2'
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className='text-red-400 hover:text-red-300 p-2'
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className='text-white space-y-1'>
                <p className='font-semibold'>{address.firstName} {address.lastName}</p>
                <p className='text-sm text-gray-300'>{address.street}</p>
                <p className='text-sm text-gray-300'>{address.city}, {address.state} - {address.pinCode}</p>
                {address.landmark && <p className='text-sm text-gray-400'>Near: {address.landmark}</p>}
                <p className='text-sm text-gray-300'>Phone: {address.phone}</p>
              </div>

              {!address.isDefault && (
                <button
                  onClick={() => setAsDefault(address._id)}
                  className='mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-300'
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>

        {addresses.length === 0 && !loading && (
          <div className='text-center py-12'>
            <FaMapMarkerAlt className='text-6xl text-gray-500 mx-auto mb-4' />
            <p className='text-white text-xl mb-4'>No addresses found</p>
            <p className='text-gray-400 mb-6'>Add your first address to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300'
            >
              Add Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageAddresses;
