import React, { useContext, useEffect, useState } from 'react'
import Title from '../component/Title'
import { shopDataContext } from '../context/ShopContext'
import { authDataContext } from '../context/authContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Invoice from '../component/Invoice'

function Order() {
    let [orderData,setOrderData] = useState([])
    let [orders, setOrders] = useState([])
    let [trackingInfo, setTrackingInfo] = useState(null)
    let [showTracking, setShowTracking] = useState(false)
    let [showInvoice, setShowInvoice] = useState(false)
    let [selectedOrderId, setSelectedOrderId] = useState(null)
    let [loading, setLoading] = useState(true)
    let {currency} = useContext(shopDataContext)
    let {serverUrl} = useContext(authDataContext)

    const loadOrderData = async () => {
       try {
      const result = await axios.post(serverUrl + '/api/order/userorder',{},{withCredentials:true})
      if(result.data){
        let allOrdersItem = []
        result.data.map((order, orderIndex)=>{
          order.items.map((item, itemIndex)=>{
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            item['orderId'] = order._id
            item['itemIndex'] = itemIndex.toString()
            allOrdersItem.push(item)
          })
        })
        setOrders(result.data)
        setOrderData(allOrdersItem.reverse())
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
  }
    }

    const downloadInvoice = (orderId, itemId) => {
        setSelectedOrderId({ orderId, itemId })
        setShowInvoice(true)
    }

const trackOrder = (orderItem) => {
    const trackingData = {
        orderId: orderItem._id || 'N/A',
        status: orderItem.status,
        estimatedDelivery: getEstimatedDelivery(orderItem.status, orderItem.date),
        trackingSteps: getTrackingSteps(orderItem.status),
        currentLocation: getCurrentLocation(orderItem.status)
    };

    setTrackingInfo(trackingData);
    setShowTracking(true);
    toast.info(`Tracking order: ${trackingData.orderId}`);
};

const getEstimatedDelivery = (status, orderDate) => {
    const orderDateObj = new Date(orderDate);
    const deliveryDays = status === 'Delivered' ? 0 :
                        status === 'Out for Delivery' ? 1 :
                        status === 'Shipped' ? 3 :
                        status === 'Processing' ? 5 : 7;

    const deliveryDate = new Date(orderDateObj);
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    return deliveryDate.toDateString();
};

const getTrackingSteps = (status) => {
    const allSteps = [
        { step: 'Order Placed', completed: true, date: 'Order Date', icon: '📝' },
        { step: 'Order Confirmed', completed: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status), date: '1-2 days', icon: '✅' },
        { step: 'Order Processed', completed: ['Shipped', 'Out for Delivery', 'Delivered'].includes(status), date: '2-3 days', icon: '📦' },
        { step: 'Shipped', completed: ['Shipped', 'Out for Delivery', 'Delivered'].includes(status), date: '3-5 days', icon: '🚚' },
        { step: 'Out for Delivery', completed: ['Out for Delivery', 'Delivered'].includes(status), date: '5-6 days', icon: '🏃' },
        { step: 'Delivered', completed: status === 'Delivered', date: '6-7 days', icon: '🎉' }
    ];
    return allSteps;
};

const getCurrentLocation = (status) => {
    const locations = {
        'Processing': 'Warehouse - Order being prepared',
        'Shipped': 'Distribution Center - Package shipped',
        'Out for Delivery': 'Local Delivery Hub - Out for delivery',
        'Delivered': 'Delivered to customer'
    };
    return locations[status] || 'Order placed, awaiting processing';
};

const getStatusColor = (status) => {
    switch(status) {
        case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
        case 'Out for Delivery': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const getStatusDotColor = (status) => {
    switch(status) {
        case 'Delivered': return 'bg-green-500';
        case 'Out for Delivery': return 'bg-orange-500';
        case 'Shipped': return 'bg-blue-500';
        case 'Processing': return 'bg-yellow-500';
        default: return 'bg-gray-500';
    }
};

useEffect(()=>{
 loadOrderData()
},[])


  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-3 md:px-5 lg:px-8 pb-32 md:pb-36 lg:pb-[150px] pt-20 md:pt-24 lg:pt-28'>
      <div className='max-w-4xl mx-auto'>
        {/* Header Section */}
        <div className='text-center mb-8 md:mb-10'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4'>
            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
            </svg>
          </div>
          <Title text1={'MY'} text2={'ORDERS'} />
          <p className='text-gray-500 mt-2 text-sm md:text-base'>Track your orders and download bills</p>
        </div>
        
        {loading ? (
          // Loading Skeleton
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='bg-white rounded-2xl p-6 animate-pulse'>
                <div className='flex gap-6'>
                  <div className='w-32 h-32 bg-gray-200 rounded-xl'></div>
                  <div className='flex-1 space-y-3'>
                    <div className='h-5 bg-gray-200 rounded w-3/4'></div>
                    <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                    <div className='h-4 bg-gray-200 rounded w-1/3'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orderData.length === 0 ? (
          // Empty State
          <div className='text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100'>
            <div className='relative inline-block mb-6'>
              <div className='w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto'>
                <span className='text-5xl'>📦</span>
              </div>
              <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm'>+</div>
            </div>
            <h3 className='text-2xl font-bold text-gray-800 mb-2'>No Orders Yet</h3>
            <p className='text-gray-500 mb-6 max-w-sm mx-auto'>You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <button className='px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'>
              Start Shopping
            </button>
          </div>
        ) : (
          // Orders List
          <div className='space-y-5 md:space-y-6'>
            {orderData.map((item, index) => (
              <div 
                key={index} 
                className='bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100/50 overflow-hidden group'
              >
                {/* Order Header */}
                <div className='bg-gradient-to-r from-gray-50 to-white px-5 md:px-6 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                      <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                    </div>
                    <div>
                      <span className='text-xs text-gray-400 block'>Order Date</span>
                      <span className='text-sm font-semibold text-gray-700'>
                        {new Date(item.date).toDateString()}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-400'>Payment</span>
                    <span className='text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100'>
                      {item.paymentMethod}
                    </span>
                  </div>
                </div>
                
                {/* Order Content */}
                <div className='p-4 md:p-6'>
                  <div className='flex flex-col lg:flex-row gap-5 md:gap-6'>
                    {/* Product Image */}
                    <div className='flex-shrink-0 relative'>
                      <div className='relative overflow-hidden rounded-xl'>
                        <img 
                          src={item.image1} 
                          alt={item.name} 
                          className='w-full lg:w-[160px] h-[140px] lg:h-[160px] object-cover transition-transform duration-300 group-hover:scale-105'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity'></div>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex flex-wrap items-start justify-between gap-3 mb-3'>
                        <h3 className='text-lg md:text-xl font-bold text-gray-800 line-clamp-2 flex-1'>
                          {item.name}
                        </h3>
                        {/* Status Badge */}
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(item.status)}`}>
                          <span className={`w-2 h-2 rounded-full ${getStatusDotColor(item.status)}`}></span>
                          {item.status}
                        </span>
                      </div>
                      
                      {/* Order Info Grid */}
                      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4'>
                        <div className='bg-gray-50 rounded-lg p-3'>
                          <span className='text-xs text-gray-400 block mb-1'>Price</span>
                          <span className='text-lg font-bold text-indigo-600'>{currency}{item.price}</span>
                        </div>
                        <div className='bg-gray-50 rounded-lg p-3'>
                          <span className='text-xs text-gray-400 block mb-1'>Quantity</span>
                          <span className='text-lg font-semibold text-gray-700'>{item.quantity}</span>
                        </div>
                        <div className='bg-gray-50 rounded-lg p-3'>
                          <span className='text-xs text-gray-400 block mb-1'>Size</span>
                          <span className='text-lg font-semibold text-gray-700'>{item.size}</span>
                        </div>
                        <div className='bg-gray-50 rounded-lg p-3'>
                          <span className='text-xs text-gray-400 block mb-1'>Total</span>
                          <span className='text-lg font-bold text-gray-800'>{currency}{item.price * item.quantity}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className='flex flex-wrap gap-3'>
                        <button 
                          className='flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                          onClick={() => trackOrder(item)}
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                          </svg>
                          Track Order
                        </button>
                        <button 
                          className='flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium cursor-pointer hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                          onClick={() => downloadInvoice(item.orderId, item.itemIndex)}
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                          </svg>
                          Download Bill
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Order Tracking Modal */}
        {showTracking && trackingInfo && (
          <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all'>
              {/* Modal Header */}
              <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-3xl'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center'>
                      <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                    </div>
                    <h2 className='text-xl md:text-2xl font-bold text-white'>Order Tracking</h2>
                  </div>
                  <button
                    onClick={() => setShowTracking(false)}
                    className='w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors'
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Order Info */}
              <div className='p-6 border-b border-gray-100'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-gray-50 rounded-xl p-4'>
                    <span className='text-xs text-gray-400 block mb-1'>Order ID</span>
                    <span className='text-sm font-semibold text-gray-800 break-all'>#{trackingInfo.orderId.slice(-8)}</span>
                  </div>
                  <div className='bg-gray-50 rounded-xl p-4'>
                    <span className='text-xs text-gray-400 block mb-1'>Status</span>
                    <span className='text-sm font-bold text-indigo-600'>{trackingInfo.status}</span>
                  </div>
                  <div className='bg-gray-50 rounded-xl p-4'>
                    <span className='text-xs text-gray-400 block mb-1'>Estimated Delivery</span>
                    <span className='text-sm font-semibold text-gray-800'>{trackingInfo.estimatedDelivery}</span>
                  </div>
                  <div className='bg-gray-50 rounded-xl p-4'>
                    <span className='text-xs text-gray-400 block mb-1'>Location</span>
                    <span className='text-sm font-medium text-gray-600'>{trackingInfo.currentLocation}</span>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className='p-6'>
                <h3 className='text-lg font-bold text-gray-800 mb-5 flex items-center gap-2'>
                  <span className='w-2 h-2 bg-indigo-600 rounded-full'></span>
                  Tracking Timeline
                </h3>
                <div className='space-y-1'>
                  {trackingInfo.trackingSteps.map((step, index) => (
                    <div key={index} className={`flex items-start gap-4 ${step.completed ? 'opacity-100' : 'opacity-50'}`}>
                      <div className='flex flex-col items-center'>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {step.icon}
                        </div>
                        {index !== trackingInfo.trackingSteps.length - 1 && (
                          <div className={`w-0.5 h-10 ${step.completed ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                        )}
                      </div>
                      <div className='flex-1 pb-6'>
                        <p className={`font-semibold ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                          {step.step}
                        </p>
                        <p className='text-sm text-gray-500'>{step.date}</p>
                      </div>
                      {step.completed && (
                        <div className='text-green-500 flex-shrink-0 mt-2'>
                          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className='p-6 border-t bg-gray-50 rounded-b-3xl'>
                <button
                  onClick={() => setShowTracking(false)}
                  className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {showInvoice && selectedOrderId && (
            <Invoice 
                orderId={selectedOrderId} 
                onClose={() => {
                    setShowInvoice(false)
                    setSelectedOrderId(null)
                }}
            />
        )}
    </div>
  )
}

export default Order
