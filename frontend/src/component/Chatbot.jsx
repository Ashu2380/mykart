import React, { useState } from 'react';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your shopping assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage = { id: messages.length + 1, text: inputValue, sender: 'user' };
    setMessages([...messages, userMessage]);

    // Clear input
    setInputValue('');

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      const botMessage = { id: messages.length + 2, text: botResponse, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 1000);
  };

  const getBotResponse = async (userInput) => {
    const input = userInput.toLowerCase();

    // Check if it's a product recommendation query
    if (input.includes('recommend') || input.includes('suggest') || input.includes('find') ||
        input.includes('looking for') || input.includes('need') || input.includes('want') ||
        input.includes('best') || input.includes('good')) {

      try {
        // Extract budget from query
        let budget = null;
        const budgetMatch = input.match(/under\s+(\d+)|below\s+(\d+)|₹?\s*(\d+)\s*rupees?/i);
        if (budgetMatch) {
          budget = budgetMatch[1] || budgetMatch[2] || budgetMatch[3];
        }

        // Extract preferences
        const preferences = [];
        if (input.includes('men') || input.includes('male')) preferences.push('men');
        if (input.includes('women') || input.includes('female')) preferences.push('women');
        if (input.includes('kids') || input.includes('children')) preferences.push('kids');
        if (input.includes('electronics') || input.includes('phone') || input.includes('laptop')) preferences.push('electronics');
        if (input.includes('home') || input.includes('kitchen')) preferences.push('home');
        if (input.includes('beauty') || input.includes('health')) preferences.push('beauty');

        // Call AI recommendations API
        const response = await fetch('http://localhost:6000/api/product/ai-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: userInput,
            budget: budget,
            preferences: preferences
          })
        });

        const data = await response.json();

        if (data.success && data.recommendations.length > 0) {
          const topRecommendations = data.recommendations.slice(0, 3);
          let responseText = `Based on your query "${userInput}", here are some recommendations:\n\n`;

          topRecommendations.forEach((product, index) => {
            responseText += `${index + 1}. ${product.name} - ₹${product.price}\n`;
            responseText += `   ${product.description.substring(0, 100)}...\n\n`;
          });

          responseText += "Would you like me to show you more details about any of these products?";
          return responseText;
        } else {
          return "I couldn't find specific recommendations for your query. Could you please provide more details about what you're looking for?";
        }
      } catch (error) {
        console.error('AI Recommendation error:', error);
        return "I'm having trouble getting recommendations right now. Let me help you with general product information instead.";
      }
    }

    // Default responses for other queries
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello there! How can I assist you with your shopping today?";
    } else if (input.includes('product') || input.includes('item')) {
      return "We have a wide range of products in categories like Men, Women, Kids, Electronics, Home & Kitchen, Beauty & Health, Sports & Outdoors, Books & Media, and Toys & Games. Which category interests you?";
    } else if (input.includes('men')) {
      return "Our Men's collection includes TopWear, BottomWear, and WinterWear. Would you like to know more about any specific subcategory?";
    } else if (input.includes('women')) {
      return "Our Women's collection includes TopWear, BottomWear, and WinterWear. Would you like to know more about any specific subcategory?";
    } else if (input.includes('kids')) {
      return "Our Kids collection includes TopWear, BottomWear, and WinterWear. Would you like to know more about any specific subcategory?";
    } else if (input.includes('electronics')) {
      return "Our Electronics section includes Phones, Laptops, and Accessories. Is there something specific you're looking for?";
    } else if (input.includes('home') || input.includes('kitchen')) {
      return "Our Home & Kitchen section includes Furniture, Cookware, and Storage solutions. What are you looking for?";
    } else if (input.includes('beauty') || input.includes('health')) {
      return "Our Beauty & Health section includes Skincare, Haircare, and Wellness products. What would you like to know?";
    } else if (input.includes('sports') || input.includes('outdoors')) {
      return "Our Sports & Outdoors section includes Athletic Wear, Camping Gear, and Fitness Equipment. Are you looking for something specific?";
    } else if (input.includes('books') || input.includes('media')) {
      return "Our Books & Media section includes Fiction, Non-Fiction, and Movies & TV. What genre interests you?";
    } else if (input.includes('toys') || input.includes('games')) {
      return "Our Toys & Games section includes Action Figures, Board Games, and Puzzles. What age group are you shopping for?";
    } else if (input.includes('order') || input.includes('track')) {
      return "You can track your orders in the 'My Orders' section of your account. Would you like me to help you navigate there?";
    } else if (input.includes('cart')) {
      return "You can view your cart by clicking on the cart icon in the top right corner. Would you like me to take you there?";
    } else if (input.includes('return') || input.includes('refund')) {
      return "We have a 30-day return policy on most items. For more details, please check our Returns & Refunds page or contact customer support.";
    } else if (input.includes('contact') || input.includes('support')) {
      return "You can reach our customer support team through the Contact page, or I can connect you to a live agent. Would you like me to do that?";
    } else if (input.includes('visual search') || input.includes('image search') || input.includes('photo search')) {
      return "Great! You can use our Visual Search feature to find similar products by uploading a photo. Would you like me to take you to the visual search page?";
    } else if (input.includes('voice search') || input.includes('speak') || input.includes('talk')) {
      return "You can use voice commands with our AI assistant! Just say 'Hey AI' and speak your commands like 'show me winter jackets' or 'open visual search'. Try it now!";
    } else if (input.includes('personalized') || input.includes('recommendations') || input.includes('for me')) {
      return "Our AI-powered personalized recommendations are shown at the top of our collections page. They adapt based on your browsing and cart history!";
    } else if (input.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    } else {
      return "I'm here to help with your shopping experience. You can ask me about products, orders, returns, visual search, voice commands, or anything else related to your shopping. What would you like to know?";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-20">
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={toggleChatbot}
          className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-96 flex flex-col">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Shopping Assistant</h3>
            <button onClick={toggleChatbot} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 ${message.sender === 'bot' ? 'text-left' : 'text-right'}`}
              >
                <div
                  className={`inline-block p-2 rounded-lg max-w-xs ${
                    message.sender === 'bot'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;