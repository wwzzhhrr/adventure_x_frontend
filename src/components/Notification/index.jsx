import React, { useState, useEffect } from 'react';
import styles from './index.module.css';

const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose && onClose(), 300); // 等待动画完成
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  return (
    <div className={`${styles.notification} ${styles[type]} ${visible ? styles.show : styles.hide}`}>
      <div className={styles.icon}>{getIcon()}</div>
      <div className={styles.message}>{message}</div>
      <button 
        className={styles.closeBtn} 
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose && onClose(), 300);
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Notification;