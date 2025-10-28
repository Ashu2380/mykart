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

function Login() {
    let [show,setShow] = useState(false)
        let [email,setEmail] = useState("")
        let [password,setPassword] = useState("")
        let {serverUrl} = useContext(authDataContext)
        let {getCurrentUser} = useContext(userDataContext)
        let [loading,setLoading] = useState(false)
        let [googleLoading, setGoogleLoading] = useState(false)

    let navigate = useNavigate()

    const handleLogin = async (e) => {
        setLoading(true)
        e.preventDefault()
        try {
            let result = await axios.post(serverUrl + '/api/auth/login',{
                email,password
            },{withCredentials:true})
            console.log("Login successful:", result.data)
            setLoading(false)
            getCurrentUser()
            navigate("/")
            toast.success("User Login Successful")

        } catch (error) {
            console.error("Login error:", error);
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
    <div className='w-[100vw] h-[100vh] bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] text-[white] flex flex-col items-center justify-start'>
    <div className='w-[100%] h-[80px] flex items-center justify-start px-[30px] gap-[10px] cursor-pointer' onClick={()=>navigate("/")}>
    <img className='w-[40px]' src={Logo} alt="" />
    <h1 className='text-[22px] font-sans '>Mykart</h1>
    </div>

    <div className='w-[100%] h-[100px] flex items-center justify-center flex-col gap-[10px]'>
        <span className='text-[25px] font-semibold'>Login Page</span>
        <span className='text-[16px]'>Welcome to Mykart, Place your order</span>

    </div>
    <div className='max-w-[600px] w-[90%] h-[500px] bg-[#00000025] border-[1px] border-[#96969635] backdrop:blur-2xl rounded-lg shadow-lg flex items-center justify-center '>
        <form action="" onSubmit={handleLogin} className='w-[90%] h-[90%] flex flex-col items-center justify-start gap-[20px]'>
            <div
                className={
                    `w-[90%] h-[50px] rounded-lg flex items-center justify-center gap-[10px] py-[20px] ${googleLoading ? 'bg-[#42656c80] cursor-not-allowed opacity-75' : 'bg-[#42656cae] cursor-pointer'}`
                }
                onClick={googleLoading ? undefined : googlelogin}
                aria-disabled={googleLoading}
            >
                <img src={google} alt="" className='w-[20px]'/>
                {googleLoading ? <Loading /> : ' Login account with Google'}
            </div>
            <div className='w-[100%] h-[20px] flex items-center justify-center gap-[10px]'>
             <div className='w-[40%] h-[1px] bg-[#96969635]'></div> OR <div className='w-[40%] h-[1px] bg-[#96969635]'></div>
            </div>
            <div className='w-[90%] h-[400px] flex flex-col items-center justify-center gap-[15px]  relative'>
              
                 <input type="text" className='w-[100%] h-[50px] border-[2px] border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-[20px] font-semibold' placeholder='Email' required  onChange={(e)=>setEmail(e.target.value)} value={email}/>
                  <input type={show?"text":"password"} className='w-[100%] h-[50px] border-[2px] border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-[20px] font-semibold' placeholder='Password' required onChange={(e)=>setPassword(e.target.value)} value={password}/>
                  {!show && <IoEyeOutline className='w-[20px] h-[20px] cursor-pointer absolute right-[5%] bottom-[57%]' onClick={()=>setShow(prev => !prev)}/>}
                  {show && <IoEye className='w-[20px] h-[20px] cursor-pointer absolute right-[5%] bottom-[57%]' onClick={()=>setShow(prev => !prev)}/>}
                  <button className='w-[100%] h-[50px] bg-[#6060f5] rounded-lg flex items-center justify-center mt-[20px] text-[17px] font-semibold'>{loading? <Loading/> : "Login"}</button>
                  <p className='flex  gap-[10px]'>You haven't any account? <span className='text-[#5555f6cf] text-[17px] font-semibold cursor-pointer' onClick={()=>navigate("/signup")}>Create New Account</span></p>
            </div>
        </form>
    </div>
    </div>
  )
}

export default Login
