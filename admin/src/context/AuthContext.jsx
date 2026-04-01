import React, { createContext } from 'react'

export const authDataContext = createContext()
function AuthContext({children}) {
    // Use environment variable for server URL, fallback to localhost for development
    let serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"

    let value = {
      serverUrl
    }
  return (
    <div>
        <authDataContext.Provider value={value}>
            {children}
        </authDataContext.Provider>
      
    </div>
  )
}

export default AuthContext
