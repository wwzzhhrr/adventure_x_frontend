import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Empty, Spin, Toast, Typography } from '@douyinfe/semi-ui';
import { IconArrowLeft, IconCalendar } from '@douyinfe/semi-icons';
import { apiGet } from '../../utils/api';
import styles from './index.module.css';

const { Title, Text } = Typography;

const MyPosts = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    console.log('开始获取我的任务...');
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    console.log('当前token:', token ? '存在' : '不存在');
    console.log('当前用户:', user);
    try {
      const response = await apiGet('http://127.0.0.1:8000/api/tasks/my/created');
      
      // 如果response为null，说明token过期已经被处理
      if (!response) {
        console.log('响应为null，可能token过期');
        return;
      }

      console.log('API响应状态:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('获取到的任务数据:', data);
        setTasks(data);
      } else {
        const error = await response.json();
        console.error('API错误响应:', error);
        Toast.error(error.detail || '获取任务失败');
      }
    } catch (error) {
      console.error('获取任务失败:', error);
      Toast.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/homepage');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'green';
      case 'in_progress':
        return 'orange';
      case 'completed':
        return 'blue';
      case 'cancelled':
        return 'red';
      default:
        return 'grey';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return '开放中';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <Text style={{ marginTop: 16 }}>加载中...</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Content */}
      <div className={styles.content}>
        {tasks.length === 0 ? (
          <Empty
            title="暂无发布的任务"
            description="你还没有发布过任何任务，去首页发布第一个任务吧！"
          >
            <Button type="primary" onClick={handleGoBack}>
              去发布任务
            </Button>
          </Empty>
        ) : (
          <div className={styles.taskList}>
            {tasks.map((task) => (
              <Card 
                key={task.id} 
                className={styles.taskCard}
                bodyStyle={{ padding: '20px' }}
              >
                <div className={styles.taskHeader}>
                  <div className={styles.taskTitle}>
                    <Title heading={5}>{task.title}</Title>
                    <Tag 
                      color={getStatusColor(task.status)} 
                      className={styles.statusTag}
                    >
                      {getStatusText(task.status)}
                    </Tag>
                  </div>
                  <div className={styles.reward}>
                    <img src="/favicon11.svg" alt="coin" className={styles.coinIcon} />
                    <Text strong className={styles.rewardAmount}>
                      {parseFloat(task.reward_amount).toFixed(2)}
                    </Text>
                  </div>
                </div>

                <div className={styles.taskDescription}>
                  <Text type="secondary">{task.description}</Text>
                </div>

                {task.skill_tags && task.skill_tags.length > 0 && (
                  <div className={styles.skillTags}>
                    {task.skill_tags.map((tag, index) => (
                      <Tag key={index} className={styles.skillTag}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}

                <div className={styles.taskFooter}>
                  <div className={styles.dateInfo}>
                    <IconCalendar className={styles.dateIcon} />
                    <Text type="tertiary" size="small">
                      发布于 {formatDate(task.created_at)}
                    </Text>
                    {task.updated_at !== task.created_at && (
                      <Text type="tertiary" size="small" style={{ marginLeft: 16 }}>
                        更新于 {formatDate(task.updated_at)}
                      </Text>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <Button size="small" type="tertiary">
                      查看详情
                    </Button>
                    {task.status === 'open' && (
                      <Button size="small" type="primary" style={{ marginLeft: 8 }}>
                        编辑任务
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;