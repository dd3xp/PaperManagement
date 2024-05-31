import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Home';
import Auth from './components/Auth';
import Dashboard from './Dashboard';
import MyLibraries from './MyLibraries';
import AllPapers from './AllPapers';
import AddPaper from './AddPaper';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/auth" component={Auth} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/my-libraries" component={MyLibraries} />
        <Route path="/all-papers" component={AllPapers} />
        <Route path="/add-paper" component={AddPaper} />
      </Switch>
    </Router>
  );
};

export default App;
