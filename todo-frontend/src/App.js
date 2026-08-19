import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

// STYLES
import './styles/index.css';
import './styles/tailwind.css';

// CONTEXT PROVIDERS
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './notifications/NotificationProvider';
import ThemeProvider from './ThemeContext';

// GENERAL PAGES
import LandingPage from './LandingPage';
import UserLogin from './UserLogin'; // Assuming this is the main login page
import EmployeeTodo from './EmployeeTodo';

// LAYOUT COMPONENTS (These act as shells/templates for other pages)
import ManagerTodo from './manager/ManagerTodo';
import AdminTodo from './admin/AdminTodo';

// SECTION/PAGE COMPONENTS (These will be rendered inside the layouts)
import ManagerTasks from './manager/ManagerTasks';
import AssignTaskPage from './admin/AssignTaskPage';
import EmployeeSectionPage from './admin/EmployeeSectionPage';
// SECTION/PAGE COMPONENTS

import ManagerSection from './admin/ManagerSection'; 
import ProjectSection from './projects/ProjectSection';
import TaskRecommender from './admin/TaskRecommender'; 
import TaskAutomation from './admin/TaskAutomation';
import AdminAIAssistant from './admin/AdminAIAssistant';
import AdminHome from './admin/HomeSection'; 
import ManagerHome from './manager/HomeSection'; 
import TaskSummarySection from './admin/TaskSummarySection'; 
import NotificationPage from './notifications/NotificationPage';
 // New component
import ProjectForm from './projects/ProjectForm'; 
import EditProjectForm from './projects/EditProjectForm';
import ProjectDetailsPage from './projects/ProjectDetailsPage';
import ProjectTaskAssignment from './projects/ProjectTaskAssignment';
import ManagerProjects from './manager/ManagerProjects';
import ExecutionHealthDashboard from './admin/ExecutionHealthDashboard';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
           <NotificationProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<UserLogin />} />
              <Route path="/UserLogin" element={<UserLogin />} />
              
              {/*Employee Route */}
              <Route path="/emptodo" element={<EmployeeTodo />} />

              {/* --- MANAGER NESTED ROUTES --- */}
              <Route path="/manager" element={<ManagerTodo />}>
                <Route index element={<ManagerHome />} />
                <Route path="employees" element={<EmployeeSectionPage />} />
                <Route path="tasks" element={<ManagerTasks />} />
                <Route path="assignTask/:id" element={<AssignTaskPage />} />
                <Route path="projects" element={<ManagerProjects />} />
                <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
                <Route path="projects/:projectId/assign/:userId" element={<ProjectTaskAssignment />} />
                <Route path="task-summary" element={<TaskSummarySection />} />
                <Route path="task-recommender" element={<TaskRecommender />} />
                <Route path="notifications" element={<NotificationPage />} />
              </Route>
              
              {/* --- ADMIN NESTED ROUTES --- */}
              <Route path="/admin" element={<AdminTodo />}>
                  <Route index element={<AdminHome />} /> 
                  <Route path="managers" element={<ManagerSection />} />
                  <Route path="employees" element={<EmployeeSectionPage />} />
                  <Route path="projects" element={<ProjectSection />} />
                  <Route path="projects/new" element={<ProjectForm />} />
                  <Route path="projects/edit/:projectId" element={<EditProjectForm />} />
                  <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
                  <Route path="projects/:projectId/assign/:userId" element={<ProjectTaskAssignment />} />
                  <Route path="task-recommender" element={<TaskRecommender />} />
                  <Route path="task-automation" element={<TaskAutomation />} />
                  <Route path="task-summary" element={<TaskSummarySection />} />
                  <Route path="execution-health" element={<ExecutionHealthDashboard />} />
                  <Route path="notifications" element={<NotificationPage />} />
                  <Route path="assignTask/:id" element={<AssignTaskPage />} />
                  <Route path="ai-assistant" element={<AdminAIAssistant />} />
              </Route>

            </Routes>
            </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;