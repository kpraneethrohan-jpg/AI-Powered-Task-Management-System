import React from "react";
import { Calendar, MessageSquare } from "react-feather";
function KanbanMiniCard({ task, onClick }) {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-400";
    }
  };

  // Safely get the display name for the avatar bubble
  const displayAssignee = task.assignedTo || task.assignee?.username || "U";

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all duration-200 active:scale-95"
    >
      <div className={`w-10 h-1 rounded-full mb-3 ${getPriorityColor(task.priority)}`} />

      <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
        {task.taskname}
      </h5>

      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
        {task.description}
      </p>

      <div className="flex justify-between items-center border-t dark:border-gray-700 pt-2 mt-2">
        <div className="flex items-center text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
           <Calendar size={12} className="mr-1 text-gray-400" />
           {task.deadline}
        </div>

        <div 
          title={`Assigned to ${displayAssignee}`}
          className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-white dark:border-gray-700"
        >
          {displayAssignee.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
}

export default KanbanMiniCard;