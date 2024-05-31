import React from 'react';
import { useHistory } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const history = useHistory();

  const handleButtonClick = () => {
    history.push('/auth'); // 跳转到登录或注册页面
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to Paper Management System</h1>
        <button onClick={handleButtonClick} className="home-button">Login or Register</button>
      </div>
    </div>
  );
};

export default Home;
