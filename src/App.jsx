import './App.css'
import { createBrowserRouter, RouterProvider, Navigate, useNavigate } from "react-router-dom";
import Login from "../src/components/Login";
import HomePage from "../src/components/HomePage";
import MyPosts from "../src/components/MyPosts";
import TaskHall from "../src/components/TaskHall";
import Profile from "../src/components/Profile";
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import { useEffect, useState } from 'react';

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    setIsAuthenticated(token && user);
  }, []);
  
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 登录页面组件
const LoginPage = () => {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    // 登录成功后跳转到homepage
    navigate('/homepage');
  };
  
  return (
    <div className={"login-container"}>
      <Login onLogin={handleLogin} />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/homepage",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    )
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: "/my-posts",
    element: (
      <ProtectedRoute>
        <MyPosts />
      </ProtectedRoute>
    )
  },
  {
    path: "/task-hall",
    element: (
      <ProtectedRoute>
        <TaskHall />
      </ProtectedRoute>
    )
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App