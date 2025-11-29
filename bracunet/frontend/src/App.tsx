import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/alumni" element={<Alumni />} />
        <Route path="/events" element={<Events />} />
        <Route path="/jobs" element={<Jobs />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;