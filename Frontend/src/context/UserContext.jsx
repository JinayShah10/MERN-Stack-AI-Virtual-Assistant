import React, { createContext, useEffect, useState } from 'react'
import axios from "axios"

export const userDataContext = createContext()

const UserContext = ({ children }) => {

  const serverUrl = "http://localhost:8000"

  const value = {
    serverUrl
  }

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
      setUserData(result.data)
      console.log(result.data)
    }
    catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    handleCurrentUser()
  }, [])

  const [userData, setUserData] = useState(null);

  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>

    </div>
  )
}

export default UserContext