import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation} from 'react-router-dom';
import { ArrowLeft, Video, X } from 'react-feather'; // Added Video and X icons
import { useAuth } from '../context/AuthContext';
import { API_ROUTES } from '../api/apiRoutes';

function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth(); 
  const [project, setProject] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // --- NEW STATES FOR GOOGLE MEET ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: ''
  });

   useEffect(() => {
    if (!projectId) return;
    fetchProjectDetails();
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('google') === 'connected') {
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [projectId, location]);

  
  const fetchProjectDetails = () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    setIsLoading(true);
    axios.get(API_ROUTES.PROJECTS.GET_ONE(projectId), { headers })
      .then(response => {
        setProject(response.data);
        setAssignedUsers(response.data.assignedUsers || []);
      })
      .catch(error => console.error("Error fetching project details:", error))
      .finally(() => setIsLoading(false));
  };

  // --- GOOGLE MEET LOGIC ---
  const handleScheduleClick = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Pass projectId in the URL
      const response = await axios.post(API_ROUTES.PROJECTS.GOOGLE_MEET.CONNECT(projectId), {}, { headers });

      if (response.data === "Already Connected") {
        setIsModalOpen(true);
      } else {
        // User is redirected to Google, then comes back via the callback redirect
        window.location.href = response.data;
      }
    } catch (error) {
      alert(error.response?.data || "Failed to initiate Google connection");
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const res = await axios.post(API_ROUTES.PROJECTS.GOOGLE_MEET.SCHEDULE(projectId), meetingData, { headers });
      
      alert(`Meeting created! Link: ${res.data}`);
      setIsModalOpen(false);
      setMeetingData({ title: '', description: '', startTime: '', endTime: '' });
    } catch (error) {
      alert("Failed to create meeting. Check if times are valid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = assignedUsers.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserClick = (userId) => {
    const path = isAdmin
      ? `/admin/projects/${projectId}/assign/${userId}`
      : `/manager/projects/${projectId}/assign/${userId}`;
    navigate(path);
  };

  const handleBackClick = () => {
    const path = isAdmin ? '/admin/projects' : '/manager/projects';
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-100 relative">
      
      {/* Header Section */}
      <div className="mb-4">
        <button onClick={handleBackClick} className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-2">
          <ArrowLeft size={16} className="mr-1.5" />
          Back to All Projects
        </button>
        <h2 className="text-3xl font-bold text-gray-800">
          Team Members for: <span className="text-indigo-600">{project?.name}</span>
        </h2>
      </div>

      {/* --- SEARCH BAR & SCHEDULE BUTTON ROW --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search for team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 w-full md:flex-1 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        
        {isAdmin && (
          <button
            onClick={handleScheduleClick}
            className="flex items-center justify-center bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-all shadow-md font-semibold whitespace-nowrap"
          >
            <Video size={18} className="mr-2" />
            Schedule Meet
          </button>
        )}
      </div>

      {/* List Container */}
      <div className="mt-4 overflow-y-auto flex-1 pr-2 max-h-[70vh]">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className="relative border border-gray-200 p-4 mb-4 bg-white rounded-lg shadow-md hover:shadow-lg hover:border-indigo-400 transition-all duration-300 cursor-pointer"
            >
              <h4 className="text-lg font-semibold mb-2 text-gray-800">{user.username}</h4>
              <p className="text-gray-600">Role: {user.role}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 mt-4">No members found.</p>
        )}
      </div>

      {/* --- MEETING FORM MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Schedule Google Meet</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Meeting Title</label>
                <input
                  required
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={meetingData.title}
                  onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={meetingData.description}
                  onChange={(e) => setMeetingData({...meetingData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    required
                    type="datetime-local"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={meetingData.startTime}
                    onChange={(e) => setMeetingData({...meetingData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    required
                    type="datetime-local"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={meetingData.endTime}
                    onChange={(e) => setMeetingData({...meetingData, endTime: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 rounded-md text-white font-bold transition-colors ${
                  isSubmitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Meeting'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetailsPage;