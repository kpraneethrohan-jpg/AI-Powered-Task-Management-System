// ThemeToggle.js
import React from 'react';
import { useTheme } from './ThemeContext'; // adjust the path if needed

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: darkMode ? '#444' : '#ddd',
        color: darkMode ? 'white' : 'black',
        position: 'fixed', // This makes it float in the corner
        top: '10px',
        right: '10px',
        zIndex: 1000,
      }}
    >
      {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
};

export default ThemeToggle;
