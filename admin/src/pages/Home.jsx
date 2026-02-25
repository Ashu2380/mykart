import React from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { useState } from 'react'
import { useContext } from 'react'
import { authDataContext } from '../context/AuthContext'
import { useEffect } from 'react'
import axios from 'axios'
import { Bar, Line, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

function Home() {
    const [totalProducts, setTotalProducts] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [analyticsData, setAnalyticsData] = useState({
    monthlyRevenue: [],
    categorySales: [],
    userGrowth: [],
    categories: [],
    orderStatusStats: [],
    topProducts: [],
    recentOrders: []
  })
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [completedOrders, setCompletedOrders] = useState(0)
  const [totalCompletedOrders, setTotalCompletedOrders] = useState(0)
  const [avgOrderValue, setAvgOrderValue] = useState(0)

  const { serverUrl } = useContext(authDataContext)

 const fetchCounts = async () => {
   try {
     const products = await axios.get(`${serverUrl}/api/product/list`, {} ,{withCredentials:true})
     setTotalProducts(products.data.length)

     const orders = await axios.post(`${serverUrl}/api/order/list`, {} ,{withCredentials:true})
     setTotalOrders(orders.data.length)

     const users = await axios.get(`${serverUrl}/api/user/all`, {withCredentials:true})
     setTotalUsers(users.data.total)

     // Fetch real analytics data
     try {
       const analytics = await axios.get(`${serverUrl}/api/user/analytics`, {withCredentials:true})
       setAnalyticsData({
         monthlyRevenue: analytics.data.data.monthlyRevenue,
         categorySales: analytics.data.data.categorySales,
         userGrowth: analytics.data.data.userGrowth,
         categories: analytics.data.data.categories || ['Electronics', 'Clothing', 'Books', 'Home', 'Others'],
         orderStatusStats: analytics.data.data.orderStatusStats || [],
         topProducts: analytics.data.data.topProducts || [],
         recentOrders: analytics.data.data.recentOrders || []
       })
       setTotalRevenue(analytics.data.data.monthlyRevenue.reduce((sum, val) => sum + val, 0))
       setPendingOrders(analytics.data.data.orderStatusStats.find(stat => stat._id === 'pending')?.count || 0)
       setCompletedOrders(analytics.data.data.orderStatusStats.find(stat => stat._id === 'completed')?.count || 0)
       setTotalCompletedOrders(analytics.data.data.completedOrders || 0)
       setAvgOrderValue(totalOrders > 0 ? (analytics.data.data.monthlyRevenue.reduce((sum, val) => sum + val, 0) / totalOrders).toFixed(2) : 0)
     } catch (analyticsError) {
       console.log("Analytics fetch failed, using mock data:", analyticsError)
       // Fallback to mock data if analytics endpoint fails
       setAnalyticsData({
         monthlyRevenue: [12000, 15000, 18000, 22000, 25000, 28000],
         categorySales: [35, 25, 20, 15, 5],
         userGrowth: [100, 150, 200, 280, 350, 420],
         categories: ['Electronics', 'Clothing', 'Books', 'Home', 'Others'],
         orderStatusStats: [],
         topProducts: [],
         recentOrders: []
       })
       setTotalRevenue([12000, 15000, 18000, 22000, 25000, 28000].reduce((sum, val) => sum + val, 0))
       setPendingOrders(0)
       setCompletedOrders(0)
       setAvgOrderValue(totalOrders > 0 ? (12000 + 15000 + 18000 + 22000 + 25000 + 28000) / totalOrders : 0)
     }
   } catch (err) {
     console.error("Failed to fetch counts", err)
   }
 }

   useEffect(() => {
    fetchCounts()
  }, [])
  return (

    <div className='w-[100vw] min-h-[100vh] bg-gradient-to-br from-[#eff6ff] via-[#eef2ff] to-[#f3e8ff] text-black overflow-x-hidden relative'>
       <Nav/>
       <Sidebar/>

       <div className='w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]'>
         <div className='w-[100%] md:w-[90%] h-[100%] mt-[70px] flex flex-col gap-[30px] py-[90px] px-[30px] md:px-[60px]'>
         <div className='w-full h-[50px] text-[28px] md:text-[40px] mb-[20px] text-gray-800'>Mykart Admin Dashboard</div>

         {/* Main Statistics Grid - 4 columns */}
         <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full'>
          <div className='text-gray-800 w-full min-h-[140px] bg-white/90 flex items-center justify-center flex-col gap-3 rounded-xl shadow-lg shadow-black/10 backdrop-blur-sm text-base font-medium border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer p-4'>
            <span className='text-center'>Total Products</span>
            <span className='px-4 py-2 bg-blue-50 rounded-lg border border-blue-200 text-xl font-bold text-blue-700'>{totalProducts}</span>
          </div>
          <div className='text-gray-800 w-full min-h-[140px] bg-white/90 flex items-center justify-center flex-col gap-2 rounded-xl shadow-lg shadow-black/10 backdrop-blur-sm text-base font-medium border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer p-4'>
            <span className='text-center'>Total Orders</span>
            <span className='px-4 py-2 bg-green-50 rounded-lg border border-green-200 text-xl font-bold text-green-700'>{totalOrders}</span>
            <div className='text-xs flex gap-3 text-green-600'>
              <span>Pending: {pendingOrders}</span>
              <span>Completed: {completedOrders}</span>
            </div>
          </div>
          <div className='text-gray-800 w-full min-h-[140px] bg-white/90 flex items-center justify-center flex-col gap-3 rounded-xl shadow-lg shadow-black/10 backdrop-blur-sm text-base font-medium border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer p-4'>
            <span className='text-center'>Total Users</span>
            <span className='px-4 py-2 bg-purple-50 rounded-lg border border-purple-200 text-xl font-bold text-purple-700'>{totalUsers}</span>
          </div>
          <div className='text-gray-800 w-full min-h-[140px] bg-white/90 flex items-center justify-center flex-col gap-3 rounded-xl shadow-lg shadow-black/10 backdrop-blur-sm text-base font-medium border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer p-4'>
            <span className='text-center'>Total Reviews</span>
            <span className='px-4 py-2 bg-pink-50 rounded-lg border border-pink-200 text-xl font-bold text-pink-700'>0</span>
          </div>
          <div className='text-gray-800 w-full min-h-[140px] bg-white/90 flex items-center justify-center flex-col gap-3 rounded-xl shadow-lg shadow-black/10 backdrop-blur-sm text-base font-medium border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer p-4'>
            <span className='text-center'>Total Revenue</span>
            <span className='px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200 text-xl font-bold text-yellow-700'>₹{totalRevenue.toLocaleString()}</span>
          </div>
         </div>

         {/* Secondary Statistics Grid - 4 columns */}
         <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full'>
          <div className='text-gray-800 w-full min-h-[140px] bg-white/90 flex items-center justify-center flex-col gap-3 rounded-xl shadow-lg shadow-black/10 backdrop-blur-sm text-base font-medium border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer p-4'>
            <span className='text-center'>Avg Order Value</span>
            <span className='px-4 py-2 bg-red-50 rounded-lg border border-red-200 text-xl font-bold text-red-700'>₹{avgOrderValue}</span>
          </div>
          <div className='text-gray-800 w-full min-h-[140px] bg-white/90 flex items-center justify-center flex-col gap-3 rounded-xl shadow-lg shadow-black/10 backdrop-blur-sm text-base font-medium border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer p-4'>
            <span className='text-center'>Completed Orders</span>
            <span className='px-4 py-2 bg-teal-50 rounded-lg border border-teal-200 text-xl font-bold text-teal-700'>{totalCompletedOrders}</span>
          </div>
          <div className='text-gray-800 w-full min-h-[140px] bg-white/90 flex items-center justify-center flex-col gap-3 rounded-xl shadow-lg shadow-black/10 backdrop-blur-sm text-sm font-medium border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer p-4'>
            <span className='text-center'>Order Status Distribution</span>
            <div className='flex flex-wrap gap-2 justify-center'>
              {analyticsData.orderStatusStats.slice(0, 3).map((status, index) => (
                <span key={index} className='px-2 py-1 bg-cyan-50 rounded text-xs border border-cyan-200 text-cyan-700'>
                  {status._id}: {status.count}
                </span>
              ))}
            </div>
          </div>
          <div className='text-gray-800 w-full min-h-[140px] bg-white/90 flex items-center justify-center flex-col gap-3 rounded-xl shadow-lg shadow-black/10 backdrop-blur-sm text-sm font-medium border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer p-4'>
            <span className='text-center'>Top Products</span>
            <div className='text-center'>
              {analyticsData.topProducts.slice(0, 2).map((product, index) => (
                <div key={index} className='text-xs text-gray-600 hover:text-blue-600'>
                  {product.name}: {product.totalSold} sold
                </div>
              ))}
            </div>
          </div>
         </div>

         {/* Charts Section */}
         <div className='w-full flex flex-col gap-8 lg:gap-10 px-2 lg:px-4'>
           <h2 className='text-2xl lg:text-3xl font-semibold text-gray-800 transition-colors duration-300 hover:text-black cursor-pointer'>Analytics Overview</h2>

           <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
             {/* Monthly Revenue Chart */}
             <div className='bg-white/90 p-4 lg:p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer backdrop-blur-sm'>
               <h3 className='text-gray-800 text-lg font-medium mb-4 transition-colors duration-300 hover:text-black'>Monthly Revenue</h3>
               <div className='h-[250px] lg:h-[280px]'>
                 <Line
                   data={{
                     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                     datasets: [{
                       label: 'Revenue (₹)',
                       data: analyticsData.monthlyRevenue,
                       borderColor: '#3b82f6',
                       backgroundColor: 'rgba(59, 130, 246, 0.1)',
                       tension: 0.4,
                       fill: true
                     }]
                   }}
                   options={{
                     responsive: true,
                     maintainAspectRatio: false,
                     plugins: {
                       legend: { display: false }
                     },
                     scales: {
                       y: { beginAtZero: true, grid: { color: '#374151' } },
                       x: { grid: { color: '#374151' } }
                     }
                   }}
                 />
               </div>
             </div>

             {/* Category Sales Chart */}
             <div className='bg-white/90 p-4 lg:p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 cursor-pointer backdrop-blur-sm'>
               <h3 className='text-gray-800 text-lg font-medium mb-4 transition-colors duration-300 hover:text-black'>Sales by Category</h3>
               <div className='h-[250px] lg:h-[280px]'>
                 <Pie
                   data={{
                     labels: analyticsData.categories,
                     datasets: [{
                       data: analyticsData.categorySales,
                       backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                       borderWidth: 1
                     }]
                   }}
                   options={{
                     responsive: true,
                     maintainAspectRatio: false,
                     plugins: {
                       legend: { position: 'bottom', labels: { color: '#374151', font: { size: 12 } } }
                     }
                   }}
                 />
               </div>
             </div>

             {/* User Growth Chart */}
             <div className='bg-white/90 p-4 lg:p-6 rounded-xl border border-gray-200 lg:col-span-2 backdrop-blur-sm'>
               <h3 className='text-gray-800 text-lg font-medium mb-4'>User Growth</h3>
               <div className='text-sm text-gray-600 mb-3'>New user registrations over time</div>
               <div className='h-[250px] lg:h-[280px]'>
                 <Bar
                   data={{
                     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                     datasets: [{
                       label: 'New Users',
                       data: analyticsData.userGrowth,
                       backgroundColor: '#10b981',
                       borderColor: '#059669',
                       borderWidth: 1
                     }]
                   }}
                   options={{
                     responsive: true,
                     maintainAspectRatio: false,
                     plugins: {
                       legend: { display: false }
                     },
                     scales: {
                       y: { beginAtZero: true, grid: { color: '#374151' } },
                       x: { grid: { color: '#374151' } }
                     }
                   }}
                 />
               </div>
             </div>
           </div>
         </div>
         </div>
       </div>

      
    </div>
  )
}

export default Home
