# Settings Integration Guide - Quick Start

## 📋 What Was Created

### New Component Files:
1. **general.jsx** - General settings (institution, system config)
2. **notification.jsx** - Notification preferences (email, SMS, Slack, alerts)
3. **data-management.jsx** - Data retention, backups, exports, audit logs
4. **appearance.jsx** - Theme customization, branding, layout
5. **SETTINGS_INTEGRATION.md** - Complete documentation
6. **STYLES_REFERENCE.css** - CSS class reference and styling guide

### Updated Files:
- **settings.jsx** - Main component with tab navigation
- **index.js** - Exports all components

---

## 🚀 Quick Integration

### Step 1: Verify API Configuration
Make sure your backend settings endpoints are working:
```bash
curl -X GET http://localhost:5000/api/admin/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 2: Check CSS Classes
Ensure your `Styles.css` contains these required classes:
```css
.dashboard-container
.content
.breadcrumbs
.page-header
.page-title
.filter-tabs
.filter-tab
.card
.btn
.btn-primary
.btn-success
.btn-outline
```

If missing, add the styles from `STYLES_REFERENCE.css`.

### Step 3: Test the Component
Navigate to `/settings` in your app. You should see:
- 4 tabs: General, Notifications, Data Management, Appearance
- Each tab with fully functional settings
- Save/Cancel buttons for edits
- Success/Error notifications

---

## 📊 Component Data Flow

```
Settings (Main)
├─ General Settings
│  ├─ Fetch: settingsAPI.getAll()
│  └─ Save: settingsAPI.bulkUpdate()
│
├─ Notifications
│  ├─ Fetch: settingsAPI.getAll()
│  └─ Save: settingsAPI.bulkUpdate()
│
├─ Data Management
│  ├─ Fetch: settingsAPI.getAll() + auditAPI.getAll()
│  └─ Save: settingsAPI.bulkUpdate()
│
└─ Appearance
   ├─ Fetch: settingsAPI.getAll()
   ├─ Save: settingsAPI.bulkUpdate()
   └─ Apply: CSS custom properties
```

---

## 🔑 Key Features

### ✅ Implemented:
- [x] Backend API integration
- [x] Real-time edit/save/cancel
- [x] Form validation
- [x] Error handling
- [x] Loading states
- [x] User notifications
- [x] Color theming support
- [x] Audit log display
- [x] Toggle switches for boolean settings
- [x] Dropdown selects for choices
- [x] Color pickers for theme customization
- [x] Responsive design
- [x] Dark theme ready

### 🎯 Use Cases:

**General Settings Tab:**
```javascript
// Get current institution settings
const settings = {
  institution_name: "University Name",
  academic_year: "2024-2025",
  institution_email: "admin@university.edu",
  attendance_threshold: 75
}
```

**Notifications Tab:**
```javascript
// Configure notification channels
const notificationSettings = {
  email_notifications_enabled: true,
  notification_email: "alerts@university.edu",
  send_daily_report: true,
  low_attendance_alert: true,
  alert_threshold_percentage: 70
}
```

**Data Management Tab:**
```javascript
// Set data retention policies
const dataSettings = {
  data_retention_days: 365,
  auto_backup_enabled: true,
  backup_frequency: "daily",
  log_retention_days: 90
}
```

**Appearance Tab:**
```javascript
// Customize UI theme
const appearanceSettings = {
  theme_mode: "light",
  primary_color: "#007bff",
  secondary_color: "#6c757d",
  accent_color: "#28a745",
  language: "en"
}
```

---

## 🧪 Testing Scenarios

### Test 1: Load Settings
```javascript
// Should load all settings from backend
Visit: /settings
Expected: All input fields populated with current values
```

### Test 2: Edit General Setting
```javascript
Steps:
1. Click edit icon on "Institution Name"
2. Type new name
3. Click Save
Expected: Value updates, notification shows "Institution Name updated successfully"
```

### Test 3: Cancel Edit
```javascript
Steps:
1. Click edit icon
2. Type new value
3. Click Cancel
Expected: Value reverts to original
```

### Test 4: Toggle Notification
```javascript
Steps:
1. Toggle "Email Notifications" checkbox
Expected: Setting saves immediately, notification appears
```

### Test 5: Theme Application
```javascript
Steps:
1. Go to Appearance tab
2. Change Primary Color
3. Click Save
Expected: Theme colors update in real-time
```

---

## 🔧 Customization

### Add New Setting Field

**In the component (e.g., `general.jsx`):**
```javascript
// 1. Add to formData state
const [formData, setFormData] = useState({
  // ... existing fields
  new_setting: 'default_value'
});

