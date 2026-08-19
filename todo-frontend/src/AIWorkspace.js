import React, { useState } from "react";
import { X, Minus } from "react-feather";
import TaskAIAssistant from "./TaskAIAssistant";
import GeneralChatAssistant from "./GeneralChatAssistant";

function AIWorkspace({ isOpen, onClose }) {

  const [activeTab, setActiveTab] = useState("task");
  const [isMinimized, setIsMinimized] = useState(false);

  // 🔥 MOVE CHAT STATES HERE (so they persist)
  const [taskMessages, setTaskMessages] = useState([
    { role: "assistant", text: "Hi 👋 I can help you manage your tasks." }
  ]);

  const [generalMessages, setGeneralMessages] = useState([
    { text: "Hello! Ask me anything.", sender: "ai" }
  ]);

  const [taskLoading, setTaskLoading] = useState(false);
  const [generalLoading, setGeneralLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div
  className={`fixed bottom-6 right-6 w-[850px] 
  ${isMinimized ? "h-[60px]" : "h-[600px]"} 
  bg-white dark:bg-gray-900 shadow-2xl rounded-xl flex flex-col z-[9999] transition-all duration-300`}
>

      {/* HEADER */}
      <div className="flex justify-between items-center p-3 bg-indigo-600 text-white rounded-t-xl">

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("task")}
            className={`px-3 py-1 rounded ${activeTab === "task" ? "bg-white text-indigo-600" : ""}`}
          >
            Task AI
          </button>

          <button
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1 rounded ${activeTab === "general" ? "bg-white text-indigo-600" : ""}`}
          >
            General AI
          </button>
        </div>

        <div className="flex gap-3">
          <Minus className="cursor-pointer" onClick={() => setIsMinimized(!isMinimized)} />
          <X className="cursor-pointer" onClick={onClose} />
        </div>
      </div>

    <div
  className={`transition-all duration-300 overflow-hidden 
  ${isMinimized ? "h-0" : "flex-1"}`}
>

          {activeTab === "task" && (
            <TaskAIAssistant
              messages={taskMessages}
              setMessages={setTaskMessages}
              loading={taskLoading}
              setLoading={setTaskLoading}
            />
          )}

          {activeTab === "general" && (
            <GeneralChatAssistant
              messages={generalMessages}
              setMessages={setGeneralMessages}
              loading={generalLoading}
              setLoading={setGeneralLoading}
            />
          )}

        </div>
    </div>
  );
}

export default AIWorkspace;