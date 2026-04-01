import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import axios from 'axios';

function ChatSupport() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI chat assistant powered by Gemini. How can I help you with your shopping or support needs today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Get API key from environment
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isGeminiConfigured = geminiApiKey && geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Call Gemini API for intelligent responses
  const getGeminiResponse = async (userInput) => {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{
            parts: [{
              text: `You are a customer support AI assistant for an e-commerce website called "Mykart". Help the user with their shopping questions. Keep responses concise and helpful. User question: ${userInput}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.candidates && response.data.candidates[0]) {
        return response.data.candidates[0].content.parts[0].text;
      }
      return null;
    } catch (error) {
      console.log('Gemini API error:', error.message);
      return null;
    }
  };

  // Predefined responses for quick answers
  const getPredefinedResponse = (userInput) => {
    const input = userInput.toLowerCase();

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! Welcome to our live chat support. I'm here to assist you with any questions about our products, orders, or services.";
    } else if (input.includes('order') || input.includes('track')) {
      return "I'd be happy to help you with your order! Can you please provide your order number or tell me what specific assistance you need regarding your order?";
    } else if (input.includes('return') || input.includes('refund')) {
      return "For returns and refunds, we offer a 30-day return policy on most items. You can initiate a return through your account or contact our support team. Would you like me to guide you through the process?";
    } else if (input.includes('product') || input.includes('item') || input.includes('shop')) {
      return "We have an extensive collection of products across various categories. Are you looking for something specific? I can help you find the perfect item or provide recommendations based on your preferences.";
    } else if (input.includes('payment') || input.includes('pay') || input.includes('upi') || input.includes('card')) {
      return "We accept various payment methods including credit/debit cards, UPI, net banking, and cash on delivery. If you're having trouble with a payment, please provide more details so I can assist you.";
    } else if (input.includes('delivery') || input.includes('shipping') || input.includes('deliver')) {
      return "We offer fast and reliable shipping across India. Standard delivery usually takes 3-5 business days, while express delivery is available for 1-2 days. Free shipping on orders above ₹500!";
    } else if (input.includes('contact') || input.includes('support') || input.includes('help')) {
      return "You're already in the right place! I'm here to help. If you need to speak with a human representative, I can connect you. What specific issue are you facing?";
    } else if (input.includes('thank') || input.includes('thanks')) {
      return "You're welcome! Is there anything else I can help you with today? Feel free to ask about products, orders, returns, or any other questions.";
    } else if (input.includes('price') || input.includes('cost') || input.includes(' rupees') || input.includes('₹')) {
      return "Our products are competitively priced with great deals and discounts. You can check the current price on any product page. Would you like to see our current offers?";
    } else if (input.includes('discount') || input.includes('offer') || input.includes('sale') || input.includes('coupon')) {
      return "We regularly offer exciting discounts and deals! Check our homepage for current offers. You can also apply coupon codes at checkout to avail additional discounts.";
    } else if (input.includes('account') || input.includes('login') || input.includes('password') || input.includes('signup')) {
      return "You can create an account or login from the main website. For account issues, I can help you reset your password or update your profile information.";
    } else if (input.includes('wishlist') || input.includes('favorite')) {
      return "You can add products to your wishlist by clicking the heart icon on any product. This helps you save items for later purchase.";
    } else if (input.includes('cart') || input.includes('shopping cart')) {
      return "Your cart shows all items you've added. You can modify quantities or remove items before checkout. Proceed to place order when ready!";
    } else if (input.includes('emi') || input.includes('installment') || input.includes('monthly')) {
      return "We offer EMI options on most products! You can use our EMI calculator to check monthly installments. Interest rates may apply based on the tenure.";
    } else if (input.includes('cancel') || input.includes('order cancel')) {
      return "To cancel an order, please go to your orders page and select the order you wish to cancel. You can only cancel orders that haven't been shipped yet.";
    } else if (input.includes('replace') || input.includes('exchange')) {
      return "We offer easy exchanges! You can request a replacement through your order details. The process typically takes 5-7 business days.";
    } else if (input.includes('track') || input.includes('tracking')) {
      return "You can track your order from the Orders page. Once shipped, you'll receive a tracking number via SMS and email.";
    } else if (input.includes('quality') || input.includes('authentic') || input.includes('genuine')) {
      return "We guarantee 100% authentic products! All items are sourced directly from manufacturers and brand authorized sellers.";
    } else if (input.includes('bulk') || input.includes('wholesale') || input.includes('business')) {
      return "For bulk orders or business inquiries, please contact our B2B team at business@mykart.com";
    } else if (input.includes('gift') || input.includes('present')) {
      return "We have gift wrapping available! You can add a gift message during checkout. Perfect for special occasions!";
    } else if (input.includes('phone') || input.includes('number') || input.includes('call')) {
      return "You can reach our customer support at 1800-XXX-XXXX (Mon-Sat, 9AM-6PM). I'm also here to help you right now!";
    } else if (input.includes('size') || input.includes('small') || input.includes('large') || input.includes('xl')) {
      return "We have all sizes available! Check the size chart on each product page. If you need help, I can guide you on finding the right fit.";
    } else if (input.includes('color') || input.includes('colour')) {
      return "Many products come in multiple colors! Check the product page for available color options.";
    } else {
      return null; // No predefined match - will use Gemini
    }
  };

  const handleSend = async () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage = { id: messages.length + 1, text: inputValue, sender: 'user' };
    setMessages([...messages, userMessage]);

    // Clear input
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      let botResponse;

      // First check predefined responses
      const predefinedResponse = getPredefinedResponse(currentInput);

      if (predefinedResponse) {
        botResponse = predefinedResponse;
      } else if (isGeminiConfigured) {
        // Use Gemini for unknown queries
        const geminiResponse = await getGeminiResponse(currentInput);
        botResponse = geminiResponse || "I understand you're asking about '" + currentInput + "'. I'm here to help with shopping, orders, returns, payments, and more! Could you please provide more details?";
      } else {
        // Fallback if no predefined and no Gemini
        botResponse = "I understand you're asking about '" + currentInput + "'. For specific assistance, please contact our support team or ask about our products, orders, returns, or payments.";
      }

      const botMessage = { id: messages.length + 2, text: botResponse, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.log('Error getting response:', error);
      const errorMessage = { 
        id: messages.length + 2, 
        text: "I apologize, but I'm having trouble processing your request. Please try again or contact our support team.", 
        sender: 'bot' 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      } else if (event.error === 'audio-capture') {
        alert('No microphone found. Please connect a microphone.');
      } else {
        alert('Voice recognition error. Please try again.');
      }
    };

    try {
      recognition.start();
    } catch(e) {
      console.log('Could not start recognition:', e);
      setIsListening(false);
      alert('Could not start voice recognition. Please try again.');
    }
  };

  // Quick action handlers
  const handleQuickAction = (text) => {
    setInputValue(text);
  };

  return (
    <div className='w-full min-h-screen bg-gray-50 pt-24 md:pt-20 lg:pt-24 px-4 md:px-6 lg:px-8 pb-20'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white/10 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden'>
          {/* Chat Header */}
          <div className='bg-blue-600 text-white p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
                <span className='text-xl'>🤖</span>
              </div>
              <div>
                <h2 className='text-lg font-semibold'>AI Chat Support {isGeminiConfigured && '(Gemini AI)'}</h2>
                <p className='text-sm opacity-90'>
                  {isLoading ? 'Thinking...' : isGeminiConfigured ? 'Powered by Google Gemini' : 'Online • Typically replies instantly'}
                </p>
              </div>
            </div>
            <div className='text-sm'>
              Live Chat
            </div>
          </div>

          {/* Chat Messages */}
          <div className='h-96 overflow-y-auto p-4 bg-gray-50'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'bot'
                      ? 'bg-blue-100 text-blue-800 rounded-bl-none'
                      : 'bg-green-100 text-green-800 rounded-br-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className='mb-4 flex justify-start'>
                <div className='bg-blue-100 text-blue-800 rounded-lg rounded-bl-none px-4 py-2'>
                  <span className='inline-flex items-center'>
                    <span className='w-2 h-2 bg-blue-600 rounded-full mr-1 animate-bounce' style={{ animationDelay: '0ms' }}></span>
                    <span className='w-2 h-2 bg-blue-600 rounded-full mr-1 animate-bounce' style={{ animationDelay: '150ms' }}></span>
                    <span className='w-2 h-2 bg-blue-600 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className='p-4 border-t border-gray-200 bg-white'>
            <div className='flex items-center gap-2'>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                disabled={isLoading}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={startVoiceRecognition}
                disabled={isListening || isLoading}
                className={`p-2 rounded-lg ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'} hover:bg-gray-300 transition-colors disabled:opacity-50`}
                title="Voice input"
              >
                {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading || inputValue.trim() === ''}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Send message"
              >
                <FaPaperPlane />
              </button>
            </div>
            <p className='text-xs text-gray-500 mt-2'>
              Press Enter to send • Click microphone for voice input • {isGeminiConfigured ? 'Powered by Gemini AI' : 'Basic mode'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4'>
          <button
            onClick={() => handleQuickAction("I need help with my order")}
            className='bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-lg transition-colors text-sm border border-gray-300'
          >
            Order Help
          </button>
          <button
            onClick={() => handleQuickAction("I want to return an item")}
            className='bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-lg transition-colors text-sm border border-gray-300'
          >
            Returns
          </button>
          <button
            onClick={() => handleQuickAction("Tell me about your products")}
            className='bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-lg transition-colors text-sm border border-gray-300'
          >
            Products
          </button>
          <button
            onClick={() => handleQuickAction("I have a payment issue")}
            className='bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-lg transition-colors text-sm border border-gray-300'
          >
            Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatSupport;
