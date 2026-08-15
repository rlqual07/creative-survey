import React, { useState, useEffect } from 'react';
import * as surveyService from '../services/surveyService';
import '../styles/AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [activeSurvey, setActiveSurvey] = useState<any | null>(null);
  const [showNewSurvey, setShowNewSurvey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const [surveyForm, setSurveyForm] = useState({
    title: '',
    description: '',
    consentForm: '',
  });

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const data = await surveyService.getAllSurveys();
      setSurveys(data);
    } catch (error) {
      showMessage('error', 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const surveyId = await surveyService.createSurvey(
        surveyForm.title,
        surveyForm.description,
        surveyForm.consentForm
      );
      const newSurvey = await surveyService.getSurvey(surveyId);
      setSurveys([newSurvey, ...surveys]);
      setActiveSurvey(newSurvey);
      setSurveyForm({ title: '', description: '', consentForm: '' });
      setShowNewSurvey(false);
      showMessage('success', 'Survey created successfully!');
    } catch (error) {
      showMessage('error', 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSurvey = async (survey: any) => {
    setActiveSurvey(survey);
  };

  const handlePublishSurvey = async () => {
    if (!activeSurvey) return;
    setLoading(true);
    try {
      await surveyService.publishSurvey(activeSurvey.id);
      const updated = await surveyService.getSurvey(activeSurvey.id);
      setActiveSurvey(updated);
      setSurveys(surveys.map((s) => (s.id === updated.id ? updated : s)));
      showMessage('success', 'Survey published successfully!');
    } catch (error) {
      showMessage('error', 'Failed to publish survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="card">
        <h1>📊 Admin Dashboard</h1>
        <p className="subtitle">Create and manage your surveys</p>

        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        <button
          className="btn btn-primary"
          onClick={() => setShowNewSurvey(!showNewSurvey)}
          disabled={loading}
        >
          {showNewSurvey ? '❌ Cancel' : '➕ Create New Survey'}
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
                placeholder="e.g., Creative Stimuli Study 2024"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={surveyForm.description}
                onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })}
                placeholder="Brief description of your research"
              />
            </div>

            <div className="form-group">
              <label>Consent Form *</label>
              <textarea
                required
                value={surveyForm.consentForm}
                onChange={(e) => setSurveyForm({ ...surveyForm, consentForm: e.target.value })}
                placeholder="Paste your full informed consent text here..."
              />
            </div>

            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Creating...' : '✓ Create Survey'}
            </button>
          </form>
        )}
      </div>

      {surveys.length > 0 && (
        <div className="card">
          <h2>📋 Your Surveys</h2>
          <div className="survey-list">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className={`survey-item ${activeSurvey?.id === survey.id ? 'active' : ''}`}
                onClick={() => handleSelectSurvey(survey)}
              >
                <div className="survey-item-header">
                  <h3>{survey.title}</h3>
                  <span className={`status-badge status-${survey.status}`}>{survey.status}</span>
                </div>
                <p>{survey.description || 'No description'}</p>
                <small>Created: {new Date(survey.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSurvey && (
        <SurveyEditor survey={activeSurvey} onPublish={handlePublishSurvey} onUpdate={loadSurveys} />
      )}
    </div>
  );
};

interface SurveyEditorProps {
  survey: any;
  onPublish: () => void;
  onUpdate: () => void;
}

const SurveyEditor: React.FC<SurveyEditorProps> = ({ survey, onPublish, onUpdate }) => {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const [blockForm, setBlockForm] = useState({
    blockOrder: 1,
    stimulusType: 'image',
    stimulusUrl: '',
    stimulusTitle: '',
  });

  useEffect(() => {
    loadBlocks();
  }, [survey.id]);

  const loadBlocks = async () => {
    try {
      const data = await surveyService.getStimulusBlocks(survey.id);
      setBlocks(data);
    } catch (error) {
      showMessage('error', 'Failed to load blocks');
    }
  };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const blockId = await surveyService.addStimulusBlock(
        survey.id,
        blockForm.blockOrder,
        blockForm.stimulusType as 'image' | 'video',
        blockForm.stimulusUrl,
        blockForm.stimulusTitle
      );
      const newBlock = {
        id: blockId,
        ...blockForm,
      };
      setBlocks([...blocks, newBlock].sort((a, b) => a.blockOrder - b.blockOrder));
      setBlockForm({
        blockOrder: Math.min(blockForm.blockOrder + 1, 4),
        stimulusType: 'image',
        stimulusUrl: '',
        stimulusTitle: '',
      });
      showMessage('success', 'Stimulus block added!');
    } catch (error) {
      showMessage('error', 'Failed to add block');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>✏️ Edit: {survey.title}</h2>
      <div className="survey-status">
        <span className="status-label">Status:</span>
        <strong className={`status-${survey.status}`}>{survey.status}</strong>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="survey-section">
        <h3>🎬 Stimulus Blocks ({blocks.length}/4)</h3>
        <button className="btn btn-primary btn-small" onClick={() => setShowAddBlock(!showAddBlock)}>
          {showAddBlock ? '❌ Cancel' : '➕ Add Stimulus Block'}
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
              <label>Stimulus URL *</label>
              <input
                type="url"
                required
                value={blockForm.stimulusUrl}
                onChange={(e) => setBlockForm({ ...blockForm, stimulusUrl: e.target.value })}
                placeholder="https://imgur.com/xxxxx.jpg"
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

            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Adding...' : '✓ Add Block'}
            </button>
          </form>
        )}

        <div className="blocks-list">
          {blocks.map((block) => (
            <div key={block.id} className="block-item">
              <div className="block-header">
                <h4>Block {block.blockOrder}</h4>
                <span className="block-type">{block.stimulusType}</span>
              </div>
              <p>{block.stimulusTitle || 'No title'}</p>
              <a href={block.stimulusUrl} target="_blank" rel="noopener noreferrer" className="preview-link">
                👁️ Preview Stimulus
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="survey-section">
        <h3>❓ Questions</h3>
        <p className="info-text">Questions will be added in the next update. For now, configure them via the API.</p>
      </div>

      {survey.status === 'draft' && blocks.length === 4 && (
        <button className="btn btn-success btn-lg" onClick={onPublish}>
          🚀 Publish Survey
        </button>
      )}
    </div>
  );
};

export default AdminDashboard;
