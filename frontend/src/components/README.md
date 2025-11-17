# Component Structure

This directory contains all React components organized by feature/domain.

## Folder Structure

```
components/
├── Auth/              # Authentication & Profile
│   ├── Login.jsx
│   ├── AdminProfile.jsx
│   └── index.js
│
├── Common/            # Shared/Global Components
│   ├── sidebar.jsx
│   ├── dashboard.jsx
│   ├── NotificationContainer.jsx
│   ├── viewlist.jsx
│   └── index.js
│
├── Users/             # User Management
│   ├── users.jsx
│   ├── newuser.jsx
│   ├── UserManagement.jsx
│   └── index.js
│
├── Venues/            # Venue & Beacon Management
│   ├── venues.jsx
│   ├── add_venue.jsx
│   ├── add_beacon.jsx
│   └── index.js
│
├── Scheduling/        # Class Scheduling
│   ├── scheduling.jsx
│   ├── AddNewClass.jsx
│   ├── importschedule.jsx
│   └── index.js
│
├── Reports/           # Attendance Reports
│   └── reports.jsx
│
├── Settings/          # System Settings
│   ├── settings.jsx
│   └── security.jsx
│
├── css/               # Shared Styles
│   ├── Styles.css
│   ├── Login.css
│   ├── Dashboard.css
│   └── ...
│
└── Users/             # Legacy - may contain old sidebar
    └── sidebar.jsx

```

## Import Guidelines

### From App.js or other root files:
```javascript
import { Login, AdminProfile } from './components/Auth';
import { Sidebar, Dashboard } from './components/Common';
import { Users, AddNewUser, UserManagement } from './components/Users';
import { Venues, AddVenue, AddBeacon } from './components/Venues';
import { Scheduling, AddNewClass, ScheduleImport } from './components/Scheduling';
```

### From within component folders:
```javascript
// Importing from same folder
import Sidebar from '../Common/sidebar';

// Importing services/context
import { userAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

// Importing CSS
import '../css/Styles.css';
```

## Component Relationships

### Auth Module
- **Login.jsx** - User authentication
- **AdminProfile.jsx** - Admin profile management

### Common Module
- **sidebar.jsx** - Navigation sidebar (used by all pages)
- **dashboard.jsx** - Main dashboard view
- **NotificationContainer.jsx** - Global notification system
- **viewlist.jsx** - Generic list view component

### Users Module
- **users.jsx** - User list & management
  - Links to: `/add-user`, `/edit-user/:userId`
- **newuser.jsx** - Create new user form
- **UserManagement.jsx** - Edit existing user

### Venues Module
- **venues.jsx** - Venue & beacon list
  - Links to: `/add_venue`, `/add_beacon`
- **add_venue.jsx** - Create new venue
- **add_beacon.jsx** - Register new beacon

### Scheduling Module
- **scheduling.jsx** - Class schedule management
  - Links to: `/add-class`, `/scheduleimport`
- **AddNewClass.jsx** - Create new class schedule
- **importschedule.jsx** - Bulk import schedules (CSV/JSON)

### Reports Module
- **reports.jsx** - Attendance reports & analytics

### Settings Module
- **settings.jsx** - System configuration
- **security.jsx** - Security settings

## Route Mappings

| Route | Component | Module |
|-------|-----------|--------|
| `/login` | Login | Auth |
| `/admin-profile` | AdminProfile | Auth |
| `/dashboard` | Dashboard | Common |
| `/users` | Users | Users |
| `/add-user` | AddNewUser | Users |
| `/edit-user/:userId` | UserManagement | Users |
| `/venues` | Venues | Venues |
| `/add_venue` | AddVenue | Venues |
| `/add_beacon` | AddBeacon | Venues |
| `/scheduling` | Scheduling | Scheduling |
| `/add-class` | AddNewClass | Scheduling |
| `/scheduleimport` | ScheduleImport | Scheduling |
| `/reports` | Reports | Reports |
| `/settings` | Settings | Settings |
| `/security` | Security | Settings |

## Notes

- All components import Sidebar from `Common/sidebar.jsx`
- CSS files remain in the shared `css/` folder
- Services and context are imported from `../../services/` and `../../context/`
- Each module folder has an `index.js` for clean imports
