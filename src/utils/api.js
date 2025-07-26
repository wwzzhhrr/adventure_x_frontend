// API工具函数，统一处理token过期和错误

// 检查响应是否为401未授权
const isUnauthorized = (response) => {
  return response.status === 401;
};

// 处理token过期，清除本地存储并跳转到登录页
const handleTokenExpired = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  
  // 跳转到登录页
  window.location.href = '/login';
};

// 统一的API请求函数
export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  // 如果没有token，直接跳转到登录页
  if (!token) {
    handleTokenExpired();
    return null;
  }

  // 设置默认headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 合并headers
  const headers = {
    ...defaultHeaders,
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // 检查是否为401未授权
    if (isUnauthorized(response)) {
      handleTokenExpired();
      return null;
    }

    return response;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

// GET请求
export const apiGet = async (url) => {
  return apiRequest(url, { method: 'GET' });
};

// POST请求
export const apiPost = async (url, data) => {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// PUT请求
export const apiPut = async (url, data) => {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

// DELETE请求
export const apiDelete = async (url) => {
  return apiRequest(url, { method: 'DELETE' });
};

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete
};