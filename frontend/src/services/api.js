import axios from 'axios';

// Base API URL - update this based on your Flask backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 8 seconds timeout to prevent resource overload
});

// Request interceptor to add auth token
//auth 
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✓ Request to:', config.url, 'with Bearer token');
    } else {
      console.warn('⚠ Request to:', config.url, 'WITHOUT token');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    // Only handle 401 if it's NOT a login request
    const isLoginRequest = error.config?.url?.includes('/login');
    
    if (error.response?.status === 401 && !isLoginRequest) {
      // Unauthorized - clear token and redirect to login
      console.warn('⚠ 401 Unauthorized - Token invalid or expired');
      
      // Clear all auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Clear session storage as well
      sessionStorage.clear();
      
      // Show notification if available
      if (window.showNotification) {
        window.showNotification('Session expired. Please login again.', 'error');
      }
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        // Force a full page reload to reset all state
        window.location.replace('/login');
      }
    }
    
    return Promise.reject(error);
  }
);

// ==================== HEALTH CHECK ====================
export const healthAPI = {
  check: () => apiClient.get('/health', { timeout: 5000 }), // 5 second timeout for health check
};

// ==================== AUTHENTICATION ====================
export const authAPI = {
  login: (credentials) => apiClient.post('/admin/auth/login', credentials),
  logout: () => apiClient.post('/admin/auth/logout'),
  changePassword: (data) => apiClient.post('/admin/auth/change-password', data),
};

// ==================== ADMIN MANAGEMENT ====================
export const adminAPI = {
  getAll: () => apiClient.get('/admin/admins'),
  getById: (adminId) => apiClient.get(`/admin/admins/${adminId}`),
  create: (data) => apiClient.post('/admin/admins', data),
  update: (adminId, data) => apiClient.put(`/admin/admins/${adminId}`, data),
  delete: (adminId) => apiClient.delete(`/admin/admins/${adminId}`),
  getByRole: (role) => apiClient.get(`/admin/admins/role/${role}`),
  updatePermissions: (adminId, permissions) => 
    apiClient.put(`/admin/admins/${adminId}/permissions`, permissions),
};

// ==================== USER MANAGEMENT ====================
export const userAPI = {
  getAll: (params) => apiClient.get('/admin/users', { params }),
  getById: (userId) => apiClient.get(`/admin/users/${userId}`),
  create: (data) => apiClient.post('/admin/users', data),
  update: (userId, data) => apiClient.put(`/admin/users/${userId}`, data),
  delete: (userId) => apiClient.delete(`/admin/users/${userId}`),
  activate: (userId) => apiClient.put(`/admin/users/${userId}/activate`),
  deactivate: (userId) => apiClient.put(`/admin/users/${userId}/deactivate`),
};

// ==================== STUDENT MANAGEMENT ====================
export const studentAPI = {
  getAll: (params) => apiClient.get('/admin/students', { params }),
  getById: (studentId) => apiClient.get(`/admin/students/${studentId}`),
  create: (data) => apiClient.post('/admin/students', data),
  update: (studentId, data) => apiClient.put(`/admin/students/${studentId}`, data),
  delete: (studentId) => apiClient.delete(`/admin/students/${studentId}`),
};

// ==================== LECTURER MANAGEMENT ====================
export const lecturerAPI = {
  getAll: (params) => apiClient.get('/admin/lecturers', { params }),
  getById: (lecturerId) => apiClient.get(`/admin/lecturers/${lecturerId}`),
  create: (data) => apiClient.post('/admin/lecturers', data),
  update: (lecturerId, data) => apiClient.put(`/admin/lecturers/${lecturerId}`, data),
  delete: (lecturerId) => apiClient.delete(`/admin/lecturers/${lecturerId}`),
};

// ==================== INSTITUTIONAL HIERARCHY ====================
export const institutionAPI = {
  // Schools
  schools: {
    getAll: () => apiClient.get('/admin/schools'),
    create: (data) => apiClient.post('/admin/schools', data),
    update: (schoolId, data) => apiClient.put(`/admin/schools/${schoolId}`, data),
    delete: (schoolId) => apiClient.delete(`/admin/schools/${schoolId}`),
  },
  
  // Departments
  departments: {
    getAll: (params) => apiClient.get('/admin/departments', { params }),
    create: (data) => apiClient.post('/admin/departments', data),
    update: (deptId, data) => apiClient.put(`/admin/departments/${deptId}`, data),
    delete: (deptId) => apiClient.delete(`/admin/departments/${deptId}`),
  },
  
  // Programs
  programs: {
    getAll: (params) => apiClient.get('/admin/programs', { params }),
    create: (data) => apiClient.post('/admin/programs', data),
    update: (programId, data) => apiClient.put(`/admin/programs/${programId}`, data),
    delete: (programId) => apiClient.delete(`/admin/programs/${programId}`),
  },
  
  // Units
  units: {
    getAll: (params) => apiClient.get('/admin/units', { params }),
    create: (data) => apiClient.post('/admin/units', data),
    update: (unitId, data) => apiClient.put(`/admin/units/${unitId}`, data),
    delete: (unitId) => apiClient.delete(`/admin/units/${unitId}`),
  },
};

