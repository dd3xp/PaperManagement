import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      alert('Login successful!');
      history.push('/dashboard'); // 登录成功后跳转到仪表盘页面
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      alert('Login failed! ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/auth/register', { username, password });
      setIsLogin(true);
      alert('Registration successful! Please log in.');
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      alert('Registration failed! ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="auth-input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="auth-input"
          />
          <button type="submit" className="auth-button">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <div className="auth-switch" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Don\'t have an account? Register' : 'Already have an account? Login'}
        </div>
      </div>
    </div>
  );
};

export default Auth;
