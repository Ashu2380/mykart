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
    <div className='w-[100vw] min-h-[100vh] bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 text-[white] overflow-x-hidden relative'>
      <Nav />
      <Sidebar />
      <div className='w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]'>
        <div className='w-[100%] md:w-[90%] h-[100%] mt-[70px] flex flex-col gap-[30px] py-[90px] px-[30px] md:px-[60px]'>
          <div className='w-[400px] h-[50px] text-[28px] md:text-[40px] mb-[20px] text-white'>All Orders List</div>
          {
           orders.map((order,index)=>(
            <div key={index} className='w-full md:w-[90%] lg:w-[95%] xl:w-[90%] h-auto min-h-[40%] bg-slate-600 rounded-xl flex lg:items-center items-start justify-between  flex-col lg:flex-row p-[10px] md:px-[20px]  gap-[20px] overflow-hidden'>
            <SiEbox  className='w-[60px] h-[60px] text-[black] p-[5px] rounded-lg bg-[white]'/>

            <div>
              <div className='flex items-start justify-center flex-col gap-[5px] text-[16px] text-[#56dbfc] break-words'>
                {
                  order.items.map((item,index)=>{
                    if(index === order.items.length - 1){
                       return <p key={index} className='break-words'>{item.name.toUpperCase()}  *  {item.quantity} <span>{item.size}</span></p>

                    }else{
                       return <p key={index} className='break-words'>{item.name.toUpperCase()}  *  {item.quantity} <span>{item.size}</span>,</p>

                    }
                  })
                }
              </div>

              <div className='text-[15px] text-green-100 break-words'>
                  <p className='break-words'>{order.address.firstName+" "+ order.address.lastName}</p>
                  <p className='break-words'>{order.address.street + ", "}</p>
                  <p className='break-words'>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.pinCode}</p>
                  <p className='break-words'>{order.address.phone}</p>
                </div>
            </div>
            <div className='text-[15px] text-green-100 break-words'>
                  <p>Items : {order.items.length}</p>
                  <p>Method : {order.paymentMethod}</p>
                  <p>Payment : {order.payment ? 'Done' : 'Pending'}</p>

                  <p>Date : {new Date(order.date).toLocaleDateString()}</p>
                   <p className='text-[20px] text-[white]'> ₹ {order.amount}</p>
                </div>
                <div className='flex flex-col gap-2'>
                  <select  value={order.status} className='px-[5px] py-[10px] bg-slate-500 rounded-lg border-[1px] border-[#96eef3]' onChange={(e)=>statusHandler(e,order._id)} >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <select value={order.payment ? 'Paid' : 'Pending'} className='px-[5px] py-[10px] bg-slate-500 rounded-lg border-[1px] border-[#96eef3]' onChange={(e) => paymentHandler(e, order._id)}>
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
