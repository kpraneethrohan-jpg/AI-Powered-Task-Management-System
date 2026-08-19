import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TaskComments from './TaskComments';
import { useNavigate } from 'react-router-dom';
import TaskCard from './TaskCard';
import Icon from './components/AppIcon';
import Button from './components/Button';
import { useAuth } from './context/AuthContext';
import AIWorkspace from './AIWorkspace';  
import { MessageSquare, Bell, X, Mail, CheckCircle } from 'react-feather'; 
import { useNotifications } from './notifications/NotificationProvider'; 
import KanbanMiniCard from './KanbanMiniCard';

import { API_ROUTES } from './api/apiRoutes';

// Helper functions (keep these)
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const calculateDaysOverdue = (deadline) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(deadline);
  taskDate.setHours(0, 0, 0, 0);

  if (taskDate < today) {
    const diffTime = Math.abs(today.getTime() - taskDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
};

// --- Notification Item Component (for use inside the modal) ---
const NotificationItem = ({ notification, onMarkAsRead }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp));
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

   return (
    <li 
      onClick={handleClick} 
      className={`p-4 flex items-start space-x-4 transition-colors ${!notification.isRead ? 'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 cursor-pointer' : 'bg-white dark:bg-gray-800'}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <span className={`h-8 w-8 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-indigo-500' : 'bg-gray-400'}`}>
          <Mail className="h-4 w-4 text-white" />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTime(notification.timestamp)}</p>
      </div>
      {!notification.isRead && (
        <div className="flex-shrink-0 mt-1">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" aria-hidden="true" title="Unread"></span>
        </div>
      )}
    </li>
  );
};

function EmployeeTodo() {
   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
   const { 
    notifications, 
    unreadCount, 
    markOneAsRead, 
    markAllAsRead 
  } = useNotifications();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [task, setTask] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [unreadMap, setUnreadMap] = useState({});
  //const userId = localStorage.getItem('userId');
  const {user} = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false); 

  // State for filters and search (assuming these are defined elsewhere or will be added)
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', 'calendar'
  const [sortOrder, setSortOrder] = useState('status');

  // State for Calendar 
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [selectedKanbanTask, setSelectedKanbanTask] = useState(null);
  const [viewingTaskDetails, setViewingTaskDetails] = useState(null);

console.log('--- EmployeeTodo is rendering. User from context is:', user);

