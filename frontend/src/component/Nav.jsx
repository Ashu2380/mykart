 import React, { useContext, useState } from 'react'
 import logo from '../assets/logo.png'
 import { IoSearchCircleOutline } from "react-icons/io5";
 import { FaCircleUser } from "react-icons/fa6";
 import { MdOutlineShoppingCart } from "react-icons/md";
 import { FaHeart } from "react-icons/fa";
 import { userDataContext } from '../context/UserContext';
 import { IoSearchCircleSharp } from "react-icons/io5";
 import { useNavigate } from 'react-router-dom';
 import { IoMdHome } from "react-icons/io";
 import { HiOutlineCollection } from "react-icons/hi";
 import { MdContacts, MdSupportAgent } from "react-icons/md";
 import { FaChevronDown } from "react-icons/fa";
 import axios from 'axios';
 import { authDataContext } from '../context/authContext';
 import { shopDataContext } from '../context/ShopContext';
 import NotificationSystem from './NotificationSystem';
function Nav() {
    let {userData, setUserData} = useContext(userDataContext)
    let {serverUrl} = useContext(authDataContext)
    let {search,setSearch,getCartCount} = useContext(shopDataContext)
    let [showProfile,setShowProfile] = useState(false)
    let [showMore,setShowMore] = useState(false)
    let navigate = useNavigate()

    const handleLogout = async () => {
        try {
            const result = await axios.get(serverUrl + "/api/auth/logout" , {withCredentials:true})
            console.log(result.data)
            setUserData(null) // Clear user data immediately
            navigate("/login", { replace: true }) // Use replace to prevent back navigation
        } catch (error) {
            console.log(error)
        }
        
    }
  return (
    <>
    <div className='nav-main'>

        <div className='nav-logo'>
            <img src={logo} alt="" className='w-[30px]' />
            <h1 className='text-[25px] font-sans'>Mykart</h1>
        </div>

        <div className='nav-search'>
            <input
                type="text"
                className='w-[80%] h-[40px] bg-white text-black rounded-[20px] px-[20px] placeholder:text-gray-500'
                placeholder='Search products...'
                onChange={(e)=>{
                    setSearch(e.target.value);
                    if(e.target.value.length > 0) {
                        navigate('/collection');
                    }
                }}
                value={search}
                onFocus={() => {
                    navigate('/collection');
                }}
                onClick={() => {
                    navigate('/collection');
                }}
            />
        </div>

        <div className='nav-actions'>
            {!userData && <button className='text-[14px] hover:underline' onClick={()=>navigate("/login")}>Login</button>}
            <button className='text-[14px] hover:underline' onClick={()=>navigate("/")}>Home</button>
            <button className='text-[14px] hover:underline' onClick={()=>navigate("/collection")}>Collections</button>
            <button className='text-[14px] hover:underline' onClick={()=>navigate("/contact")}>Contact</button>
            <button className='text-[14px] hover:underline' onClick={()=>navigate("/customer-support")}>Customer Support</button>
            <button className='text-[14px] hover:underline' onClick={()=>navigate("/emi-calculator")}>EMI Calculator</button>
            <div className='relative group'>
                <button className='text-[14px] flex items-center gap-1 hover:underline' onClick={()=>setShowMore(prev=>!prev)}>More <FaChevronDown /></button>
                <div className={`absolute w-[180px] bg-white text-black top-[30px] right-0 border rounded-md shadow-lg z-20 max-h-[200px] overflow-y-auto transition-all duration-300 ${showMore || 'group-hover:block'} ${showMore ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
                    <ul className='py-2'>
                        <li className='px-4 py-2 hover:bg-gray-100 cursor-pointer' onClick={()=>{navigate("/about");setShowMore(false)}}>About</li>
                        <li className='px-4 py-2 hover:bg-gray-100 cursor-pointer' onClick={()=>{navigate("/order");setShowMore(false)}}>My Orders</li>
                        <li className='px-4 py-2 hover:bg-gray-100 cursor-pointer' onClick={()=>{navigate("/referrals");setShowMore(false)}}>Refer & Earn</li>
                    </ul>
                </div>
            </div>
            {!userData && <FaCircleUser className='w-[29px] h-[29px] text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200' onClick={()=>setShowProfile(prev=>!prev)}/>}
            {userData && <div className='w-[30px] h-[30px] bg-gray-200 text-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:text-white transition-colors duration-200' onClick={()=>setShowProfile(prev=>!prev)}>{userData?.name.slice(0,1)}</div>}
            <div className='relative hidden md:block'>
                <MdOutlineShoppingCart className='w-[30px] h-[30px] cursor-pointer' onClick={()=>navigate("/cart")}/>
                <p className='absolute w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white rounded-full text-[9px] -top-[8px] -right-[8px]'>{getCartCount()}</p>
            </div>
            <div className='relative hidden md:block'>
                <FaHeart className='w-[30px] h-[30px] cursor-pointer' onClick={()=>navigate("/wishlist")}/>
            </div>
            <NotificationSystem />
        </div>

       {showProfile && <div className='absolute w-[220px] bg-white top-[110%] right-[4%] border-[1px] border-gray-300 rounded-[10px] z-50 shadow-lg'>
        <ul className='w-[100%] flex items-start justify-start flex-col text-[15px] py-[10px] text-gray-800'>
            {!userData && <li className='w-[100%] hover:bg-blue-50 px-[15px] py-[8px] cursor-pointer' onClick={()=>{
                navigate("/login");setShowProfile(false)
            }}>Login</li>}
            {userData && (
                <>
                    <li className='w-[100%] hover:bg-blue-50 px-[15px] py-[8px] cursor-pointer' onClick={()=>{navigate("/account-settings");setShowProfile(false)}}>Account Settings</li>
                    <li className='w-[100%] hover:bg-blue-50 px-[15px] py-[8px] cursor-pointer' onClick={()=>{navigate("/addresses");setShowProfile(false)}}>Manage Addresses</li>
                    <li className='w-[100%] hover:bg-blue-50 px-[15px] py-[8px] cursor-pointer' onClick={()=>{navigate("/order");setShowProfile(false)}}>My Orders</li>
                    <li className='w-[100%] hover:bg-blue-50 px-[15px] py-[8px] cursor-pointer' onClick={()=>{navigate("/referrals");setShowProfile(false)}}>Refer & Earn</li>
                    <li className='w-[100%] hover:bg-blue-50 px-[15px] py-[8px] cursor-pointer' onClick={()=>{navigate("/payment-settings");setShowProfile(false)}}>Payment Settings</li>
                    <li className='w-[100%] hover:bg-blue-50 px-[15px] py-[8px] cursor-pointer' onClick={()=>{navigate("/returns");setShowProfile(false)}}>Returns & Refunds</li>
                    <li className='w-[100%] hover:bg-red-50 hover:text-red-600 px-[15px] py-[8px] cursor-pointer' onClick={()=>{handleLogout();setShowProfile(false)}}>Logout</li>
                </>
            )}
            {!userData && <li className='w-[100%] hover:bg-blue-50 px-[15px] py-[8px] cursor-pointer' onClick={()=>{navigate("/about");setShowProfile(false)}}>About</li>}
        </ul>

        </div>}
        <div className='w-[100vw] h-[90px] flex items-center justify-between px-[10px] text-[10px]
        fixed bottom-0 left-0 bg-white border-t border-gray-300 md:hidden shadow-lg'>
            <button className='text-gray-800 flex items-center justify-center flex-col gap-[2px]' onClick={()=>navigate("/")}><IoMdHome className='w-[24px] h-[24px] text-gray-800'/> Home</button>
            <button className='text-gray-800 flex items-center justify-center flex-col gap-[2px] hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg px-2 py-1' onClick={()=>navigate("/collection")}><HiOutlineCollection className='w-[24px] h-[24px] text-gray-800 hover:text-blue-600 transition-all duration-200'/> Collections</button>
            <button className='text-gray-800 flex items-center justify-center flex-col gap-[2px] hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg px-2 py-1' onClick={()=>navigate("/customer-support")}><MdSupportAgent className='w-[24px] h-[24px] text-gray-800 hover:text-blue-600 transition-all duration-200'/> Support</button>
            <button className='text-gray-800 flex items-center justify-center flex-col gap-[2px] relative hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg px-2 py-1' onClick={()=>navigate("/cart")}><MdOutlineShoppingCart className='w-[24px] h-[24px] text-gray-800 hover:text-blue-600 transition-all duration-200'/> Cart
                <span className='absolute w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white rounded-full text-[8px] -top-[2px] -right-[2px]'>{getCartCount()}</span>
            </button>
            <button className='text-gray-800 flex items-center justify-center flex-col gap-[2px] hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg px-2 py-1' onClick={()=>navigate("/wishlist")}><FaHeart className='w-[24px] h-[24px] text-gray-800 hover:text-blue-600 transition-all duration-200'/> Wishlist</button>
        </div>
    
    </div>
    </>
  )
}

export default Nav
