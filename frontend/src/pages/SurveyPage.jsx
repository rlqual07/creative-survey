import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SurveyPage() {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [participantId, setParticipantId] = useState(null);

  useEffect(() => {
    fetchActiveSurveys();
  }, []);

  const fetchActiveSurveys = async () => {
    try {
      const response = await axios.get('/api/survey');
      const activeSurveys = response.data.filter(s => s.status === 'active');
      setSurveys(activeSurveys);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };

  const handleStartSurvey = async (surveyId) => {
    try {
      const response = await axios.post(`/api/survey/${surveyId}/start`);
      setParticipantId(response.data.id);
      setSelectedSurvey(surveyId);
    } catch (error) {
      console.error('Error starting survey:', error);
      alert('Error starting survey');
    }
  };

  if (selectedSurvey && participantId) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Survey</h1>
        <div className="bg-white p-8 rounded shadow">
          <p className="text-lg mb-4">Thank you for starting the survey!</p>
          <p className="text-gray-600">Participant ID: {participantId}</p>
          <p className="text-gray-600 mt-2">Survey content coming soon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Available Surveys</h1>

      {surveys.length === 0 ? (
        <p className="text-gray-600 text-lg">No active surveys available at this time.</p>
      ) : (
        <div className="space-y-6">
          {surveys.map((survey) => (
            <div key={survey.id} className="bg-white p-8 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">{survey.title}</h2>
              <p className="text-gray-600 mb-4">{survey.description}</p>
              <div className="bg-gray-100 p-4 rounded mb-6">
                <h3 className="font-bold mb-2">Consent Form:</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{survey.consent_form}</p>
              </div>
              <button
                onClick={() => handleStartSurvey(survey.id)}
                className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
              >
                I Agree & Start Survey
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <a href="/" className="text-blue-500 hover:text-blue-700">Back to Home</a>
      </div>
    </div>
  );
}

export default SurveyPage;
