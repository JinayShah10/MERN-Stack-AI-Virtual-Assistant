import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import aiImg from "../assets/ai.gif"
import userImg from "../assets/user.gif"

const Home = () => {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState(null)
  const [aiText, setAiText] = useState(null)
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false)
  const synth = window.speechSynthesis

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

  const startRecognition = () => {
    try {
      recognitionRef.current?.start()
      setListening(true)
    }
    catch (error) {
      if (!error.message.includes("start")) {
        console.log("Recognition Error", error)
      }
    }
  }

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 0.85;
    utterance.rate = 1;
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find(v => v.name === "Google UK English Male") ||
      voices.find(v => v.name.includes("Microsoft David")) ||
      voices.find(v => v.name.includes("Microsoft Guy")) ||
      voices.find(v => v.name.includes("Daniel")) ||
      voices.find(v => v.name.includes("Microsoft Ryan")) ||
      voices.find(v => v.lang === "en-US") ||
      voices.find(v => v.lang?.startsWith("en"));
    if (voice) {
      utterance.voice = voice;
    }
    isSpeakingRef.current = true;
    utterance.onend = () => {
      isSpeakingRef.current = false;
      startRecognition();
    }
    synth.speak(utterance);
  }

  const handleCommand = async (data) => {
    const { type, userInput, response } = data;
    speak(response);


    if (type === "google_search") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, `_blank`);
    }

    if (type === "google_open") {
      window.open(`https://www.google.com/`, `_blank`);
    }

    if (type === "calculator_open") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=calculator`, `_blank`);
    }

    if (type === "instagram_open") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.instagram.com/`, `_blank`);
    }

    if (type === "facebook_open") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.facebook.com/`, `_blank`);
    }

    if (type === "weather_show") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=weather`, `_blank`);
    }

    if (type === "youtube_search" || type === "youtube_play") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, `_blank`);
    }

    if (type === "youtube_open") {
      window.open(`https://www.youtube.com/`, `_blank`);
    }


  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-IN";

    recognitionRef.current = recognition;

    const safeRecognition = () => {
      try {
        if (!isSpeakingRef.current && !isRecognizingRef.current) {
          recognition.start();
        }
      }
      catch (error) {
        if (error.name != "InvalidStateError") {
          console.log("Strt Error", error);
        }
      }
    }

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    }

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
    }

    if (!isSpeakingRef.current) {
      setTimeout(() => {
        safeRecognition()
      }, 1000);
    }

    recognition.onerror = (event) => {
      console.warn("Recognition Error", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error != 'aborted' && !isSpeakingRef.current) {
        setTimeout(() => {
          safeRecognition()
        }, 1000)
      }
    }

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log(transcript);

      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setAiText("")
        setUserText(transcript)
        recognition.stop()
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        console.log(data)
        handleCommand(data)
        setAiText(data.response)
        setUserText("")
      }
    }

    const fallback = setInterval(() => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        safeRecognition();
      }
    }, 10000)

    safeRecognition();

    return () => {
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
      clearInterval(fallback)
    }

  }, [])

  return (
    <div className='w-full h-screen bg-linear-to-t from-black to-[#030353] flex justify-center items-center flex-col gap-5 relative'>

      <button className='min-w-37.5 h-15 bg-white rounded-full text-black font-semibold text-[19px] mt-7.5 hover:bg-blue-400 absolute top-5 right-5 px-5 py-2.5 cursor-pointer' onClick={() => { navigate("/customize") }}>Customize Your Assistant</button>

      <button className='min-w-37.5 h-15 bg-white rounded-full text-black font-semibold text-[19px] mt-7.5 hover:bg-blue-400 absolute top-25 right-5 cursor-pointer' onClick={handleLogOut}>LogOut</button>

      <div className='w-75 h-100 flex justify-center items-center overflow-hidden rounded-2xl border-3 border-blue-400 shadow-2xl shadow-blue-400'>
        <img src={userData?.assistantImage} className='h-full object-cover object-top ' />
      </div>

      <h1 className='text-white text-[30px] font-semibold'>{userData?.assistantName}</h1>

      {!aiText && <img src={userImg} alt="" className='w-50' />}
      {aiText && <img src={aiImg} alt="" className='w-50' />}

      <h2 className='text-white text-[18px] font-semibold text-wrap'>{userText ? userText : aiText ? aiText : null}</h2>

    </div>
  )
}

export default Home