import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Survey {
  id: string;
  title: string;
  description: string;
  consent_form: string;
  status: string;
}

interface StimulusBlock {
  id: string;
  block_order: number;
  stimulus_type: string;
  stimulus_url: string;
  stimulus_title: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  question_set: number;
  question_number: number;
  scale_max?: number;
}

const AdminDashboard: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [showNewSurvey, setShowNewSurvey] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [blocks, setBlocks] = useState<StimulusBlock[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Form states
  const [surveyForm, setSurveyForm] = useState({
    title: '',
    description: '',
    consentForm: '',
  });

  const [blockForm, setBlockForm] = useState({
    blockOrder: 1,
    stimulusType: 'image',
    stimulusUrl: '',
    stimulusTitle: '',
  });

  const [questionForm, setQuestionForm] = useState({
    questionSet: 1,
    questionNumber: 1,
    questionText: '',
    questionType: 'likert',
    scaleMax: 5,
  });

  // Load surveys on mount
  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const response = await axios.get(`${API_URL}/survey`);
      setSurveys(response.data);
    } catch (error) {
      console.error('Error loading surveys:', error);
    }
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/survey`, surveyForm);
      setSurveys([response.data, ...surveys]);
      setActiveSurvey(response.data);
      setSurveyForm({ title: '', description: '', consentForm: '' });
      setShowNewSurvey(false);
      alert('Survey created successfully!');
    } catch (error) {
      console.error('Error creating survey:', error);
      alert('Failed to create survey');
    }
  };

  const handleSelectSurvey = async (survey: Survey) => {
    setActiveSurvey(survey);
    // Load blocks for this survey
    try {
      const response = await axios.get(`${API_URL}/questions/${survey.id}/blocks`);
      setBlocks(response.data);
    } catch (error) {
      console.error('Error loading blocks:', error);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurvey) return;

    try {
      const response = await axios.post(`${API_URL}/questions/${activeSurvey.id}/blocks`, blockForm);
      setBlocks([...blocks, response.data]);
      setBlockForm({
        blockOrder: blockForm.blockOrder + 1,
        stimulusType: 'image',
        stimulusUrl: '',
        stimulusTitle: '',
      });
      alert('Stimulus block added successfully!');
    } catch (error) {
      console.error('Error adding block:', error);
      alert('Failed to add block');
    }
  };

  const handlePublishSurvey = async () => {
    if (!activeSurvey) return;

    try {
      const response = await axios.put(`${API_URL}/survey/${activeSurvey.id}/publish`);
      setActiveSurvey(response.data);
      setSurveys(surveys.map(s => s.id === response.data.id ? response.data : s));
      alert('Survey published successfully!');
    } catch (error) {
      console.error('Error publishing survey:', error);
      alert('Failed to publish survey');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="card">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setShowNewSurvey(!showNewSurvey)}>
          {showNewSurvey ? 'Cancel' : 'Create New Survey'}
        </button>

        {showNewSurvey && (
          <form onSubmit={handleCreateSurvey} className="survey-form">
            <div className="form-group">
              <label>Survey Title *</label>
              <input
                type="text"
                required
                value={surveyForm.title}
                onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                placeholder="e.g., Creative Stimuli Study"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={surveyForm.description}
                onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })}
                placeholder="Brief description of your survey"
              />
            </div>

            <div className="form-group">
              <label>Consent Form *</label>
              <textarea
                required
                value={surveyForm.consentForm}
                onChange={(e) => setSurveyForm({ ...surveyForm, consentForm: e.target.value })}
                placeholder="Paste your consent form text here"
              />
            </div>

            <button type="submit" className="btn btn-success">
              Create Survey
            </button>
          </form>
        )}
      </div>

      {surveys.length > 0 && (
        <div className="card">
          <h2>Your Surveys</h2>
          <div className="survey-list">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className={`survey-item ${activeSurvey?.id === survey.id ? 'active' : ''}`}
                onClick={() => handleSelectSurvey(survey)}
              >
                <h3>{survey.title}</h3>
                <p>{survey.description}</p>
                <span className={`status-badge status-${survey.status}`}>{survey.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSurvey && (
        <div className="card">
          <h2>Edit: {activeSurvey.title}</h2>
          <p>Status: <strong>{activeSurvey.status}</strong></p>

          <div className="survey-section">
            <h3>Stimulus Blocks ({blocks.length}/4)</h3>
            <button className="btn btn-primary" onClick={() => setShowAddBlock(!showAddBlock)}>
              {showAddBlock ? 'Cancel' : 'Add Stimulus Block'}
            </button>

            {showAddBlock && (
              <form onSubmit={handleAddBlock} className="block-form">
                <div className="form-group">
                  <label>Block Order</label>
                  <select
                    value={blockForm.blockOrder}
                    onChange={(e) => setBlockForm({ ...blockForm, blockOrder: parseInt(e.target.value) })}
                  >
                    <option value="1">Block 1</option>
                    <option value="2">Block 2</option>
                    <option value="3">Block 3</option>
                    <option value="4">Block 4</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Stimulus Type</label>
                  <select
                    value={blockForm.stimulusType}
                    onChange={(e) => setBlockForm({ ...blockForm, stimulusType: e.target.value })}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Stimulus URL</label>
                  <input
                    type="url"
                    required
                    value={blockForm.stimulusUrl}
                    onChange={(e) => setBlockForm({ ...blockForm, stimulusUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-group">
                  <label>Stimulus Title</label>
                  <input
                    type="text"
                    value={blockForm.stimulusTitle}
                    onChange={(e) => setBlockForm({ ...blockForm, stimulusTitle: e.target.value })}
                    placeholder="e.g., Abstract Art #1"
                  />
                </div>

                <button type="submit" className="btn btn-success">
                  Add Block
                </button>
              </form>
            )}

            <div className="blocks-list">
              {blocks.map((block) => (
                <div key={block.id} className="block-item">
                  <h4>{block.stimulus_title || `Block ${block.block_order}`}</h4>
                  <p>Type: {block.stimulus_type}</p>
                  <a href={block.stimulus_url} target="_blank" rel="noopener noreferrer">View Stimulus</a>
                </div>
              ))}
            </div>
          </div>

          {activeSurvey.status === 'draft' && blocks.length === 4 && (
            <button className="btn btn-success" onClick={handlePublishSurvey}>
              Publish Survey
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
