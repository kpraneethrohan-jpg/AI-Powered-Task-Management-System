import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Briefcase,
  Folder,
  CheckSquare,
  ArrowUpRight,
  Plus,
} from "react-feather";
import { useAuth } from "../context/AuthContext";
import SummaryPieChart from "./SummaryPieChart";
import { API_ROUTES } from "../api/apiRoutes";
import AddUserForm from "./AddUserForm";
import BulkUploadModal from "./BulkUploadModal";
const STATUS_COLORS = [
  "#38bdf8", // To Do
  "#f59e0b", // In Progress
  "#10b981", // Done
];

const processSummaryData = (rawData) => {
  if (!Array.isArray(rawData) || rawData.length < 4) {
    return [
      { name: "To Do", value: 0 },
      { name: "In Progress", value: 0 },
      { name: "Done", value: 0 },
    ];
  }

  return [
    { name: "To Do", value: rawData[1] },
    { name: "In Progress", value: rawData[2] },
    { name: "Done", value: rawData[3] },
  ];
};

const StatCard = ({ icon, title, value, isLoading, color = "emerald" }) => {
  const Icon = icon;

  const colorStyles = {
    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      count: "text-emerald-500",
    },
    sky: {
      bg: "bg-sky-100",
      text: "text-sky-600",
      count: "text-sky-500",
    },
    amber: {
      bg: "bg-amber-100",
      text: "text-amber-600",
      count: "text-amber-500",
    },
    violet: {
      bg: "bg-violet-100",
      text: "text-violet-600",
      count: "text-violet-500",
    },
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          {isLoading ? (
            <div className="mt-3 h-10 w-24 bg-slate-200 rounded animate-pulse" />
          ) : (
            <>
              <p
                className={`text-4xl font-bold mt-2 ${colorStyles[color].count}`}
              >
                {value}
              </p>
              <div className="flex items-center text-xs mt-2 text-emerald-500 font-medium">
                <ArrowUpRight size={14} className="mr-1" />
                Updated
              </div>
            </>
          )}
        </div>

        <div
          className={`p-3 rounded-xl ${colorStyles[color].bg} ${colorStyles[color].text}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

function HomeSection() {
  const { user } = useAuth();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [stats, setStats] = useState({
    employeeCount: 0,
    managerCount: 0,
    projectCount: 0,
  });

  const [summaryData, setSummaryData] = useState({
    total: [],
    employee: [],
    manager: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [
          employeesRes,
          managersRes,
          projectsRes,
          totalSummaryRes,
          employeeSummaryRes,
          managerSummaryRes,
        ] = await Promise.all([
          axios.get(API_ROUTES.ADMIN.GET_EMPLOYEE_PROFILES, { headers }),
          axios.get(API_ROUTES.ADMIN.GET_MANAGER_PROFILES, { headers }),
          axios.get(API_ROUTES.ADMIN.GET_PROJECTS, { headers }),
          axios.get(API_ROUTES.ADMIN.TOTAL_SUMMARY, { headers }),
          axios.get(API_ROUTES.ADMIN.TOTAL_EMPLOYEE_SUMMARY, { headers }),
          axios.get(API_ROUTES.ADMIN.TOTAL_MANAGER_SUMMARY, { headers }),
        ]);

        setStats({
          employeeCount: employeesRes.data?.length || 0,
          managerCount: managersRes.data?.length || 0,
          projectCount: projectsRes.data?.length || 0,
        });

        setSummaryData({
          total: processSummaryData(totalSummaryRes.data),
          employee: processSummaryData(employeeSummaryRes.data),
          manager: processSummaryData(managerSummaryRes.data),
        });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:8080/admin/bulk-upload-users",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Users uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="w-full min-h-screen p-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Welcome back, {user?.username}
            </h1>
            <p className="text-slate-500 mt-1">
              Here's what's happening in your workspace.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition"
            >
              <Plus size={16} /> Add User
            </button>

            <input
              type="file"
              accept=".xlsx,.xls"
              id="bulkUploadInput"
              style={{ display: "none" }}
              onChange={handleBulkUpload}
            />

            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition"
            >
              <Plus size={16} /> Bulk Upload
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg shadow hover:bg-slate-900 transition">
              <Plus size={16} /> Create Project
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Managers"
            value={stats.managerCount}
            icon={Briefcase}
            isLoading={isLoading}
            color="amber"
          />
          <StatCard
            title="Total Employees"
            value={stats.employeeCount}
            icon={Users}
            isLoading={isLoading}
            color="sky"
          />
          <StatCard
            title="Active Projects"
            value={stats.projectCount}
            icon={Folder}
            isLoading={isLoading}
            color="emerald"
          />
          <StatCard
            title="Completed Tasks"
            value={summaryData.total.find((d) => d.name === "Done")?.value || 0}
            icon={CheckSquare}
            isLoading={isLoading}
            color="violet"
          />
        </div>

        {/* Analytics Section */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Task Completion Overview
            </h3>
            <div className="h-40 flex items-center justify-center text-slate-400">
              Add Line / Bar Chart Here
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Team Performance
            </h3>
            <div className="h-40 flex items-center justify-center text-slate-400">
              Add Performance Chart Here
            </div>
          </div>
        </div> */}

        {/* Task Summary Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Task Summary Overview
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SummaryPieChart
              title="Overall Task Distribution"
              data={summaryData.total}
              colors={STATUS_COLORS}
              isLoading={isLoading}
            />
            <SummaryPieChart
              title="Employee Task Summary"
              data={summaryData.employee}
              colors={STATUS_COLORS}
              isLoading={isLoading}
            />
            <SummaryPieChart
              title="Manager Task Summary"
              data={summaryData.manager}
              colors={STATUS_COLORS}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            Recent Activity
          </h3>
          <ul className="space-y-4 text-sm text-slate-600">
            <li>✔ Manager created a new project</li>
            <li>👤 New employee joined the organization</li>
            <li>📁 Project marked as completed</li>
            <li>📝 Task assigned to employee</li>
          </ul>
        </div>

        {showAddUserModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded-lg w-96 relative">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="absolute top-2 right-3 text-gray-500"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold mb-4">Add User</h2>

              <AddUserForm onClose={() => setShowAddUserModal(false)} />
            </div>
          </div>
        )}

        <BulkUploadModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
        />
      </div>
    </div>
  );
}

export default HomeSection;
