import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Avatar, Typography, Divider, Space, Tag, Modal, Input, Toast } from '@douyinfe/semi-ui';
import { IconArrowLeft, IconUser, IconSetting, IconCalendar, IconEdit, IconExit } from '@douyinfe/semi-icons';
import { apiGet, apiPut } from '../../utils/api';
import styles from './index.module.css';

const { Title, Text } = Typography;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalEarnings: 0,
    totalSpent: 0
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ username: '', email: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    loadUserStats();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const response = await apiGet('http://127.0.0.1:8000/api/auth/me');
      if (response && response.ok) {
        const data = await response.json();
        setUser(data);
        setEditFormData({ username: data.username, email: data.email });
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setEditFormData({
            username: parsedUser.username,
            email: parsedUser.email
          });
        }
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
      Toast.error('加载用户数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // 获取用户统计数据
      const response = await apiGet('http://127.0.0.1:8000/api/users/stats');
      
      if (!response) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const handleEditProfile = async () => {
    // Basic validation
    if (!editFormData.username || !editFormData.email) {
      Toast.error('请填写所有必填字段');
      return;
    }
    
    if (editFormData.username.length < 2 || editFormData.username.length > 20) {
      Toast.error('用户名长度应在2-20个字符之间');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      Toast.error('请输入有效的邮箱地址');
      return;
    }

    try {
      const response = await apiPut('http://127.0.0.1:8000/api/users/profile', editFormData);
      
      if (!response) {
        return;
      }

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        Toast.success('个人信息更新成功');
        setShowEditModal(false);
      } else {
        const error = await response.json();
        Toast.error(error.detail || '更新失败');
      }
    } catch (error) {
      console.error('更新个人信息失败:', error);
      Toast.error('网络错误，请稍后重试');
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      onOk: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    });
  };

  const handleGoBack = () => {
    navigate('/homepage');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Text>加载中...</Text>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.errorContainer}>
        <Text>用户信息加载失败</Text>
        <Button onClick={handleGoBack}>返回首页</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Button 
          icon={<IconArrowLeft />} 
          onClick={handleGoBack}
          type="tertiary"
          className={styles.backButton}
        >
          返回
        </Button>
        <Title heading={3} className={styles.title}>我的</Title>
        <Button 
          icon={<IconExit />} 
          onClick={handleLogout}
          type="tertiary"
          className={styles.logoutButton}
        >
          退出
        </Button>
      </div>

      <div className={styles.content}>
        {/* 用户信息卡片 */}
        <Card className={styles.userCard}>
          <div className={styles.userInfo}>
            <Avatar 
              size="large" 
              className={styles.avatar}
              style={{ backgroundColor: '#1890ff' }}
            >
              {user.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <div className={styles.userDetails}>
              <Title heading={4} className={styles.username}>
                {user.username}
              </Title>
              <Text type="secondary" className={styles.email}>
                {user.email}
              </Text>
              <div className={styles.joinDate}>
                <IconCalendar size="small" />
                <Text type="tertiary" size="small">
                  加入时间: {formatDate(user.created_at || new Date())}
                </Text>
              </div>
              <div className={styles.walletInfo}>
                <Text type="secondary" className={styles.walletAddress}>
                  钱包地址: {user.wallet_address}
                </Text>
                <Text type="secondary" className={styles.balance}>
                  余额: {user.balance}
                </Text>
              </div>
            </div>
            <Button 
              icon={<IconEdit />} 
              onClick={() => {
                setEditFormData({
                  username: user.username,
                  email: user.email
                });
                setShowEditModal(true);
              }}
              type="tertiary"
              className={styles.editButton}
            >
              编辑
            </Button>
          </div>
        </Card>

        {/* 统计数据卡片 */}
        <Card className={styles.statsCard}>
          <Title heading={5} className={styles.sectionTitle}>
            📊 我的统计
          </Title>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.totalTasks}</div>
              <Text type="secondary" size="small">发布任务</Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.completedTasks}</div>
              <Text type="secondary" size="small">完成任务</Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                <img src="/favicon11.svg" alt="coin" className={styles.coinIcon} />
                <span>{stats.totalEarnings}</span>
              </div>
              <Text type="secondary" size="small">总收入</Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                <img src="/favicon11.svg" alt="coin" className={styles.coinIcon} />
                <span>{stats.totalSpent}</span>
              </div>
              <Text type="secondary" size="small">总支出</Text>
            </div>
          </div>
        </Card>

        {/* 快捷操作卡片 */}
        <Card className={styles.actionsCard}>
          <Title heading={5} className={styles.sectionTitle}>
            <IconSetting /> 快捷操作
          </Title>
          <div className={styles.actionsList}>
            <div className={styles.actionItem} onClick={() => navigate('/my-posts')}>
              <div className={styles.actionIcon}>📝</div>
              <div className={styles.actionContent}>
                <Text strong>我的发布</Text>
                <Text type="secondary" size="small">查看和管理我发布的任务</Text>
              </div>
              <IconArrowLeft style={{ transform: 'rotate(180deg)' }} />
            </div>
            
            <Divider margin="12px" />
            
            <div className={styles.actionItem} onClick={() => navigate('/task-hall')}>
              <div className={styles.actionIcon}>🏛️</div>
              <div className={styles.actionContent}>
                <Text strong>任务大厅</Text>
                <Text type="secondary" size="small">浏览和申请任务</Text>
              </div>
              <IconArrowLeft style={{ transform: 'rotate(180deg)' }} />
            </div>
            
            <Divider margin="12px" />
            
            <div className={styles.actionItem}>
              <div className={styles.actionIcon}>💰</div>
              <div className={styles.actionContent}>
                <Text strong>钱包管理</Text>
                <Text type="secondary" size="small">查看收支记录和余额</Text>
              </div>
              <Tag color="orange" size="small">即将上线</Tag>
            </div>
            
            <Divider margin="12px" />
            
            <div className={styles.actionItem}>
              <div className={styles.actionIcon}>⚙️</div>
              <div className={styles.actionContent}>
                <Text strong>账户设置</Text>
                <Text type="secondary" size="small">修改密码和安全设置</Text>
              </div>
              <Tag color="orange" size="small">即将上线</Tag>
            </div>
          </div>
        </Card>
      </div>

      {/* 编辑个人信息弹窗 */}
      <Modal
        title="编辑个人信息"
        visible={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
        width={500}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>用户名</label>
            <Input
              value={editFormData.username}
              onChange={(value) => setEditFormData(prev => ({ ...prev, username: value }))}
              placeholder="请输入用户名"
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>邮箱</label>
            <Input
              value={editFormData.email}
              onChange={(value) => setEditFormData(prev => ({ ...prev, email: value }))}
              placeholder="请输入邮箱"
              style={{ width: '100%' }}
            />
          </div>
          
          <div className={styles.modalFooter}>
            <Button onClick={() => setShowEditModal(false)}>
              取消
            </Button>
            <Button 
              type="primary" 
              onClick={handleEditProfile}
              style={{ marginLeft: 8 }}
            >
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;