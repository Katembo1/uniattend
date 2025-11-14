# Activities Feature Documentation

## Overview
The Activities feature provides a comprehensive view of all system activities tracked through the audit log system. Users can view, filter, search, mark as complete, and delete activities.

## Features

### 1. **View All Activities**
- Displays all activities from the audit log in a paginated list
- Shows activity icon, description, user, entity type, and timestamp
- Color-coded by action type (create, update, delete, login, logout)

### 2. **Search & Filter**
- **Search**: Search activities by description, entity type, username, or action type
- **Filter by Type**: Filter activities by action type (create, update, delete, login, logout)
- **Real-time Updates**: Results update instantly as you type

### 3. **Activity Management**
- **Check/Complete**: Mark activities as complete with a checkbox
- **Undo**: Unmark completed activities
- **Delete**: Remove activities from the system (with confirmation)
- **Batch Operations**: Complete multiple activities individually

### 4. **Activity States**
- **Active**: Default state, full opacity
- **Completed**: Grayed out with strikethrough text
- **Color Coding**:
  - 🟢 Green: Create actions
  - 🔵 Blue: Update actions
  - 🔴 Red: Delete actions
  - 🟣 Purple: Login/Logout actions

### 5. **Pagination**
- 20 activities per page (configurable)
- Shows total count and current range
- Previous/Next navigation

### 6. **Empty State**
- Helpful message when no activities exist
- Quick action buttons to create users or venues
- Adjusted message when filters produce no results

## Component Structure

```
frontend/src/components/Common/
├── activities.jsx         # Main activities component
└── css/
    └── Activities.css     # Dedicated styles
```

## Backend Endpoints

### Get Recent Activity
```
GET /api/admin/dashboard/recent-activity
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20)

**Response:**
```json
{
  "items": [
    {
      "id": 123,
      "action_type": "create",
      "entity_type": "user",
      "entity_id": 45,
      "description": "Created new user: john@example.com",
      "user_id": 1,
      "username": "admin",
      "user_email": "admin@uniattend.com",
      "created_at": "2025-11-14T10:30:00",
      "completed": false
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 8,
  "per_page": 20
}
```

### Delete Activity
```
DELETE /api/admin/dashboard/activity/{log_id}
```
**Response:**
```json
{
  "message": "Activity deleted successfully"
}
```

## Usage

### Accessing Activities
1. From Dashboard: Click "View All" button in Recent Activity section
2. Direct URL: Navigate to `/activities`

### Managing Activities
1. **Mark Complete**: Click checkbox or "Complete" button
2. **Undo Complete**: Click "Undo" button on completed activities
3. **Delete**: Click trash icon, confirm in modal

### Searching & Filtering
1. **Search**: Type in search box (searches description, entity, user, action)
2. **Filter**: Select action type from dropdown
3. **Clear**: Clear search box or select "All Types"

## API Integration

### Frontend Service
```javascript
// In services/api.js
export const dashboardAPI = {
  getRecentActivity: (params) => 
    apiClient.get('/admin/dashboard/recent-activity', { params }),
  deleteActivity: (logId) => 
    apiClient.delete(`/admin/dashboard/activity/${logId}`),
};
```

### Component Usage
```javascript
import { dashboardAPI } from '../../services/api';

// Fetch activities
const response = await dashboardAPI.getRecentActivity({
  page: 1,
  per_page: 20
});

// Delete activity
await dashboardAPI.deleteActivity(activityId);
```

## Styling

### Color Scheme
- **Success (Create)**: `#28a745`
- **Info (Update)**: `#17a2b8`
- **Danger (Delete)**: `#dc3545`
- **Primary (Login/Logout)**: `#007bff`
- **Secondary (Other)**: `#6c757d`

### Responsive Design
- **Desktop**: Multi-column layout with side-by-side actions
- **Tablet**: Adjusted spacing and font sizes
- **Mobile**: Stacked layout with full-width elements

## Activity Icons
- 👤 User (create/update user, student, lecturer)
- 🏛️ Venue/Class (create/update venue)
- 📡 Beacon (create/update beacon)
- 📅 Timetable (create/update schedule)
- ✏️ Update (generic update)
- 🗑️ Delete (delete action)
- 🔐 Login (user login)
- 🚪 Logout (user logout)
- 📊 Attendance (attendance tracking)
- ➕ Create (generic create)

## State Management

### Local State
```javascript
const [activities, setActivities] = useState([]);
const [completedActivities, setCompletedActivities] = useState(new Set());
const [pagination, setPagination] = useState({...});
const [searchTerm, setSearchTerm] = useState('');
const [filterType, setFilterType] = useState('all');
```

### Completed Activities
- Stored in a Set for O(1) lookup
- Persists during session (not saved to backend)
- Visual-only state for activity tracking

## Navigation

### Routes
```javascript
<Route path="/activities" element={<Activities />} />
```

### Navigation Links
- Back button: Returns to dashboard
- Dashboard "View All" button: Links to activities

## Error Handling

### Loading States
- Displays spinner while fetching
- Handles empty results gracefully
- Shows appropriate messages

### Error Messages
- Network errors: Shows notification
- Delete failures: Displays error message
- Pagination errors: Falls back to page 1

## Performance Considerations

1. **Pagination**: Only loads 20 items at a time
2. **Client-side Filtering**: Fast search/filter with no API calls
3. **Optimistic Updates**: Immediate UI feedback on actions
4. **Lazy Loading**: Activities fetch on mount and page change

## Future Enhancements

1. **Bulk Operations**: Select multiple activities for batch delete
2. **Export**: Download activities as CSV/PDF
3. **Advanced Filters**: Date range, user filter, entity filter
4. **Activity Details**: Expandable row for full activity data
5. **Persistent Complete State**: Save completed activities to backend
6. **Real-time Updates**: WebSocket for live activity feed
7. **Activity Analytics**: Charts showing activity trends

## Troubleshooting

### Activities Not Loading
- Check backend server is running
- Verify JWT token is valid
- Check browser console for errors
- Verify audit log table has data

### Delete Not Working
- Ensure user has admin permissions
- Check network tab for 401/403 errors
- Verify endpoint URL is correct

### Search Not Working
- Check if activities array is populated
- Verify searchTerm state is updating
- Console log filtered results

## Related Files

**Frontend:**
- `frontend/src/components/Common/activities.jsx`
- `frontend/src/components/Common/dashboard.jsx`
- `frontend/src/components/css/Activities.css`
- `frontend/src/services/api.js`
- `frontend/src/App.js`

**Backend:**
- `backend/app/routes.py` (dashboard routes)
- `backend/app/models.py` (AuditLog model)

## Testing Checklist

- [ ] Activities load on page mount
- [ ] Pagination works correctly
- [ ] Search filters activities
- [ ] Type filter works
- [ ] Check/uncheck activities
- [ ] Undo completed activities
- [ ] Delete confirmation modal appears
- [ ] Delete removes activity
- [ ] Empty state displays correctly
- [ ] Back button returns to dashboard
- [ ] Responsive design on mobile
- [ ] Error messages display properly
- [ ] Loading states work
- [ ] Color coding is correct
- [ ] Icons display properly
- [ ] Time formatting is correct

---

**Created**: November 14, 2025  
**Version**: 1.0.0  
**Author**: UniAttend Development Team
