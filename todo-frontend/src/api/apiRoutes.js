const BASE_URL =  process.env.REACT_APP_API_BASE_URL
console.log(BASE_URL);
console.log(process.env);
export const API_ROUTES = {    
    LOGIN: `${BASE_URL}/user/login`,
    REGISTER: `${BASE_URL}/user/register`,
    GET_USERS: "/user/all",
    UNREAD_COMMENTS:`${BASE_URL}/comments/unread-map`,

    EMPLOYEE:{
        GET_TASKS:(userId)=> `${BASE_URL}/assigntask/gettask/${userId}`,
        UPDATE_STATUS: `${BASE_URL}/assigntask/updateStatus`,
        VIEW_COMMENTS:(taskId,userId)=> `${BASE_URL}/comments/view/${taskId}/${userId}`,
        GEMINI_QUERY: `${BASE_URL}/api/gemini/ask`,
        
    },

    ADMIN:{
        GEMINI_QUERY: `${BASE_URL}/api/gemini/admin-assistant/ask`,
        GET_TASKS:(userId)=> `${BASE_URL}/assigntask/gettask/${userId}`,
        ASSIGN_TASK:(assigneeId)=> `${BASE_URL}/assigntask/assign/${assigneeId}`, //assigneeid - employee or manager
        UPDATE_TASK:(taskId)=> `${BASE_URL}/assigntask/updateTask/${taskId}`,
        UPDATE_STATUS: `${BASE_URL}/assigntask/updateStatus`,
        DELETE_TASK:(taskId)=> `${BASE_URL}/assigntask/deleteTask/${taskId}`,
        VIEW_COMMENTS:(taskId,userId)=> `${BASE_URL}/comments/view/${taskId}/${userId}`,
        GET_EMPLOYEE_PROFILES: `${BASE_URL}/profile/employees`,
        GET_MANAGER_PROFILES: `${BASE_URL}/profile/managers`,
        GET_PROJECTS: `${BASE_URL}/projects`,
        DELETE_AN_USER:(userId)=> `${BASE_URL}/profile/user/${userId}`,
        GENERATE_EMPLOYEE_REPORT:(employeeId)=> `${BASE_URL}/api/admin/reports/employee/${employeeId}`,
        TOTAL_SUMMARY: `${BASE_URL}/assigntask/totalSummary`,
        TOTAL_EMPLOYEE_SUMMARY: `${BASE_URL}/assigntask/totalEmployeeSummary`,
        TOTAL_MANAGER_SUMMARY: `${BASE_URL}/assigntask/totalManagerSummary`,

        ADD_TASKS_TO_QUEUE:(adminId)=> `${BASE_URL}/api/gemini/automation/add-to-queue?adminId=${adminId}`,
        GET_TASKS_IN_QUEUE:(adminId)=> `${BASE_URL}/api/gemini/automation/get-queue?adminId=${adminId}`,
        DELETE_FROM_QUEUE:(id)=> `${BASE_URL}/api/gemini/automation/queue/${id}`,

        MULTITASK_SUGGESTIONS: `${BASE_URL}/api/gemini/automation/suggest-multi`,
        FINALIZE_ASSIGNMENT: `${BASE_URL}/api/gemini/automation/finalize-assign`,
        AI_AUTOFILL_TASK_DETAILS: `${BASE_URL}/api/gemini/automation/parse-task`,
        TASK_RECOMMENDER: `${BASE_URL}/api/recommend`,
        BULK_USER_UPLOAD: `"${BASE_URL}/admin/bulk-upload-users",`
    },

    MANAGER:{
        GET_TASKS:(userId)=> `${BASE_URL}/assigntask/gettask/${userId}`,
        UPDATE_STATUS: `${BASE_URL}/assigntask/updateStatus`,
        VIEW_COMMENTS:(taskId,userId)=> `${BASE_URL}/comments/view/${taskId}/${userId}`,
        GET_EMPLOYEE_PROFILES: `${BASE_URL}/profile/employees`,
        GET_MANAGER_PROFILES: `${BASE_URL}/profile/managers`,
        GEMINI_QUERY: `${BASE_URL}/api/gemini/ask`,

    },

    NOTIFICATIONS:{
        GET_USER_NOTIFICATIONS:(userId)=> `${BASE_URL}/api/notifications/user/${userId}`,
        MARK_ALL_AS_READ:(userId)=> `${BASE_URL}/api/notifications/mark-all-as-read/${userId}`,
        MARK_ONE_AS_READ:(notificationId)=> `${BASE_URL}/api/notifications/mark-as-read/${notificationId}`,
    },

    PROJECTS:{
        GET_ALL: `${BASE_URL}/projects`,
        GET_ALL_TASKS_OF_A_USER_IN_A_PROJECT:(projectId,userId)=> `${BASE_URL}/assigntask/projects/${projectId}/users/${userId}/tasks`,
        GET_ONE:(projectId)=> `${BASE_URL}/projects/${projectId}`, // project name, description, etc
        GET_ALL_USERS: `${BASE_URL}/user/all`, // for dropdown when creating/updating project
        CREATE: `${BASE_URL}/projects`,
        UPDATE:(projectId)=> `${BASE_URL}/projects/${projectId}`,
        DELETE:(projectId)=> `${BASE_URL}/projects/${projectId}`,
        GOOGLE_MEET:{
            CONNECT:(projectId)=> `${BASE_URL}/meeting/connect-google/${projectId}`,
            SCHEDULE:(projectId)=> `${BASE_URL}/meeting/schedule/${projectId}`,
        },
        UPDATE_STATUS: `${BASE_URL}/assigntask/updateStatus`,
        VIEW_COMMENTS:(taskId,userId)=> `${BASE_URL}/comments/view/${taskId}/${userId}`,
        ASSIGN_TASK:(projectId)=> `${BASE_URL}/assigntask/projects/${projectId}/tasks`,
        UPDATE_TASK: `${BASE_URL}/assigntask/updateTask`,
        DELETE_TASK:(taskId)=> `${BASE_URL}/assigntask/deleteTask/${taskId}`,
    },

    FILE_HANDLING:{
        GET_TASK_FILES:(taskId)=> `${BASE_URL}/api/tasks/${taskId}/files`,
        DOWNLOAD:(fileId)=> `${BASE_URL}/api/files/${fileId}`,
        DELETE:(fileId)=> `${BASE_URL}/api/files/${fileId}`,
    }
  };