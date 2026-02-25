import React, { useState } from 'react'
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegListAlt, FaUsers, FaStar } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import { MdDashboard } from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
    let navigate = useNavigate()
    let location = useLocation()
    const [hoveredItem, setHoveredItem] = useState(null)

    const menuItems = [
        { path: '/', icon: MdDashboard, label: 'Dashboard', color: 'blue' },
        { path: '/add', icon: IoIosAddCircleOutline, label: 'Add Items', color: 'green' },
        { path: '/lists', icon: FaRegListAlt, label: 'List Items', color: 'purple' },
        { path: '/orders', icon: SiTicktick, label: 'Orders', color: 'orange' },
        { path: '/users', icon: FaUsers, label: 'Users', color: 'pink' },
        { path: '/reviews', icon: FaStar, label: 'Reviews', color: 'yellow' }
    ]

    const getHoverColor = (color) => {
        switch(color) {
            case 'blue': return 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
            case 'green': return 'hover:bg-green-50 hover:border-green-300 hover:text-green-600'
            case 'purple': return 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600'
            case 'orange': return 'hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600'
            case 'pink': return 'hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600'
            case 'yellow': return 'hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-600'
            default: return 'hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600'
        }
    }

    const getActiveColor = (color) => {
        switch(color) {
            case 'blue': return 'bg-blue-100 border-blue-400 text-blue-700 shadow-md'
            case 'green': return 'bg-green-100 border-green-400 text-green-700 shadow-md'
            case 'purple': return 'bg-purple-100 border-purple-400 text-purple-700 shadow-md'
            case 'orange': return 'bg-orange-100 border-orange-400 text-orange-700 shadow-md'
            case 'pink': return 'bg-pink-100 border-pink-400 text-pink-700 shadow-md'
            case 'yellow': return 'bg-yellow-100 border-yellow-400 text-yellow-700 shadow-md'
            default: return 'bg-gray-100 border-gray-400 text-gray-700 shadow-md'
        }
    }

  return (
    <div className='w-[60px] md:w-[18%] h-[calc(100vh-70px)] bg-gradient-to-b from-white/95 to-blue-50/95 backdrop-blur-sm border-r border-gray-200 py-[20px] fixed left-0 top-[70px] shadow-lg z-10'>
        <div className='flex flex-col gap-3 pl-[20%] text-[15px]'>

            {menuItems.map((item, index) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                    <div
                        key={index}
                        className={`flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-4 py-3 cursor-pointer rounded-l-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md ${getHoverColor(item.color)} ${isActive ? getActiveColor(item.color) : 'bg-white/60'}`}
                        onClick={() => navigate(item.path)}
                        onMouseEnter={() => setHoveredItem(index)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        <Icon className={`w-[22px] h-[22px] transition-all duration-300 ${hoveredItem === index ? 'scale-110' : ''} ${isActive ? 'text-current' : 'text-gray-600'}`} />
                        <p className={`hidden md:block font-medium transition-all duration-300 ${hoveredItem === index ? 'translate-x-1' : ''} ${isActive ? 'text-current font-semibold' : 'text-gray-700'}`}>
                            {item.label}
                        </p>
                        {isActive && (
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-current rounded-l-full"></div>
                        )}
                    </div>
                )
            })}
        </div>

    </div>
  )
}

export default Sidebar
