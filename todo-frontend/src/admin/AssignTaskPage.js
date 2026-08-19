import React from 'react';
import { useNavigate } from 'react-router-dom';
//import AdminDashboard from './AdminDashboard';
import AssignTask from './AssignTask';

export default function AssignTaskPage() {
  const navigate = useNavigate();

  const handleSelect = (section) => {
    navigate('/admintodo', { state: { section } });
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
     

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: '#f4f4f4',
      }}>
        <AssignTask />
      </div>
    </div>
  );
}