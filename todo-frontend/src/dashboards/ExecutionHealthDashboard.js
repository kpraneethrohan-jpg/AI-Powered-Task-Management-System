import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

const ExecutionHealthDashboard = () => {
  const [health, setHealth] = useState(null);
  const [tasksByWindow, setTasksByWindow] = useState(null);
  const [completionTrend, setCompletionTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const [healthRes, windowRes, trendRes] = await Promise.all([
        fetch('/api/health/task-execution'),
        fetch('/api/health/tasks-by-window'),
        fetch('/api/health/completion-trend')
      ]);

      if (healthRes.ok && windowRes.ok && trendRes.ok) {
        const healthData = await healthRes.json();
        const windowData = await windowRes.json();
        const trendData = await trendRes.json();

        setHealth(healthData);
        setTasksByWindow(windowData);
        setCompletionTrend(trendData);
      } else {
        setError('Failed to fetch health data');
      }
    } catch (err) {
      setError('Error fetching health data: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    if (score >= 40) return 'bg-orange-50';
    return 'bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading execution health metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <button
            onClick={fetchHealthData}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Execution Health Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Organization-wide task completion status, deadline adherence, and delivery efficiency
          </p>
        </div>

        {/* Health Score Card */}
        {health && (
          <div className={`${getHealthScoreBgColor(health.healthScore)} rounded-2xl border-2 border-gray-200 p-8 mb-8 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-lg font-semibold mb-2">Overall Health Score</p>
                <p className={`text-6xl font-bold ${getHealthScoreColor(health.healthScore)}`}>
                  {health.healthScore.toFixed(1)}/100
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="text-right">
                  <p className="text-gray-600 text-sm">Completion Rate</p>
                  <p className="text-3xl font-bold text-indigo-600">{health.completionRate.toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-sm">On-Time Rate</p>
                  <p className="text-3xl font-bold text-green-600">{health.onTimeCompletionRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {['overview', 'details', 'deadlines', 'trend'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === tab
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && health && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Tasks */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Assigned</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{health.totalAssignedTasks}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{health.completedTasks}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Active Tasks */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{health.activeTasks}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Overdue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{health.overdueTasks}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && health && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Completion Quality */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Completion Quality</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-600 font-medium">Completed On-Time</p>
                    <p className="text-lg font-bold text-green-600">{health.tasksCompletedOnTime}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: health.completedTasks > 0
                          ? `${(health.tasksCompletedOnTime / health.completedTasks) * 100}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-600 font-medium">Completed Late</p>
                    <p className="text-lg font-bold text-orange-600">{health.tasksCompletedLate}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{
                        width: health.completedTasks > 0
                          ? `${(health.tasksCompletedLate / health.completedTasks) * 100}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Task Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 font-medium">Pending</p>
                  <span className="text-lg font-bold text-indigo-600">{health.pendingTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 font-medium">In Progress</p>
                  <span className="text-lg font-bold text-blue-600">{health.inProgressTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 font-medium">Stuck (5+ days)</p>
                  <span className="text-lg font-bold text-red-600">{health.stuckTasks}</span>
                </div>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Active Tasks by Priority</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-2">High Priority</p>
                  <p className="text-3xl font-bold text-red-600">{health.highPriorityActive}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-2">Medium Priority</p>
                  <p className="text-3xl font-bold text-yellow-600">{health.mediumPriorityActive}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-2">Low Priority</p>
                  <p className="text-3xl font-bold text-green-600">{health.lowPriorityActive}</p>
                </div>
              </div>
            </div>

            {/* Deadline Alerts */}
            <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Deadline Alerts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600 mb-1">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{health.overdueTasks}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600 mb-1">Critical (3 days)</p>
                  <p className="text-2xl font-bold text-orange-600">{health.criticalTasks}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-1">Due Soon (7 days)</p>
                  <p className="text-2xl font-bold text-yellow-600">{health.tasksDueSoon}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-600">{health.completionRate.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deadlines Tab */}
        {activeTab === 'deadlines' && tasksByWindow && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Overdue Tasks */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Overdue ({tasksByWindow.overdue?.length || 0})</h3>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasksByWindow.overdue && tasksByWindow.overdue.length > 0 ? (
                  tasksByWindow.overdue.map((task) => (
                    <div key={task.taskId} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="font-semibold text-gray-900">{task.taskname}</p>
                      <p className="text-sm text-gray-600 mt-1">Deadline: {task.deadline}</p>
                      <p className="text-xs text-gray-500 mt-1">Assigned to: {task.assigneeName || 'Unassigned'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No overdue tasks</p>
                )}
              </div>
            </div>

            {/* Critical Tasks */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">Critical - Due in 3 Days ({tasksByWindow.critical?.length || 0})</h3>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasksByWindow.critical && tasksByWindow.critical.length > 0 ? (
                  tasksByWindow.critical.map((task) => (
                    <div key={task.taskId} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="font-semibold text-gray-900">{task.taskname}</p>
                      <p className="text-sm text-gray-600 mt-1">Deadline: {task.deadline}</p>
                      <p className="text-xs text-gray-500 mt-1">Assigned to: {task.assigneeName || 'Unassigned'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No critical tasks</p>
                )}
              </div>
            </div>

            {/* Due Soon */}
            <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-bold text-gray-900">Due Soon - Next 7 Days ({tasksByWindow.dueSoon?.length || 0})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {tasksByWindow.dueSoon && tasksByWindow.dueSoon.length > 0 ? (
                  tasksByWindow.dueSoon.map((task) => (
                    <div key={task.taskId} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="font-semibold text-gray-900">{task.taskname}</p>
                      <p className="text-sm text-gray-600 mt-1">Deadline: {task.deadline}</p>
                      <p className="text-xs text-gray-500 mt-1">Assigned to: {task.assigneeName || 'Unassigned'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8 md:col-span-2">No tasks due soon</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trend Tab */}
        {activeTab === 'trend' && completionTrend && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Daily Completion Trend (Last 30 Days)</h3>
            <div className="overflow-x-auto">
              <div className="h-80 flex items-end gap-1 p-4 bg-gray-50 rounded-lg">
                {Object.entries(completionTrend).map(([date, count]) => {
                  const maxCount = Math.max(...Object.values(completionTrend), 1);
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div
                      key={date}
                      className="flex-1 flex flex-col items-center group"
                      title={`${date}: ${count} completed`}
                    >
                      <div className="relative w-full flex items-end justify-center">
                        <div
                          className="w-full bg-indigo-600 rounded-t transition-all hover:bg-indigo-700"
                          style={{ height: `${percentage}%`, minHeight: count > 0 ? '4px' : '0px' }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 mt-2 text-center whitespace-nowrap transform -rotate-45 origin-top-left h-4 w-4 absolute bottom-0">
                        {date.substring(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={fetchHealthData}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            Refresh Metrics
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExecutionHealthDashboard;
