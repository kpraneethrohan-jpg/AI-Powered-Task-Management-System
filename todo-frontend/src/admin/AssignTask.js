import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import TaskComments from '../TaskComments';
import TaskCard from '../TaskCard';
import Icon from '../components/AppIcon';
import { X, Type, AlignLeft, Calendar, Plus, ArrowLeft } from 'react-feather';
// At the top of AssignTask.js
import useConfirmationModal from '../components/useConfirmationModal'; // Adjust path if needed
import { useAuth } from '../context/AuthContext';
import { API_ROUTES } from '../api/apiRoutes';

// Helper functions (keep these)
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

function AssignTask() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadMap, setUnreadMap] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [deadline, setDeadline] = useState('');
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState([]);
  const [priority, setPriority] = useState('medium');
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  //Added featured
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', 'calendar'
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const overdueTasks = tasks.filter(t => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(t.deadline);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today && t.status !== 'Done';
  }).length;

  // State for Calendar
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());


  // Filter states
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');


  const [selectedTask, setSelectedTask] = useState(null); //  Track selected task for viewing comments

  const statusColumns = [
    { title: 'To Do', color: 'bg-gray-100 dark:bg-gray-800' },
    { title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900' },
    { title: 'In Review', color: 'bg-yellow-100 dark:bg-yellow-900' },
    { title: 'Done', color: 'bg-green-100 dark:bg-green-900' }
  ];

  const fetchData = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Authentication Error: Please log in again.");
      return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    axios.get(API_ROUTES.ADMIN.GET_TASKS(id), { headers })
      .then((response) => setTasks(response.data))
      .catch((error) => console.error("Fetching Error: ", error));

    axios.get(API_ROUTES.UNREAD_COMMENTS, { headers })
      .then((res) => setUnreadMap(res.data))
      .catch((err) => console.log("Error loading unread map", err));
  };


  useEffect(() => {
    if (!user || !user.userId) {
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Authentication Error: Please log in again.");
      return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    const fetchTasks = () => {
      axios
        .get(API_ROUTES.ADMIN.GET_TASKS(id), { headers })
        .then((response) => setTasks(response.data))
        .catch((error) => console.error("Fetching Error: ", error));
    };

    const fetchUnreadMap = () => {
      axios
        .get(API_ROUTES.UNREAD_COMMENTS, { headers })
        .then((res) => setUnreadMap(res.data))
        .catch((err) => console.log("Error loading unread map", err));
    };

    fetchTasks();
    fetchUnreadMap();
  }, [id, user]);

  const handleLogout = () => {
    navigate('/UserLogin');
  };

  const handleAssign = (e) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Authentication Error: Please log in again.");
      return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    e.preventDefault();
    const newTask = { taskname: taskName, description, deadline, priority, status: 'To Do' };
    axios.post(API_ROUTES.ADMIN.ASSIGN_TASK(id), newTask, { headers })
      .then(() => {
        fetchData(); // Refresh the list
        resetForm(); // This will now be called on success
      })
      .catch((error) => {
        console.error("Error assigning task:", error);
        alert("Failed to assign task.");
        // It's good practice to not close the form on error so the user can retry
      });
  };

  const handleUpdate = (e) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Authentication Error: Please log in again.");
      return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    e.preventDefault();
    const updatedTask = { taskId: editTaskId, taskname: taskName, description, status, deadline, priority };
    axios.put(API_ROUTES.ADMIN.UPDATE_TASK(editTaskId), updatedTask, { headers })
      .then(() => axios.get(API_ROUTES.ADMIN.GET_TASKS(id), { headers }))
      .then((response) => {
        setTasks(response.data);
        resetForm();
      })
      .catch((error) => {
        console.error("Error updating task:", error);
        if (error.response && error.response.data) {
          alert(`Failed to update task: ${error.response.data.message || 'Check console for details.'}`);
        } else {
          alert("Failed to update task. See the console for more details.");
        }
      });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Authentication Error: Please log in again.");
      return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };


    try {
      await axios.put(API_ROUTES.ADMIN.UPDATE_STATUS, {
        taskId: taskId,
        status: newStatus
      }, { headers });

      fetchData(); // Re-fetch data to show the change
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };


  const handleBack = () => {
    navigate(-1);
  };

  const deleteTaskAction = (taskId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Authentication Error: Please log in again.");
      return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    return axios.delete(API_ROUTES.ADMIN.DELETE_TASK(taskId), { headers })
      .then(() => {
        setTasks(currentTasks => currentTasks.filter(task => task.taskId !== taskId));
      })
      .catch((error) => {
        console.error("Error deleting the task:", error);
        alert("Failed to delete the task."); 
        throw error; 
      });
  };

  const [askForDeleteConfirmation, DeleteConfirmationModal] = useConfirmationModal({
    onConfirm: deleteTaskAction,
    title: "Delete Task",
    message: "Are you sure you want to delete this task? This cannot be undone.",
    confirmText: "Delete",
  });

  const editTask = (taskToEdit) => {
    // const taskToEdit = tasks.find(task => task.taskId === taskId);
    if (taskToEdit) {
      setTaskName(taskToEdit.taskname);
      setDescription(taskToEdit.description);
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority || 'medium');
      setDeadline(taskToEdit.deadline);
      setIsEditing(true);
      setEditTaskId(taskToEdit.taskId);
      setIsFormOpen(true);
    }
  };

  const resetForm = () => {
    setTaskName('');
    setDescription('');
    setPriority('medium');
    setDeadline('');
    setIsEditing(false);
    setEditTaskId(null);
    setIsFormOpen(false); // Close the form after submission
  };

  const toggleDetails = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const openCommentsModal = async (t) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Authentication Error: Please log in again.");
      return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      await axios.get(API_ROUTES.ADMIN.VIEW_COMMENTS(t.taskId,user.userId), { headers });
      setUnreadMap((prev) => ({ ...prev, [t.taskId]: false }));
      setSelectedTask(t);
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };


  const getDeadlineColor = (deadline) => {
    const today = new Date();
    const taskDate = new Date(deadline);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) {
      return '#ff4d4f';
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return '#ffa940';
    } else if (taskDate > tomorrow) {
      return '#52c41a';
    } else {
      return '#d9d9d9';
    }
  };


  //  Filter Logic
  //  Filter Logic
  const filteredTasks = tasks.filter(task => {
    // Add a check for task.taskname being null or undefined
    const taskNameLower = task.taskname ? task.taskname.toLowerCase() : '';
    const searchTextLower = searchText.toLowerCase();

    const matchesName = taskNameLower.includes(searchTextLower);
    const matchesStatus = filterStatus ? task.status === filterStatus : true;
    const matchesStartDate = startDate ? new Date(task.deadline) >= new Date(startDate) : true;
    const matchesEndDate = endDate ? new Date(task.deadline) <= new Date(endDate) : true;

    if (searchTerm &&
      !(task.taskname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.priority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.status?.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }


    return matchesName && matchesStatus && matchesStartDate && matchesEndDate;
  });

  // Group tasks for Kanban view
  const tasksByStatus = filteredTasks.reduce((acc, t) => {
    const status = t.status || 'No Status';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(t);
    return acc;
  }, {});


  // --- Calendar Logic ---
  const getPriorityDotColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const tasksByDate = filteredTasks.reduce((acc, t) => {
    const date = new Date(t.deadline).toLocaleDateString('en-CA');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(t);
    return acc;
  }, {});

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
      if (currentMonth === 0) setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));
      if (currentMonth === 11) setCurrentYear(prev => prev + 1);
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const actualFirstDayOffset = firstDay;

    const blanks = Array.from({ length: actualFirstDayOffset }, (_, i) => (
      <div key={`blank-${i}`} className="min-h-[100px]"></div> // Tailwind for min-height
    ));

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateObj = new Date(currentYear, currentMonth, day);
      const dateStr = dateObj.toLocaleDateString('en-CA');
      const dayTasks = tasksByDate[dateStr] || [];
      const isToday = new Date().toLocaleDateString('en-CA') === dateStr;

      return (
        <div
          key={`day-${day}`}
          className="min-h-[100px] p-2 text-sm relative border border-gray-200 dark:border-gray-700 flex flex-col items-start overflow-hidden bg-white dark:bg-gray-800"
        >
          <span className={`font-bold relative z-10 ${isToday ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center float-right text-xs' : 'text-gray-700 dark:text-gray-50'}`}>
            {day}
          </span>
          <div className="mt-1 w-full max-h-[calc(100%-30px)] overflow-y-auto">
            {dayTasks.map(t => (
              <div
                key={t.taskId}
                className="flex items-center rounded-sm px-1 py-1 mb-1 cursor-pointer text-xs whitespace-nowrap overflow-hidden text-ellipsis w-[calc(100%-2px)]"
                style={{
                  backgroundColor: getPriorityDotColor(t.priority) === 'red' ? '#ffe8e6' : getPriorityDotColor(t.priority) === 'orange' ? '#fff1e6' : '#e6ffe6',
                  color: getPriorityDotColor(t.priority) === 'red' ? '#cf1322' : getPriorityDotColor(t.priority) === 'orange' ? '#d46b08' : '#237804',
                }}
                onClick={() => setSelectedTask(t)}
              >
                <span
                  className="w-2 h-2 rounded-full mr-1 flex-shrink-0"
                  style={{ backgroundColor: getPriorityDotColor(t.priority) }}
                  title={t.priority}
                ></span>
                {t.taskname}
              </div>
            ))}
          </div>
        </div>
      );
    });

    return [...blanks, ...days];
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* --- 1. HEADER SECTION --- */}
      {/* This flex container correctly aligns the title on the left and the button on the right */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-1.5" />
            Back to Employee List
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Tasks for <span className="text-indigo-600">{id}</span>
          </h1>
        </div>
        <button
          onClick={() => { resetForm(); setIsEditing(false); setIsFormOpen(true); }}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Assign New Task
        </button>
      </div>

      {/* --- 2. THE MODAL FORM (No changes needed here, it's correct) --- */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Task' : 'Assign New Task'}</h2>
              <button onClick={resetForm} className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={isEditing ? handleUpdate : handleAssign}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Task Name</label>
                <div className="relative"><Type className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Complete the quarterly report" /></div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <div className="relative"><AlignLeft className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3" placeholder="Add more details about the task..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Deadline</label>
                  <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full py-2.5 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="md:col-span-2"> {/* Make it span full width if desired */}
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full py-2.5 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end">
                <button type="submit" className="px-6 py-2.5 font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{isEditing ? 'Save Changes' : 'Assign Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap justify-center items-center gap-4 p-4 mb-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        {/* Search Input */}
        <div className="relative flex-grow min-w-[200px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon name="Search" size={16} className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search Task..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {/* Status Select */}
        <div className="relative flex-grow min-w-[180px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon name="ListChecks" size={16} className="text-gray-400" />
          </span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {/* Start Date Input */}
        <div className="flex-grow min-w-[180px]">
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">From</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon name="Calendar" size={16} className="text-gray-400" />
            </span>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* End Date Input */}
        <div className="flex-grow min-w-[180px]">
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">To</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon name="Calendar" size={16} className="text-gray-400" />
            </span>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-5 gap-4">
        {/* View Toggle Buttons */}
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm">
          <button
            className={`px-4 py-2 text-sm cursor-pointer transition-all duration-200 border-r border-gray-300 dark:border-gray-700
                      ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setViewMode('list')}
          >
            <Icon name="List" size={16} className="inline-block mr-1" /> List View
          </button>
          <button
            className={`px-4 py-2 text-sm cursor-pointer transition-all duration-200 border-r border-gray-300 dark:border-gray-700
                      ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setViewMode('kanban')}
          >
            <Icon name="LayoutDashboard" size={16} className="inline-block mr-1" /> Kanban Board
          </button>
          <button
            className={`px-4 py-2 text-sm cursor-pointer transition-all duration-200
                      ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setViewMode('calendar')}
          >
            <Icon name="Calendar" size={16} className="inline-block mr-1" /> Calendar View
          </button>
        </div>

        {/* Task Statistics and Search */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Total: {totalTasks}</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1"></span> In Progress: {inProgressTasks}</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> Completed: {completedTasks}</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> Overdue: {overdueTasks}</span>
          </div>
          {/* <Button
            onClick={() => setIsDark(!isDark)}
            variant="ghost"
            size="sm"
            className="ml-2 text-gray-700 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Icon name={isDark ? "Sun" : "Moon"} size={20} />
          </Button> */}
          {/* <Button onClick={handleLogout} variant="destructive" size="sm" className="ml-2">
            <Icon name="LogOut" size={16} className="mr-1" /> Logout
          </Button> */}
        </div>
      </div>

      {/* Task List */}


      {/* Conditional Rendering based on viewMode */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.taskId}
                task={task}
                openCommentsModal={openCommentsModal}
                onStatusChange={handleStatusChange}
                onEdit={editTask}
                onDelete={askForDeleteConfirmation}
                unreadComments={unreadMap[task.taskId]}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">No tasks found.</p>
          )}
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {statusColumns.map((column) => (
            (tasksByStatus[column.title] || ['To Do', 'In Progress', 'In Review'].includes(column.title)) && (
              <div key={column.title} className={`${column.color} rounded-lg p-4 flex flex-col shadow-sm`}>
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-50 text-center">
                  {column.title} ({tasksByStatus[column.title]?.length || 0})
                </h4>
                <div className="flex-grow flex flex-col gap-4 min-h-[200px]">
                  {tasksByStatus[column.title]?.map(t => (
                    <TaskCard
                      key={t.taskId}
                      task={t}
                      openCommentsModal={openCommentsModal}
                      unreadComments={unreadMap[t.taskId]}
                      onStatusChange={handleStatusChange}
                      onEdit={editTask}
                      onDelete={askForDeleteConfirmation}
                    />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
          <div className="flex justify-between items-center mb-5">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg transition-colors duration-200"
              onClick={() => handleMonthChange('prev')}
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-50">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg transition-colors duration-200"
              onClick={() => handleMonthChange('next')}
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            {weekDays.map(day => (
              <div key={day} className="bg-gray-100 dark:bg-gray-700 p-2 text-center font-bold text-sm text-gray-600 dark:text-gray-300">
                {day.substring(0, 3)}
              </div>
            ))}
            {renderCalendarDays()}
          </div>
        </div>
      )}


      {/* ... existing JSX ... */}

      {selectedTask && (
        <TaskComments
          task={selectedTask}
          userId={user.userId}
          onClose={() => setSelectedTask(null)}
          onCommentAdded={() => {
            // Optionally refresh comments or update unread status
          }}
        />
      )}
      <DeleteConfirmationModal />
    </div> // Closing div for the main component
  );
}


export default AssignTask;


/*
useState: Manages component-level state for form fields, task list, filtering, editing, and modal display.

useEffect: Executes side-effect to fetch tasks from backend when component mounts or id changes.

useParams: Retrieves id from the route URL. Used to fetch tasks for a specific employee.

useNavigate: Programmatic navigation (here used for "back" button).

axios: Used for HTTP requests (GET, POST, PUT, DELETE) to Spring Boot backend.

Form Handling: Form is shown conditionally using showForm, handles both task creation and update depending on isEditing.

Editing Logic: editTask() loads selected task into form, handleUpdate() updates it via PUT request.

Filtering Logic: Allows searching by name, filtering by status, and deadline range using controlled inputs and .filter() on tasks.

Conditional Rendering: Uses && to display task details, form, or modal only when conditions are met.

Modal Display: Shows TaskComments inside a styled overlay box for selected task.

Component Reusability: Modular structure like TaskComments improves maintainability and separation of concerns.

LocalStorage: Used to retrieve userId for identifying the logged-in user.

*/