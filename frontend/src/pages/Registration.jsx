import React from 'react'
import Logo from "../assets/logo.png"
import { useNavigate, useSearchParams } from 'react-router-dom'
import google from '../assets/google.png'
import { IoEyeOutline } from "react-icons/io5";
import { IoEye } from "react-icons/io5";
import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { authDataContext } from '../context/authContext';
import axios from 'axios'
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../utils/Firebase';
import { userDataContext } from '../context/UserContext';
import { toast } from 'react-toastify';
import Loading from '../component/Loading';

function Registration() {
    let [show,setShow] = useState(false)
     let {serverUrl} = useContext(authDataContext)
     let [name,setName] = useState("")
     let [email,setEmail] = useState("")
     let [password,setPassword] = useState("")
     let [referralCode, setReferralCode] = useState("")
     let {getCurrentUser} = useContext(userDataContext)
     let [loading,setLoading] = useState(false)
     let [searchParams] = useSearchParams()

     let navigate = useNavigate()

     // Check for referral code in URL
     useEffect(() => {
         const refCode = searchParams.get('ref');
         if (refCode) {
             setReferralCode(refCode.toUpperCase());
         }
     }, [searchParams]);


    const handleSignup = async (e) => {
        setLoading(true)
        e.preventDefault()
        try {
         const result = await axios.post(serverUrl + '/api/auth/registration',{
            name,email,password,referralCode: referralCode || undefined
         },{withCredentials:true})
            console.log("Registration successful:", result.data)
            getCurrentUser()
            navigate("/")
            toast.success("User Registration Successful")
            setLoading(false)

        } catch (error) {
            console.error("Registration error:", error);
            if (error.response) {
                console.error("Backend error response:", error.response.data);
                console.error("Backend error status:", error.response.status);
                toast.error(error.response.data.message || "User Registration Failed")
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

    const googleSignup = async () => {
        try {
            console.log("Starting Google signup...");
            const response = await signInWithPopup(auth , provider)
            console.log("Firebase popup successful:", response);
            let user = response.user
            let name = user.displayName;
            let email = user.email
            console.log("User data:", { name, email });

            console.log("Posting to backend...");
            const result = await axios.post(serverUrl + "/api/auth/googlelogin" ,{name , email, referralCode: referralCode || undefined} , {withCredentials:true})
            console.log("Backend response:", result.data)
            getCurrentUser()
            navigate("/")
            toast.success("Google Registration Successful")

        } catch (error) {
            console.error("Google signup error:", error);
            if (error.code) {
                console.error("Firebase error code:", error.code);
                console.error("Firebase error message:", error.message);
            }
            if (error.response) {
                console.error("Backend error response:", error.response.data);
                console.error("Backend error status:", error.response.status);
            }
            toast.error("Google Registration Failed: " + (error.message || "Unknown error"))
        }

    }
  
  return (
    <div className='w-[100vw] h-[100vh] bg-blue-50 text-gray-800 flex flex-col items-center justify-start'>
    <div className='w-[100%] h-[80px] flex items-center justify-start px-[30px] gap-[10px] cursor-pointer' onClick={()=>navigate("/")}>
    <img className='w-[40px]' src={Logo} alt="" />
    <h1 className='text-[22px] font-sans '>Mykart</h1>
    </div>

    <div className='w-[100%] h-[100px] flex items-center justify-center flex-col gap-[10px]'>
        <span className='text-[25px] font-semibold'>Registration Page</span>
        <span className='text-[16px]'>Welcome to Mykart, Place your order</span>

    </div>
    <div className='max-w-[600px] w-[90%] h-[500px] bg-white/80 border-[1px] border-gray-300 backdrop:blur-2xl rounded-lg shadow-lg flex items-center justify-center '>
        <form action="" onSubmit={handleSignup} className='w-[90%] h-[90%] flex flex-col items-center justify-start gap-[20px]'>
            <div className='w-[90%] h-[50px] bg-blue-600 rounded-lg flex items-center justify-center gap-[10px] py-[20px] cursor-pointer hover:bg-blue-700 transition-colors' onClick={googleSignup} >
                <img src={google}  alt="" className='w-[20px]'/> <span className='text-white'>Registration with Google</span>
            </div>
            <div className='w-[100%] h-[20px] flex items-center justify-center gap-[10px]'>
             <div className='w-[40%] h-[1px] bg-gray-300'></div> OR <div className='w-[40%] h-[1px] bg-gray-300'></div>
            </div>
            <div className='w-[90%] h-[400px] flex flex-col items-center justify-center gap-[15px]  relative'>
                <input type="text" className='w-[100%] h-[50px] border-[2px] border-gray-300 rounded-lg shadow-lg bg-white text-gray-800 placeholder-gray-500 px-[20px] font-semibold focus:border-blue-500 focus:outline-none' placeholder='UserName' required onChange={(e)=>setName(e.target.value)} value={name}/>
                 <input type="text" className='w-[100%] h-[50px] border-[2px] border-gray-300 rounded-lg shadow-lg bg-white text-gray-800 placeholder-gray-500 px-[20px] font-semibold focus:border-blue-500 focus:outline-none' placeholder='Email' required onChange={(e)=>setEmail(e.target.value)} value={email}/>
                  <input type={show?"text":"password"} className='w-[100%] h-[50px] border-[2px] border-gray-300 rounded-lg shadow-lg bg-white text-gray-800 placeholder-gray-500 px-[20px] font-semibold focus:border-blue-500 focus:outline-none' placeholder='Password' required onChange={(e)=>setPassword(e.target.value)} value={password}/>
                  {!show && <IoEyeOutline className='w-[20px] h-[20px] cursor-pointer absolute right-[5%]' onClick={()=>setShow(prev => !prev)}/>}
                  {show && <IoEye className='w-[20px] h-[20px] cursor-pointer absolute right-[5%]' onClick={()=>setShow(prev => !prev)}/>}

                  {/* Referral Code Input */}
                  {referralCode && (
                      <div className='w-[100%] bg-green-500/20 border border-green-400 rounded-lg p-3'>
                          <p className='text-green-300 text-sm font-semibold'>Referral Code Applied!</p>
                          <p className='text-white font-mono'>{referralCode}</p>
                          <p className='text-green-200 text-xs mt-1'>You'll get ₹50 bonus after signup!</p>
                      </div>
                  )}

                  <button className='w-[100%] h-[50px] bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center mt-[20px] text-[17px] font-semibold text-white transition-colors'>{loading? <Loading/> :"Create Account"}</button>
                  <p className='flex gap-[10px]'>You have any account? <span className='text-blue-600 text-[17px] font-semibold cursor-pointer hover:text-blue-700' onClick={()=>navigate("/login")}>Login</span></p>
            </div>
        </form>
    </div>
    </div>
  )
}

export default Registration
