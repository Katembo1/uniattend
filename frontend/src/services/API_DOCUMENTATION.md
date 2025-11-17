# API Service Documentation

## Overview
This service handles all HTTP requests to the Flask backend API using Axios.

## Configuration
The API base URL is configured in `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Authentication
All authenticated requests automatically include the JWT token from localStorage in the Authorization header:
```
Authorization: Bearer <token>
```

## Available API Modules

### 1. Authentication (`authAPI`)
```javascript
import { authAPI } from '../services/api';

// Login
const response = await authAPI.login({ email, password });

// Logout
await authAPI.logout();

// Change Password
await authAPI.changePassword({ oldPassword, newPassword });
```

### 2. User Management (`userAPI`)
```javascript
import { userAPI } from '../services/api';

// Get all users (with optional filters)
const users = await userAPI.getAll({ role: 'student', status: 'active' });

// Get user by ID
const user = await userAPI.getById(userId);

// Create user
await userAPI.create(userData);

// Update user
await userAPI.update(userId, userData);

// Delete user
await userAPI.delete(userId);

// Activate/Deactivate
await userAPI.activate(userId);
await userAPI.deactivate(userId);
```

### 3. Student Management (`studentAPI`)
```javascript
import { studentAPI } from '../services/api';

const students = await studentAPI.getAll();
const student = await studentAPI.getById(studentId);
await studentAPI.create(studentData);
await studentAPI.update(studentId, studentData);
await studentAPI.delete(studentId);
```

### 4. Lecturer Management (`lecturerAPI`)
```javascript
import { lecturerAPI } from '../services/api';

const lecturers = await lecturerAPI.getAll();
// ... similar methods as studentAPI
```

### 5. Institutional Hierarchy (`institutionAPI`)
```javascript
import { institutionAPI } from '../services/api';

// Schools
await institutionAPI.schools.getAll();
await institutionAPI.schools.create(data);

// Departments
await institutionAPI.departments.getAll();

// Programs
await institutionAPI.programs.getAll();

// Units
await institutionAPI.units.getAll();
```

### 6. Class/Venue Management (`classAPI`)
```javascript
import { classAPI } from '../services/api';

const classes = await classAPI.getAll();
await classAPI.create(classData);
```

### 7. Beacon Management (`beaconAPI`)
```javascript
import { beaconAPI } from '../services/api';

const beacons = await beaconAPI.getAll();
const unassigned = await beaconAPI.getUnassigned();
await beaconAPI.assign(beaconId, classId);
await beaconAPI.unassign(beaconId);
```

### 8. Timetable Management (`timetableAPI`)
```javascript
import { timetableAPI } from '../services/api';

const timetable = await timetableAPI.getAll();
await timetableAPI.create(timetableData);
await timetableAPI.bulkImport(csvData);
```

### 9. System Settings (`settingsAPI`)
```javascript
import { settingsAPI } from '../services/api';

const settings = await settingsAPI.getAll();
await settingsAPI.update('key', 'value');
await settingsAPI.bulkUpdate(settingsObject);
```

### 10. Audit Logs (`auditAPI`)
```javascript
import { auditAPI } from '../services/api';

const logs = await auditAPI.getAll({ limit: 50 });
const userLogs = await auditAPI.getByUser(userId);
const summary = await auditAPI.getSummary();
```

### 11. Reports & Analytics (`reportsAPI`)
```javascript
import { reportsAPI } from '../services/api';

// Attendance reports
const overall = await reportsAPI.attendance.overall();
const byProgram = await reportsAPI.attendance.byProgram();
const lowStudents = await reportsAPI.attendance.lowStudents();

// Other reports
const lecturerPerf = await reportsAPI.lecturerPerformance();
const classUtil = await reportsAPI.classUtilization();
const beaconStats = await reportsAPI.beaconUsage();

// Export
await reportsAPI.export({ format: 'csv', dateRange: '...' });
```

### 12. Dashboard (`dashboardAPI`)
```javascript
import { dashboardAPI } from '../services/api';

const stats = await dashboardAPI.getStats();
const activity = await dashboardAPI.getRecentActivity({ limit: 10 });
```

### 13. Profile (`profileAPI`)
```javascript
import { profileAPI } from '../services/api';

const profile = await profileAPI.get();
await profileAPI.update(profileData);
const stats = await profileAPI.getStatistics();
```

## Error Handling

All API calls return promises and should be wrapped in try-catch:

```javascript
try {
  const response = await userAPI.getAll();
  console.log(response.data);
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Error:', error.response.data.message);
  } else if (error.request) {
    // Request made but no response
    console.error('No response from server');
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
}
```

## Interceptors

### Request Interceptor
- Automatically adds Authorization header with JWT token
- Token is retrieved from localStorage

### Response Interceptor
- Handles 401 Unauthorized errors globally
- Automatically clears token and redirects to login on 401

## Usage Example

```javascript
import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { useApp } from '../context/AppContext';

function StudentList() {
  const [students, setStudents] = useState([]);
  const { addNotification } = useApp();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      addNotification('Failed to load students', 'error');
    }
  };

  return (
    // ... JSX
  );
}
```
