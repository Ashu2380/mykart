import React from 'react'
import Title from '../component/Title'
import about from '../assets/about.jpg'
import NewLetterBox from '../component/NewLetterBox'
import '../styles.css'

function About() {
  return (
    <>
    {/* Main container for the About page */}
    <div className='about-main bg-blue-50'>
      <Title text1={'ABOUT'} text2={'US'}/>
      {/* Container for About Us section */}
      <div className='w-[100%]  flex items-center justify-center flex-col lg:flex-row'>

        {/* Image container */}
        <div className='about-image-container'>
          <img src={about} alt="" className='lg:w-[65%] w-[80%] shadow-md shadow-black rounded-sm' />
        </div>
        {/* Text content container */}
        <div className='about-text-container lg:w-[50%] w-[80%] flex items-start justify-center gap-[20px]  flex-col mt-[20px] lg:mt-[0px]'>
          <p className='lg:w-[80%] w-[100%] text-gray-700 md:text-[16px] text-[13px]'>
           Welcome to My Kart, your trusted destination for online shopping. We are more than just an e-commerce platform – we are a community that connects customers with quality products at affordable prices.

At My Kart, we believe that shopping should be simple, secure, and enjoyable. That's why we bring together a wide range of categories – from fashion, electronics, and accessories to home essentials, beauty, and lifestyle products – all in one place
          </p>
          <p className='lg:w-[80%] w-[100%] text-gray-700 md:text-[16px] text-[13px]'>
             modern shoppers—combining style, convenience, and affordability. Whether it's fashion, essentials, or trends, we bring everything you need to one trusted platform with fast delivery, easy returns, and a customer-first shopping experience you'll love.
          </p>
          <p className='lg:w-[80%] w-[100%] text-[15px] text-gray-800 lg:text-[18px] mt-[10px] font-bold'>Our Mission</p>
          <p className='lg:w-[80%] w-[100%] text-gray-700 md:text-[16px] text-[13px]'>
            Our mission is to make online shopping accessible to everyone, offering products that suit every lifestyle and budget. We are committed to delivering value, convenience, and customer satisfaction.
          </p>
        </div>
      </div>
      {/* Container for Why Choose Us section */}
      <div className='w-[100%] flex items-center justify-center flex-col gap-[10px]'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
        {/* Features container */}
        <div className='about-features-container w-[80%] flex items-center justify-center lg:flex-row flex-col py-[40px]'>

          {/* Quality Assurance feature */}
          <div className='about-feature-quality lg:w-[33%] w-[90%] h-[250px] border-[1px] border-gray-300 flex items-center justify-center gap-[20px] flex-col  px-[40px] py-[10px] text-gray-700 backdrop-blur-[2px] bg-white/90 shadow-sm'>
            <b className='text-[20px] font-semibold text-blue-700'>Quality Assurance</b>
            <p className='text-gray-600'>We guarantee quality through strict checks, reliable sourcing, and a commitment to customer satisfaction always.</p>
          </div>
          {/* Convenience feature */}
           <div className='about-feature-convenience lg:w-[33%] w-[90%] h-[250px] border-[1px] border-gray-300 flex items-center justify-center gap-[20px] flex-col  px-[40px] py-[10px] text-gray-700 backdrop-blur-[2px] bg-white/90 shadow-sm'>
            <b className='text-[20px] font-semibold text-blue-700'>Convenience</b>
            <p className='text-gray-600'>
             Shop easily with fast delivery, simple navigation, secure checkout, and everything you need in one place.
            </p>
          </div>
          {/* Exceptional Customer Service feature */}
           <div className='about-feature-service lg:w-[33%] w-[90%] h-[250px] border-[1px] border-gray-300 flex items-center justify-center gap-[20px] flex-col  px-[40px] py-[10px] text-gray-700 backdrop-blur-[2px] bg-white/90 shadow-sm'>
            <b className='text-[20px] font-semibold text-blue-700'>Exceptional Customer Service</b>
            <p className='text-gray-600'>
              Our dedicated support team ensures quick responses, helpful solutions, and a smooth shopping experience every time.
            </p>
          </div>
        </div>
      </div>
      <NewLetterBox/>
      
    </div>
    </>
  )
}

export default About
