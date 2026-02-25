import React, { useState, useContext, useEffect } from 'react';
import { FaBox, FaUndo, FaDownload, FaPrint, FaSearch, FaFilter } from 'react-icons/fa';
import { authDataContext } from '../context/authContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../component/Title';

function Returns() {
  // const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('eligible'); // eligible, requested, completed
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
    loadReturns();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverUrl}/api/order/userorders`, { withCredentials: true });
      // Filter orders that are eligible for return (delivered and within return window)
      const eligibleOrders = response.data.orders?.filter(order =>
        order.status === 'Delivered' &&
        isWithinReturnWindow(order.date)
      ) || [];
      setOrders(eligibleOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      // toast.error('Failed to load orders'); // Removed error popup
    } finally {
      setLoading(false);
    }
  };

  const loadReturns = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/returns/user`, { withCredentials: true });
      setReturns(response.data.returns || []);
    } catch (error) {
      console.error('Error loading returns:', error);
    }
  };

  const isWithinReturnWindow = (orderDate) => {
    const orderTime = new Date(orderDate);
    const currentTime = new Date();
    const daysDiff = (currentTime - orderTime) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30; // 30 days return window
  };

  const getDaysLeft = (orderDate) => {
    const orderTime = new Date(orderDate);
    const currentTime = new Date();
    const daysDiff = (currentTime - orderTime) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(30 - daysDiff));
  };

  const handleReturnRequest = async (e) => {
    e.preventDefault();
    
    if (!returnReason || !returnDescription) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${serverUrl}/api/returns/request`, {
        orderId: selectedOrder._id,
        reason: returnReason,
        description: returnDescription,
        items: selectedOrder.items
      }, { withCredentials: true });
      
      toast.success('Return request submitted successfully');
      setShowReturnForm(false);
      setSelectedOrder(null);
      setReturnReason('');
      setReturnDescription('');
      loadReturns();
      loadOrders();
    } catch (error) {
      console.error('Error submitting return request:', error);
      toast.error('Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  const generateReturnLabel = async (returnId) => {
    try {
      const response = await axios.get(`${serverUrl}/api/returns/${returnId}/label`, { 
        withCredentials: true,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `return-label-${returnId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Return label downloaded successfully');
    } catch (error) {
      console.error('Error generating return label:', error);
      toast.error('Failed to generate return label');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Requested': return 'text-yellow-400';
      case 'Approved': return 'text-blue-400';
      case 'Picked Up': return 'text-purple-400';
      case 'Completed': return 'text-green-400';
      case 'Rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredOrders = orders.filter(order =>
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredReturns = returns.filter(returnItem =>
    returnItem.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='w-full min-h-screen bg-blue-50 pt-24 md:pt-20 lg:pt-24 px-4 md:px-6 lg:px-8 pb-20'>
      <div className='max-w-6xl mx-auto'>
        <Title text1={'RETURNS &'} text2={'REFUNDS'} />
        
        {/* Search Bar */}
        <div className='mb-6'>
          <div className='relative'>
            <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search by order ID or product name...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:outline-none'
            />
          </div>
        </div>

        {/* Tabs */}
        <div className='flex flex-wrap gap-2 mb-6'>
          {[
            { key: 'eligible', label: 'Eligible for Return', count: filteredOrders.length },
            { key: 'requested', label: 'Return Requests', count: filteredReturns.filter(r => ['Requested', 'Approved', 'Picked Up'].includes(r.status)).length },
            { key: 'completed', label: 'Completed Returns', count: filteredReturns.filter(r => ['Completed', 'Rejected'].includes(r.status)).length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === tab.key 
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Eligible Orders Tab */}
        {activeTab === 'eligible' && (
          <div className='space-y-4'>
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
              <h3 className='text-blue-800 font-semibold mb-2'>Return Policy</h3>
              <ul className='text-blue-700 text-sm space-y-1'>
                <li>• Returns accepted within 30 days of delivery</li>
                <li>• Items must be in original condition with tags</li>
                <li>• Free return pickup for eligible items</li>
                <li>• Refund processed within 7-10 business days</li>
              </ul>
            </div>

            {filteredOrders.map((order) => (
              <div key={order._id} className='bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-sm'>
                <div className='flex flex-col md:flex-row md:items-center justify-between mb-4'>
                  <div>
                    <h3 className='text-gray-800 font-semibold'>Order #{order._id}</h3>
                    <p className='text-gray-600 text-sm'>
                      Delivered on {new Date(order.date).toLocaleDateString()}
                    </p>
                    <p className='text-orange-600 text-sm'>
                      {getDaysLeft(order.date)} days left to return
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowReturnForm(true);
                    }}
                    className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 mt-4 md:mt-0'
                  >
                    Request Return
                  </button>
                </div>

                <div className='space-y-3'>
                  {order.items.map((item, index) => (
                    <div key={index} className='flex items-center gap-4 bg-gray-50 rounded-lg p-3'>
                      <img
                        src={item.image1}
                        alt={item.name}
                        className='w-16 h-16 object-cover rounded-lg'
                      />
                      <div className='flex-1'>
                        <h4 className='text-gray-800 font-medium'>{item.name}</h4>
                        <p className='text-gray-600 text-sm'>Size: {item.size}</p>
                        <p className='text-gray-600 text-sm'>Quantity: {item.quantity}</p>
                        <p className='text-green-600 font-semibold'>₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className='text-center py-12'>
                <FaBox className='text-6xl text-gray-500 mx-auto mb-4' />
                <p className='text-gray-800 text-xl mb-4'>No orders eligible for return</p>
                <p className='text-gray-600'>Orders are eligible for return within 30 days of delivery</p>
              </div>
            )}
          </div>
        )}

        {/* Return Requests Tab */}
        {activeTab === 'requested' && (
          <div className='space-y-4'>
            {filteredReturns.filter(r => ['Requested', 'Approved', 'Picked Up'].includes(r.status)).map((returnItem) => (
              <div key={returnItem._id} className='bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-sm'>
                <div className='flex flex-col md:flex-row md:items-center justify-between mb-4'>
                  <div>
                    <h3 className='text-gray-800 font-semibold'>Return Request #{returnItem._id}</h3>
                    <p className='text-gray-600 text-sm'>Order: {returnItem.orderId}</p>
                    <p className={`text-sm font-semibold ${getStatusColor(returnItem.status)}`}>
                      Status: {returnItem.status}
                    </p>
                  </div>
                  {returnItem.status === 'Approved' && (
                    <div className='flex gap-2 mt-4 md:mt-0'>
                      <button
                        onClick={() => generateReturnLabel(returnItem._id)}
                        className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300'
                      >
                        <FaDownload /> Download Label
                      </button>
                    </div>
                  )}
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='text-gray-800 mb-2'><strong>Reason:</strong> {returnItem.reason}</p>
                  <p className='text-gray-600'><strong>Description:</strong> {returnItem.description}</p>
                  <p className='text-gray-600 text-sm mt-2'>
                    Requested on: {new Date(returnItem.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {filteredReturns.filter(r => ['Requested', 'Approved', 'Picked Up'].includes(r.status)).length === 0 && (
              <div className='text-center py-12'>
                <FaUndo className='text-6xl text-gray-500 mx-auto mb-4' />
                <p className='text-gray-800 text-xl mb-4'>No active return requests</p>
                <p className='text-gray-600'>Your return requests will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Completed Returns Tab */}
        {activeTab === 'completed' && (
          <div className='space-y-4'>
            {filteredReturns.filter(r => ['Completed', 'Rejected'].includes(r.status)).map((returnItem) => (
              <div key={returnItem._id} className='bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-sm'>
                <div className='flex flex-col md:flex-row md:items-center justify-between mb-4'>
                  <div>
                    <h3 className='text-gray-800 font-semibold'>Return #{returnItem._id}</h3>
                    <p className='text-gray-600 text-sm'>Order: {returnItem.orderId}</p>
                    <p className={`text-sm font-semibold ${getStatusColor(returnItem.status)}`}>
                      Status: {returnItem.status}
                    </p>
                  </div>
                  {returnItem.status === 'Completed' && returnItem.refundAmount && (
                    <div className='bg-green-50 border border-green-200 rounded-lg p-3 mt-4 md:mt-0'>
                      <p className='text-green-700 font-semibold'>
                        Refunded: ₹{returnItem.refundAmount}
                      </p>
                    </div>
                  )}
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='text-gray-800 mb-2'><strong>Reason:</strong> {returnItem.reason}</p>
                  <p className='text-gray-600'><strong>Description:</strong> {returnItem.description}</p>
                  <div className='flex flex-col md:flex-row gap-4 mt-3 text-sm text-gray-600'>
                    <p>Requested: {new Date(returnItem.createdAt).toLocaleDateString()}</p>
                    {returnItem.completedAt && (
                      <p>Completed: {new Date(returnItem.completedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredReturns.filter(r => ['Completed', 'Rejected'].includes(r.status)).length === 0 && (
              <div className='text-center py-12'>
                <FaUndo className='text-6xl text-gray-500 mx-auto mb-4' />
                <p className='text-gray-800 text-xl mb-4'>No completed returns</p>
                <p className='text-gray-600'>Completed returns will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Return Request Form Modal */}
        {showReturnForm && selectedOrder && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto'>
              <h3 className='text-xl font-semibold text-white mb-4'>Request Return</h3>
              
              <div className='mb-4'>
                <p className='text-gray-300 text-sm'>Order: {selectedOrder._id}</p>
                <p className='text-gray-300 text-sm'>
                  Delivered: {new Date(selectedOrder.date).toLocaleDateString()}
                </p>
              </div>

              <form onSubmit={handleReturnRequest} className='space-y-4'>
                <div>
                  <label className='block text-white mb-2'>Return Reason *</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className='w-full p-3 rounded-lg bg-white/20 text-white border border-gray-600 focus:border-blue-500 focus:outline-none'
                    required
                  >
                    <option value='' className='text-black'>Select reason</option>
                    <option value='defective' className='text-black'>Defective product</option>
                    <option value='wrong-item' className='text-black'>Wrong item received</option>
                    <option value='size-issue' className='text-black'>Size doesn't fit</option>
                    <option value='quality-issue' className='text-black'>Quality not as expected</option>
                    <option value='damaged' className='text-black'>Damaged during shipping</option>
                    <option value='not-needed' className='text-black'>No longer needed</option>
                    <option value='other' className='text-black'>Other</option>
                  </select>
                </div>

                <div>
                  <label className='block text-white mb-2'>Description *</label>
                  <textarea
                    value={returnDescription}
                    onChange={(e) => setReturnDescription(e.target.value)}
                    className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                    placeholder='Please provide details about the issue...'
                    rows='4'
                    required
                  />
                </div>

                <div className='flex gap-4'>
                  <button
                    type='submit'
                    disabled={loading}
                    className='flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors duration-300 disabled:opacity-50'
                  >
                    {loading ? 'Submitting...' : 'Submit Return Request'}
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setShowReturnForm(false);
                      setSelectedOrder(null);
                      setReturnReason('');
                      setReturnDescription('');
                    }}
                    className='flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors duration-300'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Returns;
