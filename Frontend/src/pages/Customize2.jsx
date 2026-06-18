import React, { useState } from 'react'
import { useContext } from 'react';
import { userDataContext } from '../context/UserContext';

const Customize2 = () => {
    const { userData } = useContext(userDataContext)
    const [assistantName, setAssistantName] = useState(userData?.Assistantname || "");
    return (
        <div className='w-full h-screen bg-linear-to-t from-black to-[#030353] flex justify-center items-center flex-col p-5'>

            <h1 className='text-white text-[30px] text-center font-semibold mb-10'>Enter Your <span className=' text-blue-400 text-[30px] font-semibold'>AI Assistant's Name</span></h1>

            <input type="text" placeholder='Enter name' className='w-full max-w-150 h-15 outline-none border-2 border-white bg-transparent text-white placeholder-grey-300 px-5 py-2.5 rounded-full text-[18px]' required onChange={(e) => { setAssistantName(e.target.value) }} value={assistantName} />

            {assistantName && <button className='min-w-75 h-15 bg-white rounded-full text-black font-semibold text-[19px] mt-15 hover:bg-blue-400 cursor-pointer' onClick={() => {
                navigate("/customize2")
            }}>Create AI Assistant</button>}

        </div>
    )
}

export default Customize2