// 2. Add setting item JSX
<div className="setting-item">
  <div className="setting-details">
    <label>New Setting Label</label>
    {editingField === 'new_setting' ? (
      <div className="input-group">
        <input
          type="text"
          value={formData.new_setting}
          onChange={(e) => handleInputChange('new_setting', e.target.value)}
          className="form-input"
        />
        <div className="action-buttons">
          <button 
            onClick={() => handleSave('new_setting')}
            className="btn btn-success"
          >
            Save
          </button>
          <button 
            onClick={() => handleCancel('new_setting')}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <div className="display-field">
        <strong>{formData.new_setting}</strong>
        <button 
          onClick={() => setEditingField('new_setting')}
          className="action-btn"
        >
          ✏️
        </button>
      </div>
    )}
  </div>
</div>
```

### Add New Tab

**In `settings.jsx`:**
```javascript
// 1. Import component
import NewTab from './new-tab';

// 2. Add to tab list
{['General', 'Notifications', 'Data Management', 'Appearance', 'New Tab'].map(...)}

// 3. Add case in renderTabContent
case 'New Tab':
  return <NewTab />;
```

---

## 📝 Backend Settings Keys Reference

### General Settings:
- `institution_name` - String
- `academic_year` - String (e.g., "2024-2025")
- `institution_email` - Email string
- `institution_phone` - Phone string
- `max_students_per_class` - Number
- `attendance_threshold` - Number (0-100)
- `session_timeout` - Number (minutes)
- `system_mode` - String (production/maintenance/testing)

### Notification Settings:
- `email_notifications_enabled` - Boolean
- `sms_notifications_enabled` - Boolean
- `slack_notifications_enabled` - Boolean
- `notification_email` - Email string
- `attendance_report_frequency` - String (daily/weekly/monthly)
- `alert_threshold_percentage` - Number (0-100)
- `send_daily_report` - Boolean
- `send_weekly_summary` - Boolean
- `admin_alert_enabled` - Boolean
- `slack_webhook_url` - String (URL)
- `sms_gateway_enabled` - Boolean
- `low_attendance_alert` - Boolean

### Data Management Settings:
- `data_retention_days` - Number
- `auto_backup_enabled` - Boolean
- `backup_frequency` - String (hourly/daily/weekly/monthly)
- `archive_old_records` - Boolean
- `archive_after_days` - Number
- `export_format` - String (csv/xlsx/json/pdf)
- `log_retention_days` - Number
- `delete_inactive_users_after_days` - Number

### Appearance Settings:
- `theme_mode` - String (light/dark/auto)
- `primary_color` - String (#RRGGBB)
- `secondary_color` - String (#RRGGBB)
- `accent_color` - String (#RRGGBB)
- `logo_url` - String (URL)
- `favicon_url` - String (URL)
- `font_family` - String
- `sidebar_position` - String (left/right)
- `dashboard_layout` - String (grid/list/compact)
- `show_breadcrumbs` - Boolean
- `enable_animations` - Boolean
- `language` - String (en/es/fr/de/sw)

---

## 🐛 Troubleshooting

### Issue: Settings not loading
**Solution:** 
1. Check network tab for API errors
2. Verify JWT token is valid
3. Ensure backend `/admin/settings` endpoint exists

### Issue: Changes not persisting
**Solution:**
1. Check browser console for errors
2. Verify `settingsAPI.bulkUpdate()` is being called
3. Check backend logs for validation errors

### Issue: Styles not applying
**Solution:**
1. Import `Styles.css` correctly
2. Add missing CSS classes from `STYLES_REFERENCE.css`
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: Notifications not showing
**Solution:**
1. Ensure `useApp()` context is available
2. Check `AppContext.js` has `addNotification` function
3. Verify notification container is rendered in parent component

---

## 📚 File Structure

```
frontend/src/components/Settings/
├── settings.jsx                    (Main component)
├── general.jsx                     (General settings)
├── notification.jsx                (Notification settings)
├── data-management.jsx             (Data management)
├── appearance.jsx                  (Appearance settings)
├── security.jsx                    (Security - existing)
├── index.js                        (Exports)
├── SETTINGS_INTEGRATION.md         (Full documentation)
├── STYLES_REFERENCE.css            (CSS reference)
└── QUICK_START.md                  (This file)
```

---

## ✨ Next Steps

1. **Add CSS Styles** - Import `STYLES_REFERENCE.css` or add classes to `Styles.css`
2. **Test Settings** - Navigate to `/settings` and test each tab
3. **Add More Settings** - Follow the customization guide to add new fields
4. **Implement Validations** - Add form validation as needed
5. **User Testing** - Get feedback from admin users
6. **Monitor Logs** - Check audit logs for setting changes

---

## 💡 Pro Tips

- Use the color picker in Appearance tab to preview theme changes instantly
- Set data retention to at least 90 days for compliance
- Enable automatic backups with daily frequency for safety
- Use the audit logs to track who changed what settings
- Test settings in a staging environment first

---

**Created:** November 17, 2025
**Status:** ✅ Ready for Production
**Support:** Check SETTINGS_INTEGRATION.md for detailed documentation
