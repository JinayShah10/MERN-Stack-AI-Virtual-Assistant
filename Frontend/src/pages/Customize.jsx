import { React, useState } from 'react'
import { useContext } from 'react'
import Card from '../components/Card'
import image1 from "../assets/image1.png"
import image2 from "../assets/image2.jpg"
import image3 from "../assets/authBg.png"
import image4 from "../assets/image4.png"
import image5 from "../assets/image5.png"
import image6 from "../assets/image6.jpeg"
import image7 from "../assets/image7.jpeg"
import { RiImageAddLine } from "react-icons/ri"
import {MdKeyboardBackspace} from "react-icons/md";
import { useRef } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'

const Customize = () => {

    const { serverUrl,userData,setUserData,frontendImage,setFrontendImage,backendImage,setBackendImage,selectedImage,setSelectedImage} = useContext(userDataContext)

    const inputImage = useRef()
    const navigate = useNavigate()

    const handleImage = (e) => {
        const file = e.target.files[0];
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file))
    }

    return (
        <div className='w-full min-h-screen bg-linear-to-t from-black to-[#030353] flex justify-center items-center flex-col p-4 sm:p-5 relative'>

            <MdKeyboardBackspace className="absolute top-5 left-5 sm:top-7.5 sm:left-7.5 text-white w-7 h-7 sm:w-8 sm:h-8 cursor-pointer" onClick={()=>{navigate("/")}}/>

            <h1 className='text-white text-[22px] sm:text-[26px] md:text-[30px] text-center font-semibold mb-6 sm:mb-10 mt-10 sm:mt-0 px-2'>Select Your <span className=' text-blue-400 text-[22px] sm:text-[26px] md:text-[30px] font-semibold'>AI Assistant's Image</span></h1>

            <div className='w-full max-w-225 flex justify-center items-center flex-wrap gap-5 sm:gap-8 md:gap-15'>
                <Card image={image1} />
                <Card image={image2} />
                <Card image={image3} />
                <Card image={image4} />
                <Card image={image5} />
                <Card image={image6} />
                <Card image={image7} />

                <div>
                    <div className={`w-28 h-46 sm:w-32 sm:h-54 md:w-37.5 md:h-62.5 bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-400 hover:border-3 hover:border-blue-400 cursor-pointer flex items-center justify-center ${selectedImage=="input"?"border-3 border-blue-400 shadow-2xl shadow-blue-400":null}`}>

                        {!frontendImage && <RiImageAddLine className="text-white w-7 h-7 sm:w-9 sm:h-9" onClick={() => { inputImage.current.click() 
                        setSelectedImage("input")   
                        }} />}
                        {frontendImage && <img src={frontendImage} className='w-full h-full object-cover object-top' />}
                    </div>

                    <input type="file" accept='image/*' ref={inputImage} hidden onChange={handleImage} />
                </div>

            </div>
            
            {selectedImage && <button className='min-w-37.5 h-13 sm:h-15 bg-white rounded-full text-black font-semibold text-[17px] sm:text-[19px] mt-8 sm:mt-15 hover:bg-blue-400 cursor-pointer' onClick={()=>{
                navigate("/customize2")
            }}>Next</button>}
            

        </div>
    )
}

export default Customize