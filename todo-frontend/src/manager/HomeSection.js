import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Briefcase, Folder, CheckSquare } from 'react-feather'; // Import icons
import { useAuth } from '../context/AuthContext';
import { API_ROUTES } from '../api/apiRoutes';
// A reusable StatCard component for a clean and scalable dashboard
const StatCard = ({ icon, title, value, isLoading, color = 'emerald' }) => {
  const Icon = icon;
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600',
    sky: 'bg-sky-100 text-sky-600',
    amber: 'bg-amber-100 text-amber-600',
    violet: 'bg-violet-100 text-violet-600',
  };
  const countColorClasses = {
    emerald: 'text-emerald-500',
    sky: 'text-sky-500',
    amber: 'text-amber-500',
    violet: 'text-violet-500',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
          {isLoading ? (
            // Skeleton loader for the count
            <div className="mt-2 h-10 w-24 bg-slate-200 rounded-md animate-pulse"></div>
          ) : (
            // The actual count
            <p className={`text-4xl font-bold mt-2 ${countColorClasses[color]}`}>{value}</p>
          )}
        </div>
        {/* The Icon */}
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};


function HomeSection() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employeeCount: 0,
    managerCount: 0,
    projectCount: 0, // Added for future expansion
    taskCount: 0,    // Added for future expansion
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = user?.userId;
     if (!userId) {
        setIsLoading(false);
        return;
    }
    const fetchAllStats = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Authentication Error: No token found.");
        setIsLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };
     try {
        const [employeesRes, managersRes, projectsRes, tasksRes] = await Promise.all([
          axios.get(API_ROUTES.MANAGER.GET_EMPLOYEE_PROFILES, { headers }),
          axios.get(API_ROUTES.MANAGER.GET_MANAGER_PROFILES, { headers }),
          axios.get(`http://localhost:8080/projects/user/${userId}`, { headers }),
          axios.get(`http://localhost:8080/assigntask/getincompletetask/${userId}`, { headers })
        ]);

        setStats({
          employeeCount: Array.isArray(employeesRes.data) ? employeesRes.data.length : 0,
          managerCount: Array.isArray(managersRes.data) ? managersRes.data.length : 0,
          projectCount: Array.isArray(projectsRes.data) ? projectsRes.data.length : 0,
          taskCount: Array.isArray(tasksRes.data) ? tasksRes.data.length : 0,
        });

      }catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllStats();
  }, [user]); // Runs once when component mounts

  const username = user?.username;

  return (
    // Main container with consistent padding and background
    <div className="w-full p-6 md:p-8">
      <div className="flex flex-col space-y-6">

        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome, {username} !</h1>
          <p className="text-slate-500 mt-1">Here's a summary of your workspace.</p>
        </div>

        {/* Grid container for the stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={stats.employeeCount}
            icon={Users}
            isLoading={isLoading}
            color="sky"
          />
          <StatCard
            title="Total Managers"
            value={stats.managerCount}
            icon={Briefcase}
            isLoading={isLoading}
            color="amber"
          />
          {/* Example of how easily you can add more cards */}
           <StatCard
            title="Active Projects"
            value={stats.projectCount} // Replace with real data when ready
            icon={Folder}
            isLoading={isLoading}
            color="emerald"
          />
           <StatCard
            title="Pending Tasks"
            value={stats.taskCount} // Replace with real data when ready
            icon={CheckSquare}
            isLoading={isLoading}
            color="violet"
          />
        </div>

        {/* You can add more sections here, like recent activity, charts, etc. */}
        
      </div>
    </div>
  );
}


export default HomeSection;