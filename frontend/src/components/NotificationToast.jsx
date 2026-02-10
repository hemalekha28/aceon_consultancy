import React from 'react';
import { FiX, FiCheck, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { useNotification } from '../context/notificationContext';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheck size={18} />;
      case 'error':
        return <FiAlertCircle size={18} />;
      case 'warning':
        return <FiAlertTriangle size={18} />;
      default:
        return <FiInfo size={18} />;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          background: 'var(--gradient-blue-medium)',
          color: 'white'
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, #FF4B2B 0%, #FF416C 100%)',
          color: 'white'
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
          color: 'white'
        };
      default:
        return {
          background: 'var(--gradient-blue-light)',
          color: 'white'
        };
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            ...getTypeStyles(notification.type),
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease-out',
            position: 'relative'
          }}
        >
          <div style={{ flexShrink: 0 }}>
            {getIcon(notification.type)}
          </div>

          <div style={{ flex: 1, fontSize: '14px', lineHeight: '1.4' }}>
            {notification.message}
          </div>

          <button
            onClick={() => removeNotification(notification.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'currentColor',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.8,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.8'}
          >
            <FiX size={16} />
          </button>
        </div>
      ))}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationToast;