import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// Import your powerful, reusable components
import TaskCard from '../TaskCard';
import NewTaskModal from './NewTaskModal'; 
import TaskComments from '../TaskComments'; 
import useConfirmationModal from '../components/useConfirmationModal';

// Import icons
import { ArrowLeft, Plus, Search, List, Layout, Calendar as CalendarIcon, Filter } from 'react-feather';
import Icon from '../components/AppIcon';
import { API_ROUTES } from '../api/apiRoutes';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

function ProjectTaskAssignment() {
  const { user } = useAuth();
  const { projectId, userId } = useParams();
  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem('userId'); // For comments

  // === State Management (Adapted from AssignTask.js) ===
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', 'calendar'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // To pass data to the modal for editing
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);
  const [unreadMap, setUnreadMap] = useState({});

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [selectedTask, setSelectedTask] = useState(null);

  //filter
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

  // === Data Fetching ===
 const fetchData = () => {

    if (!user || !user.userId) return;
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Authentication Error: No token found.");
        setIsLoading(false);
        return;
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    setIsLoading(true);
    const projectRequest = axios.get(API_ROUTES.PROJECTS.GET_ONE(projectId), { headers });
    const tasksRequest = axios.get(API_ROUTES.PROJECTS.GET_ALL_TASKS_OF_A_USER_IN_A_PROJECT(projectId,userId), { headers });
    const unreadMapRequest = axios.get(API_ROUTES.UNREAD_COMMENTS, { headers });

    Promise.all([projectRequest, tasksRequest, unreadMapRequest])
      .then(([projectResponse, tasksResponse, unreadResponse]) => {
        setProject(projectResponse.data);
        setTasks(tasksResponse.data);
        setUnreadMap(unreadResponse.data);
      })
      .catch(error => console.error("Error fetching data:", error))
      .finally(() => setIsLoading(false));
  };


  useEffect(() => {
    fetchData();
  }, [projectId, userId, user]);

  // === Event Handlers ===
  const handleStatusChange = (taskId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    axios.put(API_ROUTES.PROJECTS.UPDATE_STATUS, { taskId, status: newStatus }, {headers})
      .then(() => {
        setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));
      })
      .catch(error => console.error("Failed to update status", error));
  };

  const handleEdit = (taskToEdit) => {
    setEditingTask(taskToEdit); // Set the task data to pre-fill the modal
    setIsModalOpen(true); // Open the modal
  };

  const handleDelete = (taskId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
      axios.delete(API_ROUTES.PROJECTS.DELETE_TASK(taskId),{headers})
        .then(() => {
          fetchData(); 
        })
        .catch((error) => console.error("Error deleting the task:", error));
  };

  const [askForDeleteConfirmation, DeleteConfirmationModal] = useConfirmationModal({
      onConfirm: handleDelete,
      title: "Delete Task",
      message: "Are you sure you want to delete this task? This cannot be undone.",
      confirmText: "Delete",
    });
  
  const openCommentsModal = (task) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
      axios.get(API_ROUTES.PROJECTS.VIEW_COMMENTS(task.taskId,user.userId), {headers})
          .then(() => setUnreadMap(prev => ({...prev, [task.taskId]: false })))
          .catch(err => console.error("Failed to mark as read", err));
      setSelectedTaskForComments(task);
  };
  
  // === Derived State for Views ===
  const filteredTasks = tasks.filter(task => 
    task.taskname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tasksByStatus = filteredTasks.reduce((acc, t) => {
    const status = t.status || 'No Status';
    if (!acc[status]) acc[status] = [];
    acc[status].push(t);
    return acc;
  }, {});
  const statusColumns = ['To Do', 'In Progress', 'Done'];
  
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
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 mb-2">
            <ArrowLeft size={16} className="mr-1.5" />
            Back to Project Team
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Tasks for <span className="text-indigo-600">{userId}</span></h1>
          <p className="text-lg text-gray-500 mt-1">In Project: {project?.name}</p>
        </div>
        <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="mt-4 md:mt-0 flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <Plus size={18} className="mr-2" />
          Assign New Task
        </button>
      </div>

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



      {/* --- MAIN CONTENT AREA --- */}
      {isLoading ? <p>Loading...</p> : (
        <>
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map(task => <TaskCard key={task.taskId} task={task} onStatusChange={handleStatusChange} onDelete={askForDeleteConfirmation} onEdit={handleEdit} openCommentsModal={() => openCommentsModal(task)} unreadComments={unreadMap[task.taskId]} />)}
            </div>
          )}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statusColumns.map(status => (
                <div key={status} className="bg-gray-100 rounded-lg p-4">
                  <h4 className="font-bold text-center mb-4">{status} ({tasksByStatus[status]?.length || 0})</h4>
                  <div className="space-y-4">
                    {tasksByStatus[status]?.map(task => <TaskCard key={task.taskId} task={task} onStatusChange={handleStatusChange} onDelete={askForDeleteConfirmation} onEdit={handleEdit} openCommentsModal={() => openCommentsModal(task)} unreadComments={unreadMap[task.taskId]} />)}
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

        </>
      )}

      {/* --- MODALS --- */}
       {isModalOpen && (
    <NewTaskModal
      projectId={projectId}
      userId={userId}
      initialData={editingTask}
      onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
      onTaskSaved={fetchData}
    />
  )}
       {selectedTaskForComments && (
        <TaskComments
          task={selectedTaskForComments}
          userId={loggedInUserId}
          onClose={() => setSelectedTaskForComments(null)}
        />
      )}
      <DeleteConfirmationModal/>
    </div>
  );
}

export default ProjectTaskAssignment;