import React from 'react'
import bg from "../assets/authBG.png"
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useState } from "react"
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()
  return (
    <div className='w-full h-screen bg-cover flex justify-center items-center' style={{ backgroundImage: `url(${bg})` }}>

      <form className='w-[90%] h-175 max-w-150 bg-[#00000090] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-5 px-7.5 py-7.5 rounded-4xl'>

        <h1 className='text-white text-[36px] font-semibold mb-7.5'>Register To Your <span className='text-blue-400'>Virtual Assistant</span></h1>

        <input type="text" placeholder='Enter your name' className='w-full h-15 outline-none border-2 border-white bg-transparent text-white placeholder-grey-300 px-5 py-2.5 rounded-full text-[18px]' />

        <input type="email" placeholder='Enter your email' className='w-full h-15 outline-none border-2 border-white bg-transparent text-white placeholder-grey-300 px-5 py-2.5 rounded-full text-[18px]' />

        <div className='w-full h-15 border-2 border-white bg-transparent text-white rounded-full text-[18px] relative'>
          <input type={showPassword ? "text" : "password"} placeholder="Enter your password" className='w-full h-full rounded-full outline-none bg-transparent placeholder-grey-300 px-5 py-2.5' />

          {!showPassword && <IoEye className='absolute top-4 right-5 text-[white] w-6.25 h-6.25 cursor-pointer' onClick={() => { setShowPassword(true) }} />}

          {showPassword && <IoEyeOff className='absolute top-4 right-5 text-[white] w-6.25 h-6.25 cursor-pointer' onClick={() => { setShowPassword(false) }} />}
        </div>

        <button className='min-w-37.5 h-15 bg-white rounded-full text-black font-semibold text-[19px] mt-7.5 hover:bg-blue-400'>Sign Up</button>

        <p className='text-[white] text-[18px] cursor-pointer' onClick={()=>{navigate("/signin")}}>Already have an account? <span className='text-blue-400'>Sign In</span></p>
      </form>
    </div>
  )
}

export default SignUp