import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { Send } from "react-feather";

function GeneralChatAssistant({ messages, setMessages, loading, setLoading }) {

  const token = localStorage.getItem("token");
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/gemini/ask",
        { newPrompt: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, { text: res.data, sender: "ai" }]);
    } catch {
      setMessages(prev => [...prev, { text: "Error fetching AI response", sender: "ai" }]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i}
            className={`p-2 rounded max-w-[70%] ${
              msg.sender === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="text-sm text-gray-500">
            Loading response...
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-4 rounded"
        >
          <Send size={14}/>
        </button>
      </div>

    </div>
  );
}

export default GeneralChatAssistant;