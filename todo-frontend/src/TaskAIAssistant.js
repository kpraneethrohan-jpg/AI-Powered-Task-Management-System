import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { Send, Cpu, User, Loader } from "react-feather";
import { useAuth } from "./context/AuthContext";

function TaskAIAssistant({ messages, setMessages, loading, setLoading }) {

  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getPriorityColor = (priority) => {
    if (!priority) return "bg-gray-100 text-gray-600";
    if (priority.toLowerCase() === "high") return "bg-red-100 text-red-600";
    if (priority.toLowerCase() === "medium") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-600";
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/gemini/chat",
        { userId: user.userId, userMessage: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Store structured AI response
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          data: res.data
        }
      ]);

    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Error fetching AI response" }]);
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
    <div className="flex flex-col h-full bg-slate-50">

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

            <div className={`p-3 rounded-lg max-w-[70%] text-sm shadow ${
              msg.role === "user"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-800"
            }`}>

              <div className="flex items-center gap-2 text-xs mb-1">
                {msg.role === "user" ? <User size={12}/> : <Cpu size={12}/>}
                {msg.role}
              </div>

              {/* USER MESSAGE */}
              {msg.role === "user" && msg.text}

              {/* AI RESPONSE */}
              {msg.role === "assistant" && msg.data?.tasks && (
                <div className="space-y-3 mt-2">

                  {msg.data.tasks.length === 0 && (
                    <div className="text-gray-500 text-xs">No tasks found</div>
                  )}

                  {msg.data.tasks.map((task, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-indigo-50">

                      <div className="font-semibold text-indigo-700">
                        {task.taskName}
                      </div>

                      <div className="text-xs text-gray-600 mt-1">
                        {task.description}
                      </div>

                      <div className="flex gap-2 mt-2 text-xs flex-wrap">

                        <span className={`px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>

                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded">
                          {task.status}
                        </span>

                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {task.deadline}
                        </span>

                      </div>

                      {task.reasoning && (
                        <div className="text-xs mt-2 text-gray-500 italic">
                          {task.reasoning}
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}

              {/* FALLBACK IF ERROR */}
              {msg.role === "assistant" && msg.text && (
                <div>{msg.text}</div>
              )}

            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-center text-gray-500">
            <Loader className="animate-spin" size={14}/>
            Analyzing your tasks...
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask about your tasks..."
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-4 rounded flex items-center gap-1"
        >
          <Send size={14}/> Send
        </button>
      </div>

    </div>
  );
}

export default TaskAIAssistant;