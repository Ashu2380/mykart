import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Add from './pages/Add'
import Lists from './pages/Lists'
import Orders from './pages/Orders'
import Users from './pages/Users'
import Login from './pages/Login'
import { adminDataContext } from './context/AdminContext'
  import { ToastContainer, toast } from 'react-toastify';

function App() {
  let {adminData} = useContext(adminDataContext)
  console.log("App component rendering, adminData:", adminData)
  return (

    <>
      <ToastContainer />
    {!adminData ? (
      <>
        {console.log("Rendering Login component because adminData is null")}
        <Login/>
      </>
    ) : (
      <>
        {console.log("Rendering admin routes because adminData exists:", adminData)}
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/add' element={<Add/>}/>
          <Route path='/lists' element={<Lists/>}/>
          <Route path='/orders' element={<Orders/>}/>
          <Route path='/users' element={<Users/>}/>
          <Route path='/login' element={<Login/>}/>
        </Routes>
      </>
      )
      }
    </>
  )
}

export default App