// ==================== VENUE/CLASS MANAGEMENT ====================
export const classAPI = {
  getAll: (params) => apiClient.get('/admin/venues', { params }),
  getById: (classId) => apiClient.get(`/admin/venues/${classId}`),
  create: (data) => apiClient.post('/admin/venues', data),
  update: (classId, data) => apiClient.put(`/admin/venues/${classId}`, data),
  delete: (classId) => apiClient.delete(`/admin/venues/${classId}`),
};

// ==================== BEACON MANAGEMENT ====================
export const beaconAPI = {
  getAll: (params) => apiClient.get('/admin/beacons', { params }),
  getById: (beaconId) => apiClient.get(`/admin/beacons/${beaconId}`),
  create: (data) => apiClient.post('/admin/beacons/register', data),
  update: (beaconId, data) => apiClient.put(`/admin/beacons/${beaconId}`, data),
  delete: (beaconId) => apiClient.delete(`/admin/beacons/${beaconId}`),
  getUnassigned: () => apiClient.get('/admin/beacons/unassigned'),
  assign: (beaconId, classId) => apiClient.post(`/admin/beacons/${beaconId}/assign`, { classId }),
  unassign: (beaconId) => apiClient.delete(`/admin/beacons/${beaconId}/unassign`),
};

// ==================== TIMETABLE MANAGEMENT ====================
export const timetableAPI = {
  getAll: (params) => apiClient.get('/admin/timetable', { params }),
  getById: (timetableId) => apiClient.get(`/admin/timetable/${timetableId}`),
  create: (data) => apiClient.post('/admin/timetable', data),
  update: (timetableId, data) => apiClient.put(`/admin/timetable/${timetableId}`, data),
  delete: (timetableId) => apiClient.delete(`/admin/timetable/${timetableId}`),
  bulkImport: (data) => apiClient.post('/admin/timetable/import', data),
  importFile: (formData) => apiClient.post('/admin/timetable/import-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// ==================== SYSTEM SETTINGS ====================
export const settingsAPI = {
  getAll: () => apiClient.get('/admin/settings'),
  getByKey: (key) => apiClient.get(`/admin/settings/${key}`),
  update: (key, value) => apiClient.put(`/admin/settings/${key}`, { value }),
  bulkUpdate: (settings) => apiClient.post('/admin/settings/bulk', settings),
  initialize: () => apiClient.post('/admin/settings/initialize'),
};

// ==================== AUDIT LOGS ====================
export const auditAPI = {
  getAll: (params) => apiClient.get('/admin/audit-logs', { params }),
  getByUser: (userId, params) => apiClient.get(`/admin/audit-logs/user/${userId}`, { params }),
  getByEntity: (type, id, params) => 
    apiClient.get(`/admin/audit-logs/entity/${type}/${id}`, { params }),
  search: (query) => apiClient.get('/admin/audit-logs/search', { params: query }),
  getSummary: (params) => apiClient.get('/admin/audit-logs/summary', { params }),
};

// ==================== REPORTS & ANALYTICS ====================
export const reportsAPI = {
  attendance: {
    overall: (params) => apiClient.get('/admin/reports/attendance/overall', { params }),
    byProgram: (params) => apiClient.get('/admin/reports/attendance/by-program', { params }),
    byUnit: (params) => apiClient.get('/admin/reports/attendance/by-unit', { params }),
    lowStudents: (params) => apiClient.get('/admin/reports/attendance/low-students', { params }),
  },
  
  lecturerPerformance: (params) => 
    apiClient.get('/admin/reports/lecturer-performance', { params }),
  
  classUtilization: (params) => 
    apiClient.get('/admin/reports/class-utilization', { params }),
  
  beaconUsage: (params) => 
    apiClient.get('/admin/reports/beacon-usage', { params }),
  
  dailyTrends: (params) => 
    apiClient.get('/admin/reports/daily-trends', { params }),
  
  studentDetailed: (studentId, params) => 
    apiClient.get(`/admin/reports/student/${studentId}`, { params }),
  
  export: (data) => 
    apiClient.post('/admin/reports/export', data, { responseType: 'blob' }),
};

// ==================== DASHBOARD STATS ====================
export const dashboardAPI = {
  getStats: () => apiClient.get('/admin/dashboard/stats'),
  getRecentActivity: (params) => apiClient.get('/admin/dashboard/recent-activity', { params }),
  deleteActivity: (logId) => apiClient.delete(`/admin/dashboard/activity/${logId}`),
  getTodayClasses: () => apiClient.get('/admin/dashboard/today-classes'),
};

// ==================== PROFILE ====================
export const profileAPI = {
  get: () => apiClient.get('/admin/profile'),
  update: (data) => apiClient.put('/admin/profile', data),
  getStatistics: () => apiClient.get('/admin/profile/statistics'),
};

// Export the axios instance for custom requests
export default apiClient;
