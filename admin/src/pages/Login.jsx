import React, { useContext, useState } from 'react'
import logo from '../assets/logo.png'
import { IoEyeOutline } from "react-icons/io5";
import { IoEye } from "react-icons/io5";
import axios from 'axios'
import { authDataContext } from '../context/AuthContext';
import { adminDataContext } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
  let [show,setShow] = useState(false)
          let [email,setEmail] = useState("")
          let [password,setPassword] = useState("")
          let {serverUrl} = useContext(authDataContext)
          let {getAdmin} = useContext(adminDataContext)
          let navigate = useNavigate()
          // const [loading,setLoading] = useState(false)

          const AdminLogin = async (e) => {
            // setLoading(true)
            e.preventDefault()
            try {
              console.log("Attempting admin login with:", {email, password: "***"})
              const result = await axios.post(serverUrl + '/api/auth/adminlogin', {email, password}, {withCredentials:true})
              console.log("Admin login response:", result.data)
              toast.success("AdminLogin Successfully")
              console.log("Calling getAdmin after successful login")
              getAdmin()
              console.log("Navigating to home page")
              navigate("/")
              // setLoading(false)
            } catch (error) {
              console.log("Admin login error:", error.response?.data || error.message)
              toast.error("AdminLogin Failed")
              // setLoading(false)
            }

          }
  return (
    <div className='w-[100vw] h-[100vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-[black] flex flex-col items-center justify-start overflow-hidden'>
       <div className='w-[100%] h-[80px] flex items-center justify-start px-[30px] gap-[10px] cursor-pointer hover:scale-105 transition-transform duration-300' >
       <img className='w-[40px] drop-shadow-lg' src={logo} alt="" />
       <h1 className='text-[22px] font-sans font-bold text-gray-800'>Mykart Admin</h1>
       </div>

       <div className='w-[100%] h-[100px] flex items-center justify-center flex-col gap-[10px]'>
           <span className='text-[32px] font-bold text-gray-800 animate-pulse'>Admin Portal</span>
           <span className='text-[18px] text-gray-600 font-medium'>Secure Access to Mykart Administration</span>

       </div>
       <div className='max-w-[500px] w-[90%] h-[450px] bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all duration-500 hover:scale-105'>
           <form action="" onSubmit={AdminLogin} className='w-[90%] h-[90%] flex flex-col items-center justify-start gap-[25px]'>

               <div className='w-[90%] h-[400px] flex flex-col items-center justify-center gap-[20px] relative'>

                    <div className='w-full text-center mb-4'>
                        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Welcome Back</h2>
                        <p className='text-gray-600'>Please sign in to your admin account</p>
                    </div>

                    <div className='w-full relative group'>
                        <input
                            type="text"
                            className='w-[100%] h-[55px] border-2 border-gray-300 rounded-xl shadow-lg bg-white/90 placeholder-gray-500 px-[20px] font-medium text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:border-blue-400 hover:shadow-xl'
                            placeholder='Admin Email'
                            required
                            onChange={(e)=>setEmail(e.target.value)}
                            value={email}
                        />
                        <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none'></div>
                    </div>

                    <div className='w-full relative group'>
                        <input
                            type={show?"text":"password"}
                            className='w-[100%] h-[55px] border-2 border-gray-300 rounded-xl shadow-lg bg-white/90 placeholder-gray-500 px-[20px] pr-[50px] font-medium text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:border-blue-400 hover:shadow-xl'
                            placeholder='Password'
                            required
                            onChange={(e)=>setPassword(e.target.value)}
                            value={password}
                        />
                        <div className='absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform duration-200'>
                            {!show && <IoEyeOutline className='w-[22px] h-[22px] text-gray-500 hover:text-blue-500' onClick={()=>setShow(prev => !prev)}/>}
                            {show && <IoEye className='w-[22px] h-[22px] text-gray-500 hover:text-blue-500' onClick={()=>setShow(prev => !prev)}/>}
                        </div>
                        <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none'></div>
                    </div>

                    <button className='w-[100%] h-[55px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl flex items-center justify-center mt-[10px] text-[18px] font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 active:scale-95'>
                        Sign In
                    </button>

                    <div className='text-center text-sm text-gray-500 mt-4'>
                        <p>Access restricted to authorized administrators only</p>
                    </div>
               </div>
           </form>
       </div>

       {/* Animated background elements */}
       <div className='absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce'></div>
       <div className='absolute bottom-20 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse'></div>
       <div className='absolute top-1/2 left-1/4 w-12 h-12 bg-indigo-200 rounded-full opacity-15 animate-ping'></div>
       </div>
  )
}

export default Login
