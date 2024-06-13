import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, useHistory } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // 正确导入命名导出
import './Dashboard.css';
import MyLibraries from './MyLibraries';
import AllPapers from './AllPapers';
import AllLibraries from './AllLibraries';

const Dashboard = () => {
  const history = useHistory();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      history.push('/auth');
    } else {
      try {
        const decodedToken = jwtDecode(token);
        console.log('Decoded Token:', decodedToken); // 调试输出解码后的令牌
        setUserId(decodedToken.userId);
      } catch (error) {
        console.error('Failed to decode token:', error);
        history.push('/auth');
      }
    }
  }, [history]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('You have been logged out.');
    history.push('/auth');
  };

  return (
    <Router>
      <div className="dashboard-container">
        <div className="sidebar">
          <h2>Menu</h2>
          <ul>
            <li><Link to="/my-libraries">My Libraries</Link></li>
            <li><Link to="/all-papers">All Papers</Link></li>
            <li><Link to="/all-libraries">All Libraries</Link></li>
          </ul>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
        <div className="content">
          <Switch>
            <Route path="/my-libraries" component={MyLibraries} />
            <Route path="/all-papers" component={AllPapers} />
            <Route path="/all-libraries" component={AllLibraries} />
            <Route path="/" exact>
              <h1>Welcome to your Dashboard</h1>
            </Route>
          </Switch>
        </div>
        {userId && (
          <div className="user-id-display">
            User ID: {userId}
          </div>
        )}
      </div>
    </Router>
  );
};

export default Dashboard;
