import React from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { useState } from 'react'
import { useContext } from 'react'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { useEffect } from 'react'
import { RiFileWarningLine } from "react-icons/ri";

function Returns() {

  let [returns,setReturns] = useState([])
  let {serverUrl} = useContext(authDataContext)

    const fetchAllReturns =async () => {
    try {
      const result = await axios.get(serverUrl + '/api/returns/admin/all' ,{withCredentials:true})
      console.log("Returns data:", result.data)
      if(result.data && result.data.returns){
        setReturns(result.data.returns.reverse())
      }
      
    } catch (error) {
      console.log(error)
    }
    
  }

  const statusHandler = async (e , returnId) => {
    try {
      const status = e.target.value;
      const result = await axios.put(serverUrl + `/api/returns/admin/${returnId}/status`, 
        {status}, 
        {withCredentials:true}
      )
      if(result.data){
        await fetchAllReturns()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Requested': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Picked Up': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const getReasonLabel = (reason) => {
    switch(reason) {
      case 'defective': return 'Defective Product';
      case 'wrong_item': return 'Wrong Item';
      case 'not_as_described': return 'Not as Described';
      case 'changed_mind': return 'Changed Mind';
      default: return reason;
    }
  }

  useEffect(()=>{
    fetchAllReturns()
  },[])

  return (
    <div className='w-full min-h-[100vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-[black] overflow-x-hidden relative'>
      <Nav />
      <Sidebar />
      <div className='w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]'>
        <div className='w-full md:w-[90%] h-full mt-0 md:mt-[70px] flex flex-col gap-[20px] md:gap-[30px] py-[20px] md:py-[90px] px-[15px] md:px-[60px]'>
          <div className='w-full md:w-auto text-[24px] md:text-[40px] mb-[20px] text-gray-800 font-bold animate-fade-in'>Return Requests</div>
          
          {returns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RiFileWarningLine className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No return requests found</p>
            </div>
          ) : (
            returns.map((returnItem,index)=>(
            <div key={index} className='w-full md:w-[90%] lg:w-[95%] xl:w-[90%] h-auto min-h-[40%] bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-300 flex lg:items-center items-start justify-between flex-col lg:flex-row p-[15px] md:px-[25px] gap-[25px] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group animate-fade-in-up hover:bg-white' style={{animationDelay: `${index * 0.05}s`}}>
            <RiFileWarningLine className='w-[70px] h-[70px] text-orange-600 p-[8px] rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md'/>

            <div className="flex-1">
              <div className='flex items-start justify-center flex-col gap-[5px] text-[16px] text-gray-800 break-words group-hover:text-gray-900 transition-colors duration-300'>
                <p className='font-bold text-lg'>Return ID: #{returnItem._id ? returnItem._id.toString().slice(-8).toUpperCase() : 'N/A'}</p>
                <p className='font-medium'>Order ID: #{returnItem.orderId ? returnItem.orderId._id ? returnItem.orderId._id.toString().slice(-8).toUpperCase() : 'N/A' : 'N/A'}</p>
                {
                  returnItem.items && returnItem.items.map((item,idx)=>{
                    if(idx === returnItem.items.length - 1){
                      return <p key={idx} className='break-words font-medium text-gray-600'>{item.name ? item.name.toUpperCase() : 'Unknown Item'} * {item.quantity || 1}</p>
                    }else{
                      return <p key={idx} className='break-words font-medium text-gray-600'>{item.name ? item.name.toUpperCase() : 'Unknown Item'} * {item.quantity || 1},</p>
                    }
                  })
                }
              </div>

              <div className='text-[15px] text-gray-600 break-words mt-2 group-hover:text-gray-700 transition-colors duration-300'>
                  <p className='break-words font-medium'>Customer: {returnItem.userId ? returnItem.userId.name || 'N/A' : 'N/A'}</p>
                  <p className='break-words'>Email: {returnItem.userId ? returnItem.userId.email || 'N/A' : 'N/A'}</p>
                  <p className='break-words font-medium mt-1'>Reason: <span className="text-orange-600">{getReasonLabel(returnItem.reason)}</span></p>
                  {returnItem.description && <p className='break-words mt-1 text-gray-500'>Description: {returnItem.description}</p>}
                </div>
            </div>
            <div className='text-[15px] text-gray-600 break-words group-hover:text-gray-700 transition-colors duration-300'>
                  <p className='font-medium'>Refund Amount: <span className="text-green-600 font-bold">₹{returnItem.refundAmount || 0}</span></p>
                  <p className='font-medium'>Requested: {returnItem.createdAt ? new Date(returnItem.createdAt).toLocaleDateString() : 'N/A'}</p>
                  <p className='font-medium mt-1'>Status: 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                      {returnItem.status || 'Pending'}
                    </span>
                  </p>
                  {returnItem.completedAt && (
                    <p className='font-medium'>Completed: {new Date(returnItem.completedAt).toLocaleDateString()}</p>
                  )}
                </div>
                <div className='flex flex-col gap-2'>
                  <select value={returnItem.status || 'Requested'} className='px-[5px] py-[10px] bg-white border-2 border-gray-300 rounded-lg text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:shadow-lg' onChange={(e)=>statusHandler(e,returnItem._id)} >
                    <option value="Requested">Requested</option>
                    <option value="Approved">Approved</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Returns