import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Archive } from 'react-feather';
import { useAuth } from '../context/AuthContext'; // To get the logged-in manager's ID
import ProjectCard from '../projects/ProjectCard'; 

function ManagerProjects() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth(); 

  useEffect(() => {
    if (!user || !user.userId) {
        setIsLoading(false);
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Authentication Error: No token found.");
        setIsLoading(false);
        return;
    }
    const headers = {
        'Authorization': `Bearer ${token}`
      };
    setIsLoading(true);
    
    axios.get(`http://localhost:8080/projects/user/${user.userId}`, { headers })
      .then(response => {
        setProjects(response.data);
      })
      .catch(error => {
        console.error("Error fetching projects:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]); // Re-fetch if the user changes

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header: Title Only (No "New Project" button) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
      </div>

      {/* Search Filter Input (Same as admin) */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search my projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full max-w-md pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map(project => (
            // We reuse the ProjectCard but don't pass onEdit or onDelete
            // so the buttons won't appear (assuming ProjectCard handles this)
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Archive className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Projects Assigned</h3>
          <p className="mt-1 text-sm text-gray-500">
            You have not been assigned to any projects yet.
          </p>
        </div>
      )}
    </div>
  );
}

export default ManagerProjects;