useEffect(() => {
  console.log('!!! EmployeeTodo useEffect is running. User is:', user);
    
    if (!user || !user.userId) {
      console.log('useEffect is stopping because user is not available.'); // <-- ADD THIS LOG
      setTask([]); 
      return;
    }
    
    console.log('useEffect is proceeding to fetch data for user:', user.userId); // <-- ADD THIS LOG

    const userId = user.userId;
    const token = localStorage.getItem('token'); 

    if (userId && token) {
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      axios.get(API_ROUTES.EMPLOYEE.GET_TASKS(userId), { headers })
        .then((response) => setTask(response.data))
        .catch((error) => console.log(error));

      axios.get(API_ROUTES.UNREAD_COMMENTS, { headers })
        .then((res) => setUnreadMap(res.data))
        .catch((err) => console.log("Error loading unread map", err));
    }
}, [user]);

  const handleStatusChange = async (taskId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Authentication Error: Please log in again.");
        return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      await axios.put(API_ROUTES.EMPLOYEE.UPDATE_STATUS, {
        taskId: taskId,
        status: newStatus
      }, {headers});
      setTask(prev =>
        prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t)
      );
      // alert("Status updated!"); 
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const openCommentsModal = async (t) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Authentication Error: Please log in again.");
        return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const userId = user.userId;
      await axios.get(API_ROUTES.EMPLOYEE.VIEW_COMMENTS(t.taskId,userId),{headers});
      setUnreadMap((prev) => ({ ...prev, [t.taskId]: false }));
      setSelectedTask(t);
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleLogout = () => {
    navigate('/UserLogin');
  };

  const handleSendMessageToGemini = async (prompt,history) => {
        const payload = {
        newPrompt: prompt,
        history: history 
    };
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Authentication Error: Please log in again.");
        return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    const res = await axios.post(API_ROUTES.EMPLOYEE.GEMINI_QUERY, payload,{headers});
    return res.data;
  };

   const handleToggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  // --- Filtering Logic ---
  const filteredTasks = task.filter(t => {
    if (filterStatus !== 'All' && t.status !== filterStatus) {
      return false;
    }
    if (filterAssignee !== 'All' && t.assignedTo !== filterAssignee) {
      return false;
    }
    if (filterPriority !== 'All' && t.priority?.toLowerCase() !== filterPriority.toLowerCase()) {
            return false;
    }
    if (searchTerm &&
        !(t.taskname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.priority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.status?.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const sortedAndFilteredTasks = [...filteredTasks].sort((a, b) => {
    switch (sortOrder) {
      case 'deadline-asc':
        return new Date(a.deadline) - new Date(b.deadline);
      case 'deadline-desc':
        return new Date(b.deadline) - new Date(a.deadline);
      case 'priority':
        // Custom sort for priority: High > Medium > Low
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority?.toLowerCase()] || 4) - (priorityOrder[b.priority?.toLowerCase()] || 4);
      case 'status':
      default:
        // Default sort by status: To Do > In Progress > Done
        const statusOrder = { "To Do": 1, "In Progress": 2, "Done": 3 };
        return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
    }
  });



  // Calculate task counts
  const totalTasks = task.length;
  const inProgressTasks = task.filter(t => t.status === 'In Progress').length;
  const completedTasks = task.filter(t => t.status === 'Done').length;
  const overdueTasks = task.filter(t => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDate = new Date(t.deadline);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate < today && t.status !== 'Done';
  }).length;

  const uniqueAssignees = [...new Set(task.map(t => t.assignedTo))].filter(Boolean);

  // Group tasks for Kanban view
  const tasksByStatus = filteredTasks.reduce((acc, t) => {
    const status = t.status || 'No Status';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(t);
    return acc;
  }, {});

const statusColumns = [
    { title: 'To Do', color: 'bg-blue-100 dark:bg-blue-900/40' },
    { title: 'In Progress', color: 'bg-amber-100 dark:bg-amber-900/40' }, // Yellow
    { title: 'In Review', color: 'bg-purple-100 dark:bg-purple-900/40' }, // Violet
    { title: 'Done', color: 'bg-emerald-100 dark:bg-emerald-900/40' }    // Green
];

  const getPriorityColorKanban = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#ffa940';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

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
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-50 transition-colors duration-300">
      <h1 className="text-4xl font-bold text-center mb-2 text-gray-900 dark:text-gray-50">Task Management</h1>
       <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-gray-300 mb-6">
        Welcome, {user?.username} 
      </h2>
      <p className="text-lg text-center mb-8 text-gray-600 dark:text-gray-300">Manage and track tasks across your organization with intelligent workflow orchestration</p>

           <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-50"
      >
        <MessageSquare size={28} />
      </button>
      


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
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-50 text-sm w-48 transition-all duration-300 focus:ring-blue-500 focus:border-blue-500"
          />
           {/* THIS BUTTON WAS ADDED */}
          <Button
            onClick={() => setIsNotificationsOpen(true)}
            variant="ghost"
            size="sm"
            className="ml-2 text-gray-700 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
          >
            <Icon name="Bell" size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button
            onClick={() => setIsDark(!isDark)}
            variant="ghost"
            size="sm"
            className="ml-2 text-gray-700 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Icon name={isDark ? "Sun" : "Moon"} size={20} />
          </Button>
          <Button onClick={handleLogout} variant="destructive" size="sm" className="ml-2">
            <Icon name="LogOut" size={16} className="mr-1" /> Logout
          </Button>
        </div>
      </div>


      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 border-y border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-right-0" // Add bg-right-0 if needed for custom arrow
          >
            <option value="All">All</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="priorityFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</label>
          <select
            id="priorityFilter"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-right-0"
          >
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="assigneeFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Assignee:</label>
          <select
            id="assigneeFilter"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-right-0"
          >
            <option value="All">All</option>
            {uniqueAssignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
        </div>
        {/*SORT BY*/}
        <div className="flex items-center gap-2">
            <label htmlFor="statusSort" className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
            <select
                id="statusSort"
                value={sortOrder} // Bind to the new state
                onChange={(e) => setSortOrder(e.target.value)} // Update the state on change
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 ... "
            >
                <option value="status">Status</option>
                <option value="priority">Priority</option>
                <option value="deadline-asc">Due Date (Asc)</option>
                <option value="deadline-desc">Due Date (Desc)</option>
            </select>
        </div>
      </div>

      {/* Conditional Rendering based on viewMode */}
      {viewMode === 'list' && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.isArray(filteredTasks) && sortedAndFilteredTasks.length > 0 ? (
        sortedAndFilteredTasks.map((t) => (
            <TaskCard
              key={t.taskId}
              task={t}
              onStatusChange={handleStatusChange}
              showStatusChanger={true}
              openCommentsModal={openCommentsModal}
              unreadComments={unreadMap[t.taskId]}
            />
        ))
      ) : (
        <p className="text-center text-gray-500 col-span-full">No tasks found matching your filters.</p>
      )}
    </div>
  )}
{viewMode === 'kanban' && (
  <div className="flex overflow-x-auto pb-6 gap-6 scrollbar-hide">
    {statusColumns.map((column) => (
      /* --- THIS IS THE DIV YOU ARE UPDATING --- */
      <div 
        key={column.title} 
        className={`flex-shrink-0 w-80 ${column.color} rounded-xl flex flex-col max-h-[75vh] snap-center border border-gray-200/50 dark:border-gray-700/50 shadow-sm`}
      >
        {/* Column Header */}
        <div className="p-4 flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {column.title}
          </h4>
          <span className="bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {tasksByStatus[column.title]?.length || 0}
          </span>
        </div>

        {/* Task List in Column */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
          {tasksByStatus[column.title]?.map(t => (
            <KanbanMiniCard
              key={t.taskId}
              task={t}
              onClick={() => setViewingTaskDetails(t)} 
            />
          ))}
          
          {(!tasksByStatus[column.title] || tasksByStatus[column.title].length === 0) && (
            <div className="border-2 border-dashed border-gray-300/50 dark:border-gray-600/30 rounded-lg h-24 flex items-center justify-center text-gray-400 text-[10px] uppercase font-bold">
              Empty
            </div>
          )}
        </div>
      </div>
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

      {selectedKanbanTask && (
  <TaskCard
    task={selectedKanbanTask}
    onStatusChange={handleStatusChange}
    showStatusChanger={true}
    openCommentsModal={openCommentsModal}
    unreadComments={unreadMap[selectedKanbanTask.taskId]}
    isModal={true}
    onClose={() => setSelectedKanbanTask(null)}
  />
)}

       {isNotificationsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-50">Notifications</h2>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                   <button 
                    onClick={markAllAsRead} 
                    className="flex items-center px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors"
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Mark All as Read
                  </button>
                )}
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-grow overflow-y-auto">
              {notifications.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map(notification => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification}
                      onMarkAsRead={markOneAsRead}
                    />
                  ))}
                </ul>
              ) : (
                <div className="text-center py-20">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-50">
                    No notifications yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    We'll notify you here about important updates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
          <AIWorkspace 
  isOpen={isChatOpen}
  onClose={() => setIsChatOpen(false)}
/>

{/* MASTER TASK DETAIL MODAL */}
{viewingTaskDetails && (
  <div 
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
    onClick={() => setViewingTaskDetails(null)}
  >
    <div 
      className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-xl shadow-2xl"
      onClick={(e) => e.stopPropagation()} 
    >
      {/* 1. Dedicated Header Bar (Fixed the overlap) */}
      <div className="bg-white dark:bg-gray-800 px-4 py-2 flex justify-between items-center border-b dark:border-gray-700">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Task Details
        </span>
        <button 
          onClick={() => setViewingTaskDetails(null)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* 2. Scrollable Body containing the TaskCard */}
      <div className="overflow-y-auto bg-white dark:bg-gray-900">
        <TaskCard
          task={viewingTaskDetails}
          onStatusChange={handleStatusChange}
          showStatusChanger={true}
          openCommentsModal={(t) => {
             setViewingTaskDetails(null);
             openCommentsModal(t);
          }}
          unreadComments={unreadMap[viewingTaskDetails.taskId]}
        />
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default EmployeeTodo;

