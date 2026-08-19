import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Send,
  Cpu,
  User,
  Loader,
  BarChart2,
  AlertCircle,
  Clock,
  TrendingUp,
  Layers,
  Activity,
} from "react-feather";
import { API_ROUTES } from "../api/apiRoutes";

const AdminAIAssistant = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hello Admin,  
I can answer questions using your Task Management System database.`
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // NEW: category filter state
  const [activeCategory, setActiveCategory] = useState("All");

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (questionText) => {
    const finalText = questionText || input;

    if (!finalText.trim()) return;

    const userMsg = { role: "user", text: finalText };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        API_ROUTES.ADMIN.GEMINI_QUERY,
        { question: finalText },
        { headers }
      );

      const botMsg = {
        role: "assistant",
        text: response.data.answer || "No response received.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Admin AI Assistant Error:", err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Sorry, I couldn't process that request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // UPDATED QUICK QUESTIONS (now multi-module)
  const quickQuestionGroups = [
    {
      category: "Workload",
      icon: <BarChart2 size={16} className="text-emerald-600" />,
      questions: [
        "Who is overloaded right now?",
        "Who is free now?",
        "Show top 5 overloaded employees",
        "Which employee has the lowest workload?",
        "Who should I assign tasks to balance workload?",
      ],
    },
    {
      category: "Deadlines",
      icon: <AlertCircle size={16} className="text-red-500" />,
      questions: [
        "Which tasks are overdue?",
        "Which tasks are due in next 3 days?",
        "Which employee has most overdue tasks?",
        "Which project has most deadline risks?",
        "Which tasks need urgent attention today?",
      ],
    },
    {
      category: "Monitoring",
      icon: <Activity size={16} className="text-orange-500" />,
      questions: [
        "Show tasks stuck in progress for more than 7 days",
        "Which tasks are not updated recently?",
        "Which employee hasn’t updated any task recently?",
        "List tasks waiting for review",
        "Show tasks in review status",
      ],
    },
    {
      category: "Performance",
      icon: <TrendingUp size={16} className="text-blue-600" />,
      questions: [
        "Who is completing tasks fastest?",
        "Who is frequently missing deadlines?",
        "Which employee has best completion rate?",
        "Show performance report for emp1",
        "Who is most consistent employee this month?",
      ],
    },
    {
      category: "Projects",
      icon: <Layers size={16} className="text-purple-600" />,
      questions: [
        "Show project progress summary",
        "Which project is delayed?",
        "Which project has most pending tasks?",
        "Which project has maximum completed tasks?",
        "Which project needs more manpower?",
      ],
    },
  ];

  const categories = ["All", ...quickQuestionGroups.map((g) => g.category)];

  const filteredGroups =
    activeCategory === "All"
      ? quickQuestionGroups
      : quickQuestionGroups.filter((g) => g.category === activeCategory);

  return (
    <div className="w-full h-full p-6 md:p-8 bg-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Cpu size={22} className="text-emerald-600" />
            Admin AI Assistant
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ask questions about workload, deadlines, monitoring, performance, and projects.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
          <Clock size={18} className="text-emerald-600" />
          <span className="text-sm font-semibold text-slate-700">
            Smart Admin Insights
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3">
          Quick Question Categories
        </h3>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-full border transition ${
                activeCategory === cat
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Questions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3">
          Suggested Questions
        </h3>

        <div className="space-y-5">
          {filteredGroups.map((group, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-2">
                {group.icon}
                <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wide">
                  {group.category}
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {group.questions.map((q, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[65vh] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-4 rounded-xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-br-none"
                    : "bg-slate-100 text-slate-800 rounded-bl-none"
                }`}
              >
                <div className="flex items-center gap-2 mb-2 opacity-80 text-xs font-bold uppercase">
                  {msg.role === "user" ? (
                    <>
                      <User size={14} />
                      You
                    </>
                  ) : (
                    <>
                      <Cpu size={14} />
                      AI Assistant
                    </>
                  )}
                </div>

                <div className="whitespace-pre-line">{msg.text}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-700 p-4 rounded-xl shadow-sm flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                <span className="text-sm">Analyzing...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>

        {/* Input Box */}
        <div className="border-t border-slate-200 p-4 bg-white">
          <div className="flex items-center gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask something like: Which project is delayed?"
              className="flex-1 resize-none p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />

            <button
              onClick={() => sendMessage()}
              disabled={isLoading}
              className="px-5 py-3 bg-emerald-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-emerald-500 transition disabled:opacity-50"
            >
              <Send size={16} />
              Send
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            ⚡ Tip: Ask about workload, deadlines, monitoring, performance reports, or project progress.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAIAssistant;