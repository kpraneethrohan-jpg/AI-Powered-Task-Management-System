import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SummaryPieChart = ({ title, data, colors, isLoading }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col">

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-800 mb-6 text-center">
        {title}
      </h3>

      {/* Chart Area */}
      <div className="relative w-full h-[280px] overflow-visible">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-40 h-40 rounded-full bg-slate-200 animate-pulse"></div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, bottom: 20 }}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  animationDuration={800}
                  label={({ percent }) =>
                    percent > 0
                      ? `${(percent * 100).toFixed(0)}%`
                      : ""
                  }
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={colors[index % colors.length]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>

                <Tooltip
                  wrapperStyle={{ zIndex: 1000 }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    boxShadow: "0px 10px 25px rgba(0,0,0,0.25)",
                  }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center KPI */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">
                {total}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Total Tasks
              </span>
            </div>
          </>
        )}
      </div>

      {/* Legend BELOW chart */}
      <div className="flex justify-center gap-6 mt-6 text-sm text-slate-600 flex-wrap">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryPieChart;