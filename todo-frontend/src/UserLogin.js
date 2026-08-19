import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { User, Lock, Mail, Phone, Briefcase } from 'react-feather'; // Icons for the form
import { jwtDecode } from 'jwt-decode'; 
import { API_ROUTES } from './api/apiRoutes';

function UserAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // Separate state for errors
  const [isLoading, setIsLoading] = useState(false); // Loading state for the button
  
  const navigate = useNavigate(); 
  const { login } = useAuth();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    // Clear all fields and messages on toggle
    setUsername('');
    setPassword('');
    setRole('');
    setPhone('');
    setEmail('');
    setUserId('');
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');
  if (isLogin) {
      try {
        const response = await axios.post(API_ROUTES.LOGIN, {
          userId: userId, 
          password: password
        });
        
        const { token } = response.data;

        if (token) {
           const authenticatedUser = login(token);
           if (authenticatedUser && authenticatedUser.role) {
             const userRole = authenticatedUser.role.toLowerCase();
             if (userRole === 'admin') navigate('/admin');
             else if (userRole === 'manager') navigate('/manager');
             else navigate('/emptodo');
           } else {
             setError('Login succeeded but user data could not be read.');
           }
         } else {
            setError('Login failed. No token received.');
         }
      }catch (err) {
        console.error('Login error:', err);
        setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    } else { // Register logic
      try {
        const response = await axios.post(API_ROUTES.REGISTER, {
          id: userId,
          username,
          password,
          role,
          profile: { email, phone },
        });
        setMessage('Registration successful! Please login.');
        setIsLogin(true); // Switch to login view after successful registration
      } catch (err) {
        console.error('Registration error:', err);
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    // this adapts the background from background-pattern.svg from tilwindconfig.js
     <div className="min-h-screen bg-subtle-pattern flex flex-col justify-center items-center p-4">
      {/* Branding Logo */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
          <span className="text-2xl font-bold text-white">T</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Task Platform</h1>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
          {isLogin ? 'Welcome Back!' : 'Create an Account'}
        </h2>
        <p className="text-slate-500 text-center mb-6">
          {isLogin ? 'Sign in to continue' : 'Get started by filling out the form'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID Input */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="User ID" required value={userId} onChange={(e) => setUserId(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>


    {/* REMOVED THE REGISTRATION LOGIC SINCE ADMIN ADDS THE USERS MANUALLY */}

          {/* {!isLogin && ( */}
             
               {/* Username Input (for registration) */}
            {/* //   <div className="relative">
            //     <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            //     <input type="text" placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)} */}
            {/* //       className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            //   </div>
            //   {/* Email Input */}
            {/* //   <div className="relative">
            //     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            //     <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} */} 
            {/* //       className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            //   </div> */}
               {/* Phone Input */}
            {/* //   <div className="relative">
            //     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            //     <input type="tel" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} */}
            {/* //       className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            //   </div>
            // </> */}
          

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          {/* Role Select */}
          {/* <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select required value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div> */}

          {/* Submit Button */}
          <button type="submit" disabled={isLoading}
            className="w-full py-2.5 font-semibold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:bg-emerald-300"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        {/* Toggle Button */}
        {/* <div className="text-center mt-4">
          <button onClick={handleToggle} className="text-sm font-medium text-emerald-600 hover:text-emerald-800">
            {isLogin ? 'Don\'t have an account? Sign Up' : 'Already have an account? Login'}
          </button>
        </div> */}

        {/* Message/Error Display */}
        {message && <p className="mt-4 text-center text-sm font-medium text-green-600">{message}</p>}
        {error && <p className="mt-4 text-center text-sm font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}

// The old 'styles' object is completely gone.

export default UserAuthPage;