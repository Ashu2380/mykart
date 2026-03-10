import React, { useContext, useState, useEffect, useRef } from 'react'
import ai from "../assets/ai.png"
import { shopDataContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import open from "../assets/open.mp3"

function Ai() {
  let {showSearch , setShowSearch} = useContext(shopDataContext)
  let navigate = useNavigate()
  let [activeAi,setActiveAi] = useState(false)
  let [listening,setListening] = useState(false)
  let openingSound = new Audio(open)
  let recognitionRef = useRef(null)

 function speak(message){
 let utterence=new SpeechSynthesisUtterance(message)
 utterence.lang = 'hi-IN';
 window.speechSynthesis.speak(utterence)
   }

  // Initialize speech recognition - Always ON
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.log("Speech recognition not supported")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-IN'
    recognitionRef.current = recognition

    recognition.onstart = () => {
      setListening(true)
    }

    recognition.onend = () => {
      setListening(false)
      // Auto restart to keep listening
      try {
        recognitionRef.current?.start()
      } catch(e) {}
    }

    recognition.onresult = (e)=>{
      const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
      
      console.log("Heard:", transcript)
      
      // Check for wake words (English & Hindi)
      if (transcript.toLowerCase().includes("hey ashu") || 
          transcript.toLowerCase().includes("ashu") ||
          transcript.toLowerCase().includes("हे अशु") ||
          transcript.toLowerCase().includes("अशु") ||
          transcript.toLowerCase().includes("hey ai") ||
          transcript.toLowerCase().includes("एआई") ||
          transcript.toLowerCase().includes("Himanshu") ||
          transcript.toLowerCase().includes("alexa")) {
        
        speak("Yes, I'm listening!")
        setActiveAi(true)
        openingSound.play()
      }
      
      // If AI is active, process the command
      if (activeAi && transcript.length > 5) {
        processCommand(transcript)
      }
    }

    // Start listening on mount
    try {
      recognition.start()
    } catch(e) {
      console.log("Could not start recognition")
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [activeAi])

  const processCommand = (transcript) => {
    // ===================== HINDI COMMANDS =====================
    
    // Wishlist
    if(transcript.toLowerCase().includes("विशलिस्ट") || transcript.toLowerCase().includes("wishlist") || transcript.toLowerCase().includes("पसंद")){
      speak("आपका विशलिस्ट खोल रहा हूं")
      navigate("/wishlist")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Cart
    else if(transcript.toLowerCase().includes("कार्ट") || transcript.toLowerCase().includes("गाड़ी") || transcript.toLowerCase().includes("shopping cart")){
      speak("आपका कार्ट खोल रहा हूं")
      navigate("/cart")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Orders / My Orders
    else if(transcript.toLowerCase().includes("ऑर्डर") || transcript.toLowerCase().includes("आदेश") || transcript.toLowerCase().includes("my order") || transcript.toLowerCase().includes("orders")){
      speak("आपके ऑर्डर खोल रहा हूं")
      navigate("/order")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Account Settings
    else if(transcript.toLowerCase().includes("अकाउंट") || transcript.toLowerCase().includes("account") || transcript.toLowerCase().includes("प्रोफाइल")){
      speak("अकाउंट सेटिंग्स खोल रहा हूं")
      navigate("/account-settings")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Address / Manage Address
    else if(transcript.toLowerCase().includes("पता") || transcript.toLowerCase().includes("address") || transcript.toLowerCase().includes("पते")){
      speak("पते खोल रहा हूं")
      navigate("/addresses")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Payment Settings
    else if(transcript.toLowerCase().includes("भुगतान") || transcript.toLowerCase().includes("payment") || transcript.toLowerCase().includes("pay")){
      speak("भुगतान सेटिंग्स खोल रहा हूं")
      navigate("/payment-settings")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Returns / Refund
    else if(transcript.toLowerCase().includes("रिटर्न") || transcript.toLowerCase().includes("वापस") || transcript.toLowerCase().includes("refund")){
      speak("रिटर्न्स पेज खोल रहा हूं")
      navigate("/returns")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Contact / Support
    else if(transcript.toLowerCase().includes("संपर्क") || transcript.toLowerCase().includes("contact") || transcript.toLowerCase().includes("सपोर्ट")){
      speak("संपर्क पेज खोल रहा हूं")
      navigate("/contact")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Customer Support
    else if(transcript.toLowerCase().includes("ग्राहक सहायता") || transcript.toLowerCase().includes("customer support") || transcript.toLowerCase().includes("help")){
      speak("ग्राहक सहायता खोल रहा हूं")
      navigate("/customer-support")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Chat Support
    else if(transcript.toLowerCase().includes("चैट") || transcript.toLowerCase().includes("chat support") || transcript.toLowerCase().includes("live chat")){
      speak("चैट सपोर्ट खोल रहा हूं")
      navigate("/chat-support")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Device Support
    else if(transcript.toLowerCase().includes("डिवाइस") || transcript.toLowerCase().includes("device support") || transcript.toLowerCase().includes("gadget")){
      speak("डिवाइस सपोर्ट खोल रहा हूं")
      navigate("/device-support")
      setShowSearch(false)
      setActiveAi(false)
    }
    // EMI Calculator
    else if(transcript.toLowerCase().includes("ईएमआई") || transcript.toLowerCase().includes("emi") || transcript.toLowerCase().includes("कैलकुलेटर")){
      speak("ईएमआई कैलकुलेटर खोल रहा हूं")
      navigate("/emi-calculator")
      setShowSearch(false)
      setActiveAi(false)
    }
    // QR Payment
    else if(transcript.toLowerCase().includes("क्यूआर") || transcript.toLowerCase().includes("qr payment") || transcript.toLowerCase().includes("scan")){
      speak("क्यूआर पेमेंट खोल रहा हूं")
      navigate("/qr-payment")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Referrals
    else if(transcript.toLowerCase().includes("रेफरल") || transcript.toLowerCase().includes("referral") || transcript.toLowerCase().includes("friends")){
      speak("रेफरल पेज खोल रहा हूं")
      navigate("/referrals")
      setShowSearch(false)
      setActiveAi(false)
    }
    // About
    else if(transcript.toLowerCase().includes("के बारे में") || transcript.toLowerCase().includes("about") || transcript.toLowerCase().includes("जानकारी")){
      speak("के बारे में पेज खोल रहा हूं")
      navigate("/about")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Home
    else if(transcript.toLowerCase().includes("होम") || transcript.toLowerCase().includes("home") || transcript.toLowerCase().includes("मुख्य पृष्ठ")){
      speak("होम पेज खोल रहा हूं")
      navigate("/")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Collection / Products
    else if(transcript.toLowerCase().includes("कलेक्शन") || transcript.toLowerCase().includes("collection") || transcript.toLowerCase().includes("प्रोडक्ट्स") || transcript.toLowerCase().includes("सामान") || transcript.toLowerCase().includes("shop")){
      speak("कलेक्शन पेज खोल रहा हूं")
      navigate("/collection")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Search open
    else if(transcript.toLowerCase().includes("खोज") && transcript.toLowerCase().includes("खोलो") && !showSearch){
      speak("खोज खोल रहा हूं")
      setShowSearch(true)
      navigate("/collection")
      setActiveAi(false)
    }
    // Search close
    else if(transcript.toLowerCase().includes("खोज") && transcript.toLowerCase().includes("बंद") && showSearch){
      speak("खोज बंद कर रहा हूं")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Personalized recommendations
    else if(transcript.toLowerCase().includes("सिफारिश") || transcript.toLowerCase().includes("recommend") || transcript.toLowerCase().includes("सुझाव") || transcript.toLowerCase().includes("मेरे लिए") || transcript.toLowerCase().includes("personalized")){
      speak("व्यक्तिगत सिफारिशें दिखा रहा हूं")
      navigate("/collection")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Chat / AI Assistant
    else if(transcript.toLowerCase().includes("चैट") || transcript.toLowerCase().includes("ai") || transcript.toLowerCase().includes("assistant") || transcript.toLowerCase().includes("बॉट")){
      speak("एआई शॉपिंग असिस्टेंट खोल रहा हूं")
      setActiveAi(false)
    }
    // Place Order / Checkout
    else if(transcript.toLowerCase().includes("चेकआउट") || transcript.toLowerCase().includes("checkout") || transcript.toLowerCase().includes("खरीद")){
      speak("चेकआउट पेज खोल रहा हूं")
      navigate("/placeorder")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Stop listening
    else if(transcript.toLowerCase().includes("बंद") || transcript.toLowerCase().includes("stop") || transcript.toLowerCase().includes("sleep") || transcript.toLowerCase().includes("ठहर")){
      speak("ठीक है, बंद हो रहा हूं")
      setActiveAi(false)
    }
    // ===================== ENGLISH COMMANDS =====================
    else if(transcript.toLowerCase().includes("wishlist")){
      speak("opening your wishlist")
      navigate("/wishlist")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("account settings") || transcript.toLowerCase().includes("profile")){
      speak("opening account settings")
      navigate("/account-settings")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("address") || transcript.toLowerCase().includes("addresses")){
      speak("opening addresses")
      navigate("/addresses")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("payment")){
      speak("opening payment settings")
      navigate("/payment-settings")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("return") || transcript.toLowerCase().includes("refund")){
      speak("opening returns page")
      navigate("/returns")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("customer support") || transcript.toLowerCase().includes("support")){
      speak("opening customer support")
      navigate("/customer-support")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("chat") || transcript.toLowerCase().includes("live chat")){
      speak("opening chat support")
      navigate("/chat-support")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("device") || transcript.toLowerCase().includes("gadget")){
      speak("opening device support")
      navigate("/device-support")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("emi") || transcript.toLowerCase().includes("calculator")){
      speak("opening EMI calculator")
      navigate("/emi-calculator")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("qr") || transcript.toLowerCase().includes("scan")){
      speak("opening QR payment")
      navigate("/qr-payment")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("referral") || transcript.toLowerCase().includes("refer")){
      speak("opening referrals page")
      navigate("/referrals")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("about") || transcript.toLowerCase().includes("aboutpage")){
      speak("opening about page")
      navigate("/about")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("home") || transcript.toLowerCase().includes("homepage")){
      speak("opening home page")
      navigate("/")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("collection") || transcript.toLowerCase().includes("collections") || transcript.toLowerCase().includes("product") || transcript.toLowerCase().includes("products") || transcript.toLowerCase().includes("shop")){
      speak("opening collection page")
      navigate("/collection")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("search") && transcript.toLowerCase().includes("open") && !showSearch){
      speak("opening search")
      setShowSearch(true)
      navigate("/collection")
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("search") && transcript.toLowerCase().includes("close") && showSearch){
      speak("closing search")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("recommend") || transcript.toLowerCase().includes("suggestions") || transcript.toLowerCase().includes("for me")){
      speak("showing personalized recommendations")
      navigate("/collection")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("checkout") || transcript.toLowerCase().includes("place order") || transcript.toLowerCase().includes("buy now")){
      speak("opening checkout page")
      navigate("/placeorder")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("cart") || transcript.toLowerCase().includes("kaat") || transcript.toLowerCase().includes("caat")){
      speak("opening your cart")
      navigate("/cart")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("order") || transcript.toLowerCase().includes("myorders") || transcript.toLowerCase().includes("my order")){
      speak("opening your orders page")
      navigate("/order")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("contact")){
      speak("opening contact page")
      navigate("/contact")
      setShowSearch(false)
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("assistant") || transcript.toLowerCase().includes("help") || transcript.toLowerCase().includes("bot")){
      speak("opening AI shopping assistant")
      setActiveAi(false)
    }
    else if(transcript.toLowerCase().includes("stop") || transcript.toLowerCase().includes("sleep")){
      speak("OK, stopping")
      setActiveAi(false)
    }
  }

  // Manual click handler
  const handleAiClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported in your browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false

    recognition.start()
    openingSound.play()
    setActiveAi(true)

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      processCommand(transcript)
    }

    recognition.onend = () => {
      setActiveAi(false)
    }

    recognition.onerror = (e) => {
      toast.error("Voice recognition error")
      setActiveAi(false)
    }
  }

  return (
    <div className='fixed bottom-4 right-4 z-30'>
      <div className='ai-container' onClick={handleAiClick}>
        {/* <img src={ai} alt="" className={`w-[100px] cursor-pointer ${activeAi ? 'translate-x-[10%] translate-y-[-10%] scale-125 ' : 'translate-x-[0] translate-y-[0] scale-100'} transition-transform` } style={{
          filter: ` ${activeAi?"drop-shadow(0px 0px 30px #00d2fc)":"drop-shadow(0px 0px 20px black)"}`
        }}/> */}
      </div>
      {/* Listening indicator */}
      <div className="absolute -top-2 -right-2">
        <span className="flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
        </span>
      </div>
    </div>
  )
}

export default Ai

