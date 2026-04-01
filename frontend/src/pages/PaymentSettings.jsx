import React, { useState, useContext, useEffect } from 'react';
import { FaCreditCard, FaUniversity, FaWallet, FaPlus, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import { authDataContext } from '../context/authContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../component/Title';

function PaymentSettings() {
  // const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddForm, setShowAddForm] = useState(true);
  const [editingMethod, setEditingMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('wallet');
  
  // Blockchain wallet state
  const [walletBalance, setWalletBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);

  const [formData, setFormData] = useState({
    type: 'wallet',
    walletType: 'ethereum',
    walletNumber: '',
    isDefault: true,
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
      // toast.error('Failed to load payment methods'); // Removed error popup
    } finally {
      setLoading(false);
    }
  };

  // Connect blockchain wallet and get details
  const connectBlockchainWallet = async (cryptoType) => {
    setIsConnecting(true);
    try {
      let walletData = {
        address: '',
        balance: '0',
        walletName: '',
        network: ''
      };

      if (cryptoType === 'ethereum' || cryptoType === 'bitcoin') {
        // Ethereum/Bitcoin via MetaMask
        if (typeof window.ethereum !== 'undefined') {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          walletData.address = accounts[0];
          walletData.walletName = 'MetaMask';
          
          // Get ETH balance
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          });
          // Convert from wei to ETH
          walletData.balance = (parseInt(balance, 16) / 1e18).toFixed(6);
          
          if (cryptoType === 'bitcoin') {
            // For BTC, we need a different approach - estimate based on ETH or just show 0
            // Real implementation would need a BTC node or API
            walletData.balance = '0'; // BTC balance requires separate integration
          }
          
          toast.success('Wallet connected! Address: ' + accounts[0].slice(0, 10) + '...');
        } else {
          toast.error('MetaMask not installed. Please install MetaMask for ETH/BTC.');
          setIsConnecting(false);
          return null;
        }
      } else if (cryptoType === 'cardano') {
        // Cardano via Nami/Yoroi wallet
        if (window.cardano) {
          // Updated wallet list including newer wallets
          const wallets = ['nami', 'yoroi', 'flint', 'eternl', 'gero', 'lace', 'nufi', 'typhon', 'vip'];
          let connected = false;
          let lastError = null;
          
          for (const walletName of wallets) {
            const wallet = window.cardano[walletName];
            if (wallet?.enable) {
              try {
                console.log('Trying to connect to wallet:', walletName);
                const api = await wallet.enable();
                console.log('Wallet API enabled:', walletName);
                
                // Get addresses
                const addresses = await api.getUsedAddresses();
                if (!addresses || addresses.length === 0) {
                  // Try reward addresses for staking wallets
                  const rewardAddresses = await api.getRewardAddresses();
                  if (rewardAddresses && rewardAddresses.length > 0) {
                    walletData.address = rewardAddresses[0];
                  } else {
                    continue;
                  }
                } else {
                  walletData.address = addresses[0];
                }
                walletData.walletName = walletName.charAt(0).toUpperCase() + walletName.slice(1);
                
                // Get network ID to show in UI
                let networkId = null;
                try {
                  networkId = await api.getNetworkId();
                  console.log('Network ID:', networkId);
                  // 0 = Preprod, 1 = Mainnet
                  walletData.network = networkId === 0 ? 'Preprod' : (networkId === 1 ? 'Mainnet' : 'Testnet');
                } catch (netErr) {
                  console.log('Network ID error:', netErr);
                  walletData.network = 'Unknown';
                }
                
                // Get balance - try multiple methods
                try {
                  let balanceFound = false;
                  
                  // Method 1: getUtxos (most common)
                  const utxos = await api.getUtxos();
                  console.log('UTXOs:', utxos);
                  if (utxos && utxos.length > 0) {
                    let totalLovelace = 0;
                    utxos.forEach(utxo => {
                      if (utxo.amount && Array.isArray(utxo.amount)) {
                        const lovelace = utxo.amount.find(a => a.unit === 'lovelace');
                        if (lovelace) {
                          totalLovelace += Number(lovelace.quantity);
                        }
                      }
                    });
                    if (totalLovelace > 0) {
                      walletData.balance = (totalLovelace / 1e6).toFixed(6);
                      balanceFound = true;
                      console.log('Balance from UTXOs:', walletData.balance);
                    }
                  }
                  
                  // Method 2: getBalance (CIP-30 standard)
                  if (!balanceFound) {
                    try {
                      const balance = await api.getBalance();
                      console.log('Raw balance:', balance);
                      if (balance) {
                        // Handle different balance formats
                        if (typeof balance === 'string') {
                          // Hex-encoded value - try to parse as lovelace
                          // If it's a single number in hex (lovelace)
                          if (balance.length <= 16 && !balance.includes('.')) {
                            const lovelace = parseInt(balance, 16);
                            if (!isNaN(lovelace) && lovelace > 0) {
                              walletData.balance = (lovelace / 1e6).toFixed(6);
                              balanceFound = true;
                            }
                          }
                          // Check if it's an array/collection
                          if (!balanceFound && balance.startsWith('[')) {
                            try {
                              const arr = JSON.parse(balance);
                              arr.forEach(asset => {
                                if (asset && asset.unit === 'lovelace') {
                                  walletData.balance = (Number(asset.quantity) / 1e6).toFixed(6);
                                  balanceFound = true;
                                }
                              });
                            } catch (e) {}
                          }
                        } else if (Array.isArray(balance)) {
                          // Array of assets
                          balance.forEach(asset => {
                            if (asset && asset.unit === 'lovelace') {
                              walletData.balance = (Number(asset.quantity) / 1e6).toFixed(6);
                              balanceFound = true;
                            }
                          });
                        }
                      }
                    } catch (balErr2) {
                      console.log('getBalance error:', balErr2);
                    }
                  }
                  
                  // Method 3: Check for any UTXO with assets
                  if (!balanceFound && utxos && utxos.length > 0) {
                    // Try alternative unit names
                    utxos.forEach(utxo => {
                      if (utxo.amount && Array.isArray(utxo.amount)) {
                        // Try different unit names
                        const altUnits = ['lovelace', 'ada', ' lovelace', ' lovelace'];
                        altUnits.forEach(unit => {
                          const asset = utxo.amount.find(a => String(a.unit).trim() === unit);
                          if (asset) {
                            walletData.balance = (Number(asset.quantity) / 1e6).toFixed(6);
                            balanceFound = true;
                          }
                        });
                      }
                    });
                  }
                  
                  // If still no balance, show 0 but don't fail
                  if (!balanceFound) {
                    console.log('Could not detect balance, showing 0');
                    walletData.balance = '0';
                  }
                } catch (balErr) {
                  console.log('Balance error:', balErr);
                  walletData.balance = '0';
                }
                
                connected = true;
                console.log('Connected to', walletData.walletName, 'with address:', walletData.address);
                toast.success(walletData.walletName + ' connected! Address saved.');
                break;
              } catch (err) {
                console.log('Failed to connect ' + walletName + ':', err);
                lastError = err;
              }
            }
          }
          
          if (!connected) {
            toast.error(lastError ? 'Connection failed: ' + lastError.message : 'No Cardano wallet found. Please install Nami, Yoroi, Flint, or Lace.');
            setIsConnecting(false);
            return null;
          }
        } else {
          toast.error('No Cardano wallet found. Please install a Cardano wallet like Nami, Yoroi, Flint, or Lace.');
          setIsConnecting(false);
          return null;
        }
      }

      setConnectedWallet(walletData);
      setWalletBalance(walletData.balance);
      
      // Update form data with wallet info
      setFormData(prev => ({
        ...prev,
        walletNumber: walletData.address,
        nickname: walletData.walletName + ' - ' + walletData.address.slice(0, 10) + '...'
      }));
      
      return walletData;
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet: ' + error.message);
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Reset connected wallet when wallet type changes
    if (name === 'walletType') {
      setConnectedWallet(null);
      setWalletBalance(null);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'wallet',
      cardNumber: '',
      cardHolderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      upiId: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      walletType: 'ethereum',
      walletNumber: '',
      isDefault: false,
      nickname: ''
    });
    setEditingMethod(null);
    setShowAddForm(false);
    setConnectedWallet(null);
    setWalletBalance(null);
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
    <div className='w-full min-h-screen bg-blue-50 pt-24 md:pt-20 lg:pt-24 px-2 md:px-6 lg:px-8 pb-20 overflow-x-hidden'>
      <div className='max-w-6xl mx-auto'>
        <Title text1={'PAYMENT'} text2={'SETTING'} />
        
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
          <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-300 overflow-hidden'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>
              {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
            </h3>
            
            {/* Payment Type Selection */}
            <div className='mb-6'>
              <label className='block text-gray-700 mb-3 text-sm md:text-base font-semibold'>Payment Type</label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4'>
                {[
                  { type: 'card', label: 'Card', icon: <FaCreditCard className='text-xl md:text-2xl' />, desc: 'Credit/Debit' },
                  { type: 'upi', label: 'UPI', icon: <FaWallet className='text-xl md:text-2xl' />, desc: 'BHIM, GPay' },
                  { type: 'netbanking', label: 'Net Banking', icon: <FaUniversity className='text-xl md:text-2xl' />, desc: 'Bank Transfer' },
                  { type: 'wallet', label: 'Crypto', icon: <FaWallet className='text-xl md:text-2xl' />, desc: 'ETH, ADA, BTC' }
                ].map(({ type, label, icon, desc }) => (
                  <button
                    key={type}
                    type='button'
                    onClick={() => {
                      setSelectedType(type);
                      // Reset wallet info when switching to wallet type
                      if (type === 'wallet') {
                        setFormData(prev => ({ ...prev, type, walletType: 'ethereum' }));
                        setConnectedWallet(null);
                        setWalletBalance(null);
                      } else {
                        setFormData(prev => ({ ...prev, type }));
                      }
                    }}
                    className={`p-3 md:p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedType === type 
                        ? 'border-blue-500 bg-blue-500/20 shadow-md' 
                        : 'border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <div className='flex flex-col items-center gap-1 md:gap-2 text-gray-700'>
                      {icon}
                      <span className='text-sm md:text-base font-medium'>{label}</span>
                      <span className='text-xs text-gray-500 hidden md:block'>{desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className='space-y-4 overflow-hidden'>
              {/* Nickname
              <div>
                <label className='block text-gray-700 mb-2'>Nickname (Optional)</label>
                <input
                  type='text'
                  name='nickname'
                  value={formData.nickname}
                  onChange={handleInputChange}
                  className='w-full p-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:outline-none'
                  placeholder='e.g., Personal Card, Work Account'
                />
              </div> */}

              {/* Card Details */}
              {selectedType === 'card' && (
                <>
                  <div>
                    <label className='block text-gray-700 mb-2'>Card Holder Name *</label>
                    <input
                      type='text'
                      name='cardHolderName'
                      value={formData.cardHolderName}
                      onChange={handleInputChange}
                      className='w-full p-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:outline-none'
                      placeholder='Enter cardholder name'
                      required
                    />
                  </div>
                  
                  <div>
                    <label className='block text-gray-700 mb-2'>Card Number *</label>
                    <input
                      type='text'
                      name='cardNumber'
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className='w-full p-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:outline-none'
                      placeholder='1234 5678 9012 3456'
                      maxLength='19'
                      required
                    />
                  </div>
                  
                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-gray-700 mb-2'>Expiry Month *</label>
                      <select
                        name='expiryMonth'
                        value={formData.expiryMonth}
                        onChange={handleInputChange}
                        className='w-full p-3 rounded-lg bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:outline-none'
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
                      <label className='block text-gray-700 mb-2'>Expiry Year *</label>
                      <select
                        name='expiryYear'
                        value={formData.expiryYear}
                        onChange={handleInputChange}
                        className='w-full p-3 rounded-lg bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:outline-none'
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
                      <label className='block text-gray-700 mb-2'>CVV *</label>
                      <input
                        type='password'
                        name='cvv'
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className='w-full p-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:outline-none'
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
                  <label className='block text-gray-700 mb-2'>UPI ID *</label>
                  <input
                    type='text'
                    name='upiId'
                    value={formData.upiId}
                    onChange={handleInputChange}
                    className='w-full p-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:outline-none'
                    placeholder='yourname@paytm'
                    required
                  />
                </div>
              )}

              {/* Net Banking Details */}
              {selectedType === 'netbanking' && (
                <>
                  <div>
                    <label className='block text-gray-700 mb-2'>Bank Name *</label>
                    <input
                      type='text'
                      name='bankName'
                      value={formData.bankName}
                      onChange={handleInputChange}
                      className='w-full p-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:outline-none'
                      placeholder='Enter bank name'
                      required
                    />
                  </div>
                  
                  <div>
                    <label className='block text-gray-700 mb-2'>Account Number *</label>
                    <input
                      type='text'
                      name='accountNumber'
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className='w-full p-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:outline-none'
                      placeholder='Enter account number'
                      required
                    />
                  </div>
                  
                  <div>
                    <label className='block text-gray-700 mb-2'>IFSC Code *</label>
                    <input
                      type='text'
                      name='ifscCode'
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      className='w-full p-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:outline-none'
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
                    <label className='block text-gray-700 mb-2 text-sm md:text-base'>Wallet Type *</label>
                    <select
                      name='walletType'
                      value={formData.walletType}
                      onChange={handleInputChange}
                      className='w-full p-3 md:p-4 rounded-lg bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:outline-none text-sm md:text-base'
                      required
                    >
                      <option value='ethereum' className='text-black'>Ethereum (ETH)</option>
                      <option value='cardano' className='text-black'>Cardano (ADA)</option>
                      <option value='bitcoin' className='text-black'>Bitcoin (BTC)</option>
                    </select>
                  </div>
                  
                  {/* Connect Wallet Button */}
                  <button
                    type='button'
                    onClick={() => connectBlockchainWallet(formData.walletType)}
                    disabled={isConnecting}
                    className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 md:px-6 py-3 md:py-4 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base font-semibold shadow-md hover:shadow-lg'
                  >
                    {isConnecting ? (
                      <>
                        <span className='animate-spin text-lg'>⟳</span> <span className='text-sm md:text-base'>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <FaWallet className='text-lg' /> Connect {formData.walletType === 'ethereum' ? 'MetaMask' : formData.walletType === 'cardano' ? 'Cardano' : 'Bitcoin'} Wallet
                      </>
                    )}
                  </button>
                  
                  {/* Connected Wallet Info */}
                  {connectedWallet && (
                    <div className='bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3 shadow-sm'>
                      <div className='flex items-center justify-between gap-2 mb-2'>
                        <div className='flex items-center gap-2 min-w-0'>
                          <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0'></span>
                          <span className='text-green-700 font-bold text-sm truncate'>{connectedWallet.walletName} Connected</span>
                        </div>
                        <span className='text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0'>
                          {connectedWallet.network || (formData.walletType === 'cardano' ? 'Preprod' : 'Sepolia')} Testnet
                        </span>
                      </div>
                      
                      <div className='bg-white rounded-lg p-2 mb-2 border border-green-100 overflow-hidden'>
                        <div className='flex items-center gap-1 mb-1'>
                          <span className='text-xs text-gray-500 whitespace-nowrap'>Address:</span>
                        </div>
                        <div className='overflow-x-auto max-w-full scrollbar-thin'>
                          <p className='text-xs font-mono text-gray-800 whitespace-nowrap bg-gray-50 px-2 py-1 rounded w-max'>
                            {connectedWallet.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className='block text-gray-700 mb-2 text-sm md:text-base'>
                      {['ethereum', 'cardano', 'bitcoin'].includes(formData.walletType) ? 'Wallet Address *' : 'Wallet Number *'}
                    </label>
                    <input
                      type='text'
                      name='walletNumber'
                      value={formData.walletNumber}
                      onChange={handleInputChange}
                      className='w-full p-2 md:p-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:outline-none text-xs md:text-sm font-mono'
                      placeholder={
                        ['ethereum', 'cardano', 'bitcoin'].includes(formData.walletType) 
                          ? 'Auto-filled after connecting' 
                          : 'Enter wallet number'
                      }
                      readOnly
                      style={{ fontSize: '11px' }}
                    />
                  </div>
                </>
              )}

              {/* Default Payment Method Checkbox */}
              <div>
                <label className='flex items-center gap-2 text-gray-700 cursor-pointer'>
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
              <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 md:py-4 rounded-lg transition-all duration-300 disabled:opacity-50 font-semibold shadow-md hover:shadow-lg text-sm md:text-base'
                >
                  {loading ? 'Saving...' : (editingMethod ? 'Update Method' : 'Save Method')}
                </button>
                <button
                  type='button'
                  onClick={resetForm}
                  className='w-full sm:w-auto bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 md:py-4 rounded-lg transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-sm md:text-base'
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
            <div key={method._id} className='bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-sm'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  {getPaymentIcon(method.type)}
                  <span className='text-gray-800 font-semibold capitalize'>{method.type}</span>
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

              <div className='text-gray-800 space-y-2'>
                {method.nickname && (
                  <p className='font-semibold text-blue-600'>{method.nickname}</p>
                )}
                
                {method.type === 'card' && (
                  <>
                    <p className='text-sm text-gray-600'>{method.cardHolderName}</p>
                    <p className='text-sm text-gray-600'>{maskCardNumber(method.cardNumber)}</p>
                    <p className='text-sm text-gray-600'>Expires: {method.expiryMonth}/{method.expiryYear}</p>
                  </>
                )}
                
                {method.type === 'upi' && (
                  <p className='text-sm text-gray-600'>{method.upiId}</p>
                )}
                
                {method.type === 'netbanking' && (
                  <>
                    <p className='text-sm text-gray-600'>{method.bankName}</p>
                    <p className='text-sm text-gray-600'>Account: {maskAccountNumber(method.accountNumber)}</p>
                    <p className='text-sm text-gray-600'>IFSC: {method.ifscCode}</p>
                  </>
                )}
                
                {method.type === 'wallet' && (
                  <>
                    <p className='text-sm text-gray-600 capitalize'>
                      {method.walletType === 'ethereum' ? 'Ethereum (ETH)' : 
                       method.walletType === 'cardano' ? 'Cardano (ADA)' : 
                       method.walletType === 'bitcoin' ? 'Bitcoin (BTC)' : 
                       method.walletType}
                    </p>
                    <p className='text-sm text-gray-600'>{method.walletNumber}</p>
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
            <p className='text-gray-800 text-xl mb-4'>No payment methods found</p>
            <p className='text-gray-600 mb-6'>Add your first payment method to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300'
            >
              Add Payment Method
            </button>
          </div>
        )}

        {/* Cash on Delivery Option */}
        <div className='mt-8 bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            <FaCheck className='text-green-500 text-xl' />
            <h3 className='text-xl font-semibold text-gray-800'>Cash on Delivery</h3>
          </div>
          <p className='text-gray-600 mb-4'>
            Pay with cash when your order is delivered. Available for orders up to ₹50,000.
          </p>
          <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
            <p className='text-green-700 text-sm'>
              ✓ Cash on Delivery is always available as a payment option during checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSettings;
