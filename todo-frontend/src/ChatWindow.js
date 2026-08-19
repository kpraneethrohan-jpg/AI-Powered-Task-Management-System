// src/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CornerDownLeft } from 'react-feather'; // Using icons for a better UI

function ChatWindow({ onToggle, onSendMessage, isOpen }) {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "gemini" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); // To show loading state
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // Ref to focus the input field when opened

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus the input when the chat window opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input.trim(), sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

     const historyForApi = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text
    }));

    try {
      // Call the parent's onSendMessage function
      const geminiReply = await onSendMessage(currentInput,historyForApi);
      setMessages(prev => [...prev, { text: geminiReply, sender: "gemini" }]);
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      setMessages(prev => [...prev, { text: "Oops! Something went wrong. Please try again.", sender: "gemini" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, allow new lines with Shift+Enter
      e.preventDefault();
      handleSend();
    }
  };
  
  // Conditionally apply classes for the open/close animation
  const containerClasses = `
    fixed bottom-24 right-6 
    w-96 max-w-[calc(100%-3rem)] h-[600px] max-h-[calc(100%-6rem)]
    bg-white dark:bg-gray-800 
    rounded-2xl shadow-2xl 
    flex flex-col 
    transition-all duration-300 ease-in-out
    ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
  `;

  return (
    <div className={containerClasses} onClick={e => e.stopPropagation()}>
      {/* --- Chat Header --- */}
      <div className="flex-shrink-0 flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Gemini Chat</h3>
        <button onClick={onToggle} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
          <X size={20} />
        </button>
      </div>
      
      {/* --- Chat Messages Area --- */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'gemini' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">G</div>
            )}
            <div className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md break-words ${
              msg.sender === 'user' 
                ? 'bg-blue-500 text-white rounded-br-lg' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-lg'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">G</div>
            <div className="px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* --- Chat Input Area --- */}
      <div className="flex-shrink-0 p-4 border-t dark:border-gray-700">
        <div className="relative">
          <textarea
            ref={inputRef}
            rows="1"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full pl-4 pr-20 py-2 border rounded-full bg-gray-100 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-400"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;