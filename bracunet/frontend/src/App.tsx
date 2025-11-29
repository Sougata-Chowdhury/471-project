import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Alumni from './pages/Alumni';
import Events from './pages/Events';
import Jobs from './pages/Jobs';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/alumni" component={Alumni} />
        <Route path="/events" component={Events} />
        <Route path="/jobs" component={Jobs} />
      </Switch>
      <Footer />
    </Router>
  );
};

export default App;