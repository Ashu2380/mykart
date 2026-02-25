import React from 'react'
import Logo from "../assets/logo.png"
import { useNavigate } from 'react-router-dom'
import google from '../assets/google.png'
import { IoEyeOutline } from "react-icons/io5";
import { IoEye } from "react-icons/io5";
import { useState } from 'react';
import { useContext } from 'react';
import { authDataContext } from '../context/authContext';
import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../utils/Firebase';
import { userDataContext } from '../context/UserContext';
import Loading from '../component/Loading';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

function Login() {
    let [show,setShow] = useState(false)
        let [email,setEmail] = useState("")
        let [password,setPassword] = useState("")
        let {serverUrl} = useContext(authDataContext)
        let {getCurrentUser} = useContext(userDataContext)
        let [loading,setLoading] = useState(false)
        let [googleLoading, setGoogleLoading] = useState(false)
        let [isAnimating, setIsAnimating] = useState(false)

    let navigate = useNavigate()

    const handleLogin = async (e) => {
        setIsAnimating(true)
        setLoading(true)
        e.preventDefault()
        try {
            let result = await axios.post(serverUrl + '/api/auth/login',{
                email,password
            },{withCredentials:true})
            console.log("Login successful:", result.data)
            setLoading(false)
            setIsAnimating(false)
            getCurrentUser()
            navigate("/")
            toast.success("User Login Successful")

        } catch (error) {
            console.error("Login error:", error);
            setIsAnimating(false)
            if (error.response) {
                console.error("Backend error response:", error.response.data);
                console.error("Backend error status:", error.response.status);
                toast.error(error.response.data.message || "User Login Failed")
            } else if (error.request) {
                console.error("Network error:", error.request);
                toast.error("Network error - please check backend server")
            } else {
                console.error("Request setup error:", error.message);
                toast.error("Request error: " + error.message)
            }
            setLoading(false)
        }
    }
     const googlelogin = async () => {
            // prevent duplicate popup attempts
            if (googleLoading) return
            setGoogleLoading(true)
            try {
                console.log("Starting Google login...");
                const response = await signInWithPopup(auth , provider)
                console.log("Firebase popup successful:", response);
                let user = response.user
                let name = user.displayName;
                let email = user.email
                console.log("User data:", { name, email });

                console.log("Posting to backend...");
                const result = await axios.post(serverUrl + "/api/auth/googlelogin" ,{name , email} , {withCredentials:true})
                console.log("Backend response:", result.data)
                getCurrentUser()
                navigate("/")
                toast.success("Google Login Successful")

            } catch (error) {
                console.error("Google login error:", error);
                // Handle common Firebase popup cancellation/closure errors gracefully
                if (error && error.code) {
                    console.error("Firebase error code:", error.code);
                    console.error("Firebase error message:", error.message);
                    if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                        toast.info('Google sign-in was cancelled. Please try again.')
                        return
                    }
                }
                if (error.response) {
                    console.error("Backend error response:", error.response.data);
                    console.error("Backend error status:", error.response.status);
                }
                toast.error("Google Login Failed: " + (error.message || "Unknown error"))
            } finally {
                setGoogleLoading(false)
            }

        }
  return (
    <div className='w-[100vw] h-[100vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800 flex flex-col items-center justify-start overflow-hidden relative'>
        {/* Animated background elements */}
        <div className='absolute inset-0 overflow-hidden'>
            <div className='absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob'></div>
            <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000'></div>
            <div className='absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000'></div>
        </div>

        <div className='w-[100%] h-[80px] flex items-center justify-start px-[30px] gap-[10px] cursor-pointer z-10' onClick={()=>navigate("/")}>
            <img className='w-[40px] hover:scale-110 transition-transform duration-300' src={Logo} alt="" />
            <h1 className='text-[22px] font-sans font-bold hover:text-blue-600 transition-colors duration-300'>Mykart</h1>
        </div>

        <div className='w-[100%] h-[100px] flex items-center justify-center flex-col gap-[10px] z-10'>
            <span className='text-[35px] md:text-[45px] font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in'>Welcome Back</span>
            <span className='text-[18px] text-gray-600 animate-slide-up'>Sign in to continue shopping at Mykart</span>
        </div>

        <div className={`max-w-[600px] w-[90%] h-[500px] bg-white/90 border-[1px] border-gray-200 backdrop-blur-2xl rounded-2xl shadow-2xl flex items-center justify-center z-10 transition-all duration-500 ${isAnimating ? 'scale-105 shadow-3xl' : 'hover:shadow-3xl hover:scale-[1.02]'}`}>
            <form action="" onSubmit={handleLogin} className='w-[90%] h-[90%] flex flex-col items-center justify-start gap-[25px]'>
                <div
                    className={`w-[90%] h-[50px] rounded-xl flex items-center justify-center gap-[10px] py-[20px] transition-all duration-300 hover:scale-105 ${googleLoading ? 'bg-gray-200 cursor-not-allowed opacity-75' : 'bg-gradient-to-r from-gray-50 to-gray-100 cursor-pointer hover:from-gray-100 hover:to-gray-200'} border border-gray-300 shadow-md hover:shadow-lg`}
                    onClick={googleLoading ? undefined : googlelogin}
                    aria-disabled={googleLoading}
                >
                    <img src={google} alt="" className='w-[20px]'/>
                    {googleLoading ? <Loading /> : 'Continue with Google'}
                </div>

                <div className='w-[100%] h-[20px] flex items-center justify-center gap-[10px]'>
                    <div className='w-[40%] h-[1px] bg-gradient-to-r from-transparent to-gray-300'></div>
                    <span className='text-gray-500 font-medium'>OR</span>
                    <div className='w-[40%] h-[1px] bg-gradient-to-l from-transparent to-gray-300'></div>
                </div>

                <div className='w-[90%] h-[400px] flex flex-col items-center justify-center gap-[20px] relative'>
                    <div className='w-full relative group'>
                        <FaUser className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300' />
                        <input
                            type="email"
                            className='w-[100%] h-[55px] border-[2px] border-gray-300 rounded-xl shadow-md bg-white placeholder-gray-500 pl-[50px] pr-[20px] font-medium text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:shadow-lg hover:border-gray-400'
                            placeholder='Enter your email'
                            required
                            onChange={(e)=>setEmail(e.target.value)}
                            value={email}
                        />
                    </div>

                    <div className='w-full relative group'>
                        <FaLock className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300' />
                        <input
                            type={show?"text":"password"}
                            className='w-[100%] h-[55px] border-[2px] border-gray-300 rounded-xl shadow-md bg-white placeholder-gray-500 pl-[50px] pr-[50px] font-medium text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:shadow-lg hover:border-gray-400'
                            placeholder='Enter your password'
                            required
                            onChange={(e)=>setPassword(e.target.value)}
                            value={password}
                        />
                        {!show && <IoEyeOutline className='w-[20px] h-[20px] cursor-pointer absolute right-[5%] top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-300' onClick={()=>setShow(prev => !prev)}/>}
                        {show && <IoEye className='w-[20px] h-[20px] cursor-pointer absolute right-[5%] top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-300' onClick={()=>setShow(prev => !prev)}/>}
                    </div>

                    <button
                        type="submit"
                        className={`w-[100%] h-[55px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl flex items-center justify-center gap-3 mt-[10px] text-[18px] font-bold text-white shadow-lg hover:shadow-xl transform transition-all duration-300 ${loading ? 'cursor-not-allowed opacity-75' : 'hover:scale-105 active:scale-95'}`}
                        disabled={loading}
                    >
                        <FaSignInAlt className={`${loading ? 'animate-spin' : ''}`} />
                        {loading ? <Loading /> : "Sign In"}
                    </button>

                    <p className='flex gap-[10px] text-gray-600'>
                        Don't have an account?
                        <span
                            className='text-blue-600 text-[17px] font-semibold cursor-pointer hover:text-blue-700 transition-colors duration-300 hover:underline'
                            onClick={()=>navigate("/signup")}
                        >
                            Create Account
                        </span>
                    </p>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Login
