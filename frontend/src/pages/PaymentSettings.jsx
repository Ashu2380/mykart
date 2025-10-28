import React, { useState, useContext, useEffect } from 'react';
import { FaCreditCard, FaUniversity, FaWallet, FaPlus, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import { userDataContext } from '../context/UserContext';
import { authDataContext } from '../context/authContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../component/Title';

function PaymentSettings() {
  const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('card');

  const [formData, setFormData] = useState({
    type: 'card', // card, upi, netbanking, wallet
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    walletType: 'paytm', // paytm, phonepe, googlepay
    walletNumber: '',
    isDefault: false,
    nickname: ''
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverUrl}/api/user/payment-methods`, { withCredentials: true });
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
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
      type: 'card',
      cardNumber: '',
      cardHolderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      upiId: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      walletType: 'paytm',
      walletNumber: '',
      isDefault: false,
      nickname: ''
    });
    setEditingMethod(null);
    setShowAddForm(false);
    setSelectedType('card');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation based on payment type
    if (formData.type === 'card') {
      if (!formData.cardNumber || !formData.cardHolderName || !formData.expiryMonth || !formData.expiryYear || !formData.cvv) {
        toast.error('Please fill all card details');
        return;
      }
    } else if (formData.type === 'upi') {
      if (!formData.upiId) {
        toast.error('Please enter UPI ID');
        return;
      }
    } else if (formData.type === 'netbanking') {
      if (!formData.bankName || !formData.accountNumber || !formData.ifscCode) {
        toast.error('Please fill all bank details');
        return;
      }
    } else if (formData.type === 'wallet') {
      if (!formData.walletNumber) {
        toast.error('Please enter wallet number');
        return;
      }
    }

    try {
      setLoading(true);
      
      if (editingMethod) {
        await axios.put(`${serverUrl}/api/user/payment-methods/${editingMethod._id}`, formData, { withCredentials: true });
        toast.success('Payment method updated successfully');
      } else {
        await axios.post(`${serverUrl}/api/user/payment-methods`, formData, { withCredentials: true });
        toast.success('Payment method added successfully');
      }
      
      loadPaymentMethods();
      resetForm();
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error(editingMethod ? 'Failed to update payment method' : 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method) => {
    setFormData(method);
    setEditingMethod(method);
    setSelectedType(method.type);
    setShowAddForm(true);
  };

  const handleDelete = async (methodId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${serverUrl}/api/user/payment-methods/${methodId}`, { withCredentials: true });
      toast.success('Payment method deleted successfully');
      loadPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    } finally {
      setLoading(false);
    }
  };

  const setAsDefault = async (methodId) => {
    try {
      setLoading(true);
      await axios.put(`${serverUrl}/api/user/payment-methods/${methodId}/default`, {}, { withCredentials: true });
      toast.success('Default payment method updated');
      loadPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (type) => {
    switch (type) {
      case 'card': return <FaCreditCard className="text-blue-500" />;
      case 'upi': return <FaWallet className="text-green-500" />;
      case 'netbanking': return <FaUniversity className="text-purple-500" />;
      case 'wallet': return <FaWallet className="text-orange-500" />;
      default: return <FaCreditCard className="text-gray-500" />;
    }
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    return `**** **** **** ${cardNumber.slice(-4)}`;
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return '';
    return `****${accountNumber.slice(-4)}`;
  };

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] pt-24 md:pt-20 lg:pt-24 px-4 md:px-6 lg:px-8 pb-20'>
      <div className='max-w-6xl mx-auto'>
        <Title text1={'PAYMENT'} text2={'SETTINGS'} />
        
        {/* Add New Payment Method Button */}
        <div className='mb-6'>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-300'
          >
            <FaPlus /> Add Payment Method
          </button>
        </div>

        {/* Add/Edit Payment Method Form */}
        {showAddForm && (
          <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6'>
            <h3 className='text-xl font-semibold text-white mb-4'>
              {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
            </h3>
            
            {/* Payment Type Selection */}
            <div className='mb-6'>
              <label className='block text-white mb-3'>Payment Type</label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {[
                  { type: 'card', label: 'Credit/Debit Card', icon: <FaCreditCard /> },
                  { type: 'upi', label: 'UPI', icon: <FaWallet /> },
                  { type: 'netbanking', label: 'Net Banking', icon: <FaUniversity /> },
                  { type: 'wallet', label: 'Digital Wallet', icon: <FaWallet /> }
                ].map(({ type, label, icon }) => (
                  <button
                    key={type}
                    type='button'
                    onClick={() => {
                      setSelectedType(type);
                      setFormData(prev => ({ ...prev, type }));
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedType === type 
                        ? 'border-blue-500 bg-blue-500/20' 
                        : 'border-gray-600 bg-white/5 hover:border-gray-500'
                    }`}
                  >
                    <div className='flex flex-col items-center gap-2 text-white'>
                      <div className='text-2xl'>{icon}</div>
                      <span className='text-sm text-center'>{label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Nickname */}
              <div>
                <label className='block text-white mb-2'>Nickname (Optional)</label>
                <input
                  type='text'
                  name='nickname'
                  value={formData.nickname}
                  onChange={handleInputChange}
                  className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                  placeholder='e.g., Personal Card, Work Account'
                />
              </div>

              {/* Card Details */}
              {selectedType === 'card' && (
                <>
                  <div>
                    <label className='block text-white mb-2'>Card Holder Name *</label>
                    <input
                      type='text'
                      name='cardHolderName'
                      value={formData.cardHolderName}
                      onChange={handleInputChange}
                      className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                      placeholder='Enter cardholder name'
                      required
                    />
                  </div>
                  
                  <div>
                    <label className='block text-white mb-2'>Card Number *</label>
                    <input
                      type='text'
                      name='cardNumber'
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                      placeholder='1234 5678 9012 3456'
                      maxLength='19'
                      required
                    />
                  </div>
                  
                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-white mb-2'>Expiry Month *</label>
                      <select
                        name='expiryMonth'
                        value={formData.expiryMonth}
                        onChange={handleInputChange}
                        className='w-full p-3 rounded-lg bg-white/20 text-white border border-gray-600 focus:border-blue-500 focus:outline-none'
                        required
                      >
                        <option value=''>Month</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, '0')} className='text-black'>
                            {String(i + 1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className='block text-white mb-2'>Expiry Year *</label>
                      <select
                        name='expiryYear'
                        value={formData.expiryYear}
                        onChange={handleInputChange}
                        className='w-full p-3 rounded-lg bg-white/20 text-white border border-gray-600 focus:border-blue-500 focus:outline-none'
                        required
                      >
                        <option value=''>Year</option>
                        {Array.from({ length: 20 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <option key={year} value={year} className='text-black'>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    
                    <div>
                      <label className='block text-white mb-2'>CVV *</label>
                      <input
                        type='password'
                        name='cvv'
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                        placeholder='123'
                        maxLength='4'
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* UPI Details */}
              {selectedType === 'upi' && (
                <div>
                  <label className='block text-white mb-2'>UPI ID *</label>
                  <input
                    type='text'
                    name='upiId'
                    value={formData.upiId}
                    onChange={handleInputChange}
                    className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                    placeholder='yourname@paytm'
                    required
                  />
                </div>
              )}

              {/* Net Banking Details */}
              {selectedType === 'netbanking' && (
                <>
                  <div>
                    <label className='block text-white mb-2'>Bank Name *</label>
                    <input
                      type='text'
                      name='bankName'
                      value={formData.bankName}
                      onChange={handleInputChange}
                      className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                      placeholder='Enter bank name'
                      required
                    />
                  </div>
                  
                  <div>
                    <label className='block text-white mb-2'>Account Number *</label>
                    <input
                      type='text'
                      name='accountNumber'
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                      placeholder='Enter account number'
                      required
                    />
                  </div>
                  
                  <div>
                    <label className='block text-white mb-2'>IFSC Code *</label>
                    <input
                      type='text'
                      name='ifscCode'
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                      placeholder='Enter IFSC code'
                      required
                    />
                  </div>
                </>
              )}

              {/* Wallet Details */}
              {selectedType === 'wallet' && (
                <>
                  <div>
                    <label className='block text-white mb-2'>Wallet Type *</label>
                    <select
                      name='walletType'
                      value={formData.walletType}
                      onChange={handleInputChange}
                      className='w-full p-3 rounded-lg bg-white/20 text-white border border-gray-600 focus:border-blue-500 focus:outline-none'
                      required
                    >
                      <option value='paytm' className='text-black'>Paytm</option>
                      <option value='phonepe' className='text-black'>PhonePe</option>
                      <option value='googlepay' className='text-black'>Google Pay</option>
                      <option value='amazonpay' className='text-black'>Amazon Pay</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className='block text-white mb-2'>Wallet Number *</label>
                    <input
                      type='text'
                      name='walletNumber'
                      value={formData.walletNumber}
                      onChange={handleInputChange}
                      className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                      placeholder='Enter wallet number'
                      required
                    />
                  </div>
                </>
              )}

              {/* Default Payment Method Checkbox */}
              <div>
                <label className='flex items-center gap-2 text-white cursor-pointer'>
                  <input
                    type='checkbox'
                    name='isDefault'
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className='text-blue-600'
                  />
                  <span>Set as default payment method</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className='flex gap-4'>
                <button
                  type='submit'
                  disabled={loading}
                  className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-300 disabled:opacity-50'
                >
                  {loading ? 'Saving...' : (editingMethod ? 'Update Method' : 'Save Method')}
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

        {/* Payment Methods List */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {paymentMethods.map((method) => (
            <div key={method._id} className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  {getPaymentIcon(method.type)}
                  <span className='text-white font-semibold capitalize'>{method.type}</span>
                  {method.isDefault && (
                    <span className='bg-green-500 text-white text-xs px-2 py-1 rounded-full'>Default</span>
                  )}
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => handleEdit(method)}
                    className='text-blue-400 hover:text-blue-300 p-2'
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(method._id)}
                    className='text-red-400 hover:text-red-300 p-2'
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className='text-white space-y-2'>
                {method.nickname && (
                  <p className='font-semibold text-blue-300'>{method.nickname}</p>
                )}
                
                {method.type === 'card' && (
                  <>
                    <p className='text-sm text-gray-300'>{method.cardHolderName}</p>
                    <p className='text-sm text-gray-300'>{maskCardNumber(method.cardNumber)}</p>
                    <p className='text-sm text-gray-300'>Expires: {method.expiryMonth}/{method.expiryYear}</p>
                  </>
                )}
                
                {method.type === 'upi' && (
                  <p className='text-sm text-gray-300'>{method.upiId}</p>
                )}
                
                {method.type === 'netbanking' && (
                  <>
                    <p className='text-sm text-gray-300'>{method.bankName}</p>
                    <p className='text-sm text-gray-300'>Account: {maskAccountNumber(method.accountNumber)}</p>
                    <p className='text-sm text-gray-300'>IFSC: {method.ifscCode}</p>
                  </>
                )}
                
                {method.type === 'wallet' && (
                  <>
                    <p className='text-sm text-gray-300 capitalize'>{method.walletType}</p>
                    <p className='text-sm text-gray-300'>{method.walletNumber}</p>
                  </>
                )}
              </div>

              {!method.isDefault && (
                <button
                  onClick={() => setAsDefault(method._id)}
                  className='mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-300'
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>

        {paymentMethods.length === 0 && !loading && (
          <div className='text-center py-12'>
            <FaCreditCard className='text-6xl text-gray-500 mx-auto mb-4' />
            <p className='text-white text-xl mb-4'>No payment methods found</p>
            <p className='text-gray-400 mb-6'>Add your first payment method to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300'
            >
              Add Payment Method
            </button>
          </div>
        )}

        {/* Cash on Delivery Option */}
        <div className='mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <FaCheck className='text-green-500 text-xl' />
            <h3 className='text-xl font-semibold text-white'>Cash on Delivery</h3>
          </div>
          <p className='text-gray-300 mb-4'>
            Pay with cash when your order is delivered. Available for orders up to ₹50,000.
          </p>
          <div className='bg-green-500/20 border border-green-500 rounded-lg p-4'>
            <p className='text-green-300 text-sm'>
              ✓ Cash on Delivery is always available as a payment option during checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSettings;
