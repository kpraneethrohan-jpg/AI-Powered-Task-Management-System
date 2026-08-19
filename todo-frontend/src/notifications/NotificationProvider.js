import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ROUTES } from '../api/apiRoutes';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = () => {
    if (!user || !user.userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return; 
    setIsLoading(true);
    axios.get(API_ROUTES.NOTIFICATIONS.GET_USER_NOTIFICATIONS(user.userId), {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => {
        setNotifications(response.data);
      })
      .catch(error => console.error("Error fetching notifications:", error))
      .finally(() => setIsLoading(false));
  };
  

  useEffect(() => {
    fetchNotifications();
  }, [user]); 

   const markAllAsRead = () => {
    if (!user || !user.userId) return;
    
    // Get the token and add headers to this API call as well.
    const token = localStorage.getItem('token');
    if (!token) return Promise.reject("No token found");

    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );

    return axios.post(API_ROUTES.NOTIFICATIONS.MARK_ALL_AS_READ(user.userId), null, { // null is for the request body
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => {
        fetchNotifications(); // This correctly refetches the data
      })
      .catch(error => {
          console.error("Error marking all as read:", error)
          throw error;
      });
  };
  
  const markOneAsRead = (notificationId) => {
    // Get the token and add headers here too.
    const token = localStorage.getItem('token');
    if (!token) return Promise.reject("No token found");
    
    const originalNotifications = notifications;
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));

    return axios.post(API_ROUTES.NOTIFICATIONS.MARK_ONE_AS_READ(notificationId), null, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .catch(error => {
        console.error("Failed to mark one as read, reverting:", error);
        setNotifications(originalNotifications);
        throw error;
      });
  };
  const value = {
    notifications,
    isLoading,
    markAllAsRead,
    markOneAsRead,
    unreadCount: notifications.filter(n => !n.isRead).length
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};