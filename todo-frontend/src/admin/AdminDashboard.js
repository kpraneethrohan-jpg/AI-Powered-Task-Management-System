import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Briefcase, 
  Cpu, 
  BarChart2, 
  Bell, 
  MessageSquare,
  LogOut,
  Settings,
  Activity
} from 'react-feather';
import { useNotifications } from '../notifications/NotificationProvider'; 

function AdminDashboard() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    navigate('/UserLogin');
  };

  // --- Style definitions for NavLink ---
  const baseLinkClass = "flex items-center space-x-3 rounded-md px-3 py-2 text-slate-600 transition-colors duration-200";
  const activeLinkClass = "bg-emerald-50 text-emerald-700 font-semibold";
  const inactiveLinkClass = "hover:bg-slate-100 hover:text-slate-900";

  const getLinkClass = ({ isActive }) => 
    `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`;

  return (
    // Sidebar container with a subtle right border
    <aside className="w-64 h-screen bg-white flex flex-col sticky top-0 border-r border-slate-200">
      
      {/* 1. Branding / Logo Section */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          <h1 className="text-lg font-bold text-slate-800">Admin Panel</h1>
        </div>
      </div>

      {/* 2. Main Navigation Links */}
      <nav className="flex-1 p-4 flex flex-col space-y-1">
        <NavLink to="/admin" className={getLinkClass} end>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/admin/managers" className={getLinkClass}>
          <Users size={20} />
          <span>Managers</span>
        </NavLink>
        <NavLink to="/admin/employees" className={getLinkClass}>
          <Briefcase size={20} />
          <span>Employees</span>
        </NavLink>
        <NavLink to="/admin/projects" className={getLinkClass}>
          <Cpu size={20} /> 
          <span>Projects</span>
        </NavLink>
        
        <div className="pt-4 pb-2 px-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Tools & Reports</span>
        </div>

        <NavLink to="/admin/execution-health" className={getLinkClass}>
          <Activity size={20} />
          <span>Execution Health</span>
        </NavLink>
        <NavLink to="/admin/task-recommender" className={getLinkClass}>
          <BarChart2 size={20} />
          <span>Recommender</span>
        </NavLink>
        <NavLink to="/admin/task-automation" className={getLinkClass}>
          <BarChart2 size={20} />
          <span>Automation</span>
        </NavLink>
        <NavLink to="/admin/ai-assistant" className={getLinkClass}>
          <MessageSquare size={20} />
          <span>AI Assistant</span>
        </NavLink>
         <NavLink to="/admin/notifications" className={getLinkClass}>
          <Bell size={20} />
          <span className="flex-1">Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-auto bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </NavLink>
      </nav>

      {/* 3. User / Logout Section at the bottom */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex flex-col space-y-1">
            {/* You can add a link to a user profile page here */}
             <a href="#settings" className={`${baseLinkClass} ${inactiveLinkClass}`}>
                <Settings size={20} />
                <span>Settings</span>
            </a>
            <button 
              onClick={handleLogout} 
              className={`${baseLinkClass} w-full ${inactiveLinkClass}`}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminDashboard;