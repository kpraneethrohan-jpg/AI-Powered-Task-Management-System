import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from './components/AppIcon'; // Assuming you have an Icon component

function TaskComments({ task, userId, onClose }) { // Corrected props
  const [comments, setComments] = useState([]);
  const [sendComment, setSendComment] = useState('');
  const taskId = task?.taskId; // Safely get taskId from the task object

  useEffect(() => {
    if (taskId && userId) {
      fetchComments();
    }
  }, [taskId, userId]);

  const fetchComments = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Authentication Error: Please log in again.");
        return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    axios.get(`http://localhost:8080/comments/view/${taskId}/${userId}`, {headers})
      .then((response) => {
         console.log("Fetched comments:", response.data);
        setComments(response.data);
      })
      .catch((error) => {
        console.log("Fetching comments error:", error);
      });
  };

  const handleComment = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Authentication Error: Please log in again.");
        return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    // Prevent sending empty comments
    if (!sendComment.trim()) return;

    const newComment = {
      taskId,
      userId, // *** Add this line ***
      content: sendComment,
      timestamp: new Date().toISOString()
    };

    axios.post(`http://localhost:8080/comments/add`, newComment, {headers})
      .then(() => {
        setSendComment("");
        fetchComments(); // Refresh comments after sending
      })
      .catch((error) => {
        console.log("Error sending comment:", error);
      });
  };

  const formatTimestamp = (timestamp) => {
    // Ensure timestamp is treated as UTC before converting
    const utcTimestamp = timestamp.endsWith('Z') ? timestamp : timestamp + 'Z';
    const date = new Date(utcTimestamp);
    return date.toLocaleString(undefined, {
      hour12: true,
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <>
      {/* Backdrop for the modal */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999, // Lower z-index than the modal itself
        }}
        onClick={onClose} // This will close the modal when clicking outside
      />

      {/* Main Modal Container */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000, // Ensure it's above the backdrop
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          width: '400px',
          maxWidth: '90%',
          display: 'flex',
          flexDirection: 'column',
          height: '500px',
          padding: '20px',
        }}
        className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50"
        onClick={(e) => e.stopPropagation()} // **FIX:** Prevents clicks inside the modal from closing it
      >
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-semibold">Comments for Task {taskId}</h4>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close comments"
          >
            <Icon name="X" size={20} /> {/* Close cross icon */}
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '10px',
            marginBottom: '15px',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px',
          }}
          className="dark:border-gray-700"
        >
          {comments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
          ) : (
            comments.map((c, index) => {
              const isOwn = String(c.userId) === String(userId); // Ensure strict comparison
              return (
                <div
                  key={index}
                  className={`mb-3 p-3 rounded-lg max-w-[85%] ${isOwn ? 'ml-auto bg-blue-100 dark:bg-blue-900 text-right' : 'mr-auto bg-gray-100 dark:bg-gray-700 text-left'}`}
                >
                  <div className={`font-bold text-sm ${isOwn ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {c.userId} • {formatTimestamp(c.timestamp)}
                  </div>
                  <div className="text-base mt-1 break-words">{c.content}</div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={sendComment}
            onChange={(e) => setSendComment(e.target.value)}
            placeholder="Type your comment..."
            className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleComment();
              }
            }}
          />
          <button
            onClick={handleComment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!sendComment.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}

export default TaskComments;