import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBox,
  FaUndo,
  FaHome,
  FaCrown,
  FaCreditCard,
  FaUser,
  FaLaptop,
  FaWhatsapp
} from 'react-icons/fa';

function CustomerSupport() {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I track my order?',
      answer: 'You can track your order by going to "My Orders" in your account dashboard. Click on the specific order to see its current status, tracking number, and estimated delivery date. You can also use the tracking number to check updates on our shipping partner\'s website.'
    },
    {
      id: 2,
      question: 'How do I return an item?',
      answer: 'To return an item, go to "My Orders" and select the order containing the item you want to return. Click on "Return Item" and follow the instructions. You\'ll need to provide a reason for the return and package the item securely. Once processed, we\'ll provide a return shipping label and refund your payment within 3-5 business days after receiving the item.'
    },
    {
      id: 3,
      question: 'How do I change my delivery address?',
      answer: 'You can change your delivery address before the order ships by going to "My Orders" and selecting the order. If the order hasn\'t shipped yet, you can update the address. For shipped orders, please contact our customer service team immediately. Note that address changes may not be possible for express delivery orders.'
    },
    {
      id: 4,
      question: 'How do I cancel my order?',
      answer: 'Orders can be cancelled before they ship. Go to "My Orders", find the order you want to cancel, and click "Cancel Order". If the order has already shipped, you\'ll need to return it instead. Cancellations are processed within 24 hours, and refunds will be issued to your original payment method.'
    },
    {
      id: 5,
      question: 'How do I update my payment method?',
      answer: 'To update your payment method, go to "Payment Settings" in your account. You can add new cards, remove old ones, or set a default payment method. For security, we may require verification for certain changes. All payment information is encrypted and secure.'
    }
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const supportOptions = [
    {
      id: 1,
      title: 'Your Orders',
      description: 'Track packages\nEdit or cancel orders',
      icon: <FaBox className="text-4xl text-orange-500" />,
      onClick: () => navigate('/order')
    },
    {
      id: 2,
      title: 'Returns and Refunds',
      description: 'Return or exchange items\nPrint return mailing labels',
      icon: <FaUndo className="text-4xl text-blue-500" />,
      onClick: () => navigate('/returns')
    },
    {
      id: 3,
      title: 'Manage Addresses',
      description: 'Update your addresses\nAdd address, landmark details',
      icon: <FaHome className="text-4xl text-cyan-500" />,
      onClick: () => navigate('/addresses')
    },
    {
      id: 4,
      title: 'Payment Settings',
      description: 'Add or edit payment methods\nChange expired debit or credit card',
      icon: <FaCreditCard className="text-4xl text-blue-400" />,
      onClick: () => navigate('/payment-settings')
    },
    {
      id: 5,
      title: 'Account Settings',
      description: 'Change your email or password\nUpdate login information',
      icon: <FaUser className="text-4xl text-orange-400" />,
      onClick: () => navigate('/account-settings')
    },
    {
      id: 6,
      title: 'Digital Services and Device Support',
      description: 'Find device help and support\nTroubleshoot device issues',
      icon: <FaLaptop className="text-4xl text-gray-600" />,
      onClick: () => navigate('/device-support')
    }
  ];

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] pt-24 md:pt-20 lg:pt-24 px-4 md:px-6 lg:px-8 pb-20'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl md:text-4xl font-bold text-white mb-2'>
            Some things you can do here
          </h1>
        </div>

        {/* Support Options Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {supportOptions.map((option) => (
            <div
              key={option.id}
              className='bg-white rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105'
              onClick={option.onClick}
            >
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0'>
                  {option.icon}
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    {option.title}
                  </h3>
                  <div className='text-sm text-gray-600'>
                    {option.description.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help Section */}
        <div className='mt-12 bg-white/10 backdrop-blur-sm rounded-lg p-6'>
          <h2 className='text-2xl font-bold text-white mb-4'>Need More Help?</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <button
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300'
              onClick={() => navigate('/contact')}
            >
              Contact Customer Service
            </button>
            <button
              className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-300'
              onClick={() => navigate('/chat-support')}
            >
              Start Live Chat
            </button>
            <button
              className='bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2'
              onClick={() => window.open('https://wa.me/916350395820?text=Hello, I need help with my order', '_blank')}
            >
              <FaWhatsapp className="text-lg" />
              WhatsApp Support
            </button>
          </div>

          {/* Customer Service Phone Numbers */}
          <div className='mt-6 pt-6 border-t border-white/20'>
            <h3 className='text-lg font-semibold text-white mb-3'>Call Customer Service</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <a
                href="tel:+916350395820"
                className='bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2'
              >
                📞 +91 6350395820
              </a>
              <a
                href="tel:+918003588721"
                className='bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2'
              >
                📞 +91 8003588721
              </a>
              <a
                href="tel:+919509564164"
                className='bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2'
              >
                📞 +91 9509564164
              </a>
              <a
                href="tel:+917357082882"
                className='bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2'
              >
                📞 +91 73570 82882
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className='mt-8 bg-white/5 backdrop-blur-sm rounded-lg p-6'>
          <h3 className='text-xl font-semibold text-white mb-4'>Frequently Asked Questions</h3>
          <div className='space-y-3'>
            {faqs.map((faq) => (
              <div key={faq.id} className='border-b border-white/10 last:border-b-0'>
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className='w-full text-left py-3 px-2 text-gray-300 hover:text-white transition-colors duration-300 flex items-center justify-between'
                >
                  <span className='flex items-center gap-2'>
                    <span className='text-blue-400'>•</span>
                    {faq.question}
                  </span>
                  <span className={`transform transition-transform duration-300 ${expandedFAQ === faq.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {expandedFAQ === faq.id && (
                  <div className='px-6 pb-4 text-gray-400 text-sm leading-relaxed transition-all duration-300 ease-in-out'>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerSupport;
