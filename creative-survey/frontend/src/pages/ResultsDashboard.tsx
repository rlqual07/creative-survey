import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ResultsDashboard.css';

const API_URL = '/api';

const ResultsDashboard: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadResults = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/responses/survey/${surveyId}/results`);
      setResults(response.data);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    if (surveyId) {
      loadResults();
    }
  }, [surveyId, loadResults]);

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  if (!results) {
    return <div className="card">No results available</div>;
  }

  return (
    <div className="results-dashboard">
      <div className="card">
        <h1>Survey Results</h1>
        <div className="results-stats">
          <div className="stat-card">
            <h3>Total Participants</h3>
            <p className="stat-value">{results.total_participants}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-value">{results.completed_participants}</p>
          </div>
          <div className="stat-card">
            <h3>Completion Rate</h3>
            <p className="stat-value">
              {results.total_participants > 0
                ? ((results.completed_participants / results.total_participants) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
          <div className="stat-card">
            <h3>Total Responses</h3>
            <p className="stat-value">{results.total_responses}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
