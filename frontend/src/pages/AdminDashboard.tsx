import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';

const API_URL = '/api';

interface Survey {
  id: string;
  title: string;
  description: string;
  consent_form: string;
  intro_text?: string;
  status: string;
}

interface EditableQuestion {
  id: string;
  question_set: number;
  question_number: number;
  question_text: string;
  question_type: string;
  scale_max: number | null;
  options: string[] | null;
}

interface StimulusBlock {
  id: string;
  block_order: number;
  stimulus_type: string;
  stimulus_url: string;
  stimulus_title: string;
}

const AdminDashboard: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [showNewSurvey, setShowNewSurvey] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [blocks, setBlocks] = useState<StimulusBlock[]>([]);
  const [editingSurvey, setEditingSurvey] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    consentForm: '',
    introText: '',
  });
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  const [demoQuestions, setDemoQuestions] = useState<EditableQuestion[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);

  // Form states
  const [surveyForm, setSurveyForm] = useState({
    title: '',
    description: '',
    consentForm: '',
    introText: '',
  });

  const [blockForm, setBlockForm] = useState({
    stimulusType: 'image',
    stimulusUrl: '',
    stimulusTitle: '',
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
      setSurveyForm({ title: '', description: '', consentForm: '', introText: '' });
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
      const qs = await axios.get(`${API_URL}/questions/${survey.id}/questions`);
      setQuestions(qs.data);
      const dq = await axios.get(`${API_URL}/questions/${survey.id}/demographic-questions`);
      setDemoQuestions(dq.data);
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
        stimulusType: 'image',
        stimulusUrl: '',
        stimulusTitle: '',
      });
      setShowAddBlock(false);
    } catch (error: any) {
      console.error('Error adding block:', error);
      alert(error.response?.data?.error || 'Failed to add block');
    }
  };

  const handleStartEdit = () => {
    if (!activeSurvey) return;
    setEditForm({
      title: activeSurvey.title,
      description: activeSurvey.description || '',
      consentForm: activeSurvey.consent_form || '',
      introText: activeSurvey.intro_text || '',
    });
    setEditingSurvey(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurvey) return;
    try {
      const response = await axios.put(`${API_URL}/survey/${activeSurvey.id}`, editForm);
      setActiveSurvey(response.data);
      setSurveys(surveys.map((s) => (s.id === response.data.id ? response.data : s)));
      setEditingSurvey(false);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save changes');
    }
  };

  const handleDeleteSurvey = async () => {
    if (!activeSurvey) return;
    const confirmed = window.confirm(
      `Delete "${activeSurvey.title}"?\n\nThis permanently removes the survey, its stimulus blocks, and ALL collected responses. This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/survey/${activeSurvey.id}`);
      setSurveys(surveys.filter((s) => s.id !== activeSurvey.id));
      setActiveSurvey(null);
      setBlocks([]);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete survey');
    }
  };

  const handleDeleteBlock = async (block: StimulusBlock) => {
    const label = block.stimulus_title || `Block ${block.block_order}`;
    if (!window.confirm(`Remove "${label}"?`)) return;

    try {
      await axios.delete(`${API_URL}/questions/blocks/${block.id}`);
      const response = await axios.get(`${API_URL}/questions/${activeSurvey!.id}/blocks`);
      setBlocks(response.data);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to remove stimulus block');
    }
  };

  const handleUnpublishSurvey = async () => {
    if (!activeSurvey) return;
    try {
      const response = await axios.put(`${API_URL}/survey/${activeSurvey.id}/unpublish`);
      setActiveSurvey(response.data);
      setSurveys(surveys.map((s) => (s.id === response.data.id ? response.data : s)));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to unpublish');
    }
  };

  const handleSaveQuestion = async (q: EditableQuestion, isDemographic: boolean) => {
    try {
      const url = isDemographic
        ? `${API_URL}/questions/demographic/${q.id}`
        : `${API_URL}/questions/question/${q.id}`;
      await axios.put(url, {
        questionText: q.question_text,
        options: q.options,
      });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save question');
    }
  };

  const handlePublishSurvey = async () => {
    if (!activeSurvey) return;

    try {
      const response = await axios.put(`${API_URL}/survey/${activeSurvey.id}/publish`);
      setActiveSurvey(response.data);
      setSurveys(surveys.map(s => s.id === response.data.id ? response.data : s));
      alert('Survey published successfully!');
    } catch (error: any) {
      console.error('Error publishing survey:', error);
      alert(error.response?.data?.error || 'Failed to publish survey');
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

            <div className="form-group">
              <label>Introduction / pre-read</label>
              <textarea
                rows={6}
                value={surveyForm.introText}
                onChange={(e) => setSurveyForm({ ...surveyForm, introText: e.target.value })}
                placeholder="Shown on its own page after consent, before the first stimulus. Leave blank to skip."
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
          {editingSurvey ? (
            <form onSubmit={handleSaveEdit} className="survey-form">
              <h2>Edit survey details</h2>
              <div className="form-group">
                <label>Survey Title *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Consent Form *</label>
                <textarea
                  required
                  value={editForm.consentForm}
                  onChange={(e) => setEditForm({ ...editForm, consentForm: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Introduction / pre-read</label>
                <textarea
                  rows={6}
                  value={editForm.introText}
                  onChange={(e) => setEditForm({ ...editForm, introText: e.target.value })}
                  placeholder="Shown on its own page after consent, before the first stimulus. Leave blank to skip."
                />
              </div>

              <button type="submit" className="btn btn-success">Save changes</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingSurvey(false)}
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <h2>{activeSurvey.title}</h2>
              <p>Status: <strong>{activeSurvey.status}</strong></p>
              <button className="btn btn-secondary" onClick={handleStartEdit}>
                Edit details
              </button>
              <button className="btn btn-danger" onClick={handleDeleteSurvey}>
                Delete survey
              </button>
            </>
          )}

          <div className="survey-section">
            <h3>Stimulus Blocks ({blocks.length})</h3>
            <button className="btn btn-primary" onClick={() => setShowAddBlock(!showAddBlock)}>
              {showAddBlock ? 'Cancel' : 'Add Stimulus Block'}
            </button>

            {showAddBlock && (
              <form onSubmit={handleAddBlock} className="block-form">
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
                  <h4>{block.block_order}. {block.stimulus_title || `Block ${block.block_order}`}</h4>
                  <p>Type: {block.stimulus_type}</p>
                  <a href={block.stimulus_url} target="_blank" rel="noopener noreferrer">View Stimulus</a>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDeleteBlock(block)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="survey-section">
            <h3>Questions ({questions.length} items in {new Set(questions.map((q) => q.question_set)).size} sets)</h3>
            <p className="question-help">
              These are asked after every stimulus. Edit the wording here; the
              scale and answer options stay as configured.
            </p>
            <button className="btn btn-secondary" onClick={() => setShowQuestions(!showQuestions)}>
              {showQuestions ? 'Hide questions' : 'Edit questions'}
            </button>

            {showQuestions && (
              <div className="question-editor">
                {[...new Set(questions.map((q) => q.question_set))].sort().map((setNo) => (
                  <div key={setNo} className="question-set">
                    <h4>Question set {setNo}</h4>
                    {questions
                      .filter((q) => q.question_set === setNo)
                      .map((q) => (
                        <div key={q.id} className="form-group">
                          <label>
                            {q.question_type === 'likert'
                              ? `Statement ${q.question_number} (1-${q.scale_max} scale)`
                              : 'Question'}
                          </label>
                          <textarea
                            rows={2}
                            value={q.question_text}
                            onChange={(e) =>
                              setQuestions(
                                questions.map((x) =>
                                  x.id === q.id ? { ...x, question_text: e.target.value } : x
                                )
                              )
                            }
                            onBlur={() => handleSaveQuestion(q, false)}
                          />
                          {q.options && (
                            <ul className="option-list">
                              {q.options.map((o) => (
                                <li key={o}>{o}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                  </div>
                ))}

                <h4>Demographic questions (asked once, at the end)</h4>
                {demoQuestions.map((q) => (
                  <div key={q.id} className="form-group">
                    <label>Question {q.question_number}</label>
                    <textarea
                      rows={2}
                      value={q.question_text}
                      onChange={(e) =>
                        setDemoQuestions(
                          demoQuestions.map((x) =>
                            x.id === q.id ? { ...x, question_text: e.target.value } : x
                          )
                        )
                      }
                      onBlur={() => handleSaveQuestion(q, true)}
                    />
                    {q.options && (
                      <ul className="option-list">
                        {q.options.map((o) => (
                          <li key={o}>{o}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                <p className="question-help">Changes save when you click away from a field.</p>
              </div>
            )}
          </div>

          {activeSurvey.status === 'draft' ? (
            blocks.length > 0 ? (
              <button className="btn btn-success" onClick={handlePublishSurvey}>
                Publish Survey
              </button>
            ) : (
              <p className="alert alert-info">
                Add at least one stimulus block to publish this survey.
              </p>
            )
          ) : (
            <button className="btn btn-secondary" onClick={handleUnpublishSurvey}>
              Unpublish (back to draft)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
