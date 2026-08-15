import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import SurveyPage from './pages/SurveyPage';
import ResultsPage from './pages/ResultsPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Creative Survey Platform</h1>
      <p className="text-xl mb-8">A free survey platform with block randomization</p>
      <div className="flex gap-4 justify-center">
        <a href="/admin" className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600">
          Admin Dashboard
        </a>
        <a href="/survey" className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600">
          Take Survey
        </a>
        <a href="/results" className="bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600">
          View Results
        </a>
      </div>
    </div>
  );
}

export default App;
