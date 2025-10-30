import React, { createContext, useContext, useEffect, useState } from 'react'
import { authDataContext } from './authContext'
import axios from 'axios'

export const userDataContext = createContext()
function UserContext({children}) {
    let [userData,setUserData] = useState("")
    let [token,setToken] = useState("")
    let {serverUrl} = useContext(authDataContext)


   const getCurrentUser = async () => {
        try {
            let result = await axios.get(serverUrl + "/api/user/getcurrentuser",{withCredentials:true})

            setUserData(result.data)
            console.log(result.data)

        } catch (error) {
            setUserData(null)
            console.log(error)
        }
    }

    // Get token from cookies
    const getToken = () => {
        const cookies = document.cookie.split(';')
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=')
            if (name === 'token') {
                setToken(value)
                return value
            }
        }
        return null
    }

    useEffect(()=>{
     getCurrentUser()
     getToken()
    },[])



    let value = {
     userData,setUserData,getCurrentUser,token,setToken
    }
    
   
  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
