import React, { useState } from 'react';
import { useNotifications } from './NotificationProvider'; 
import { Mail, CheckCircle, Bell } from 'react-feather';

const NotificationPage = () => {
  // All data and functions now come from the context
  const { 
    notifications, 
    isLoading, 
    markAllAsRead, 
    markOneAsRead 
  } = useNotifications();
  
  // This state is for the 'All' vs 'Unread' tabs
  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.isRead;
    }
    return true; // For 'all', return every notification
  });

  const hasUnread = notifications.some(n => !n.isRead);

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        {hasUnread && (
          <button 
            onClick={markAllAsRead} 
            className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            <CheckCircle size={16} className="mr-2" />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md border">
        {/* Filter Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-3 text-sm font-medium ${filter === 'all' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-3 text-sm font-medium relative ${filter === 'unread' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Unread
            {hasUnread && (
              <span className="absolute top-3 right-1.5 h-2 w-2 rounded-full bg-indigo-500"></span>
            )}
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredNotifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification}
                onMarkAsRead={markOneAsRead}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-20">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'unread' ? 'You are all caught up!' : 'We will notify you here about important updates.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// NotificationItem sub-component is correct
const NotificationItem = ({ notification, onMarkAsRead }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp));
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <li onClick={handleClick} className={`p-4 flex items-start space-x-4 transition-colors ${!notification.isRead ? 'bg-indigo-50 hover:bg-indigo-100 cursor-pointer' : 'bg-white'}`}>
      <div className="flex-shrink-0 mt-0.5">
        <span className={`h-8 w-8 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-indigo-500' : 'bg-gray-400'}`}>
          <Mail className="h-4 w-4 text-white" />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">{notification.message}</p>
        <p className="text-xs text-gray-500 mt-1">{formatTime(notification.timestamp)}</p>
      </div>
      {!notification.isRead && (
        <div className="flex-shrink-0 mt-1">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" aria-hidden="true" title="Unread"></span>
        </div>
      )}
    </li>
  );
};

export default NotificationPage;