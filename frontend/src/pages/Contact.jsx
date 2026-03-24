import React, { useState } from 'react'
import Title from '../component/Title'
import contact from "../assets/contact.jpg"
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane, FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa'
import { toast } from 'react-toastify'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('http://localhost:8000/api/user/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Message sent successfully! We will get back to you soon.')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        toast.error(data.message || 'Failed to send message')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col bg-gradient-to-b from-blue-50 to-white gap-8 md:gap-12 pt-24 md:pt-20 pb-10 px-4'>
      <Title text1={'CONTACT'} text2={'US'}/>
      
      <div className='w-full max-w-6xl flex flex-col lg:flex-row gap-8'>
        {/* Contact Info Side */}
        <div className='lg:w-1/2 w-full'>
          <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8'>
            <img 
              src={contact} 
              alt="Contact" 
              className='w-full h-48 md:h-64 object-cover rounded-xl mb-6'
            />
            
            <h3 className='text-xl font-bold text-gray-800 mb-4'>Get In Touch</h3>
            
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <FaMapMarkerAlt className='text-blue-600' />
                </div>
                <div>
                  <p className='font-semibold text-gray-800'>Our Store</p>
                  <p className='text-gray-600 text-sm'>Sharma Store, Kukas Amar, Jaipur, India</p>
                </div>
              </div>
              
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <FaPhone className='text-green-600' />
                </div>
                <div>
                  <p className='font-semibold text-gray-800'>Phone</p>
                  <p className='text-gray-600 text-sm'>+91-6350395820</p>
                </div>
              </div>
              
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <FaEnvelope className='text-red-600' />
                </div>
                <div>
                  <p className='font-semibold text-gray-800'>Email</p>
                  <p className='text-gray-600 text-sm'>asharamsaini2380@gmail.com</p>
                </div>
              </div>
              
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <FaClock className='text-purple-600' />
                </div>
                <div>
                  <p className='font-semibold text-gray-800'>Working Hours</p>
                  <p className='text-gray-600 text-sm'>Mon - Sat: 9:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className='mt-6 pt-6 border-t border-gray-100'>
              <p className='font-semibold text-gray-800 mb-3'>Follow Us</p>
              <div className='flex gap-3'>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className='w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition'>
                  <FaFacebook />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className='w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition'>
                  <FaInstagram />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className='w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white hover:bg-sky-600 transition'>
                  <FaTwitter />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className='w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition'>
                  <FaLinkedin />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Side */}
        <div className='lg:w-1/2 w-full'>
          <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8'>
            <h3 className='text-xl font-bold text-gray-800 mb-2'>Send us a Message</h3>
            <p className='text-gray-500 text-sm mb-6'>Have a question? We'd love to hear from you!</p>
            
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Name *</label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='Your Name'
                    required
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='your@email.com'
                    required
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition'
                  />
                </div>
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Phone</label>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder='+91 9876543210'
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Subject</label>
                  <input
                    type='text'
                    name='subject'
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder='What is this about?'
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition'
                  />
                </div>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Message *</label>
                <textarea
                  name='message'
                  value={formData.message}
                  onChange={handleChange}
                  placeholder='Write your message here...'
                  rows="5"
                  required
                  className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none'
                ></textarea>
              </div>
              
              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message <FaPaperPlane />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Contact
