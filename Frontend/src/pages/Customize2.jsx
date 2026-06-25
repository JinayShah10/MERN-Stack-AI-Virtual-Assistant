import React, { useState } from 'react'
import { useContext } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import {MdKeyboardBackspace} from "react-icons/md";

const Customize2 = () => {
    const { userData,backendImage,selectedImage,serverUrl,setUserData } = useContext(userDataContext)
    const navigate = useNavigate()
    const [assistantName, setAssistantName] = useState(userData?.Assistantname || "");
    const [loading,setLoading] = useState(false)

    const handleUpdateAssistant = async ()=>{
        try{
            setLoading(true)
            let formData = new FormData()
            formData.append("assistantName",assistantName)
            if(backendImage)
            {
                formData.append("assistantImage",backendImage)
            }
            else
            {
                formData.append("imageUrl",selectedImage)
            }
            const result = await axios.post(`${serverUrl}/api/user/update`,formData,{withCredentials:true})
            setLoading(false)
            console.log(result.data)
            setUserData(result.data)
            navigate("/")
        }
        catch(error){
            setLoading(false)
            console.log(error)
        }
    }

    return (
        <div className='w-full min-h-screen bg-linear-to-t from-black to-[#030353] flex justify-center items-center flex-col p-4 sm:p-5 relative'>

            <MdKeyboardBackspace className="absolute top-5 left-5 sm:top-7.5 sm:left-7.5 text-white w-7 h-7 sm:w-8 sm:h-8 cursor-pointer" onClick={()=>{navigate("/customize")}}/>

            <h1 className='text-white text-[22px] sm:text-[26px] md:text-[30px] text-center font-semibold mb-6 sm:mb-10 mt-10 sm:mt-0 px-2'>Enter Your <span className=' text-blue-400 text-[22px] sm:text-[26px] md:text-[30px] font-semibold'>AI Assistant's Name</span></h1>

            <input type="text" placeholder='Enter name' className='w-full max-w-150 h-13 sm:h-15 outline-none border-2 border-white bg-transparent text-white placeholder-grey-300 px-5 py-2.5 rounded-full text-[16px] sm:text-[18px]' required onChange={(e) => { setAssistantName(e.target.value) }} value={assistantName} />

            {assistantName && <button className='w-full sm:w-auto sm:min-w-75 h-13 sm:h-15 bg-white rounded-full text-black font-semibold text-[17px] sm:text-[19px] mt-8 sm:mt-15 hover:bg-blue-400 cursor-pointer max-w-150' disabled={loading} onClick={() => {
                navigate("/customize2")
                handleUpdateAssistant()
            }}>{!loading?"Create AI Assistant":"Loading..."}</button>}

        </div>
    )
}

export default Customize2