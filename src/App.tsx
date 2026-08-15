import React, { useState, useEffect } from 'react';
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
              🎨 Creative Survey Platform
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/admin" className="nav-link">Admin Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/survey" className="nav-link">Take Survey</Link>
              </li>
              <li className="nav-item">
                <Link to="/results" className="nav-link">Results</Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/survey" element={<SurveyFlow />} />
          <Route path="/results" element={<ResultsDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>🎨 Creative Survey Platform</h1>
        <p>Block-randomized research surveys, completely browser-based</p>
        <p className="subtitle">No installation. No databases. No servers.</p>
      </div>
      <div className="features-grid">
        <div className="feature-card">
          <h3>✅ Zero Setup</h3>
          <p>Deploy in 5 minutes. No software to install.</p>
        </div>
        <div className="feature-card">
          <h3>🔀 Block Randomization</h3>
          <p>Automatic random shuffling of stimulus blocks.</p>
        </div>
        <div className="feature-card">
          <h3>☁️ Cloud Database</h3>
          <p>Firebase handles all data storage automatically.</p>
        </div>
        <div className="feature-card">
          <h3>📊 Live Results</h3>
          <p>View responses in real-time. Export as CSV.</p>
        </div>
      </div>
      <div className="home-buttons">
        <Link to="/admin" className="btn btn-primary btn-lg">Create Survey</Link>
        <Link to="/survey" className="btn btn-secondary btn-lg">Take Survey</Link>
      </div>
    </div>
  );
}

export default App;
