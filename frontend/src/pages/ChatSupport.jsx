import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

function ChatSupport() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI chat assistant. How can I help you with your shopping or support needs today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage = { id: messages.length + 1, text: inputValue, sender: 'user' };
    setMessages([...messages, userMessage]);

    // Clear input
    setInputValue('');

    // Simulate AI response after a short delay
    setTimeout(() => {
      const botResponse = getAIResponse(inputValue);
      const botMessage = { id: messages.length + 2, text: botResponse, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 1000);
  };

  const getAIResponse = (userInput) => {
    const input = userInput.toLowerCase();

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! Welcome to our live chat support. I'm here to assist you with any questions about our products, orders, or services.";
    } else if (input.includes('order') || input.includes('track')) {
      return "I'd be happy to help you with your order! Can you please provide your order number or tell me what specific assistance you need regarding your order?";
    } else if (input.includes('return') || input.includes('refund')) {
      return "For returns and refunds, we offer a 30-day return policy on most items. You can initiate a return through your account or contact our support team. Would you like me to guide you through the process?";
    } else if (input.includes('product') || input.includes('item')) {
      return "We have an extensive collection of products across various categories. Are you looking for something specific? I can help you find the perfect item or provide recommendations based on your preferences.";
    } else if (input.includes('payment') || input.includes('pay')) {
      return "We accept various payment methods including credit/debit cards, UPI, net banking, and cash on delivery. If you're having trouble with a payment, please provide more details so I can assist you.";
    } else if (input.includes('delivery') || input.includes('shipping')) {
      return "We offer fast and reliable shipping across India. Standard delivery usually takes 3-5 business days, while express delivery is available for 1-2 days. Free shipping on orders above ₹500!";
    } else if (input.includes('contact') || input.includes('support')) {
      return "You're already in the right place! I'm here to help. If you need to speak with a human representative, I can connect you. What specific issue are you facing?";
    } else if (input.includes('thank') || input.includes('thanks')) {
      return "You're welcome! Is there anything else I can help you with today? Feel free to ask about products, orders, returns, or any other questions.";
    } else {
      return "I understand you're asking about '" + userInput + "'. To provide you with the best assistance, could you please provide more details or rephrase your question? I'm here to help with shopping, orders, returns, payments, and more!";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser.');
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

    recognition.start();
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
                <h2 className='text-lg font-semibold'>AI Chat Support</h2>
                <p className='text-sm opacity-90'>Online • Typically replies instantly</p>
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
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={startVoiceRecognition}
                className={`p-2 rounded-lg ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'} hover:bg-gray-300 transition-colors`}
                title="Voice input"
              >
                {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                title="Send message"
              >
                <FaPaperPlane />
              </button>
            </div>
            <p className='text-xs text-gray-500 mt-2'>
              Press Enter to send • Click microphone for voice input
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4'>
          <button
            onClick={() => setMessages([...messages, { id: messages.length + 1, text: "I need help with my order", sender: 'user' }])}
            className='bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors text-sm'
          >
            Order Help
          </button>
          <button
            onClick={() => setMessages([...messages, { id: messages.length + 1, text: "I want to return an item", sender: 'user' }])}
            className='bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors text-sm'
          >
            Returns
          </button>
          <button
            onClick={() => setMessages([...messages, { id: messages.length + 1, text: "Tell me about your products", sender: 'user' }])}
            className='bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors text-sm'
          >
            Products
          </button>
          <button
            onClick={() => setMessages([...messages, { id: messages.length + 1, text: "Payment issues", sender: 'user' }])}
            className='bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors text-sm'
          >
            Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatSupport;