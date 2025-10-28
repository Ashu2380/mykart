import React, { createContext, useContext, useEffect, useState } from 'react'
import { authDataContext } from './AuthContext'
import axios from 'axios'

export const adminDataContext = createContext()
function AdminContext({children}) {
    let [adminData,setAdminData] = useState(null)
    let {serverUrl} = useContext(authDataContext)


    const getAdmin = async () => {
      try {
           console.log("Attempting to get admin data from:", serverUrl + "/api/user/getadmin")
           let result = await axios.get(serverUrl + "/api/user/getadmin",{withCredentials:true})
           console.log("Admin data received:", result.data)
      setAdminData(result.data)
      console.log("Admin data set:", result.data)
      } catch (error) {
        console.log("Error getting admin data:", error.response?.data || error.message)
        setAdminData(null)
        console.log("Admin data set to null due to error")
      }
    }

    useEffect(()=>{
     getAdmin()
    },[])


    let value = {
adminData,setAdminData,getAdmin
    }
  return (
    <div>
<adminDataContext.Provider value={value}>
    {children}
</adminDataContext.Provider>
      
    </div>
  )
}

export default AdminContext