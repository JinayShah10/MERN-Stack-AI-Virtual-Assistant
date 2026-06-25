import React from 'react'
import { useContext } from 'react'
import { userDataContext } from '../context/UserContext'

const Card = ({image}) => {
    const { serverUrl,userData,setUserData,frontendImage,setFrontendImage,backendImage,setBackendImage,selectedImage,setSelectedImage} = useContext(userDataContext)
  return (
    <div className={`w-28 h-46 sm:w-32 sm:h-54 md:w-37.5 md:h-62.5 bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-400 hover:border-3 hover:border-blue-400 cursor-pointer ${selectedImage==image?"border-3 border-blue-400 shadow-2xl shadow-blue-400":null}`} onClick={()=>{
      setSelectedImage(image)
      setBackendImage(null)
      setFrontendImage(null)
      }}>
        <img src={image} className='w-full h-full object-cover object-top' />
    </div>
  )
}

export default Card