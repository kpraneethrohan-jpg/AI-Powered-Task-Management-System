import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();
const decodeToken = (token) => {
    const decoded = jwtDecode(token);
    return {
        userId: decoded.sub,
        role: decoded.role,
        username: decoded.username 
    };
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  console.log('--- AuthProvider is rendering. Current user state is:', user); 

 useEffect(() => {
    const token = localStorage.getItem('token');
     console.log('AuthContext useEffect is running to check localStorage.'); 
    if (token) {
      try {
        const decodedUser = decodeToken(token);
        const tokenExp = jwtDecode(token).exp;  
        if (tokenExp * 1000 > Date.now()) {
            setUser(decodedUser);
        } else {
            localStorage.removeItem('token');
        }
      } catch (error) {
          console.error("Failed to decode token on load:", error);
          localStorage.removeItem('token');
      }
    }
  }, []);

   const login = (token) => {
  try {
    const decodedUser = decodeToken(token);  // FIX HERE
    localStorage.setItem('token', token);
    setUser(decodedUser);                   // FIX HERE
    return decodedUser;
  } catch (error) {
    console.error("Failed to decode token on login:", error);
  }
};



  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    userId: user?.userId, 
    username: user?.username,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isEmployee: user?.role === 'employee',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};