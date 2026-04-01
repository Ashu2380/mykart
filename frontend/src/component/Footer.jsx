import React, { useState } from 'react'
import logo from "../assets/logo.png"
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin, FaGooglePlay, FaApple, FaCheck, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState(null); // null | 'success' | 'error'

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setSubscribeStatus(null);

    try {
      const response = await fetch('http://localhost:8000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSubscribeStatus('success');
        toast.success(data.message || 'Successfully subscribed to newsletter!');
        setEmail('');
      } else {
        setSubscribeStatus('error');
        toast.error(data.message || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setSubscribeStatus('error');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className='w-[100%] md:h-auto min-h-[36vh] mb-[77px] md:mb-[0px] bg-gradient-to-b from-blue-50 to-white'>
        <div className='w-[100%] md:py-[40px] py-[20px] md:px-[50px] px-[15px]'>
            <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[30px]'>
                {/* Company Info */}
                <div className='flex flex-col items-start gap-[10px]'>
                    <div className='flex items-center gap-[8px] cursor-pointer' onClick={() => window.location.href = '/'}>
                        <img src={logo} alt="" className='md:w-[40px] md:h-[40px] w-[35px] h-[35px] rounded-lg'/>
                        <p className='text-[22px] md:text-[24px] text-[#1e2223] font-bold'>Mykart</p>
                    </div>
                    <p className='text-[14px] text-[#555] leading-relaxed hidden md:block'>Your all-in-one online shopping destination, offering top-quality products, unbeatable deals, and fast delivery.</p>
                    <p className='text-[14px] text-[#555] flex md:hidden text-center w-full'>Fast. Easy. Reliable. Mykart Shopping</p>
                    
                    {/* Social Media Links */}
                    <div className='flex items-center gap-[12px] mt-[10px]'>
                        <a href="https://facebook.com" target='_blank' rel='noopener noreferrer' className='w-[35px] h-[35px] bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-all duration-300 transform hover:scale-110'>
                            <FaFacebook size={18} />
                        </a>
                        <a href="https://instagram.com" target='_blank' rel='noopener noreferrer' className='w-[35px] h-[35px] bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition-all duration-300 transform hover:scale-110'>
                            <FaInstagram size={18} />
                        </a>
                        <a href="https://twitter.com" target='_blank' rel='noopener noreferrer' className='w-[35px] h-[35px] bg-sky-500 rounded-full flex items-center justify-center text-white hover:bg-sky-600 transition-all duration-300 transform hover:scale-110'>
                            <FaTwitter size={18} />
                        </a>
                        <a href="https://youtube.com" target='_blank' rel='noopener noreferrer' className='w-[35px] h-[35px] bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-all duration-300 transform hover:scale-110'>
                            <FaYoutube size={18} />
                        </a>
                        <a href="https://linkedin.com" target='_blank' rel='noopener noreferrer' className='w-[35px] h-[35px] bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-all duration-300 transform hover:scale-110'>
                            <FaLinkedin size={18} />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className='flex flex-col items-center md:items-start gap-[8px]'>
                    <p className='text-[18px] md:text-[20px] text-[#1e2223] font-semibold mb-[5px]'>QUICK LINKS</p>
                    <ul className='flex flex-col gap-[8px]'>
                        <li className='text-[14px] text-[#555] cursor-pointer hover:text-blue-600 hover:translate-x-1 transition-all duration-200'><Link to="/">Home</Link></li>
                        <li className='text-[14px] text-[#555] cursor-pointer hover:text-blue-600 hover:translate-x-1 transition-all duration-200'><Link to="/about">About Us</Link></li>
                        <li className='text-[14px] text-[#555] cursor-pointer hover:text-blue-600 hover:translate-x-1 transition-all duration-200'><Link to="/collection">Collections</Link></li>
                        <li className='text-[14px] text-[#555] cursor-pointer hover:text-blue-600 hover:translate-x-1 transition-all duration-200'><Link to="/contact">Contact Us</Link></li>
                        <li className='text-[14px] text-[#555] cursor-pointer hover:text-blue-600 hover:translate-x-1 transition-all duration-200'>Privacy Policy</li>
                    </ul>
                </div>

                {/* Customer Service */}
                <div className='flex flex-col items-center md:items-start gap-[8px]'>
                    <p className='text-[18px] md:text-[20px] text-[#1e2223] font-semibold mb-[5px]'>CUSTOMER SERVICE</p>
                    <ul className='flex flex-col gap-[8px]'>
                        <li className='text-[14px] text-[#555] cursor-pointer hover:text-blue-600 hover:translate-x-1 transition-all duration-200'>Track Order</li>
                        <li className='text-[14px] text-[#555] cursor-pointer hover:text-blue-600 hover:translate-x-1 transition-all duration-200'><Link to="/returns">Returns & Exchanges</Link></li>
                        <li className='text-[14px] text-[#555] cursor-pointer hover:text-blue-600 hover:translate-x-1 transition-all duration-200'><Link to="/customer-support">Help Center</Link></li>
                        <li className='text-[14px] text-[#555] cursor-pointer hover:text-blue-600 hover:translate-x-1 transition-all duration-200'>FAQ</li>
                        <li className='text-[14px] text-[#555] cursor-pointer hover:text-blue-600 hover:translate-x-1 transition-all duration-200'>Terms & Conditions</li>
                    </ul>
                </div>

                {/* Newsletter & Contact */}
                <div className='flex flex-col items-center md:items-start gap-[12px]'>
                    <p className='text-[18px] md:text-[20px] text-[#1e2223] font-semibold'>GET IN TOUCH</p>
                    <ul className='flex flex-col gap-[6px]'>
                        <li className='text-[14px] text-[#555] flex items-center gap-[8px]'>
                            <span className='font-medium'>Phone:</span>+91-6350395820
                        </li>
                        <li className='text-[14px] text-[#555] flex items-center gap-[8px]'>
                            <span className='font-medium'>Email:</span>asharamsaini2380@gmail.com
                        </li>
                    </ul>
                    
                    {/* Newsletter Subscription */}
                    <div className='w-full mt-[10px]'>
                        <p className='text-[14px] text-[#555] mb-[8px] font-medium'>Subscribe to Newsletter</p>
                        {subscribeStatus === 'success' ? (
                          <div className='flex items-center gap-[8px] p-[12px] bg-green-100 border border-green-400 rounded-lg'>
                            <FaCheck className='text-green-600' />
                            <span className='text-[14px] text-green-700'>Thanks for subscribing!</span>
                          </div>
                        ) : (
                          <form onSubmit={handleSubscribe} className='flex'>
                            <input 
                              type="email" 
                              placeholder="Enter your email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isLoading}
                              className='flex-1 px-[12px] py-[10px] border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500 text-[14px] disabled:bg-gray-100'
                            />
                            <button 
                              type="submit"
                              disabled={isLoading}
                              className='px-[16px] py-[10px] bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-[14px] disabled:bg-blue-400'
                            >
                              {isLoading ? '...' : 'Subscribe'}
                            </button>
                          </form>
                        )}
                    </div>

                    {/* App Download */}
                    <div className='mt-[10px]'>
                        <p className='text-[14px] text-[#555] mb-[8px] font-medium'>Download App</p>
                        <div className='flex gap-[10px]'>
                            <button className='flex items-center gap-[8px] px-[12px] py-[8px] bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200'>
                                <FaGooglePlay size={18} />
                                <div className='flex flex-col items-start'>
                                    <span className='text-[10px]'>Get it on</span>
                                    <span className='text-[12px] font-medium'>Google Play</span>
                                </div>
                            </button>
                            <button className='flex items-center gap-[8px] px-[12px] py-[8px] bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200'>
                                <FaApple size={20} />
                                <div className='flex flex-col items-start'>
                                    <span className='text-[10px]'>Download on</span>
                                    <span className='text-[12px] font-medium'>App Store</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className='max-w-7xl mx-auto mt-[30px] pt-[20px] border-t border-gray-200'>
                <div className='flex flex-col md:flex-row items-center justify-between gap-[15px]'>
                    <p className='text-[14px] text-[#555]'>We Accept:</p>
                    <div className='flex items-center gap-[15px] flex-wrap justify-center'>
                        <div className='px-[12px] py-[6px] bg-white border border-gray-300 rounded text-[12px] font-medium text-gray-600'>Visa</div>
                        <div className='px-[12px] py-[6px] bg-white border border-gray-300 rounded text-[12px] font-medium text-gray-600'>Mastercard</div>
                        <div className='px-[12px] py-[6px] bg-white border border-gray-300 rounded text-[12px] font-medium text-gray-600'>UPI</div>
                        <div className='px-[12px] py-[6px] bg-white border border-gray-300 rounded text-[12px] font-medium text-gray-600'>Crypto</div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Copyright */}
        <div className='w-[100%] h-auto md:h-[5vh] py-[15px] md:py-0 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center'>
            <p className='text-[13px] text-white text-center'>Copyright 2025 @Mykart.com - All Rights Reserved | Designed with ❤️ by Mykart Team</p>
        </div>
       
    </div>
  )
}

export default Footer
