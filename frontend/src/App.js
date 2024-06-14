import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Home from './Home';
import Auth from './components/Auth';
import Dashboard from './Dashboard';
import MyLibraries from './MyLibraries';
import AllPapers from './AllPapers';
import AddPaper from './AddPaper';
import EditPaper from './EditPaper';
import AllLibraries from './AllLibraries';
import Comments from './Comments';
import UpdateProfile from './UpdateProfile'; // 导入 UpdateProfile 组件

const PrivateRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/auth" />
        )
      }
    />
  );
};

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/auth" component={Auth} />
        <PrivateRoute path="/dashboard" component={Dashboard} />
        <PrivateRoute path="/my-libraries" component={MyLibraries} />
        <PrivateRoute path="/all-papers" component={AllPapers} />
        <PrivateRoute path="/all-libraries" component={AllLibraries} />
        <PrivateRoute path="/add-paper" component={AddPaper} />
        <PrivateRoute path="/edit-paper/:paperId" component={EditPaper} />
        <PrivateRoute path="/comments/:paperId" component={Comments} />
        <PrivateRoute path="/update-profile" component={UpdateProfile} /> {/* 添加 UpdateProfile 路由 */}
      </Switch>
    </Router>
  );
};

export default App;
