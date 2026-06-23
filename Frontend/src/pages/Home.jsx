import React, { useContext, useEffect } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      navigate("/signin")
      setUserData(null)
    }
    catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const speak = (text) =>{
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log(transcript);

      if(transcript.toLowerCase().includes(userData.assistantName.toLowerCase())){
        const data = await getGeminiResponse(transcript);
        console.log(data)
        speak(data.response);
      }
    }
    recognition.start();

  }, [])

  return (
    <div className='w-full h-screen bg-linear-to-t from-black to-[#030353] flex justify-center items-center flex-col gap-5 relative'>

      <button className='min-w-37.5 h-15 bg-white rounded-full text-black font-semibold text-[19px] mt-7.5 hover:bg-blue-400 absolute top-5 right-5 px-5 py-2.5 cursor-pointer' onClick={() => { navigate("/customize") }}>Customize Your Assistant</button>

      <button className='min-w-37.5 h-15 bg-white rounded-full text-black font-semibold text-[19px] mt-7.5 hover:bg-blue-400 absolute top-25 right-5 cursor-pointer' onClick={handleLogOut}>LogOut</button>

      <div className='w-75 h-100 flex justify-center items-center overflow-hidden rounded-2xl border-3 border-blue-400 shadow-2xl shadow-blue-400'>
        <img src={userData?.assistantImage} className='h-full object-cover object-top ' />
      </div>

      <h1 className='text-white text-[30px] font-semibold'>{userData?.assistantName}</h1>

    </div>
  )
}

export default Home