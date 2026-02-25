import React, { useContext, useEffect, useState } from 'react'
import Title from '../component/Title'
import { shopDataContext } from '../context/ShopContext'
import { authDataContext } from '../context/authContext'
import axios from 'axios'
import { toast } from 'react-toastify'

function Order() {
    let [orderData,setOrderData] = useState([])
    let [trackingInfo, setTrackingInfo] = useState(null)
    let [showTracking, setShowTracking] = useState(false)
    let {currency} = useContext(shopDataContext)
    let {serverUrl} = useContext(authDataContext)
    // let {token} = useContext(userDataContext)

    const loadOrderData = async () => {
       try {
      const result = await axios.post(serverUrl + '/api/order/userorder',{},{withCredentials:true})
      if(result.data){
        let allOrdersItem = []
        result.data.map((order)=>{
          order.items.map((item)=>{
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            allOrdersItem.push(item)
          })
        })
        setOrderData(allOrdersItem.reverse())
      }
    } catch (error) {
      console.log(error)
    }
    }

const trackOrder = (orderItem) => {
    // Mock tracking information based on order status
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
        { step: 'Order Placed', completed: true, date: 'Order Date' },
        { step: 'Order Confirmed', completed: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status), date: '1-2 days' },
        { step: 'Order Processed', completed: ['Shipped', 'Out for Delivery', 'Delivered'].includes(status), date: '2-3 days' },
        { step: 'Shipped', completed: ['Shipped', 'Out for Delivery', 'Delivered'].includes(status), date: '3-5 days' },
        { step: 'Out for Delivery', completed: ['Out for Delivery', 'Delivered'].includes(status), date: '5-6 days' },
        { step: 'Delivered', completed: status === 'Delivered', date: '6-7 days' }
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

useEffect(()=>{
 loadOrderData()
},[])


  return (
    <div className='w-[99vw] min-h-[100vh] p-4 md:p-5 lg:p-[20px] pb-32 md:pb-36 lg:pb-[150px] overflow-hidden bg-blue-50 pt-24 md:pt-20 lg:pt-24'>
      <div className='h-[8%] w-[100%] text-center' style={{marginTop: '20px'}}>
        <Title text1={'MY'} text2={'ORDER'} />
      </div>
      <div className=' w-[100%] h-[92%] flex flex-wrap gap-[20px]'>
        {
         orderData.map((item,index)=>(
            <div key={index} className='w-[100%] h-[10%] border-t border-b '>
                <div className='w-[100%] h-[80%] flex items-start gap-6 bg-white/80  py-[10px] px-[20px] rounded-2xl relative border border-gray-300'>
                    <img src={item.image1} alt="" className='w-[130px] h-[130px] rounded-md '/>
                    <div className='flex items-start justify-center flex-col gap-[5px]'>
                    <p className='md:text-[25px] text-[20px] text-gray-800'>{item.name}</p>
                    <div className='flex items-center gap-[8px]   md:gap-[20px]'>
                        <p className='md:text-[18px] text-[12px] text-blue-600'>{currency} {item.price}</p>
                      <p className='md:text-[18px] text-[12px] text-gray-600'>Quantity: {item.quantity}</p>
                      <p className='md:text-[18px] text-[12px] text-gray-600'>Size: {item.size}</p>
                    </div>
                    <div className='flex items-center'>
                     <p className='md:text-[18px] text-[12px] text-gray-600'>Date: <span className='text-gray-800 pl-[10px] md:text-[16px] text-[11px] font-medium'>{new Date(item.date).toDateString()}</span></p>
                    </div>
                    <div className='flex items-center'>
                      <p className='md:text-[16px] text-[12px] text-gray-600'>Payment Method :{item.paymentMethod}</p>
                    </div>
                    <div className='absolute md:left-[55%] md:top-[40%] right-[2%] top-[2%]  '>
                        <div className='flex items-center gap-[5px]'>
                      <p className='min-w-2 h-2 rounded-full bg-green-500'></p> 
                      <p className='md:text-[17px] text-[10px] text-gray-800'>{item.status}</p>

                    </div>

                    </div>
                     <div className='absolute md:right-[5%] right-[1%] md:top-[40%] top-[70%]'>
                   <button className='md:px-[15px] px-[5px] py-[3px] md:py-[7px] rounded-md bg-blue-600 text-white text-[12px] md:text-[16px] cursor-pointer active:bg-blue-700 hover:bg-blue-700 transition-colors' onClick={() => trackOrder(item)} >Track Order</button>
                 </div>
                    </div>
                </div>
               
            </div>
         ))
        }

        {/* Order Tracking Modal */}
        {showTracking && trackingInfo && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
              <div className='p-6 border-b'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-2xl font-bold text-gray-800'>Order Tracking</h2>
                  <button
                    onClick={() => setShowTracking(false)}
                    className='text-gray-500 hover:text-gray-700 text-2xl'
                  >
                    ×
                  </button>
                </div>
                <div className='mt-4'>
                  <p className='text-gray-600'>Order ID: <span className='font-semibold'>{trackingInfo.orderId}</span></p>
                  <p className='text-gray-600'>Status: <span className='font-semibold text-blue-600'>{trackingInfo.status}</span></p>
                  <p className='text-gray-600'>Estimated Delivery: <span className='font-semibold'>{trackingInfo.estimatedDelivery}</span></p>
                  <p className='text-gray-600'>Current Location: <span className='font-semibold'>{trackingInfo.currentLocation}</span></p>
                </div>
              </div>

              <div className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>Tracking Timeline</h3>
                <div className='space-y-4'>
                  {trackingInfo.trackingSteps.map((step, index) => (
                    <div key={index} className='flex items-center space-x-4'>
                      <div className={`w-4 h-4 rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className='flex-1'>
                        <p className={`font-medium ${step.completed ? 'text-green-600' : 'text-gray-500'}`}>
                          {step.step}
                        </p>
                        <p className='text-sm text-gray-500'>{step.date}</p>
                      </div>
                      {step.completed && (
                        <div className='text-green-500'>
                          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className='p-6 border-t bg-gray-50'>
                <button
                  onClick={() => setShowTracking(false)}
                  className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Close Tracking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Order
