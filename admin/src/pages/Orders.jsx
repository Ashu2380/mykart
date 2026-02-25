import React from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { useState } from 'react'
import { useContext } from 'react'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { useEffect } from 'react'
import { SiEbox } from "react-icons/si";

function Orders() {

  let [orders,setOrders] = useState([])
  let {serverUrl} = useContext(authDataContext)

    const fetchAllOrders =async () => {
    try {
      const result = await axios.post(serverUrl + '/api/order/list' , {} ,{withCredentials:true})
      setOrders(result.data.reverse())
      
    } catch (error) {
      console.log(error)
    }
    
  }
   const statusHandler = async (e , orderId) => {
         try {
          const result = await axios.post(serverUrl + '/api/order/status' , {orderId,status:e.target.value},{withCredentials:true})
          if(result.data){
            await fetchAllOrders()
          }
         } catch (error) {
          console.log(error)

         }
  }

  const paymentHandler = async (e, orderId) => {
    try {
      const payment = e.target.value === 'Paid' ? true : false;
      const result = await axios.post(serverUrl + '/api/order/payment-status', { orderId, payment }, { withCredentials: true });
      if (result.data) {
        await fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(()=>{
    fetchAllOrders()
  },[])
  return (
    <div className='w-full min-h-[100vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-[black] overflow-x-hidden relative'>
      <Nav />
      <Sidebar />
      <div className='w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]'>
        <div className='w-full md:w-[90%] h-full mt-0 md:mt-[70px] flex flex-col gap-[20px] md:gap-[30px] py-[20px] md:py-[90px] px-[15px] md:px-[60px]'>
          <div className='w-full md:w-auto text-[24px] md:text-[40px] mb-[20px] text-gray-800 font-bold animate-fade-in'>All Orders List</div>
          {
           orders.map((order,index)=>(
            <div key={index} className='w-full md:w-[90%] lg:w-[95%] xl:w-[90%] h-auto min-h-[40%] bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-300 flex lg:items-center items-start justify-between flex-col lg:flex-row p-[15px] md:px-[25px] gap-[25px] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group animate-fade-in-up hover:bg-white' style={{animationDelay: `${index * 0.05}s`}}>
            <SiEbox  className='w-[70px] h-[70px] text-blue-600 p-[8px] rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md'/>

            <div>
              <div className='flex items-start justify-center flex-col gap-[5px] text-[16px] text-gray-800 break-words group-hover:text-gray-900 transition-colors duration-300'>
                {
                  order.items && order.items.map((item,index)=>{
                    if(index === order.items.length - 1){
                       return <p key={index} className='break-words font-medium'>{item.name ? item.name.toUpperCase() : 'Unknown Item'}  *  {item.quantity || 1} <span className='text-blue-600'>{item.size || 'N/A'}</span></p>

                    }else{
                       return <p key={index} className='break-words font-medium'>{item.name ? item.name.toUpperCase() : 'Unknown Item'}  *  {item.quantity || 1} <span className='text-blue-600'>{item.size || 'N/A'}</span>,</p>

                    }
                  })
                }
              </div>

              <div className='text-[15px] text-gray-600 break-words mt-2 group-hover:text-gray-700 transition-colors duration-300'>
                  <p className='break-words font-medium'>{order.address && order.address.firstName ? order.address.firstName : 'N/A'} {order.address && order.address.lastName ? order.address.lastName : ''}</p>
                  <p className='break-words'>{order.address && order.address.street ? order.address.street + ", " : ''}</p>
                  <p className='break-words'>{order.address && order.address.city ? order.address.city + ", " : ''} {order.address && order.address.state ? order.address.state + ", " : ''} {order.address && order.address.country ? order.address.country + ", " : ''} {order.address && order.address.pinCode ? order.address.pinCode : ''}</p>
                  <p className='break-words'>{order.address && order.address.phone ? order.address.phone : 'N/A'}</p>
                </div>
            </div>
            <div className='text-[15px] text-gray-600 break-words group-hover:text-gray-700 transition-colors duration-300'>
                  <p className='font-medium'>Items : {order.items ? order.items.length : 0}</p>
                  <p className='font-medium'>Method : {order.paymentMethod || 'N/A'}</p>
                  <p className={`font-medium ${order.payment ? 'text-green-600' : 'text-red-600'}`}>Payment : {order.payment ? 'Done' : 'Pending'}</p>

                  <p className='font-medium'>Date : {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</p>
                   <p className='text-[20px] text-gray-800 font-bold'> ₹ {order.amount || 0}</p>
                </div>
                <div className='flex flex-col gap-2'>
                  <select  value={order.status || 'Order Placed'} className='px-[5px] py-[10px] bg-white border-2 border-gray-300 rounded-lg text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:shadow-lg' onChange={(e)=>statusHandler(e,order._id)} >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <select value={order.payment ? 'Paid' : 'Pending'} className='px-[5px] py-[10px] bg-white border-2 border-gray-300 rounded-lg text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:shadow-lg' onChange={(e) => paymentHandler(e, order._id)}>
                    <option value="Pending">Payment Pending</option>
                    <option value="Paid">Payment Completed</option>
                  </select>
                </div>
            </div>
            
           ))

          }
        </div>
      </div>
    </div>
  )
}

export default Orders
