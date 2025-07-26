import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Button, Toast } from '@douyinfe/semi-ui';
import { apiPost } from '../../utils/api';
import MyPosts from '../MyPosts';
import TaskHall from '../TaskHall';
import styles from './index.module.css';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('myPosts');
  const navigate = useNavigate();

  useEffect(() => {
    // 从localStorage获取用户信息
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('解析用户数据失败:', error);
        handleLogout();
      }
    } else {
      // 如果没有token或用户数据，跳转到登录页
      handleLogout();
    }
    
    setLoading(false);
  }, []);

  const handleLogout = () => {
    // 清除localStorage中的用户数据
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    console.log('已退出登录');
    
    // 跳转到登录页
    navigate('/login');
  };

  const handleGoToProfile = () => {
    // 跳转到我的页面
    navigate('/profile');
  };

  // 处理tab切换
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  // 发布任务处理函数
  const handlePublishTask = async (values) => {
    setSubmitting(true);
    try {
      const response = await apiPost('http://127.0.0.1:8000/api/tasks/', {
        title: values.title,
        description: values.description,
        reward_amount: values.reward_amount,
        skill_tags: values.skill_tags || []
      });

      // 如果response为null，说明token过期已经被处理
      if (!response) {
        return;
      }

      if (response.ok) {
        const result = await response.json();
        Toast.success('任务发布成功！');
        setShowTaskModal(false);
        console.log('任务发布成功:', result);
      } else {
        const error = await response.json();
        Toast.error('发布失败: ' + (error.detail || '未知错误'));
      }
    } catch (error) {
      console.error('发布任务失败:', error);
      Toast.error('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 打开发布任务弹窗
  const handleOpenTaskModal = () => {
    setShowTaskModal(true);
  };

  // 关闭发布任务弹窗
  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        加载中...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.homeContainer}>
      {/* Header栏 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <img src="/favicon.svg" alt="logo" className={styles.logoIcon} />
            <span>公社</span>
          </div>
          <div className={styles.customTabs}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'myPosts' ? styles.tabButtonActive : ''}`}
              onClick={() => handleTabChange('myPosts')}
            >
              我的发布
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'taskHall' ? styles.tabButtonActive : ''}`}
              onClick={() => handleTabChange('taskHall')}
            >
              任务大厅
            </button>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.publishButton} onClick={handleOpenTaskModal}>
              发布任务
            </button>
            <button className={styles.profileButton} onClick={handleGoToProfile}>
              我的
            </button>
          </div>
        </div>
        <div className={styles.headerDivider}></div>
      </div>
      {/* 主要内容区域 */}
      <div className={styles.content}>
        {activeTab === 'myPosts' && <MyPosts />}
        {activeTab === 'taskHall' && <TaskHall />}
      </div>

      {/* 发布任务弹窗 */}
      <Modal
        title="发布新任务"
        visible={showTaskModal}
        onCancel={handleCloseTaskModal}
        footer={null}
        width={600}
        className={styles.taskModal}
      >
        <Form
          onSubmit={handlePublishTask}
          labelPosition="top"
          style={{ padding: '20px 0' }}
        >
          <Form.Input
            field="title"
            label="任务标题"
            placeholder="请输入任务标题"
            rules={[
              { required: true, message: '请输入任务标题' },
              { max: 100, message: '标题不能超过100个字符' }
            ]}
          />
          
          <Form.TextArea
            field="description"
            label="任务描述"
            placeholder="请详细描述任务需求..."
            rows={4}
            rules={[
              { required: true, message: '请输入任务描述' },
              { max: 1000, message: '描述不能超过1000个字符' }
            ]}
          />
          
          <Form.InputNumber
            field="reward_amount"
            label="悬赏金额"
            placeholder="请输入悬赏金额"
            min={1}
            max={999999}
            precision={2}
            suffix={<img src="/favicon11.svg" alt="coin" style={{width: '16px', height: '16px'}} />}
            rules={[
              { required: true, message: '请输入悬赏金额' },
              { type: 'number', min: 1, message: '悬赏金额不能少于1' }
            ]}
          />
          
          <Form.TagInput
            field="skill_tags"
            label="技能标签"
            placeholder="请输入相关技能标签，按回车添加"
            max={10}
            maxTagCount={5}
            showClear
          />
          
          <div className={styles.modalFooter}>
            <Button onClick={handleCloseTaskModal}>
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              style={{ marginLeft: 8 }}
            >
              发布任务
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default HomePage;