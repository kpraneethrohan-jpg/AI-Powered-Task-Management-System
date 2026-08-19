import React, { useState } from 'react';
import axios from 'axios';
import Icon from './components/AppIcon';
import Button from './components/Button';
import { useAuth } from './context/AuthContext';
import FileList from './fileHandling/FileList';
import { Check, X } from 'react-feather'; // Icons for approve/reject
// You'll likely need an AppImage component or replace it with a simple <img> tag
// For simplicity, I'm just using a placeholder <img> tag.
const AppImage = ({ src, alt, className }) => (
  <img src={src || 'https://via.placeholder.com/24'} alt={alt || 'Assignee'} className={className} />
);

const TaskCard = ({
  task,
  openCommentsModal,
  openUploadModal,
  unreadComments = false,
  // --- Conditionally provided functions ---
  onStatusChange,
  showStatusChanger = false,
  onEdit,         // Provide this for Admins
  onDelete,      // Provide this for Admins
  onUploadSuccess,
  isDragging = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, isAdmin, isManager } = useAuth();
 

  // --- NEW STATE FOR INLINE FILE UPLOAD ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadSuccessCount, setUploadSuccessCount] = useState(0); // This will trigger FileList refresh

  // ACCESS RESTRICTION
  const canUpload = isAdmin || isManager;
  const canModify = isAdmin || (user?.userId === task.assignedById);
  const isTaskInReview = task.status?.toLowerCase() === 'in review';
  const isTaskDone = task.status?.toLowerCase() === 'done';
  const isCurrentUserTheAssigner = user?.userId === task.assignedById;


  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadMessage(''); // Clear previous messages
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Authentication Error: Please log in again.");
        return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    setIsUploading(true);
    setUploadMessage('Uploading...');
    const formData = new FormData();
    formData.append('file', selectedFile);

    axios.post(`http://localhost:8080/api/tasks/${task.taskId}/files`, formData, {headers})
      .then(response => {
        setUploadMessage('Upload successful!');
        setSelectedFile(null); // Clear the selected file
        document.getElementById(`file-input-${task.taskId}`).value = null; // Reset the file input visually
        setUploadSuccessCount(prev => prev + 1); // Trigger refresh in FileList
        setTimeout(() => setUploadMessage(''), 3000); // Clear message after 3 seconds
      })
      .catch(error => {
        setUploadMessage('Upload failed. Please try again.');
        console.error("Upload error:", error);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'done': return 'text-green-700 bg-green-100'; // Renamed 'completed' to 'done'
      case 'in progress': return 'text-blue-700 bg-blue-100'; // Renamed 'in-progress'
      case 'to do': return 'text-yellow-700 bg-yellow-100'; // Renamed 'pending'
      //case 'on-hold': return 'text-purple-700 bg-purple-100'; // Added 'on-hold'
      case 'in review': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString)?.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      console.error("Invalid date string:", dateString, e);
      return 'Invalid Date';
    }
  };

  const getDaysUntilDue = (dueDateString, status) => {
    if (status?.toLowerCase() === 'done') return null; // No days until due if completed
    if (!dueDateString) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateString);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(task?.deadline, task?.status);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${isDragging ? 'opacity-50 rotate-2' : ''}`}>
      {/* Task Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              {/* Project Name Pill */}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                <Icon name="Folder" size={12} className="mr-1.5" />
                {task.project ? task.project.name : 'N/A'}
              </span>
              {/* Priority Pill */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task?.priority)}`}>
                <Icon name="AlertCircle" size={12} className="mr-1" />
                {task?.priority?.charAt(0)?.toUpperCase() + task?.priority?.slice(1)}
              </span>
              {/* Status Pill */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task?.status)}`}>
                {task?.status?.replace('-', ' ')?.charAt(0)?.toUpperCase() + task?.status?.replace('-', ' ')?.slice(1)}
              </span>

              {/* Assigner Name Pill */}
              {task.assignedBy && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <Icon name="User" size={12} className="mr-1.5" />
                  From: {task.assignedBy}
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {task?.taskname}
            </h3>

            <p className="text-sm text-gray-600 line-clamp-2">
              {task?.description}
            </p>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
            </Button>
          </div>
        </div>
      </div>
      {/* Task Details */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={14} />
              <span>Due: {formatDate(task?.deadline)}</span>
              {task?.status?.toLowerCase() !== 'Done' && daysUntilDue !== null && daysUntilDue < 0 && (
                <span className="text-red-600 font-medium">({Math.abs(daysUntilDue)} days overdue)</span>
              )}
              {task?.status?.toLowerCase() !== 'Done' && daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3 && (
                <span className="text-yellow-600 font-medium">({daysUntilDue} days left)</span>
              )}
              {task?.status?.toLowerCase() !== 'Done' && daysUntilDue !== null && daysUntilDue > 3 && (
                <span className="text-green-600 font-medium">({daysUntilDue} days left)</span>
              )}
            </div>

            {/* If you have estimated hours in your task data, uncomment this */}
            {/* <div className="flex items-center space-x-1">
              <Icon name="Clock" size={14} />
              <span>{task?.estimatedHours}h estimated</span>
            </div> */}
          </div>

          <div className="flex items-center space-x-2">
            {task?.assignedTo && (
              <div className="flex items-center space-x-2">
                <AppImage
                  src={`https://ui-avatars.com/api/?name=${task?.assignedTo?.split(' ')?.join('+')}&background=random`} // Generate avatar from name
                  alt={task?.assignedTo}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-700">{task?.assignedTo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar - if you have progress data */}
        {/*
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{task?.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${task?.progress || 0}%` }}
            ></div>
          </div>
        </div>
        */}

        {/* Tags - if you have tags data */}
        {/*
        {task?.tags && task?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task?.tags?.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        */}

        {/* Expanded Details */}
        {isExpanded && (
          // THE FIX: This single div wraps ALL expanded content, isolating it from the parent grid.
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="space-y-4"> {/* Use space-y for consistent vertical spacing */}

              {/* --- ATTACHMENTS SECTION --- */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Attachments</h4>
                <FileList taskId={task.taskId} triggerRefresh={uploadSuccessCount} />

                {/* --- CONDITIONAL UPLOAD UI --- */}
                {canUpload && (
                  <div className="mt-4 pt-4 border-t border-gray-100 border-dashed">
                    {/* Use Flexbox for clean alignment of the input and button */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        id={`file-input-${task.taskId}`}
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-600 file:mr-3
                        file:py-1.5 file:px-3 file:rounded-lg file:border-0
                        file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100 cursor-pointer"
                      />
                      <Button
                        size="sm"
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className="flex-shrink-0" // Prevents the button from shrinking
                      >
                        <Icon name="Upload" size={14} className="mr-1.5" />
                        {isUploading ? '...' : 'Upload'}
                      </Button>
                    </div>
                    {uploadMessage && (
                      <p className="text-xs text-gray-500 mt-2">{uploadMessage}</p>
                    )}
                  </div>
                )}
              </div>

              {/* --- COMMENTS SECTION --- */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Icon name="MessageCircle" size={14} />
                <span>Comments ({task?.commentsCount || 0})</span>
                {unreadComments && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></span>}
              </div>

            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
          <div className="flex items-center space-x-2">
            {/* ===== CONDITIONAL STATUS CONTROL ===== */}
            {/* FOR EMPLOYEE: Show dropdown if onStatusChange is provided */}
            {showStatusChanger && !isTaskInReview && !isTaskDone && onStatusChange && (
            <select
              value={task?.status || 'To Do'}
              onChange={(e) => onStatusChange(task.taskId, e.target.value)}
              className="px-3 py-2 text-sm rounded-md border border-gray-300 ..."
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">Send for Review</option>
            </select>
          )}
          </div>

          {isCurrentUserTheAssigner && isTaskInReview && onStatusChange && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onStatusChange(task.taskId, 'Done')}
                className="flex items-center px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                <Check size={14} className="mr-1" />
                Approve
              </button>
              <button
                onClick={() => onStatusChange(task.taskId, 'In Progress')}
                className="flex items-center px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                <X size={14} className="mr-1" />
                Reject
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openCommentsModal(task)}
            >
              <Icon name="MessageSquare" size={14} className="mr-1" />
              Comments {unreadComments && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></span>}
            </Button>

            {/* ===== CONDITIONAL ADMIN BUTTONS ===== */}
            {/* Add Edit/Delete buttons if needed and pass those handlers */}
            {/* FOR ADMIN: Show Edit button if onEdit is provided */}
            {canModify && onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                <Icon name="Edit2" size={14} className="mr-1" />
                Edit
              </Button>
            )}
            {/* FOR ADMIN: Show Delete button if onDelete is provided */}
            {canModify && onDelete && (
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();     // Prevent other clicks
                onDelete(task.taskId); // Call the parent's function with ONLY the ID
              }} // <-- CORRECTED LINE
                className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Icon name="Trash2" size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
