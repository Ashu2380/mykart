import React from 'react'
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegListAlt, FaUsers, FaStar } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import { MdDashboard } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

function Sidebar() {
    let navigate = useNavigate()
  return (
    <div className='w-[18%] h-[calc(100vh-70px)] border-r-[1px] py-[20px] fixed left-0 top-[70px]'>
        <div className='flex flex-col gap-4 pl-[20%] text-[15px]'>

            <div className='flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]' onClick={() => navigate('/')}>
                <MdDashboard className='w-[20px] h-[20px]'/>
                <p className='hidden md:block'>Dashboard</p>

            </div>
            <div className='flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]' onClick={() => navigate('/add')}>
                <IoIosAddCircleOutline className='w-[20px] h-[20px]'/>
                <p className='hidden md:block'>Add Items</p>

            </div>
               <div className='flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]' onClick={() => navigate('/lists')}>
                <FaRegListAlt className='w-[20px] h-[20px]'/>
                <p className='hidden md:block'>List Items</p>

            </div>
               <div className='flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]' onClick={() => navigate('/orders')}>
                 <SiTicktick className='w-[20px] h-[20px]'/>
                 <p className='hidden md:block'>Orders</p>

             </div>
                <div className='flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]' onClick={() => navigate('/users')}>
                 <FaUsers className='w-[20px] h-[20px]'/>
                 <p className='hidden md:block'>Users</p>

             </div>
                <div className='flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]' onClick={() => navigate('/reviews')}>
                 <FaStar className='w-[20px] h-[20px]'/>
                 <p className='hidden md:block'>Reviews</p>

             </div>
        </div>
      
    </div>
  )
}

export default Sidebar
