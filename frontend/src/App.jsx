import React, { useContext } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Registration from './pages/Registration'
import Home from './pages/Home'
import Login from './pages/Login'
import { userDataContext } from './context/UserContext'
import About from './pages/About'
import Collections from './pages/Collections'
import Product from './pages/Product'
import Contact from './pages/Contact'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import PlaceOrder from './pages/PlaceOrder'
import Order from './pages/Order'
import CustomerSupport from './pages/CustomerSupport'
import ManageAddresses from './pages/ManageAddresses'
import PaymentSettings from './pages/PaymentSettings'
import Returns from './pages/Returns'
import AccountSettings from './pages/AccountSettings'
import DeviceSupport from './pages/DeviceSupport'
import EmiCalculator from './pages/EmiCalculator'
import ChatSupport from './pages/ChatSupport'
import QRPayment from './pages/QRPayment'
import VisualSearchPage from './pages/VisualSearchPage'
import Wishlist from './component/Wishlist'
import ReferralDashboard from './component/ReferralDashboard'
import { ToastContainer } from 'react-toastify';
import NotFound from './pages/NotFound'
import Ai from './component/Ai'
import Chatbot from './component/Chatbot'
import Nav from './component/Nav'

function App() {
let {userData} = useContext(userDataContext)
let location = useLocation()

  // Define routes that should not show navbar
  const noNavRoutes = ['/login', '/signup']

  return (
    <>
    <ToastContainer />
    {!noNavRoutes.includes(location.pathname) && <Nav />}
      <Routes>

        <Route path='/login' 
        element={userData ? (<Navigate to={location.state?.from || "/"}/> ) 
        : (<Login/>)
          }/>

        <Route path='/signup' 
        element={userData ? (<Navigate to={location.state?.from || "/"}/> ) 
        : (<Registration/>)}/>

        <Route path='/' 
        element={userData ? <Home/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>
      
        <Route path='/about' 
        element={userData ? <About/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/collection' 
        element={userData ? <Collections/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/product' 
        element={userData ? <Product/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/contact' 
        element={userData ? <Contact/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>
        
        <Route path='/customer-support'
        element={userData ? <CustomerSupport/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/chat-support'
        element={userData ? <ChatSupport/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/addresses'
        element={userData ? <ManageAddresses/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>
        
        <Route path='/payment-settings' 
        element={userData ? <PaymentSettings/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>
        
        <Route path='/returns' 
        element={userData ? <Returns/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>
        
        <Route path='/account-settings' 
        element={userData ? <AccountSettings/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>
        
        <Route path='/device-support'
        element={userData ? <DeviceSupport/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/qr-payment'
        element={userData ? <QRPayment/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/emi-calculator'
        element={userData ? <EmiCalculator/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/visual-search'
        element={userData ? <VisualSearchPage/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/wishlist'
        element={userData ? <Wishlist/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/referrals'
        element={userData ? <ReferralDashboard/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/productdetail/:productId'
        element={userData ? <ProductDetail/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/cart'
        element={userData ? <Cart/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

          <Route path='/placeorder'
        element={userData ? <PlaceOrder/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>
         <Route path='/order'
        element={userData ? <Order/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='*' element={<NotFound/>}/>
      </Routes>
      <Ai/>
      <Chatbot/>
    </>
  )
}

export default App
