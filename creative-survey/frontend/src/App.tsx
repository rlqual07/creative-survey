import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import SurveyFlow from './pages/SurveyFlow';
import ResultsDashboard from './pages/ResultsDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              Creative Survey Platform
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/admin" className="nav-link">Admin Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/survey" className="nav-link">Take Survey</Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/survey" element={<SurveyFlow />} />
          <Route path="/results/:surveyId" element={<ResultsDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to Creative Survey Platform</h1>
      <p>A block-randomized research survey tool</p>
      <div className="home-buttons">
        <Link to="/admin" className="btn btn-primary">Go to Admin Dashboard</Link>
        <Link to="/survey" className="btn btn-secondary">Take Survey</Link>
      </div>
    </div>
  );
}

export default App;
