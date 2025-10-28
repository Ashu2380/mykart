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
<nav className="w-full h-[70px] bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 z-10 fixed top-0 flex items-center justify-between px-[30px] shadow-md shadow-black">
      {/* Logo and Brand */}
      <Link to="/" className="flex items-center gap-[10px] cursor-pointer">
        <img src={logo} alt="Mykart Logo" className="w-[30px]" />
        <h1 className="text-[25px] text-white font-sans">Mykart</h1>
      </Link>

      {/* Logout Button */}
      <button
        disabled={loading}
        onClick={logOut}
        className={`text-[15px] bg-[#000000ca] py-[10px] px-[20px] rounded-2xl text-white 
          border border-transparent hover:border-[#89daea] transition 
          ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? "Logging out..." : "Log Out"}
      </button>
    </nav>
  )
}

export default Nav
