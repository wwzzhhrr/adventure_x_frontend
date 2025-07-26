import React from 'react';
import { createRoot } from 'react-dom/client';
import Notification from '../components/Notification';

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.container = null;
    this.root = null;
    this.init();
  }

  init() {
    // 创建通知容器
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
    this.root = createRoot(this.container);
  }

  show(message, type = 'info', duration = 3000) {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      duration
    };

    this.notifications.push(notification);
    this.render();

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.render();
  }

  clear() {
    this.notifications = [];
    this.render();
  }

  render() {
    const notificationElements = this.notifications.map((notification, index) => (
      React.createElement(Notification, {
        key: notification.id,
        message: notification.message,
        type: notification.type,
        duration: 0, // 由管理器控制持续时间
        onClose: () => this.remove(notification.id),
        style: {
          top: `${20 + index * 60}px`,
          pointerEvents: 'auto'
        }
      })
    ));

    this.root.render(
      React.createElement('div', null, ...notificationElements)
    );
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 3500) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
}

// 创建全局实例
const notificationManager = new NotificationManager();

export default notificationManager;