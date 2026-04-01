import React, { useContext, useState, useRef } from 'react'
import ai from "../assets/ai.png"
import { shopDataContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

function Ai() {
  let {showSearch , setShowSearch} = useContext(shopDataContext)
  let navigate = useNavigate()
  let [activeAi,setActiveAi] = useState(false)

 function speak(message){
 let utterence=new SpeechSynthesisUtterance(message)
 utterence.lang = 'hi-IN';
 window.speechSynthesis.speak(utterence)
   }

  const processCommand = (transcript) => {
    const input = transcript.toLowerCase();
    
    // === STOP LISTENING ===
    if(input.includes("बंद") || input.includes("stop") || input.includes("sleep") || input.includes("ठहर")){
      speak("ठीक है, बंद हो रहा हूं")
      setActiveAi(false)
      return
    }
    
    // === NAVIGATION COMMANDS ===
    
    // Wishlist
    if(input.includes("विशलिस्ट") || input.includes("wishlist") || input.includes("पसंद")){
      speak("Opening Wishlist")
      navigate("/wishlist")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Cart
    else if(input.includes("कार्ट") || input.includes("गाड़ी") || input.includes("shopping cart") || input.includes("cart") || input.includes("kaat") || input.includes("caat")){
      speak("Opening Cart Page")
      navigate("/cart")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Orders / My Orders
    else if(input.includes("ऑर्डर") || input.includes("आदेश") || input.includes("my order") || input.includes("orders") || input.includes("order") || input.includes("myorders")){
      speak("Your Order Page is opening")
      navigate("/order")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Account Settings
    else if(input.includes("अकाउंट") || input.includes("account") || input.includes("प्रोफाइल") || input.includes("profile")){
      speak("Your Account Setting is Opening")
      navigate("/account-settings")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Address / Manage Address
    else if(input.includes("पता") || input.includes("address") || input.includes("पते") || input.includes("addresses")){
      speak("Address section is opening")
      navigate("/addresses")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Payment Settings
    else if(input.includes("भुगतान") || input.includes("payment") || input.includes("pay")){
      speak("Opening Payment Setting Page")
      navigate("/payment-settings")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Returns / Refund
    else if(input.includes("रिटर्न") || input.includes("वापस") || input.includes("return") || input.includes("refund")){
      speak("opening returns page")
      navigate("/returns")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Contact
    else if(input.includes("संपर्क") || input.includes("contact")){
      speak("opening contact page ")
      navigate("/contact")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Customer Support
    else if(input.includes("ग्राहक सहायता") || input.includes("customer support") || input.includes("support")){
      speak("Customer-support page is opening")
      navigate("/customer-support")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Chat Support
    else if(input.includes("चैट") || input.includes("chat support") || input.includes("live chat") || input.includes("chat")){
      speak("chat support is opening")
      navigate("/chat-support")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Device Support
    else if(input.includes("डिवाइस") || input.includes("device support") || input.includes("gadget") || input.includes("device")){
      speak("Device support is opening")
      navigate("/device-support")
      setShowSearch(false)
      setActiveAi(false)
    }
    // EMI Calculator
    else if(input.includes("ईएमआई") || input.includes("emi") || input.includes("कैलकुलेटर") || input.includes("calculator")){
      speak("Emi page is opening")
      navigate("/emi-calculator")
      setShowSearch(false)
      setActiveAi(false)
    }
    // QR Payment
    else if(input.includes("क्यूआर") || input.includes("qr") || input.includes("scan")){
      speak("opening QR payment")
      navigate("/qr-payment")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Referrals
    else if(input.includes("रेफरल") || input.includes("referral") || input.includes("friends") || input.includes("refer")){
      speak("referal page is opening")
      navigate("/referrals")
      setShowSearch(false)
      setActiveAi(false)
    }
    // About
    else if(input.includes("के बारे में") || input.includes("about") || input.includes("जानकारी") || input.includes("aboutpage")){
      speak("yes sir About page is opening ")
      navigate("/about")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Home
    else if(input.includes("होम") || input.includes("home") || input.includes("मुख्य पृष्ठ") || input.includes("homepage")){
      speak("Home page is opening")
      navigate("/")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Collection / Products
    else if(input.includes("कलेक्शन") || input.includes("collection") || input.includes("प्रोडक्ट्स") || input.includes("सामान") || input.includes("shop") || input.includes("products") || input.includes("product")){
      speak("open collection page")
      navigate("/collection")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Search
    else if(input.includes("search") && input.includes("open") && !showSearch){
      speak("opening search")
      setShowSearch(true)
      navigate("/collection")
      setActiveAi(false)
    }
    else if(input.includes("search") && input.includes("close") && showSearch){
      speak("closing search")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Personalized recommendations
    else if(input.includes("सिफारिश") || input.includes("recommend") || input.includes("सुझाव") || input.includes("मेरे लिए") || input.includes("personalized") || input.includes("suggestions") || input.includes("for me")){
      speak("showing personalized recommendations")
      navigate("/collection")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Place Order / Checkout
    else if(input.includes("चेकआउट") || input.includes("checkout") || input.includes("खरीद") || input.includes("place order") || input.includes("buy now")){
      speak("place order page is opening")
      navigate("/placeorder")
      setShowSearch(false)
      setActiveAi(false)
    }
    // Assistant / Bot / Help
    else if(input.includes("assistant") || input.includes("help") || input.includes("bot")){
      speak("opening AI shopping assistant")
      setActiveAi(false)
    }
  }

  // Manual click handler - ONLY WORKS ON CLICK
  const handleAiClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported in your browser. Please use Chrome or Edge.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false

    // Set timeout to handle no response
    const timeoutId = setTimeout(() => {
      if (recognition.state === 'running') {
        recognition.stop()
      }
      setActiveAi(false)
    }, 5000) // 5 second timeout

    try {
      recognition.start()
      setActiveAi(true)
    } catch(e) {
      clearTimeout(timeoutId)
      toast.error("Could not start voice recognition. Please allow microphone access.")
      setActiveAi(false)
      return
    }

    recognition.onresult = (e) => {
      clearTimeout(timeoutId)
      const transcript = e.results[0][0].transcript
      console.log("Heard:", transcript)
      speak("Yes, I'm listening!")
      processCommand(transcript)
    }

    recognition.onend = () => {
      clearTimeout(timeoutId)
      setActiveAi(false)
    }

    recognition.onerror = (event) => {
      clearTimeout(timeoutId)
      console.log("Voice recognition error:", event.error)
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied. Please allow microphone access in browser settings.")
      } else if (event.error === 'no-speech') {
        toast.warning("No speech detected. Try again.")
      } else if (event.error === 'audio-capture') {
        toast.error("No microphone found. Please connect a microphone.")
      } else {
        toast.error("Voice recognition error. Please try again.")
      }
      setActiveAi(false)
    }
  }

  return (
    <div className='fixed bottom-4 right-4 z-30'>
      <div className='ai-container' onClick={handleAiClick}>
        <img 
          src={ai} 
          alt="" 
          className={`w-12 sm:w-16 md:w-20 lg:w-24 xl:w-28 cursor-pointer ${activeAi ? 'scale-110' : 'scale-100'} transition-transform`} 
          style={{
            filter: activeAi ? "drop-shadow(0px 0px 30px #00d2fc)" : "drop-shadow(0px 0px 15px rgba(0,0,0,0.5))"
          }}
        />
      </div>
    </div>
  )
}

export default Ai
