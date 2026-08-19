// src/components/ProjectCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'react-feather';
import { useAuth } from '../context/AuthContext';

const ProjectCard = ({ project, onEdit, onDelete }) => {

    const navigate = useNavigate(); 
    const { isAdmin } = useAuth();
    
    const generateAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

    const handleCardClick = () => {
        const path = isAdmin 
            ? `/admin/projects/${project.id}` 
            : `/manager/projects/${project.id}`;
        navigate(path);
    };

     return (
        <div onClick={handleCardClick} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800 ">{project.name}</h3>
                    
                    {/* --- CONDITIONAL RENDERING FOR ADMINS ONLY --- */}
                    {/* Only render the actions div if the user is an admin */}
                    {isAdmin && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                            {onEdit && (
                                <button onClick={(e) => { e.stopPropagation(); onEdit(project.id); }} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                                    <Edit size={16} />
                                </button>
                            )}
                            {onDelete && (
                                <button onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{project.description}</p>
            </div>
            {/* ... footer with avatars ... */}
            <div className="px-5 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Team</p>
                <div className="flex items-center -space-x-2">
                    {project.assignedUsers.slice(0, 4).map(user => (
                        <img key={user.id} className="w-8 h-8 rounded-full border-2 border-white" src={generateAvatar(user.username)} alt={user.username} title={user.username} />
                    ))}
                    {project.assignedUsers.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                            +{project.assignedUsers.length - 4}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default ProjectCard;