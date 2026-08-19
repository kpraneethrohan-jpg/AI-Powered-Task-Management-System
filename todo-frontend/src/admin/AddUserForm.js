import React, { useState } from "react";
import axios from "axios";
import { User, Lock, Mail, Phone, Briefcase } from "react-feather";
import { API_ROUTES } from "../api/apiRoutes";

function AddUserForm({ onClose }) {

  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(""); // Default role is employee


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(API_ROUTES.REGISTER, {
        id: userId,
        username,
        password,
        role,
        profile: { email, phone },
      });

      alert("User added successfully");
      onClose();

    } catch (err) {
      console.error(err);
      alert("Error adding employee");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* User ID */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="User ID"
          required
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Username */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select required value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
        </div>

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Phone */}
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="tel"
          placeholder="Phone Number"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <button className="w-full py-2.5 font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
        Add User
      </button>

    </form>
  );
}

export default AddUserForm;