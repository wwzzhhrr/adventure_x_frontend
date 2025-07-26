import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Typography, Space, Card } from '@douyinfe/semi-ui';
import { IconMail, IconLock } from '@douyinfe/semi-icons';
import styles from './index.module.css';


const Login = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 处理表单提交
  const handleSubmit = async (values) => {
    // Semi UI Form组件的onSubmit回调不需要preventDefault
    console.log('表单提交数据:', values);
    
    // 使用Form组件提供的values而不是formData
    if (!values.email || !values.password) {
      alert('请填写完整的登录信息');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 调用后端登录API
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 登录成功，保存token到localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('登录成功！');
        
        // 调用父组件传入的登录回调
        if (onLogin) {
          onLogin({
            token: data.access_token,
            user: data.user
          });
        }
        
        console.log('登录成功:', data);
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          navigate('/homepage');
        }, 1000);
      } else {
        // 登录失败，显示错误信息
        const errorMsg = data.detail || '登录失败，请检查邮箱和密码';
        console.error('登录失败:', errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      const errorMsg = '网络错误，请稍后重试';
      console.error('网络错误:', errorMsg);
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const { Title, Text } = Typography;

  return (
    <div className={styles.loginContainer}>
      <Card 
        className={styles.loginCard}
        bodyStyle={{ padding: '40px' }}
        bordered={false}
        shadows='hover'
      >
        <Space vertical align='center' spacing='loose' style={{ width: '100%' }}>
          <Title heading={2} style={{ margin: 0, color: '#1C1F23' }}>
            欢迎登录
          </Title>
          <Text type='tertiary' size='normal'>
            请输入您的邮箱和密码
          </Text>
        </Space>
        
        <Form 
          onSubmit={handleSubmit}
          onSubmitFail={(errors, values) => {
            console.log('表单验证失败:', errors, values);
            alert('请检查输入信息');
          }}
          style={{ marginTop: '32px' }}
          labelPosition='top'
          labelAlign='left'
        >
          <Form.Input
            field='email'
            label='邮箱地址'
            placeholder='请输入邮箱地址'
            prefix={<IconMail />}
            type='email'
            size='large'
            disabled={isLoading}
            style={{ marginBottom: '20px' }}
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          />
          
          <Form.Input
            field='password'
            label='密码'
            placeholder='请输入密码'
            prefix={<IconLock />}
            type='password'
            size='large'
            disabled={isLoading}
            style={{ marginBottom: '24px' }}
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          />
          
          <Button
            htmlType='submit'
            type='primary'
            size='large'
            loading={isLoading}
            block
            style={{ 
              height: '48px',
              fontSize: '16px',
              fontWeight: 500
            }}
          >
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </Form>
        
        <div className={styles.footer}>
          <Space>
            <Button 
              theme='borderless' 
              type='tertiary' 
              size='small'
              onClick={() => alert('忘记密码功能开发中...')}
            >
              忘记密码？
            </Button>
            <Text type='tertiary'>|</Text>
            <Button 
              theme='borderless' 
              type='tertiary' 
              size='small'
              onClick={() => alert('注册功能开发中...')}
            >
              注册账号
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Login;