import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useConfirmationModal from '../components/useConfirmationModal';
import { Search, Trash2, FileText, Download } from 'react-feather';
import { API_ROUTES } from '../api/apiRoutes';

function EmployeeSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allEmployees, setAllEmployees] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Authentication Error: No token found.");
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    axios.get(API_ROUTES.ADMIN.GET_EMPLOYEE_PROFILES, { headers })
      .then(response => {
        if (Array.isArray(response.data)) {
          setAllEmployees(response.data);
        } else {
          console.error("API returned non-array:", response.data);
          setAllEmployees([]);
        }
      })
      .catch(error => {
        console.error("Fetching error:", error);
      });
  }, []);

  const filteredEmployees = allEmployees.filter((employee) =>
    employee.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClick = (employeeId) => {
    navigate(`../assignTask/${employeeId}`);
  };

  const deleteEmployeeAction = (employeeId) => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Authentication Error: No token found.");
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    return axios.delete(API_ROUTES.ADMIN.DELETE_AN_USER(employeeId), { headers })
      .then(() => {
        setAllEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      })
      .catch(error => {
        console.error("Delete failed:", error);
        alert("Failed to delete employee");
        throw error;
      });
  };

  const [askForDeleteConfirmation, DeleteConfirmationModal] = useConfirmationModal({
    onConfirm: deleteEmployeeAction,
    title: "Delete Employee",
    message: "Are you sure you want to delete this employee? This action cannot be undone.",
    confirmText: "Delete",
  });

  const generateEmployeeReport = async (employeeId, employeeName) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Authentication Error: No token found.");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    setDownloadingId(employeeId);

    try {
      const response = await axios.get(
        API_ROUTES.ADMIN.GENERATE_EMPLOYEE_REPORT(employeeId),
        {
          headers,
          responseType: "blob"
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${employeeName}_Performance_Report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Report Download Error:", err);
      alert("Failed to generate report.");
    } finally {
      setDownloadingId(null);
    }
  };

  // All UI improvements are in the JSX below.
  return (
    // The main wrapper is correct, inheriting the background from the layout.
    <div className="w-full p-6 md:p-8">
      <div className="flex flex-col space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Employee Section</h1>
          <p className="text-slate-500">Search for and manage company employees.</p>
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // --- CHANGE #1: Updated focus ring color for theme consistency ---
            className="w-full md:w-1/2 lg:w-1/3 pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="flex flex-col space-y-4">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg flex items-center justify-between cursor-pointer border-2 border-transparent hover:border-emerald-500 transition-all duration-300"
                onClick={() => handleClick(employee.id)}
              >
                {/* User Info */}
                <div className="flex flex-col space-y-1">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {employee.username}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {employee.profile?.email}
                  </p>
                  <p className="text-sm text-slate-500">
                    {employee.profile?.phone}
                  </p>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                  {/* Generate Report Button */}
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      generateEmployeeReport(employee.id, employee.username);
                    }}
                    disabled={downloadingId === employee.id}
                  >
                    {downloadingId === employee.id ? (
                      <>
                        <Download className="h-4 w-4 animate-pulse" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Report
                      </>
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      askForDeleteConfirmation(employee.id);
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 mt-4 text-center">
              No employees found.
            </p>
          )}
        </div>
      </div>
      <DeleteConfirmationModal />
    </div>
  );
}

export default EmployeeSection;

