// src/projects/EditProjectForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { API_ROUTES } from '../api/apiRoutes';
import { Aperture } from 'react-feather';

function EditProjectForm() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState(''); // <-- 1. ADD STATE
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Authentication Error: No token found.");
        setIsDataLoading(false);
        return;
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    // Fetch all users for the dropdown AND the project data to pre-fill the form
    const fetchAllData = async () => {
        try {
            const usersResponse = await axios.get(API_ROUTES.PROJECTS.GET_ALL_USERS, {headers});
            const formattedUsers = usersResponse.data.map(user => ({ 
                value: user.id, 
                label: `${user.username} (${user.role})` 
            }));
            setUserOptions(formattedUsers);

            const projectResponse = await axios.get(API_ROUTES.PROJECTS.GET_ONE(projectId), {headers});
            const project = projectResponse.data;

            setProjectName(project.name);
            setDescription(project.description); // <-- 2. SET THE FETCHED DESCRIPTION

            // Pre-select the assigned users
            const preSelected = formattedUsers.filter(option => 
                project.assignedUsers.some(assignedUser => assignedUser.id === option.value)
            );
            setSelectedUsers(preSelected);

        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to load project data.");
        } finally {
            setIsDataLoading(false);
        }
    };
    fetchAllData();
  }, [projectId]);

  const handleSubmit = (event) => {
    const token = localStorage.getItem('token');
    if(!token){
      alert("Authentication Error: Please log in again.");
      setIsLoading(false);
      return;
    }
    const headers = {'Authorization':`Bearer ${token}`}
    event.preventDefault();
    setIsLoading(true);
    const updatedData = {
      name: projectName,
      description: description, // <-- 3. ADD DESCRIPTION TO THE PAYLOAD
      userIds: selectedUsers.map(u => u.value),
    };

    axios.put(API_ROUTES.PROJECTS.GET_ONE(projectId), updatedData, {headers})
      .then(() => navigate('/admin/projects'))
      .catch(error => {
        console.error("Error updating project:", error);
        alert('Failed to update project.');
        setIsLoading(false);
      });
  };
  
  // Re-use the same styles from ProjectForm
  const customSelectStyles = {
    control: (provided, state) => ({...provided, borderColor: state.isFocused ? '#4f46e5' : '#d1d5db', boxShadow: state.isFocused ? '0 0 0 1px #4f46e5' : 'none', '&:hover': {borderColor: state.isFocused ? '#4f46e5' : '#9ca3af',}, borderRadius: '0.375rem', padding: '0.25rem',}),
    multiValue: (provided) => ({...provided, backgroundColor: '#e0e7ff', borderRadius: '0.375rem',}),
    multiValueLabel: (provided) => ({...provided, color: '#3730a3', fontWeight: 500,}),
    multiValueRemove: (provided) => ({...provided, color: '#4338ca', '&:hover': {backgroundColor: '#c7d2fe', color: '#312e81',},}),
    option: (provided, state) => ({...provided, backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : 'white', color: state.isSelected ? 'white' : '#1f2937',})
  };

  if (isDataLoading) {
    return <div className="p-8">Loading project details...</div>;
  }

  // --- 4. USE THE SAME JSX AS THE CREATE FORM ---
  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Project</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
          <input type="text" id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full px-4 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required/>
        </div>
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
          <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div className="mb-8">
          <label htmlFor="assignUsers" className="block text-sm font-medium text-gray-700 mb-2">Assign Team Members</label>
          <Select id="assignUsers" isMulti options={userOptions} value={selectedUsers} onChange={setSelectedUsers} styles={customSelectStyles} required/>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isLoading} className="px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProjectForm;