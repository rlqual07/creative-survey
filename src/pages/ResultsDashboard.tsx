import React, { useState, useEffect } from 'react';
import * as surveyService from '../services/surveyService';
import '../styles/ResultsDashboard.css';

const ResultsDashboard: React.FC = () => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const data = await surveyService.getAllSurveys();
      setSurveys(data);
    } catch (error) {
      console.error('Failed to load surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSurvey = async (survey: any) => {
    setSelectedSurvey(survey);
    setLoading(true);
    try {
      const summary = await surveyService.getSurveyResultsSummary(survey.id);
      setResults(summary);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="results-dashboard">
      <div className="card">
        <h1>📊 Results Dashboard</h1>
        <p className="subtitle">View survey responses and statistics</p>

        {loading && <div className="loading">Loading...</div>}

        {!selectedSurvey ? (
          <div className="survey-list">
            <h2>Select a Survey</h2>
            {surveys.length === 0 ? (
              <p>No surveys found.</p>
            ) : (
              surveys.map((survey) => (
                <div key={survey.id} className="survey-result-card" onClick={() => handleSelectSurvey(survey)}>
                  <h3>{survey.title}</h3>
                  <p>{survey.description}</p>
                  <span className={`status-badge status-${survey.status}`}>{survey.status}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            <button className="btn btn-secondary btn-small" onClick={() => setSelectedSurvey(null)}>
              ← Back to Surveys
            </button>

            <h2>{selectedSurvey.title}</h2>

            {results && (
              <div className="results-stats">
                <div className="stat-card">
                  <h4>Total Participants</h4>
                  <div className="stat-value">{results.totalParticipants}</div>
                </div>
                <div className="stat-card">
                  <h4>Completed</h4>
                  <div className="stat-value">{results.completedParticipants}</div>
                </div>
                <div className="stat-card">
                  <h4>Completion Rate</h4>
                  <div className="stat-value">{results.completionRate.toFixed(1)}%</div>
                </div>
                <div className="stat-card">
                  <h4>Total Responses</h4>
                  <div className="stat-value">{results.totalResponses}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDashboard;
