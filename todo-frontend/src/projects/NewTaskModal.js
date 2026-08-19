// src/components/NewTaskModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Type, AlignLeft, Calendar } from 'react-feather';
import { API_ROUTES } from '../api/apiRoutes';

// 'initialData' will be the task object if we are editing, or null if creating
const NewTaskModal = ({ projectId, userId, initialData, onClose, onTaskSaved }) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  
  const isEditing = Boolean(initialData); // True if initialData is not null

  // This useEffect pre-fills the form when in edit mode
  useEffect(() => {
    if (isEditing) {
      setTaskName(initialData.taskname);
      setDescription(initialData.description);
      setPriority(initialData.priority || 'medium');
      // Format the date correctly for the <input type="date">
      setDeadline(initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '');
    }
  }, [initialData, isEditing]);

  const handleSubmit = (e) => {
    const token = localStorage.getItem('token');
    if(!token){
        alert("Authentication Error: Please log in again.");
        setIsLoading(false);
        return;
    }
    const headers= {'Authorization': `Bearer ${token}`};
    e.preventDefault();
    setIsLoading(true);

    const taskData = {
      taskname: taskName,
      description,
      deadline,
      priority,
      assigneeId: userId,
    };  


    // Choose the correct API endpoint and method (POST for create, PUT for update)
    const request = isEditing
      ? axios.put(API_ROUTES.PROJECTS.UPDATE_TASK, { ...taskData, taskId: initialData.taskId }, {headers})
      : axios.post(API_ROUTES.PROJECTS.ASSIGN_TASK(projectId), taskData, {headers});
    request
      .then(() => {
        onTaskSaved(); // Tell the parent page to refresh its data
        onClose();
      })
      .catch(error => {
        console.error(`Error ${isEditing ? 'updating' : 'creating'} task:`, error);
        alert(`Failed to ${isEditing ? 'update' : 'create'} task.`);
      })
      .finally(() => setIsLoading(false));
  };

  // ... (The JSX remains the same, but the h2 and button text will be dynamic)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Task' : 'Assign New Task'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
           {/* ... (All form fields are the same as the previous response) ... */}
            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Task Name</label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Design the new homepage mockup" required />
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
             <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add more details about the task requirements..." rows="3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Deadline</label>
              <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
            </div>
            {/* Priority */}
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                 <select value={priority} onChange={e => setPriority(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                 </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isLoading}
              className="px-6 py-2.5 font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
              {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Assign Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;