import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import aiImg from "../assets/ai.gif"
import userImg from "../assets/user.gif"
import { HiMenu, HiX } from "react-icons/hi"
import axios from "axios"

const Home = () => {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState(null)
  const [aiText, setAiText] = useState(null)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [voiceGender, setVoiceGender] = useState("male")
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false)
  const voiceGenderRef = useRef("male")
  const synth = window.speechSynthesis

  useEffect(() => {
    voiceGenderRef.current = voiceGender
  }, [voiceGender])

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

    let voice;

    if (voiceGenderRef.current === "female") {
      voice =
        voices.find(v => v.name === "Google UK English Female") ||
        voices.find(v => v.name.includes("Microsoft Zira")) ||
        voices.find(v => v.name.includes("Samantha")) ||
        voices.find(v => v.name.includes("Microsoft Aria")) ||
        voices.find(v => v.name.includes("Female")) ||
        voices.find(v => v.lang === "en-US") ||
        voices.find(v => v.lang?.startsWith("en"));
    } else {
      voice =
        voices.find(v => v.name === "Google UK English Male") ||
        voices.find(v => v.name.includes("Microsoft David")) ||
        voices.find(v => v.name.includes("Microsoft Guy")) ||
        voices.find(v => v.name.includes("Daniel")) ||
        voices.find(v => v.name.includes("Microsoft Ryan")) ||
        voices.find(v => v.lang === "en-US") ||
        voices.find(v => v.lang?.startsWith("en"));
    }

    if (voice) {
      utterance.voice = voice;
    }
    isSpeakingRef.current = true;
    setAiSpeaking(true);
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setAiSpeaking(false);
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
    <div className='w-full min-h-screen bg-linear-to-t from-black to-[#030353] flex flex-col sm:flex-row relative overflow-hidden'>

      <style>{`
        @keyframes techGridMove {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }
        @keyframes techBlobFloatOne {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes techBlobFloatTwo {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 40px) scale(1.15); }
        }
        .tech-bg-grid {
          background-image:
            linear-gradient(to right, rgba(80, 130, 255, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(80, 130, 255, 0.12) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: techGridMove 12s linear infinite;
        }
        .tech-bg-blob-one {
          animation: techBlobFloatOne 10s ease-in-out infinite;
        }
        .tech-bg-blob-two {
          animation: techBlobFloatTwo 13s ease-in-out infinite;
        }
      `}</style>

      <div className='absolute inset-0 z-0 pointer-events-none overflow-hidden'>
        <div className='tech-bg-grid absolute inset-0'></div>
        <div className='tech-bg-blob-one absolute top-[-10%] left-[-10%] w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl'></div>
        <div className='tech-bg-blob-two absolute bottom-[-10%] right-[-10%] w-72 h-72 sm:w-96 sm:h-96 bg-indigo-500/20 rounded-full blur-3xl'></div>
      </div>

      <div className='hidden sm:flex sm:flex-col sm:w-56 md:w-64 lg:w-72 shrink-0 gap-4 px-4 pt-8 pb-8 sm:h-screen sm:sticky sm:top-0 relative z-10'>

        <div className='flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1 gap-1 shrink-0'>
          <button
            className={`flex-1 rounded-full text-[14px] lg:text-[15px] font-semibold py-2 cursor-pointer transition-colors ${voiceGender === "male" ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
            onClick={() => setVoiceGender("male")}
          >
            Male
          </button>
          <button
            className={`flex-1 rounded-full text-[14px] lg:text-[15px] font-semibold py-2 cursor-pointer transition-colors ${voiceGender === "female" ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
            onClick={() => setVoiceGender("female")}
          >
            Female
          </button>
        </div>

        <button className='w-full h-15 bg-white rounded-full text-black font-semibold text-[16px] lg:text-[19px] hover:bg-blue-400 px-4 py-2.5 cursor-pointer flex items-center justify-center text-center shrink-0' onClick={() => { navigate("/customize") }}>Customize Your Assistant</button>

        <button className='w-full h-15 bg-white rounded-full text-black font-semibold text-[16px] lg:text-[19px] hover:bg-blue-400 px-4 py-2.5 cursor-pointer flex items-center justify-center text-center shrink-0' onClick={handleLogOut}>LogOut</button>

        <div className='flex flex-col bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg shadow-black/30 p-4 overflow-hidden flex-1 min-h-0'>
          <h3 className='text-white font-semibold text-[18px] mb-3 shrink-0'>History</h3>
          <div className='flex flex-col gap-2 overflow-y-auto pr-1'>
            {userData?.history && userData.history.length > 0 ? (
              [...userData.history].reverse().map((item, index) => (
                <div
                  key={index}
                  className='text-white text-[14px] bg-white/10 border border-white/10 rounded-xl px-3 py-2 break-words backdrop-blur-sm'
                >
                  {item}
                </div>
              ))
            ) : (
              <p className='text-white/60 text-[14px]'>No history yet.</p>
            )}
          </div>
        </div>
      </div>

      <button
        className='sm:hidden absolute top-5 right-5 z-20 w-12 h-12 flex items-center justify-center bg-white rounded-full text-black cursor-pointer shadow-lg'
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <HiX className='w-6 h-6' /> : <HiMenu className='w-6 h-6' />}
      </button>

      <div className={`sm:hidden fixed top-0 right-0 h-full w-64 bg-[#020220] border-l border-[#0000ff66] shadow-2xl shadow-black z-10 flex flex-col items-center gap-6 px-6 py-24 overflow-y-auto transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>

        <div className='w-full flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1 gap-1 shrink-0'>
          <button
            className={`flex-1 rounded-full text-[14px] font-semibold py-2 cursor-pointer transition-colors ${voiceGender === "male" ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
            onClick={() => setVoiceGender("male")}
          >
            Male
          </button>
          <button
            className={`flex-1 rounded-full text-[14px] font-semibold py-2 cursor-pointer transition-colors ${voiceGender === "female" ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
            onClick={() => setVoiceGender("female")}
          >
            Female
          </button>
        </div>

        <button className='w-full min-h-15 bg-white rounded-full text-black font-semibold text-[17px] hover:bg-blue-400 px-6 py-3 cursor-pointer flex items-center justify-center text-center leading-tight' onClick={() => { setMenuOpen(false); navigate("/customize") }}>Customize Your Assistant</button>

        <button className='w-full min-h-15 bg-white rounded-full text-black font-semibold text-[17px] hover:bg-blue-400 px-6 py-3 cursor-pointer flex items-center justify-center text-center leading-tight' onClick={() => { setMenuOpen(false); handleLogOut() }}>LogOut</button>

        <div className='w-full flex flex-col bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg shadow-black/30 p-4 overflow-hidden flex-1 min-h-0'>
          <h3 className='text-white font-semibold text-[16px] mb-3 shrink-0'>History</h3>
          <div className='flex flex-col gap-2 overflow-y-auto pr-1'>
            {userData?.history && userData.history.length > 0 ? (
              [...userData.history].reverse().map((item, index) => (
                <div
                  key={index}
                  className='text-white text-[13px] bg-white/10 border border-white/10 rounded-xl px-3 py-2 break-words backdrop-blur-sm'
                >
                  {item}
                </div>
              ))
            ) : (
              <p className='text-white/60 text-[13px]'>No history yet.</p>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className='sm:hidden fixed inset-0 bg-black/50 z-0' onClick={() => setMenuOpen(false)}></div>
      )}

      <div className='flex-1 min-w-0 flex justify-center items-center flex-col gap-5 px-4 pt-24 pb-8 sm:pt-8 relative z-10'>

        <div className='w-56 h-80 sm:w-64 sm:h-90 md:w-75 md:h-100 flex justify-center items-center overflow-hidden rounded-2xl border-3 border-blue-400 shadow-2xl shadow-blue-400'>
          <img src={userData?.assistantImage} className='h-full object-cover object-top ' />
        </div>

        <h1 className='text-white text-[22px] sm:text-[26px] md:text-[30px] font-semibold text-center'>{userData?.assistantName}</h1>

        {!aiSpeaking && <img src={userImg} alt="" className='w-40 sm:w-44 md:w-50' />}
        {aiSpeaking && <img src={aiImg} alt="" className='w-40 sm:w-44 md:w-50' />}

        {!aiSpeaking && (
          <p className='text-white text-[14px] sm:text-[15px] font-medium text-center px-4 -mt-1'>
            Listening...Please speak a command
          </p>
        )}

        <h2 className='text-white text-[16px] sm:text-[18px] font-semibold text-wrap text-center px-4'>{userText ? userText : aiText ? aiText : null}</h2>

      </div>

    </div>
  )
}

export default Home