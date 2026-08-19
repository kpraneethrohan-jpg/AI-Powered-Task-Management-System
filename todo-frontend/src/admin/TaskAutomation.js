import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Zap, User, Clock, AlertCircle, CheckCircle } from 'react-feather';
import { API_ROUTES } from '../api/apiRoutes';

const TaskAutomation = () => {
  // --- Auth Constants ---
  const adminId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  // --- States ---
  const [pendingTasks, setPendingTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState({
    taskName: '',
    description: '',
    priority: 'Medium',
    deadline: ''
  });
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userMap, setUserMap] = useState({});

  // ✅ NEW STATES FOR AI AUTO FILL FEATURE
  const [smartText, setSmartText] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  // --- 1. Load User Map & Existing Queue on Mount ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Users for the map
        const [emp, mgr] = await Promise.all([
          axios.get(API_ROUTES.ADMIN.GET_EMPLOYEE_PROFILES, { headers }),
          axios.get(API_ROUTES.ADMIN.GET_MANAGER_PROFILES, { headers })
        ]);
        const all = [...emp.data, ...mgr.data].reduce((acc, u) => {
          acc[u.id] = u.username;
          return acc;
        }, {});
        setUserMap(all);

        // FETCH PERSISTENT QUEUE: Get tasks already in UnassignedTask table
        const queueRes = await axios.get(API_ROUTES.ADMIN.GET_TASKS_IN_QUEUE(adminId), { headers });
        // Map backend 'id' to our frontend 'id'
        const existingTasks = queueRes.data.map(t => ({
          id: t.id,
          taskName: t.taskname,
          description: t.description,
          priority: t.priority,
          deadline: t.deadline
        }));
        setPendingTasks(existingTasks);

      } catch (err) {
        console.error("Initialization failed", err);
      }
    };
    fetchData();
  }, [adminId]);

  // --- 2. Add to Queue (Persistent) ---
  const addToQueue = async () => {
    if (!currentTask.taskName || !currentTask.description) return;

    try {
      // SAVE TO UNASSIGNED_TASK TABLE
      const response = await axios.post(
        API_ROUTES.ADMIN.ADD_TASKS_TO_QUEUE(adminId),
        currentTask,
        { headers }
      );

      // Use the real Database ID returned from backend
      const newTask = {
        ...currentTask,
        id: response.data.id
      };

      setPendingTasks([...pendingTasks, newTask]);
      setCurrentTask({ taskName: '', description: '', priority: 'Medium', deadline: '' });

      // ✅ Clear smart input also
      setSmartText("");

    } catch (err) {
      alert("Failed to save task to queue.");
    }
  };

  // --- 3. Remove from Queue (Persistent) ---
  const removeFromQueue = async (id) => {
    try {
      // DELETE FROM UNASSIGNED_TASK TABLE
      await axios.delete(API_ROUTES.ADMIN.DELETE_FROM_QUEUE(id), { headers });
      setPendingTasks(pendingTasks.filter(t => t.id !== id));
    } catch (err) {
      alert("Failed to remove task from database.");
    }
  };

  // --- 4. Run AI Suggestions ---
  const handleAutomate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
       API_ROUTES.ADMIN.MULTITASK_SUGGESTIONS,
        { tasks: pendingTasks },
        { headers }
      );
      setResults(response.data.suggestions);
    } catch (err) {
      alert("AI Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 5. Finalize Assignment (Move from Unassigned to Assigned) ---
  const finalizeAssignment = async (task, employeeId) => {
    try {
      // This calls the method that saves to AssignedTask AND deletes from UnassignedTask
      await axios.post(API_ROUTES.ADMIN.FINALIZE_ASSIGNMENT, {
        tempId: task.id.toString(), // The ID in UnassignedTask table
        taskName: task.taskName,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline,
        assignedToId: employeeId,
        assignedById: adminId
      }, { headers });

      setPendingTasks(pendingTasks.filter(t => t.id !== task.id));
      alert(`Task "${task.taskName}" officially assigned to ${userMap[employeeId]}!`);
    } catch (err) {
      alert("Final assignment failed.");
    }
  };

  // NEW FEATURE: AI AUTO FILL TASK FROM NATURAL LANGUAGE
  const handleSmartParse = async () => {
    if (!smartText.trim()) {
      alert("Please enter a task sentence.");
      return;
    }

    setIsParsing(true);

    try {
      const response = await axios.post(
        API_ROUTES.ADMIN.AI_AUTOFILL_TASK_DETAILS,
        { text: smartText },
        { headers }
      );

      const parsed = response.data;

      setCurrentTask({
        taskName: parsed.taskName || "",
        description: parsed.description || "",
        priority: parsed.priority || "Medium",
        deadline: parsed.deadline || ""
      });

    } catch (err) {
      console.error("AI Task Parsing Failed:", err);
      alert("AI failed to understand the task sentence.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="w-full p-6 md:p-8 font-inter bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-brand-headline text-text-primary">Task Automation Hub</h1>
        <p className="text-text-secondary mt-1">Bulk create tasks and let AI find the perfect match for each.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Task Creator Form */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-subtle border border-border">
            <h3 className="text-lg font-brand-value mb-4">Create New Task</h3>

            <div className="space-y-4">

              {/* ✅ NEW SMART TASK INPUT UI */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Smart Task Input (AI)
                </label>

                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                    value={smartText}
                    onChange={(e) => setSmartText(e.target.value)}
                    placeholder='e.g. "Assign login API to Rahul by Friday urgent"'
                  />

                  <button
                    onClick={handleSmartParse}
                    disabled={isParsing}
                    className="px-4 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-500 transition disabled:opacity-50"
                  >
                    {isParsing ? "Parsing..." : "AI Fill"}
                  </button>
                </div>

                <p className="text-[11px] text-muted-foreground mt-1">
                  AI will auto-fill task title, description, priority, and deadline.
                </p>
              </div>

              {/* Existing Inputs */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">Task Title</label>
                <input
                  type="text"
                  className="w-full p-2 mt-1 border rounded-lg focus:ring-2 focus:ring-brand-primary outline-none"
                  value={currentTask.taskName}
                  onChange={e => setCurrentTask({ ...currentTask, taskName: e.target.value })}
                  placeholder="e.g. Database Migration"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                <textarea
                  className="w-full p-2 mt-1 border rounded-lg h-24 outline-none"
                  value={currentTask.description}
                  onChange={e => setCurrentTask({ ...currentTask, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Priority</label>
                  <select
                    className="w-full p-2 mt-1 border rounded-lg"
                    value={currentTask.priority}
                    onChange={e => setCurrentTask({ ...currentTask, priority: e.target.value })}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Deadline</label>
                  <input
                    type="date"
                    className="w-full p-2 mt-1 border rounded-lg text-sm"
                    value={currentTask.deadline}
                    onChange={e => setCurrentTask({ ...currentTask, deadline: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={addToQueue}
                className="w-full py-3 bg-slate-800 text-white rounded-lg font-brand-cta flex items-center justify-center space-x-2 hover:bg-slate-700 transition"
              >
                <Plus size={18} />
                <span>Add to Queue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Queue & Results */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-brand-headline">Automation Queue ({pendingTasks.length})</h3>
            {pendingTasks.length > 0 && (
              <button
                onClick={handleAutomate}
                disabled={isLoading}
                className="gradient-brand text-white px-6 py-2 rounded-full font-brand-cta flex items-center space-x-2 shadow-moderate interactive-hover disabled:opacity-50"
              >
                <Zap size={18} fill="currentColor" />
                <span>{isLoading ? 'AI Analyzing...' : 'Run Smart Automation'}</span>
              </button>
            )}
          </div>

          {pendingTasks.length === 0 ? (
            <div className="h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-white/50">
              <Clock size={48} className="mb-2 opacity-20" />
              <p>Your queue is empty. Add tasks to start automation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-xl shadow-subtle border border-border overflow-hidden">
                  <div className="p-5 flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {task.priority}
                        </span>
                        <h4 className="text-lg font-semibold text-text-primary">{task.taskName}</h4>
                      </div>
                      <p className="text-text-secondary text-sm mt-1 line-clamp-2">{task.description}</p>
                    </div>
                    <button onClick={() => removeFromQueue(task.id)} className="text-muted-foreground hover:text-error transition">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* AI RESULTS DRAWER */}
                  {results && results[task.id.toString()] && (
                    <div className="bg-slate-50 border-t border-border p-5 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top AI Recommendations</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {results[task.id.toString()].map((rec, rIdx) => (
                          <div key={rIdx} className="bg-white p-4 rounded-lg border border-border shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-colors">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                  {userMap[rec.employeeId]?.substring(0, 2).toUpperCase() || '??'}
                                </div>
                                <span className="font-semibold text-sm">{userMap[rec.employeeId]}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed italic mb-3">
                                "{rec.reasoning}"
                              </p>
                            </div>
                            <button
                              onClick={() => finalizeAssignment(task, rec.employeeId)}
                              className="w-full py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded text-xs font-bold transition-all"
                            >
                              Assign Task
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskAutomation;