import React, { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import logo from "../assets/logo.png"
import axios from 'axios'
import { authDataContext } from '../context/AuthContext'
import { adminDataContext } from '../context/AdminContext'
import { toast } from 'react-toastify'

function Nav() {
  const navigate = useNavigate()
  const { serverUrl } = useContext(authDataContext)
  const { getAdmin } = useContext(adminDataContext)
  const [loading, setLoading] = useState(false)

  const logOut = async () => {
    setLoading(true)
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      console.log(result.data)
      toast.success("Logged out successfully")
      getAdmin()
      navigate("/login", { replace: true })
    } catch (error) {
      console.error(error)
      toast.error("Logout failed")
    } finally {
      setLoading(false)
    }
  }

  return (
<nav className="w-full h-[70px] bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-md z-10 fixed top-0 flex items-center justify-between px-[30px] shadow-lg border-b border-gray-200">
      {/* Logo and Brand */}
      <Link to="/" className="flex items-center gap-[10px] cursor-pointer">
        <img src={logo} alt="Mykart Logo" className="w-[30px]" />
        <h1 className="text-[25px] text-gray-800 font-sans font-bold">Mykart Admin</h1>
      </Link>

      {/* Logout Button */}
      <button
        disabled={loading}
        onClick={logOut}
        className={`text-[15px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 py-[10px] px-[20px] rounded-2xl text-white
          border border-transparent hover:border-red-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105
          ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? "Logging out..." : "Log Out"}
      </button>
    </nav>
  )
}

export default Nav
