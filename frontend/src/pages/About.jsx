import React from 'react'
import Title from '../component/Title'
import about from '../assets/about.jpg'
import asharamImg from '../assets/Asharam.jpeg'
import bhawneshImg from '../assets/Bhawnesh.jpeg'
import hiteshImg from '../assets/hitesh.jpeg'
import himanshuImg from '../assets/himanshu.jpeg'
import '../styles.css'
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa'

function About() {
  return (
    <>
    {/* Main container for the About page */}
    <div className='about-main w-full max-w-[100%] overflow-x-hidden'>
      <Title text1={'ABOUT'} text2={'US'}/>
      {/* Container for About Us section */}
      <div className='w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 flex items-center justify-center flex-col lg:flex-row gap-6 lg:gap-8'>

        {/* Image container */}
        <div className='about-image-container w-full lg:w-1/2 flex items-center justify-center p-4'>
          <img src={about} alt="" className='w-full max-w-[500px] lg:w-[65%] shadow-md shadow-black rounded-sm' />
        </div>
        {/* Text content container */}
        <div className='about-text-container lg:w-1/2 w-full flex items-start justify-center gap-4 flex-col mt-6 lg:mt-0 px-4'>
          <p className='lg:w-[80%] w-full text-gray-700 md:text-base text-sm'>
           Welcome to My Kart, your trusted destination for online shopping. We are more than just an e-commerce platform – we are a community that connects customers with quality products at affordable prices.

At My Kart, we believe that shopping should be simple, secure, and enjoyable. That's why we bring together a wide range of categories – from fashion, electronics, and accessories to home essentials, beauty, and lifestyle products – all in one place
          </p>
          <p className='lg:w-[80%] w-full text-gray-700 md:text-base text-sm'>
             modern shoppers—combining style, convenience, and affordability. Whether it's fashion, essentials, or trends, we bring everything you need to one trusted platform with fast delivery, easy returns, and a customer-first shopping experience you'll love.
          </p>
          <p className='lg:w-[80%] w-full text-base text-gray-800 lg:text-lg mt-2 font-bold'>Our Mission</p>
          <p className='lg:w-[80%] w-full text-gray-700 md:text-base text-sm'>
            Our mission is to make online shopping accessible to everyone, offering products that suit every lifestyle and budget. We are committed to delivering value, convenience, and customer satisfaction.
          </p>
        </div>
      </div>
      {/* Container for Why Choose Us section */}
      <div className='w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 flex items-center justify-center flex-col gap-6'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
        {/* Features container */}
        <div className='about-features-container w-full max-w-[1000px] flex items-center justify-center lg:flex-row flex-col py-8 lg:py-10 gap-4 lg:gap-6'>

          {/* Quality Assurance feature */}
          <div className='about-feature-quality lg:w-1/3 w-full min-h-[180px] lg:min-h-[250px] border border-gray-300 flex items-center justify-center gap-4 flex-col px-4 py-4 text-gray-700 backdrop-blur bg-white/90 shadow-sm rounded-lg'>
            <b className='text-lg md:text-xl font-semibold text-blue-700'>Quality Assurance</b>
            <p className='text-gray-600 text-center text-sm md:text-base'>We guarantee quality through strict checks, reliable sourcing, and a commitment to customer satisfaction always.</p>
          </div>
          {/* Convenience feature */}
           <div className='about-feature-convenience lg:w-1/3 w-full min-h-[180px] lg:min-h-[250px] border border-gray-300 flex items-center justify-center gap-4 flex-col px-4 py-4 text-gray-700 backdrop-blur bg-white/90 shadow-sm rounded-lg'>
            <b className='text-lg md:text-xl font-semibold text-blue-700'>Convenience</b>
            <p className='text-gray-600 text-center text-sm md:text-base'>
             Shop easily with fast delivery, simple navigation, secure checkout, and everything you need in one place.
            </p>
          </div>
          {/* Exceptional Customer Service feature */}
           <div className='about-feature-service lg:w-1/3 w-full min-h-[180px] lg:min-h-[250px] border border-gray-300 flex items-center justify-center gap-4 flex-col px-4 py-4 text-gray-700 backdrop-blur bg-white/90 shadow-sm rounded-lg'>
            <b className='text-lg md:text-xl font-semibold text-blue-700'>Exceptional Customer Service</b>
            <p className='text-gray-600 text-center text-sm md:text-base'>
              Our dedicated support team ensures quick responses, helpful solutions, and a smooth shopping experience every time.
            </p>
          </div>
        </div>
      </div>
      
      {/* Team Section */}
      <div className='w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 flex items-center justify-center flex-col gap-6 py-8 lg:py-10'>
        <Title text1={'OUR'} text2={'TEAM'}/>
        <p className='text-gray-600 text-center max-w-2xl px-4 mb-6 text-sm md:text-base'>
          Meet the passionate team behind My Kart who work tirelessly to bring you the best shopping experience.
        </p>
        <div className='about-features-container w-full max-w-[1000px] flex items-center justify-center lg:flex-row flex-col py-8 lg:py-10 gap-6'>

          {/* Team Member 1 */}
          <div className='lg:w-1/3 xl:w-1/4 w-full border border-gray-200 flex items-center justify-center gap-4 flex-col px-6 py-6 text-gray-700 bg-white/90 shadow-sm rounded-xl hover:shadow-lg transition-shadow'>
            <img 
              src={asharamImg} 
              alt='Ashharam Saini' 
              className='w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover shadow-md'
            />
            <div className='text-center'>
              <b className='text-lg md:text-xl font-semibold text-gray-800'>Ashharam Saini</b>
              <p className='text-blue-600 font-medium text-sm md:text-base'>Founder & CEO</p>
              <p className='text-gray-500 text-sm mt-2'>
                Visionary leader with passion for e-commerce and customer satisfaction.
              </p>
              <div className='flex justify-center gap-3 mt-4'>
                <a href="https://www.facebook.com/share/1E3vktD8XW/" target="_blank" rel="noopener noreferrer" className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition'>
                  <FaFacebook size={14} />
                </a>
                <a href="https://www.instagram.com/ashusaini2380?igsh=dTJrNGp4YXE5d3k0" target="_blank" rel="noopener noreferrer" className='w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition'>
                  <FaInstagram size={14} />
                </a>
                <a href="https://www.linkedin.com/in/asharam-saini?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className='w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition'>
                  <FaLinkedin size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Team Member 2 */}
          <div className='lg:w-1/3 xl:w-1/4 w-full border border-gray-200 flex items-center justify-center gap-4 flex-col px-6 py-6 text-gray-700 bg-white/90 shadow-sm rounded-xl hover:shadow-lg transition-shadow'>
            <img 
              src={himanshuImg} 
              alt='Himanshu' 
              className='w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover shadow-md'
            />
            <div className='text-center'>
              <b className='text-lg md:text-xl font-semibold text-gray-800'>Himanshu</b>
              <p className='text-blue-600 font-medium text-sm md:text-base'>Head of Operations</p>
              <p className='text-gray-500 text-sm mt-2'>
                Expert in logistics and supply chain management.
              </p>
              <div className='flex justify-center gap-3 mt-4'>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition'>
                  <FaFacebook size={14} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className='w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition'>
                  <FaInstagram size={14} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className='w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition'>
                  <FaLinkedin size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Team Member 3 */}
          <div className='lg:w-1/3 xl:w-1/4 w-full border border-gray-200 flex items-center justify-center gap-4 flex-col px-6 py-6 text-gray-700 bg-white/90 shadow-sm rounded-xl hover:shadow-lg transition-shadow'>
            <img 
              src={hiteshImg} 
              alt='Hitesh Singh' 
              className='w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover shadow-md'
            />
            <div className='text-center'>
              <b className='text-lg md:text-xl font-semibold text-gray-800'>Hitesh Singh</b>
              <p className='text-blue-600 font-medium text-sm md:text-base'>Customer Support Lead</p>
              <p className='text-gray-500 text-sm mt-2'>
                Dedicated to providing excellent customer service.
              </p>
              <div className='flex justify-center gap-3 mt-4'>
                {/* <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition'>
                  <FaFacebook size={14} />
                </a> */}
                <a href="https://www.instagram.com/hiteshchauhan018?igsh=eWZlZHc4dGJ3ajI4" target="_blank" rel="noopener noreferrer" className='w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition'>
                  <FaInstagram size={14} />
                </a>
                <a href="https://www.linkedin.com/in/hitesh-singh-chouhan-72547635b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className='w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition'>
                  <FaLinkedin size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Team Member 4 */}
          <div className='lg:w-1/3 xl:w-1/4 w-full border border-gray-200 flex items-center justify-center gap-4 flex-col px-6 py-6 text-gray-700 bg-white/90 shadow-sm rounded-xl hover:shadow-lg transition-shadow'>
            <img 
              src={bhawneshImg} 
              alt='Bhawnesh Gautam' 
              className='w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover shadow-md'
            />
            <div className='text-center'>
              <b className='text-lg md:text-xl font-semibold text-gray-800'>Bhawnesh Gautam</b>
              <p className='text-blue-600 font-medium text-sm md:text-base'>Marketing Director</p>
              <p className='text-gray-500 text-sm mt-2'>
                Strategic thinker driving brand growth and customer engagement.
              </p>
              <div className='flex justify-center gap-3 mt-4'>
                <a href="https://www.facebook.com/share/19DNkRbk6Q/" target="_blank" rel="noopener noreferrer" className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition'>
                  <FaFacebook size={14} />
                </a>
                <a href="https://www.instagram.com/bhawnesh_11?igsh=cXFodDc4MTRlZHNx" target="_blank" rel="noopener noreferrer" className='w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition'>
                  <FaInstagram size={14} />
                </a>
                <a href="https://www.linkedin.com/in/bhawnesh-gtm3?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className='w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition'>
                  <FaLinkedin size={14} />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
    </>
  )
}

export default About
