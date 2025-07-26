import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Empty, Spin, Toast, Typography, Input } from '@douyinfe/semi-ui';
import { IconArrowLeft, IconCalendar, IconSearch } from '@douyinfe/semi-icons';
import { apiGet, apiPost } from '../../utils/api';
import styles from './index.module.css';

const { Title, Text } = Typography;

const TaskHall = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedTasks, setAppliedTasks] = useState(new Set());
  const navigate = useNavigate();

  // 获取所有任务
  const fetchAllTasks = async () => {
    try {
      const response = await apiGet('http://127.0.0.1:8000/api/tasks/');
      
      // 如果response为null，说明token过期已经被处理
      if (!response) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        const error = await response.json();
        Toast.error(error.detail || '获取任务失败');
      }
    } catch (error) {
      console.error('获取任务失败:', error);
      Toast.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTask = (taskId) => {
    setAppliedTasks(prev => new Set([...prev, taskId]));
    Toast.success('申请成功');
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  // 过滤任务
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    task.description.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 获取状态标签颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'green';
      case 'in_progress': return 'orange';
      case 'completed': return 'blue';
      case 'cancelled': return 'red';
      default: return 'grey';
    }
  };

  // 获取状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 'open': return '开放中';
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <Text style={{ marginTop: 16, color: '#666' }}>加载任务中...</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 搜索栏 */}
      <div className={styles.searchContainer}>
        <Input
          prefix={<IconSearch />}
          placeholder="搜索任务标题或描述..."
          value={searchKeyword}
          onChange={setSearchKeyword}
          className={styles.searchInput}
        />
      </div>

      {/* 任务列表 */}
      <div className={styles.content}>
        {filteredTasks.length === 0 ? (
          <Empty
            image={<IconCalendar size="extra-large" />}
            title="暂无任务"
            description={searchKeyword ? "没有找到匹配的任务" : "还没有发布任何任务"}
          />
        ) : (
          <div className={styles.taskGrid}>
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={styles.taskCard}
                bodyStyle={{ padding: '20px' }}
                hoverable
              >
                <div className={styles.taskHeader}>
                  <Title heading={4} className={styles.taskTitle}>
                    {task.title}
                  </Title>
                  <Tag 
                    color={getStatusColor(task.status)} 
                    className={styles.statusTag}
                  >
                    {getStatusText(task.status)}
                  </Tag>
                </div>
                
                <Text className={styles.taskDescription}>
                  {task.description}
                </Text>
                
                <div className={styles.taskMeta}>
                  <div className={styles.reward}>
                    <img src="/favicon11.svg" alt="coin" className={styles.coinIcon} />
                    <span className={styles.rewardAmount}>
                      {task.reward_amount}
                    </span>
                  </div>
                  
                  <div className={styles.dateInfo}>
                    <IconCalendar className={styles.dateIcon} />
                    <Text type="tertiary" size="small">
                      {formatDate(task.created_at)}
                    </Text>
                  </div>
                </div>
                
                {task.skill_tags && task.skill_tags.length > 0 && (
                  <div className={styles.skillTags}>
                    {task.skill_tags.map((tag, index) => (
                      <Tag key={index} size="small" className={styles.skillTag}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
                
                <div className={styles.taskFooter}>
                  <Text type="tertiary" size="small">
                    发布者: {task.creator?.username || '匿名用户'}
                  </Text>
                  
                  <div className={styles.actions}>
                    {task.status === 'open' && (
                      <Button 
                        theme="solid" 
                        type="primary"
                        size="small"
                        className={styles.applyButton}
                        disabled={appliedTasks.has(task.id)}
                        onClick={() => handleApplyTask(task.id)}
                      >
                        {appliedTasks.has(task.id) ? '已申请' : '申请任务'}
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

export default TaskHall;