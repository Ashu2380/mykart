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
   
    <div className='w-[100vw] h-[100vh] bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 text-[white] relative'>
       <Nav/>
       <Sidebar/>

       <div className='w-[70vw] h-[100vh] absolute left-[25%] flex items-start justify-start flex-col gap-[30px] py-[100px] overflow-y-auto'>
         <h1 className='text-[35px] text-[#afe2f2]'>Mykart Admin Dashboard</h1>

         {/* Main Statistics Grid - 4 columns */}
         <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]'>
          <div className='text-[#dcfafd] w-full h-[120px] bg-[#0000002e] flex items-center justify-center flex-col gap-[10px] rounded-lg shadow-sm shadow-black backdrop:blur-lg text-[16px] border-[1px] border-[#969595] transition-all duration-300 hover:scale-105 hover:bg-[#0000003e] hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer hover:text-[#ffffff]'>
            <span>Total Products</span>
            <span className='px-[15px] py-[6px] bg-[#030e11] rounded-lg flex items-center justify-center border-[1px] border-[#969595] text-[20px] font-bold transition-colors duration-300 hover:bg-[#1a2a35]'>{totalProducts}</span>
          </div>
          <div className='text-[#dcfafd] w-full h-[120px] bg-[#0000002e] flex items-center justify-center flex-col gap-[5px] rounded-lg shadow-sm shadow-black backdrop:blur-lg text-[16px] border-[1px] border-[#969595] transition-all duration-300 hover:scale-105 hover:bg-[#0000003e] hover:shadow-lg hover:shadow-green-500/20 cursor-pointer hover:text-[#ffffff]'>
            <span>Total Orders</span>
            <span className='px-[15px] py-[6px] bg-[#030e11] rounded-lg flex items-center justify-center border-[1px] border-[#969595] text-[20px] font-bold transition-colors duration-300 hover:bg-[#1a2a35]'>{totalOrders}</span>
            <div className='text-[12px] flex gap-[10px]'>
              <span>Pending: {pendingOrders}</span>
              <span>Completed: {completedOrders}</span>
            </div>
          </div>
          <div className='text-[#dcfafd] w-full h-[120px] bg-[#0000002e] flex items-center justify-center flex-col gap-[10px] rounded-lg shadow-sm shadow-black backdrop:blur-lg text-[16px] border-[1px] border-[#969595] transition-all duration-300 hover:scale-105 hover:bg-[#0000003e] hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer hover:text-[#ffffff]'>
            <span>Total Users</span>
            <span className='px-[15px] py-[6px] bg-[#030e11] rounded-lg flex items-center justify-center border-[1px] border-[#969595] text-[20px] font-bold transition-colors duration-300 hover:bg-[#1a2a35]'>{totalUsers}</span>
          </div>
          <div className='text-[#dcfafd] w-full h-[120px] bg-[#0000002e] flex items-center justify-center flex-col gap-[10px] rounded-lg shadow-sm shadow-black backdrop:blur-lg text-[16px] border-[1px] border-[#969595] transition-all duration-300 hover:scale-105 hover:bg-[#0000003e] hover:shadow-lg hover:shadow-yellow-500/20 cursor-pointer hover:text-[#ffffff]'>
            <span>Total Revenue</span>
            <span className='px-[15px] py-[6px] bg-[#030e11] rounded-lg flex items-center justify-center border-[1px] border-[#969595] text-[20px] font-bold transition-colors duration-300 hover:bg-[#1a2a35]'>₹{totalRevenue.toLocaleString()}</span>
          </div>
         </div>

         {/* Secondary Statistics Grid - 4 columns */}
         <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]'>
          <div className='text-[#dcfafd] w-full h-[120px] bg-[#0000002e] flex items-center justify-center flex-col gap-[10px] rounded-lg shadow-sm shadow-black backdrop:blur-lg text-[16px] border-[1px] border-[#969595] transition-all duration-300 hover:scale-105 hover:bg-[#0000003e] hover:shadow-lg hover:shadow-red-500/20 cursor-pointer hover:text-[#ffffff]'>
            <span>Avg Order Value</span>
            <span className='px-[15px] py-[6px] bg-[#030e11] rounded-lg flex items-center justify-center border-[1px] border-[#969595] text-[20px] font-bold transition-colors duration-300 hover:bg-[#1a2a35]'>₹{avgOrderValue}</span>
          </div>
          <div className='text-[#dcfafd] w-full h-[120px] bg-[#0000002e] flex items-center justify-center flex-col gap-[10px] rounded-lg shadow-sm shadow-black backdrop:blur-lg text-[16px] border-[1px] border-[#969595] transition-all duration-300 hover:scale-105 hover:bg-[#0000003e] hover:shadow-lg hover:shadow-teal-500/20 cursor-pointer hover:text-[#ffffff]'>
            <span>Completed Orders</span>
            <span className='px-[15px] py-[6px] bg-[#030e11] rounded-lg flex items-center justify-center border-[1px] border-[#969595] text-[20px] font-bold transition-colors duration-300 hover:bg-[#1a2a35]'>{completedOrders}</span>
          </div>
          <div className='text-[#dcfafd] w-full h-[120px] bg-[#0000002e] flex items-center justify-center flex-col gap-[10px] rounded-lg shadow-sm shadow-black backdrop:blur-lg text-[14px] border-[1px] border-[#969595] transition-all duration-300 hover:scale-105 hover:bg-[#0000003e] hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer hover:text-[#ffffff]'>
            <span>Order Status Distribution</span>
            <div className='flex flex-wrap gap-[8px] justify-center'>
              {analyticsData.orderStatusStats.slice(0, 3).map((status, index) => (
                <span key={index} className='px-[6px] py-[3px] bg-[#030e11] rounded text-[11px] transition-colors duration-300 hover:bg-[#1a2a35]'>
                  {status._id}: {status.count}
                </span>
              ))}
            </div>
          </div>
          <div className='text-[#dcfafd] w-full h-[120px] bg-[#0000002e] flex items-center justify-center flex-col gap-[10px] rounded-lg shadow-sm shadow-black backdrop:blur-lg text-[14px] border-[1px] border-[#969595] transition-all duration-300 hover:scale-105 hover:bg-[#0000003e] hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer hover:text-[#ffffff]'>
            <span>Top Products</span>
            <div className='text-center'>
              {analyticsData.topProducts.slice(0, 2).map((product, index) => (
                <div key={index} className='text-[11px] transition-colors duration-300 hover:text-[#afe2f2]'>
                  {product.name}: {product.totalSold} sold
                </div>
              ))}
            </div>
          </div>
         </div>

         {/* Charts Section */}
         <div className='w-full flex flex-col gap-[40px]'>
           <h2 className='text-[28px] text-[#afe2f2] transition-colors duration-300 hover:text-[#ffffff] cursor-pointer'>Analytics Overview</h2>

           <div className='grid grid-cols-1 lg:grid-cols-2 gap-[20px]'>
             {/* Monthly Revenue Chart */}
             <div className='bg-[#0000002e] p-[15px] rounded-lg border-[1px] border-[#969595] transition-all duration-300 hover:scale-105 hover:bg-[#0000003e] hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer'>
               <h3 className='text-[#dcfafd] text-[16px] mb-[15px] transition-colors duration-300 hover:text-[#ffffff]'>Monthly Revenue</h3>
               <div className='h-[250px]'>
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
             <div className='bg-[#0000002e] p-[15px] rounded-lg border-[1px] border-[#969595] transition-all duration-300 hover:scale-105 hover:bg-[#0000003e] hover:shadow-lg hover:shadow-green-500/20 cursor-pointer'>
               <h3 className='text-[#dcfafd] text-[16px] mb-[15px] transition-colors duration-300 hover:text-[#ffffff]'>Sales by Category</h3>
               <div className='h-[250px]'>
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
                       legend: { position: 'bottom', labels: { color: '#dcfafd', font: { size: 12 } } }
                     }
                   }}
                 />
               </div>
             </div>

             {/* User Growth Chart */}
             <div className='bg-[#0000002e] p-[15px] rounded-lg border-[1px] border-[#969595] lg:col-span-2'>
               <h3 className='text-[#dcfafd] text-[16px] mb-[15px]'>User Growth</h3>
               <div className='text-[12px] text-[#bef3da] mb-[10px]'>New user registrations over time</div>
               <div className='h-[250px]'>
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
  )
}

export default Home
