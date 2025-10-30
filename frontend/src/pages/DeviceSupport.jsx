import React, { useState } from 'react';
import { 
  FaLaptop, 
  FaMobile, 
  FaTabletAlt, 
  FaHeadphones, 
  FaSearch, 
  FaBook, 
  FaVideo, 
  FaPhone, 
  FaComments,
  FaDownload,
  FaTools,
  FaQuestionCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import Title from '../component/Title';

function DeviceSupport() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  // const [selectedDevice, setSelectedDevice] = useState(null);

  const deviceCategories = [
    { id: 'all', name: 'All Devices', icon: <FaTools /> },
    { id: 'mobile', name: 'Mobile Phones', icon: <FaMobile /> },
    { id: 'laptop', name: 'Laptops', icon: <FaLaptop /> },
    { id: 'tablet', name: 'Tablets', icon: <FaTabletAlt /> },
    { id: 'audio', name: 'Audio Devices', icon: <FaHeadphones /> }
  ];

  const supportArticles = [
    {
      id: 1,
      title: 'How to Set Up Your New Smartphone',
      category: 'mobile',
      type: 'setup',
      description: 'Complete guide to setting up your new smartphone including initial configuration, account setup, and essential apps.',
      readTime: '5 min read',
      difficulty: 'Beginner'
    },
    {
      id: 2,
      title: 'Troubleshooting Laptop Performance Issues',
      category: 'laptop',
      type: 'troubleshooting',
      description: 'Learn how to diagnose and fix common laptop performance problems including slow startup and freezing.',
      readTime: '8 min read',
      difficulty: 'Intermediate'
    },
    {
      id: 3,
      title: 'Tablet Screen Not Responding - Quick Fixes',
      category: 'tablet',
      type: 'troubleshooting',
      description: 'Step-by-step solutions for unresponsive tablet screens and touch sensitivity issues.',
      readTime: '4 min read',
      difficulty: 'Beginner'
    },
    {
      id: 4,
      title: 'Connecting Bluetooth Headphones',
      category: 'audio',
      type: 'setup',
      description: 'How to pair and connect Bluetooth headphones with various devices and troubleshoot connection issues.',
      readTime: '3 min read',
      difficulty: 'Beginner'
    },
    {
      id: 5,
      title: 'Laptop Battery Optimization Tips',
      category: 'laptop',
      type: 'maintenance',
      description: 'Maximize your laptop battery life with these proven tips and best practices.',
      readTime: '6 min read',
      difficulty: 'Intermediate'
    },
    {
      id: 6,
      title: 'Mobile Phone Storage Management',
      category: 'mobile',
      type: 'maintenance',
      description: 'Free up space on your phone and manage storage effectively with these simple techniques.',
      readTime: '5 min read',
      difficulty: 'Beginner'
    }
  ];

  const commonIssues = [
    {
      issue: 'Device won\'t turn on',
      solution: 'Check battery charge, try different charger, perform hard reset',
      category: 'all'
    },
    {
      issue: 'Slow performance',
      solution: 'Close unused apps, restart device, check available storage',
      category: 'all'
    },
    {
      issue: 'Wi-Fi connection problems',
      solution: 'Restart router, forget and reconnect network, check network settings',
      category: 'all'
    },
    {
      issue: 'App crashes frequently',
      solution: 'Update app, clear app cache, restart device, reinstall app',
      category: 'mobile'
    },
    {
      issue: 'Screen flickering',
      solution: 'Update display drivers, check cable connections, adjust refresh rate',
      category: 'laptop'
    },
    {
      issue: 'Audio not working',
      solution: 'Check volume settings, update audio drivers, test with different audio source',
      category: 'audio'
    }
  ];

  const filteredArticles = supportArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredIssues = commonIssues.filter(issue => {
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory || issue.category === 'all';
    const matchesSearch = issue.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.solution.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'setup': return <FaTools className="text-blue-400" />;
      case 'troubleshooting': return <FaExclamationTriangle className="text-red-400" />;
      case 'maintenance': return <FaQuestionCircle className="text-green-400" />;
      default: return <FaBook className="text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400';
      case 'Intermediate': return 'text-yellow-400';
      case 'Advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className='w-full min-h-screen bg-blue-50 pt-24 md:pt-20 lg:pt-24 px-4 md:px-6 lg:px-8 pb-20'>
      <div className='max-w-6xl mx-auto'>
        <Title text1={'DEVICE SUPPORT &'} text2={'HELP CENTER'} />
        
        {/* Search Bar */}
        <div className='mb-8'>
          <div className='relative'>
            <FaSearch className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search for help articles, troubleshooting guides...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-4 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:outline-none text-lg'
            />
          </div>
        </div>

        {/* Device Categories */}
        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Device Categories</h2>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
            {deviceCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  selectedCategory === category.id 
                    ? 'border-blue-500 bg-blue-500/20' 
                    : 'border-gray-600 bg-white/5 hover:border-gray-500'
                }`}
              >
                <div className='flex flex-col items-center gap-2 text-gray-800'>
                  <div className='text-3xl'>{category.icon}</div>
                  <span className='text-sm text-center'>{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Contact Options */}
        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Need Immediate Help?</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600 text-center'>
              <FaPhone className='text-4xl text-blue-400 mx-auto mb-4' />
              <h3 className='text-gray-800 font-semibold mb-2'>Call Support</h3>
              <p className='text-gray-600 text-sm mb-4'>Talk to our technical experts</p>
              <div className='space-y-2'>
                <a
                  href="tel:+916350395820"
                  className='block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm'
                >
                  📞 +91 6350395820
                </a>
                <a
                  href="tel:+918003588721"
                  className='block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm'
                >
                  📞 +91 8003588721
                </a>
              </div>
            </div>

            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600 text-center'>
              <FaComments className='text-4xl text-green-400 mx-auto mb-4' />
              <h3 className='text-gray-800 font-semibold mb-2'>Live Chat</h3>
              <p className='text-gray-600 text-sm mb-4'>Chat with support agents</p>
              <button
                onClick={() => window.location.href = '/chat-support'}
                className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-300'
              >
                Start Chat
              </button>
            </div>

            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600 text-center'>
              <FaVideo className='text-4xl text-purple-400 mx-auto mb-4' />
              <h3 className='text-gray-800 font-semibold mb-2'>Video Support</h3>
              <p className='text-gray-600 text-sm mb-4'>Screen sharing assistance</p>
              <div className='space-y-2'>
                <a
                  href="tel:+919509564164"
                  className='block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm'
                >
                  📞 +91 9509564164
                </a>
                <a
                  href="tel:+917357082882"
                  className='block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm'
                >
                  📞 +91 73570 82882
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Common Issues & Quick Fixes</h2>
          <div className='space-y-4'>
            {filteredIssues.map((item, index) => (
              <div key={index} className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
                <div className='flex items-start gap-4'>
                  <FaExclamationTriangle className='text-yellow-400 text-xl mt-1 flex-shrink-0' />
                  <div className='flex-1'>
                    <h3 className='text-gray-800 font-semibold mb-2'>{item.issue}</h3>
                    <p className='text-gray-600 text-sm'>{item.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Articles */}
        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Help Articles & Guides</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredArticles.map(article => (
              <div key={article.id} className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600 hover:border-blue-500 transition-all duration-300 cursor-pointer'>
                <div className='flex items-center gap-2 mb-3'>
                  {getTypeIcon(article.type)}
                  <span className='text-xs text-gray-400 uppercase tracking-wide'>{article.type}</span>
                </div>
                
                <h3 className='text-gray-800 font-semibold mb-3 line-clamp-2'>{article.title}</h3>
                <p className='text-gray-600 text-sm mb-4 line-clamp-3'>{article.description}</p>
                
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-gray-400'>{article.readTime}</span>
                  <span className={`font-semibold ${getDifficultyColor(article.difficulty)}`}>
                    {article.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className='text-center py-12'>
              <FaBook className='text-6xl text-gray-500 mx-auto mb-4' />
              <p className='text-gray-800 text-xl mb-4'>No articles found</p>
              <p className='text-gray-600'>Try adjusting your search or category filter</p>
            </div>
          )}
        </div>

        {/* Downloads Section */}
        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Downloads & Resources</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {[
              { name: 'User Manuals', icon: <FaBook />, description: 'Device user guides and manuals' },
              { name: 'Drivers', icon: <FaDownload />, description: 'Latest device drivers and software' },
              { name: 'Firmware Updates', icon: <FaTools />, description: 'Firmware updates for your devices' },
              { name: 'Diagnostic Tools', icon: <FaSearch />, description: 'Tools to diagnose device issues' }
            ].map((resource, index) => (
              <div key={index} className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600 text-center hover:border-blue-500 transition-all duration-300 cursor-pointer'>
                <div className='text-3xl text-blue-400 mb-3'>{resource.icon}</div>
                <h3 className='text-gray-800 font-semibold mb-2'>{resource.name}</h3>
                <p className='text-gray-600 text-sm'>{resource.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Warranty Information */}
        <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Warranty & Service Information</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-gray-800 font-semibold mb-3'>Check Warranty Status</h3>
              <p className='text-gray-600 text-sm mb-4'>
                Enter your device serial number to check warranty coverage and service options.
              </p>
              <div className='flex gap-2'>
                <input
                  type='text'
                  placeholder='Enter serial number'
                  className='flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                />
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300'>
                  Check
                </button>
              </div>
            </div>

            <div>
              <h3 className='text-gray-800 font-semibold mb-3'>Service Centers</h3>
              <p className='text-gray-600 text-sm mb-4'>
                Find authorized service centers near you for repairs and maintenance.
              </p>
              <div className='space-y-2 mb-4'>
                <a
                  href="tel:+916350395820"
                  className='block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm text-center'
                >
                  📞 Service: +91 6350395820
                </a>
                <a
                  href="tel:+918003588721"
                  className='block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm text-center'
                >
                  📞 Support: +91 8003588721
                </a>
              </div>
              <button className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-300 w-full'>
                Find Service Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceSupport;
