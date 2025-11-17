import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import '../NotificationContainer.css';

const NotificationItem = ({ notification, onRemove }) => {
  const [progress, setProgress] = useState(100);
  const duration = notification.type === 'error' ? 8000 : notification.type === 'warning' ? 6000 : 5000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div
      className={`notification notification-${notification.type}`}
      onClick={() => onRemove(notification.id)}
    >
      <div className="notification-icon">
        {notification.type === 'success' && '✓'}
        {notification.type === 'error' && '✗'}
        {notification.type === 'warning' && '⚠'}
        {notification.type === 'info' && 'ℹ'}
      </div>
      <div className="notification-message">{notification.message}</div>
      <button
        className="notification-close"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(notification.id);
        }}
      >
        ×
      </button>
      <div 
        className="notification-progress" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;




