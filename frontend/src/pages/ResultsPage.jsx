import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ResultsPage() {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await axios.get('/api/survey');
      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };

  const handleViewResults = async (surveyId) => {
    try {
      const response = await axios.get(`/api/responses/survey/${surveyId}/results`);
      setResults(response.data);
      setSelectedSurvey(surveyId);
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Error fetching results');
    }
  };

  if (selectedSurvey && results) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Survey Results</h1>
        <button
          onClick={() => {
            setSelectedSurvey(null);
            setResults(null);
          }}
          className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 mb-8"
        >
          Back to Surveys
        </button>

        <div className="bg-white p-8 rounded shadow">
          <h2 className="text-2xl font-bold mb-6">Results Summary</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Total Participants</p>
              <p className="text-3xl font-bold">{results.totalParticipants}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold">{results.completedParticipants}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Completion Rate</p>
              <p className="text-3xl font-bold">{results.completionRate}%</p>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Total Responses</p>
              <p className="text-3xl font-bold">{results.totalResponses}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Survey Results</h1>

      <div className="space-y-4">
        {surveys.length === 0 ? (
          <p className="text-gray-600">No surveys found.</p>
        ) : (
          surveys.map((survey) => (
            <div key={survey.id} className="bg-white p-6 rounded shadow flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{survey.title}</h3>
                <p className="text-gray-600">{survey.description}</p>
              </div>
              <button
                onClick={() => handleViewResults(survey.id)}
                className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
              >
                View Results
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 text-center">
        <a href="/" className="text-blue-500 hover:text-blue-700">Back to Home</a>
      </div>
    </div>
  );
}

export default ResultsPage;
