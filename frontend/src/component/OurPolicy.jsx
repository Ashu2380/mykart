import React from 'react'
import Title from './Title'
import { RiExchangeFundsLine } from "react-icons/ri";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { BiSupport } from "react-icons/bi";
import { FaShippingFast, FaShieldAlt, FaUndo, FaHeadset, FaLock, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function OurPolicy() {
  return (
    <div className='w-[100vw] min-h-[80vh] md:min-h-[70vh] flex items-center justify-start flex-col bg-blue-50 gap-[30px] py-[40px]'>
        <div className='h-[8%] w-[100%] text-center mt-[20px]'>
            <Title text1={"WHY"} text2={"CHOOSE US"}/>
            <p className='w-[100%] m-auto text-[13px] md:text-[18px] px-[10px] text-gray-700 '>Customer-Friendly Policies – Committed to Your Satisfaction and Safety.</p>
        </div>
      
        {/* Main Policy Cards */}
        <div className='w-[100%] md:min-h-[50%] h-auto flex items-center justify-center flex-wrap lg:gap-[40px] gap-[30px] px-[20px]'>
        
        {/* Easy Exchange */}
        <div className='w-[300px] max-w-[90%] min-h-[200px] bg-white p-[25px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col items-center gap-[15px] group'>
            <div className='w-[70px] h-[70px] bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300'>
                <RiExchangeFundsLine className='w-[35px] h-[35px] text-blue-600 group-hover:text-white transition-colors duration-300'/>
            </div>
            <p className='font-bold md:text-[22px] text-[18px] text-gray-800 text-center'>Easy Exchange Policy</p>
            <p className='font-medium md:text-[15px] text-[13px] text-gray-600 text-center leading-relaxed'>Exchange Made Easy – Quick, Simple, and Customer-Friendly Process.</p>
            <Link to="/returns" className='text-blue-600 font-semibold text-sm hover:underline mt-[5px]'>Learn More →</Link>
        </div>
        
        {/* 7 Days Return */}
        <div className='w-[300px] max-w-[90%] min-h-[200px] bg-white p-[25px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col items-center gap-[15px] group'>
            <div className='w-[70px] h-[70px] bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300'>
                <FaUndo className='w-[30px] h-[30px] text-green-600 group-hover:text-white transition-colors duration-300'/>
            </div>
            <p className='font-bold md:text-[22px] text-[18px] text-gray-800 text-center'>7 Days Return Policy</p>
            <p className='font-medium md:text-[15px] text-[13px] text-gray-600 text-center leading-relaxed'>Shop with Confidence – 7 Days Easy Return Guarantee.</p>
            <Link to="/returns" className='text-green-600 font-semibold text-sm hover:underline mt-[5px]'>Learn More →</Link>
        </div>
        
        {/* Customer Support */}
        <div className='w-[300px] max-w-[90%] min-h-[200px] bg-white p-[25px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col items-center gap-[15px] group'>
            <div className='w-[70px] h-[70px] bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300'>
                <FaHeadset className='w-[30px] h-[30px] text-purple-600 group-hover:text-white transition-colors duration-300'/>
            </div>
            <p className='font-bold md:text-[22px] text-[18px] text-gray-800 text-center'>Best Customer Support</p>
            <p className='font-medium md:text-[15px] text-[13px] text-gray-600 text-center leading-relaxed'>Trusted Customer Support – Your Satisfaction Is Our Priority.</p>
            <Link to="/customer-support" className='text-purple-600 font-semibold text-sm hover:underline mt-[5px]'>Contact Us →</Link>
        </div>
        
        </div>

        {/* Trust Badges Section */}
        <div className='w-[100%] mt-[20px] px-[20px]'>
            <div className='max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-[20px]'>
                
                {/* Free Shipping */}
                <div className='flex items-center justify-center gap-[12px] bg-white p-[15px] rounded-xl shadow-sm hover:shadow-md transition-all'>
                    <FaShippingFast className='text-2xl text-orange-500'/>
                    <div>
                        <p className='font-bold text-gray-800 text-sm'>Free Shipping</p>
                        <p className='text-xs text-gray-500'>On orders ₹499+</p>
                    </div>
                </div>

                {/* Secure Payment */}
                <div className='flex items-center justify-center gap-[12px] bg-white p-[15px] rounded-xl shadow-sm hover:shadow-md transition-all'>
                    <FaLock className='text-2xl text-green-600'/>
                    <div>
                        <p className='font-bold text-gray-800 text-sm'>Secure Payment</p>
                        <p className='text-xs text-gray-500'>100% Protected</p>
                    </div>
                </div>

                {/* Original Products */}
                <div className='flex items-center justify-center gap-[12px] bg-white p-[15px] rounded-xl shadow-sm hover:shadow-md transition-all'>
                    <FaCheckCircle className='text-2xl text-blue-500'/>
                    <div>
                        <p className='font-bold text-gray-800 text-sm'>100% Original</p>
                        <p className='text-xs text-gray-500'>All Authentic Products</p>
                    </div>
                </div>

                {/* Support */}
                <div className='flex items-center justify-center gap-[12px] bg-white p-[15px] rounded-xl shadow-sm hover:shadow-md transition-all'>
                    <FaShieldAlt className='text-2xl text-purple-500'/>
                    <div>
                        <p className='font-bold text-gray-800 text-sm'>24/7 Support</p>
                        <p className='text-xs text-gray-500'>Always Here for You</p>
                    </div>
                </div>

            </div>
        </div>

    </div>
  )
}

export default OurPolicy
