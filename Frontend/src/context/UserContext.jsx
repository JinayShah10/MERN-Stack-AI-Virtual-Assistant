import React, { createContext, useEffect, useState} from 'react'
import axios from "axios"

export const userDataContext = createContext()

const serverUrl = "http://localhost:8000"

const [userData,setUserData] = useState(null);

const value = {
    serverUrl
}

const handleCurrentUser = async ()=>{
  try{
    const result = await axios.get(`${serverUrl}/api/auth/user/current`,{withCredentials:true})
    setUserData(result.data)
    console.log(result.data)
  }
  catch(error){
    console.log(error)
  }
}

useEffect(()=>{
  handleCurrentUser()
},[])

const UserContext = ({children}) => {
  return (
    <div>
        <userDataContext.Provider value={value}>
            {children}
        </userDataContext.Provider>
        
    </div>
  )
}

export default UserContext