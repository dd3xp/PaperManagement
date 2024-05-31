import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import './Dashboard.css';
import MyLibraries from './MyLibraries';
import AllPapers from './AllPapers';

const Dashboard = () => {
  return (
    <Router>
      <div className="dashboard-container">
        <div className="sidebar">
          <h2>Menu</h2>
          <ul>
            <li><Link to="/my-libraries">My Libraries</Link></li>
            <li><Link to="/all-papers">All Papers</Link></li>
          </ul>
        </div>
        <div className="content">
          <Switch>
            <Route path="/my-libraries" component={MyLibraries} />
            <Route path="/all-papers" component={AllPapers} />
            <Route path="/" exact>
              <h1>Welcome to your Dashboard</h1>
              {/* 其他仪表盘内容 */}
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default Dashboard;
