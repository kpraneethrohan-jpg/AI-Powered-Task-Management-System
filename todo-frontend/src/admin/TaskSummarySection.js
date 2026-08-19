import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SummaryPieChart from './SummaryPieChart';
import { API_ROUTES } from '../api/apiRoutes';

// // Define theme-consistent colors for the charts
const STATUS_COLORS = ["#38bdf8", "#f59e0b", "#10b981"];

// // A helper function to process the raw data from the backend
const processSummaryData = (rawData) => {
	if (!Array.isArray(rawData) || rawData.length < 4) {
		return [{ name: 'To Do', value: 0 }, { name: 'In Progress', value: 0 }, { name: 'Done', value: 0 }];
	}
	return [
		{ name: 'To Do', value: rawData[1] },
		{ name: 'In Progress', value: rawData[2] },
		{ name: 'Done', value: rawData[3] },
	];
};


function TaskSummarySection() {
	const [summaryData, setSummaryData] = useState({ total: [], employee: [], manager: [] });
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchSummaries = async () => {
			const token = localStorage.getItem('token');
			if (!token) {
				setIsLoading(false);
				return;
			}
			const headers = { Authorization: `Bearer ${token}` };

			try {
				const [totalRes, employeeRes, managerRes] = await Promise.all([
					axios.get(API_ROUTES.ADMIN.TOTAL_SUMMARY, { headers }),
					axios.get(API_ROUTES.ADMIN.TOTAL_EMPLOYEE_SUMMARY, { headers }),
					axios.get(API_ROUTES.ADMIN.TOTAL_MANAGER_SUMMARY, { headers }),
				]);

				setSummaryData({
					total: processSummaryData(totalRes.data),
					employee: processSummaryData(employeeRes.data),
					manager: processSummaryData(managerRes.data),
				});

			} catch (error) {
				console.error("Error fetching task summaries:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSummaries();
	}, []);

	return (
	<div className="w-full p-6 md:p-8">
	<div className="flex flex-col space-y-6">

				<div>
					<h1 className="text-3xl font-bold text-slate-800">Task Summary</h1>
					<p className="text-slate-500 mt-1">An overview of task distribution across the organization.</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<SummaryPieChart title="Overall Task Distribution" data={summaryData.total} colors={STATUS_COLORS} isLoading={isLoading} />
					<SummaryPieChart title="Employee Task Summary" data={summaryData.employee} colors={STATUS_COLORS} isLoading={isLoading} />
					<SummaryPieChart title="Manager Task Summary" data={summaryData.manager} colors={STATUS_COLORS} isLoading={isLoading} />
				</div>
        
			</div>
		</div>
	);
}

export default TaskSummarySection;