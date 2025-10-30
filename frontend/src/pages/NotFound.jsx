import React from 'react'
import { useNavigate } from 'react-router-dom'

function NotFound() {
    let navigate = useNavigate()
  return (
    <div className='w-[100vw] h-[100vh] bg-gray-50 md:text-[70px] text-[30px] flex items-center justify-center text-gray-800 flex-col gap-[20px]'>
      404 Page Not Found
      <button className='bg-blue-600 hover:bg-blue-700 px-[20px] py-[10px] rounded-xl text-[18px] text-white cursor-pointer transition-colors duration-300' onClick={()=>navigate("/login")}>Login</button>
    </div>
  )
}

export default NotFound
