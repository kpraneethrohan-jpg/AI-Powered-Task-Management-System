// src/pages/ProjectSection.js (or wherever it is located)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Archive } from 'react-feather';
import ProjectCard from '../projects/ProjectCard'; // Make sure this path is correct
import useConfirmationModal from '../components/useConfirmationModal'; // Import the hook
import { API_ROUTES } from '../api/apiRoutes';

function ProjectSection() {
  const [allProjects, setAllProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Authentication Error: No token found.");
        setIsLoading(false);
        return;
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    setIsLoading(true);
    axios.get(API_ROUTES.PROJECTS.GET_ALL,{headers})
      .then(response => setAllProjects(response.data))
      .catch(error => console.error("Error fetching projects:", error))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEdit = (projectId) => {
    navigate(`/admin/projects/edit/${projectId}`);
  };

  // --- UPGRADED DELETE LOGIC ---
  // This uses the same professional confirmation modal as your other pages.
  const deleteProjectAction = (projectId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Authentication Error: Please log in again.");
        return Promise.reject("No token found");
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    return axios.delete(API_ROUTES.PROJECTS.GET_ONE(projectId),{headers})
      .then(() => {
        setAllProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
      })
      .catch(error => {
        console.error("Error deleting project:", error);
        alert('Failed to delete project.');
        throw error; // Important for the hook
      });
  };

  const [askForDeleteConfirmation, DeleteConfirmationModal] = useConfirmationModal({
    onConfirm: deleteProjectAction,
    title: "Delete Project",
    message: "Are you sure you want to delete this project? This action cannot be undone.",
    confirmText: "Delete",
  });
  // -----------------------------

  const filteredProjects = allProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- THEME-CONSISTENT LOADING SPINNER ---
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-600"></div>
    </div>
  );

  return (
    // Main wrapper with correct padding. It inherits the bg-slate-100 from the layout.
    <div className="w-full p-6 md:p-8">
      {/* Main container for consistent spacing */}
      <div className="flex flex-col space-y-6">
        {/* --- CORRECTED HEADER (Your version was already good) --- */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Projects</h1>
            <p className="text-slate-500 mt-1">Manage all company initiatives from here.</p>
          </div>
          <button
            onClick={() => navigate('/admin/projects/new')}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            New Project
          </button>
        </div>

        {/* --- CORRECTED SEARCH BAR --- */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search projects by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full max-w-md pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* --- RESULTS GRID / LOADING / EMPTY STATE --- */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onEdit={handleEdit}
                onDelete={() => askForDeleteConfirmation(project.id)} // Use the modal trigger
              />
            ))}
          </div>
        ) : (
          // --- THEME-CONSISTENT EMPTY STATE ---
          <div className="text-center py-16">
            <Archive className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-800">No Projects Found</h3>
            <p className="mt-1 text-sm text-slate-500">
                {searchTerm ? 'Try adjusting your search.' : 'Get started by creating a new project.'}
            </p>
          </div>
        )}

      </div>
      {/* Don't forget to render the modal component */}
      <DeleteConfirmationModal />
    </div>
  );
}

export default ProjectSection;