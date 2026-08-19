// src/pages/TaskDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskCard from './components/TaskCard';
import useConfirmationModal from './components/useConfirmationModal';
import { useAuth } from './context/AuthContext'; // <--- IMPORT useAuth

const TaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth(); // <--- GET THE LOGGED-IN USER

  // FETCH TASKS: Corrected to use your specific endpoint
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Authentication Error: Please log in again.");
        return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    // Make sure user and user.userId are available before fetching
    if (user?.userId) {
      // API CALL CORRECTION 1: Using your GET endpoint
      axios.get(`http://localhost:8080/assigntask/gettask/${user.userId}`, {headers})
        .then(response => {
          setTasks(response.data);
        })
        .catch(error => console.error("Error fetching tasks:", error));
    }
  }, [user]); // Re-run if the user object changes

  const deleteTaskAction = (taskId) => {
     const token = localStorage.getItem('token');
    if (!token) {
        alert("Authentication Error: Please log in again.");
        return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    return axios.delete(`http://localhost:8080/assigntask/deleteTask/${taskId}`, {headers})
      .then(() => {
        setTasks(currentTasks => currentTasks.filter(task => task.taskId !== taskId));
      })
      .catch(error => {
        console.error("Failed to delete task:", error);
        throw error;
      });
  };
  

  const handleStatusChange = (taskId, newStatus) => {
     const token = localStorage.getItem('token');
    if (!token) {
        alert("Authentication Error: Please log in again.");
        return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    axios.put(`http://localhost:8080/assigntask/updateStatus`, { taskId, status: newStatus }, {headers})
        .then(() => {
            // Update the status in the local state for an immediate UI response
            setTasks(currentTasks => currentTasks.map(task => 
                task.taskId === taskId ? { ...task, status: newStatus } : task
            ));
        })
        .catch(error => {
            console.error("Failed to update status:", error);
            // Optionally, revert the change or show an error to the user
        });
  };


  const [askForDeleteConfirmation, DeleteConfirmationModal] = useConfirmationModal({
    onConfirm: deleteTaskAction,
    title: "Delete Task",
    message: "Are you sure you want to delete this task? This cannot be undone.",
    confirmText: "Delete",
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Task Dashboard</h1>
  

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <TaskCard
            key={task.taskId}
            task={task}
            // Pass the functions down to the child component
            onDelete={askForDeleteConfirmation}
            onStatusChange={handleStatusChange} // <-- Pass the new handler
            showStatusChanger={true} // <-- Make sure the dropdown is visible
            // ... other props
          />
        ))}
      </div>
          <DeleteConfirmationModal />
    </div>
  );
};

export default TaskDashboard;