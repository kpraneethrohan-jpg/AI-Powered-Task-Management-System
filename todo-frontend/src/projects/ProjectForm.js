import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { API_ROUTES } from '../api/apiRoutes';

function ProjectForm() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState(''); 
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token){
        alert("Authentication Error: Please log in again.");
        return;
    }
    const headers = {'Authorization': `Bearer ${token}`};
    axios.get(API_ROUTES.PROJECTS.GET_ALL_USERS, {headers})
      .then(response => {
        const formattedUsers = response.data.map(user => ({
          value: user.id,
          label: `${user.username} (${user.role})`
        }));
        setUserOptions(formattedUsers);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
        setError('Could not load team members. Please refresh and try again.');
      });
  }, []);


  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    if(!token){
        alert("Authentication Error: Please log in again.");
        setIsLoading(false);
        return;
    }
    const headers= {'Authorization': `Bearer ${token}`};
    if (!projectName.trim() || selectedUsers.length === 0) {
      setError("Enter a project name and select at least one team member.");
      return;
    }
    setIsLoading(true);

    const selectedUserIds = selectedUsers.map(user => user.value);

    const newProjectData = {
      name: projectName,
      description: description, // <-- 2. ADD DESCRIPTION TO THE PAYLOAD
      userIds: selectedUserIds,
    };

    axios.post(API_ROUTES.PROJECTS.GET_ALL, newProjectData, {headers})
      .then(() => navigate('/admin/projects'))
      .catch(error => {
        console.error("Error creating project:", error);
        setError(error.response?.data || "Failed to create project. Please try again.");
        setIsLoading(false);
      });
  };
  
  // ... (customSelectStyles remains the same)
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#4f46e5' : '#d1d5db', // Tailwind's indigo-500 and gray-300
      boxShadow: state.isFocused ? '0 0 0 1px #4f46e5' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#4f46e5' : '#9ca3af', // Tailwind's gray-400
      },
      borderRadius: '0.375rem', // rounded-md
      padding: '0.25rem',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e0e7ff', // indigo-100
      borderRadius: '0.375rem', // rounded-md
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#3730a3', // indigo-800
      fontWeight: 500,
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#4338ca', // indigo-700
      '&:hover': {
        backgroundColor: '#c7d2fe', // indigo-200
        color: '#312e81', // indigo-900
      },
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : 'white', // indigo-50,
        color: state.isSelected ? 'white' : '#1f2937',
    })
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New Project</h1>
      <form onSubmit={handleSubmit}>
        {/* Project Name Input */}
        <div className="mb-6">
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-4 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
            placeholder="e.g., Q4 Marketing Campaign"
          />
        </div>

        {/* --- 3. ADD TEXTAREA FOR DESCRIPTION --- */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Project Description
          </label>
          <textarea
            id="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Provide a brief summary of the project's goals, scope, and deliverables..."
          />
        </div>

        {/* User Selection with react-select */}
        <div className="mb-8">
          <label htmlFor="assignUsers" className="block text-sm font-medium text-gray-700 mb-2">
            Assign Team Members
          </label>
          <Select
            id="assignUsers"
            isMulti
            options={userOptions}
            value={selectedUsers}
            onChange={setSelectedUsers}
            styles={customSelectStyles}
            placeholder="Search and select users..."
            noOptionsMessage={() => "No users found"}
          />
        </div>

        {error && (
          <p role="alert" className="mb-6 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Project...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectForm;