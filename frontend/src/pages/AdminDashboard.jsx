import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    consentForm: '',
  });

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

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/survey', formData);
      setSurveys([...surveys, response.data]);
      setFormData({ title: '', description: '', consentForm: '' });
      setShowForm(false);
      alert('Survey created successfully!');
    } catch (error) {
      console.error('Error creating survey:', error);
      alert('Error creating survey');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 mb-8"
      >
        {showForm ? 'Cancel' : 'Create New Survey'}
      </button>

      {showForm && (
        <form onSubmit={handleCreateSurvey} className="bg-gray-100 p-8 rounded mb-8">
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Survey Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              rows="4"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Consent Form</label>
            <textarea
              value={formData.consentForm}
              onChange={(e) => setFormData({ ...formData, consentForm: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              rows="6"
              required
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600">
            Create Survey
          </button>
        </form>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Your Surveys</h2>
        {surveys.length === 0 ? (
          <p className="text-gray-600">No surveys yet. Create one to get started!</p>
        ) : (
          <div className="space-y-4">
            {surveys.map((survey) => (
              <div key={survey.id} className="bg-white p-6 rounded shadow">
                <h3 className="text-xl font-bold">{survey.title}</h3>
                <p className="text-gray-600">{survey.description}</p>
                <p className="text-sm text-gray-500 mt-2">Status: {survey.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
