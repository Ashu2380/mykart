import React from 'react'
import Title from '../component/Title'
import contact from "../assets/contact.jpg"
import NewLetterBox from '../component/NewLetterBox'

function Contact() {
  return (
    <div className='w-[99vw] min-h-[100vh] flex items-center justify-center flex-col bg-blue-50 gap-8 md:gap-12 lg:gap-[50px] pt-24 md:pt-20 lg:pt-24 px-4 md:px-6 lg:px-8'>
      <Title  text1={'CONTACT'} text2={'US'}/>
      <div className='w-[100%]  flex items-center justify-center flex-col lg:flex-row'>
        <div className='lg:w-[50%] w-[100%] flex items-center justify-center '>
          <img src={contact} alt=""  className='lg:w-[70%] w-[80%] shadow-md shadow-black rounded-sm'/>
        </div>
        <div className='lg:w-[50%] w-[80%] flex items-start justify-center gap-[20px]  flex-col mt-[20px] lg:mt-[0px]'>
        <p className='lg:w-[80%] w-[100%] text-gray-800 font-bold lg:text-[18px] text-[15px]'>Our Store</p>
        <p className='lg:w-[80%] w-[100%] text-gray-700 md:text-[16px] text-[13px]'>
          <p>Sharma Store </p>
          <p>Kukas  Amar , Jaipur  , India</p>
        </p>
        <p className='lg:w-[80%] w-[100%] text-gray-700 md:text-[16px] text-[13px]'>
          <p>tel: +91-6350395820</p>
          <p>Email: asharamsaini2380@gmail.com</p>
        </p>
        <p className='lg:w-[80%] w-[100%] text-[15px] text-gray-800 lg:text-[18px] mt-[10px] font-bold'>Careers at Mykart</p>
        <p className='lg:w-[80%] w-[100%] text-gray-700 md:text-[16px] text-[13px]'>Learn more about our teams and job openings</p>
        <button className='px-[30px] py-[20px] flex items-center justify-center text-gray-800 bg-transparent border border-gray-300 active:bg-gray-100 rounded-md' >Explore Jobs</button>
        </div>
      </div>
      <NewLetterBox/>
      
    </div>
  )
}

export default Contact
