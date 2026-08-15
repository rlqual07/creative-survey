import React, { useState, useEffect } from 'react';
import * as surveyService from '../services/surveyService';
import '../styles/SurveyFlow.css';

const SurveyFlow: React.FC = () => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);
  const [step, setStep] = useState<'select' | 'consent' | 'survey' | 'complete'>('select');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActiveSurveys();
  }, []);

  const loadActiveSurveys = async () => {
    setLoading(true);
    try {
      const data = await surveyService.getAllSurveys();
      const activeSurveys = data.filter((s) => s.status === 'active');
      setSurveys(activeSurveys);
    } catch (error) {
      console.error('Failed to load surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSurvey = (survey: any) => {
    setSelectedSurvey(survey);
    setStep('consent');
  };

  const handleConsentAccept = async () => {
    if (!selectedSurvey) return;
    setLoading(true);
    try {
      const participant = await surveyService.startParticipantSession(selectedSurvey.id);
      setStep('survey');
    } catch (error) {
      console.error('Failed to start survey:', error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'select') {
    return (
      <div className="survey-page">
        <div className="card">
          <h1>📝 Available Surveys</h1>
          {loading ? (
            <div className="loading">Loading surveys...</div>
          ) : surveys.length === 0 ? (
            <p className="no-surveys">No surveys available at the moment. Please check back later.</p>
          ) : (
            <div className="survey-select-list">
              {surveys.map((survey) => (
                <div key={survey.id} className="survey-select-card">
                  <h3>{survey.title}</h3>
                  {survey.description && <p>{survey.description}</p>}
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSelectSurvey(survey)}
                    disabled={loading}
                  >
                    Start Survey
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'consent' && selectedSurvey) {
    return (
      <div className="survey-page">
        <div className="card">
          <h2>📋 Consent Form</h2>
          <div className="consent-text">{selectedSurvey.consentForm}</div>
          <div className="consent-buttons">
            <button className="btn btn-success btn-lg" onClick={handleConsentAccept} disabled={loading}>
              ✓ I Agree & Start Survey
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => setStep('select')}>
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'survey' && selectedSurvey) {
    return <SurveyTaker survey={selectedSurvey} onComplete={() => setStep('complete')} />;
  }

  if (step === 'complete') {
    return (
      <div className="survey-page">
        <div className="card thank-you">
          <h1>🎉 Thank You!</h1>
          <p>Your responses have been recorded. Thank you for participating in this survey.</p>
          <button className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>
            Take Another Survey
          </button>
        </div>
      </div>
    );
  }

  return null;
};

interface SurveyTakerProps {
  survey: any;
  onComplete: () => void;
}

const SurveyTaker: React.FC<SurveyTakerProps> = ({ survey, onComplete }) => {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [blockOrder, setBlockOrder] = useState<number[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState<'stimulus' | 'q1' | 'q2'>('stimulus');

  useEffect(() => {
    loadSurveyData();
  }, []);

  const loadSurveyData = async () => {
    try {
      const blocksData = await surveyService.getStimulusBlocks(survey.id);
      setBlocks(blocksData);
      // Get block randomization from participant session
      const randomOrder = [0, 1, 2, 3]; // Placeholder
      for (let i = randomOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomOrder[i], randomOrder[j]] = [randomOrder[j], randomOrder[i]];
      }
      setBlockOrder(randomOrder);
    } catch (error) {
      console.error('Failed to load survey data:', error);
    }
  };

  const handleStimulusViewed = () => {
    setCurrentSubStep('q1');
  };

  const handleQuestionSetComplete = (questionSet: number) => {
    if (questionSet === 1) {
      setCurrentSubStep('q2');
    } else {
      if (currentBlockIndex + 1 < 4) {
        setCurrentBlockIndex(currentBlockIndex + 1);
        setCurrentSubStep('stimulus');
      } else {
        onComplete();
      }
    }
  };

  if (blocks.length === 0) {
    return <div className="loading">Loading survey...</div>;
  }

  const currentBlockIdx = blockOrder[currentBlockIndex];
  const currentBlock = blocks[currentBlockIdx];

  return (
    <div className="survey-taker">
      <div className="progress-section">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentBlockIndex + 1) / 4) * 100}%` }}></div>
        </div>
        <div className="progress-text">Block {currentBlockIndex + 1} of 4</div>
      </div>

      <div className="card">
        {currentSubStep === 'stimulus' && currentBlock && (
          <StimulusViewer
            type={currentBlock.stimulusType}
            url={currentBlock.stimulusUrl}
            title={currentBlock.stimulusTitle}
            onViewed={handleStimulusViewed}
          />
        )}

        {(currentSubStep === 'q1' || currentSubStep === 'q2') && (
          <QuestionSetPlaceholder
            questionSet={currentSubStep === 'q1' ? 1 : 2}
            onComplete={() => handleQuestionSetComplete(currentSubStep === 'q1' ? 1 : 2)}
          />
        )}
      </div>
    </div>
  );
};

interface StimulusViewerProps {
  type: string;
  url: string;
  title: string;
  onViewed: () => void;
}

const StimulusViewer: React.FC<StimulusViewerProps> = ({ type, url, title, onViewed }) => {
  return (
    <div className="stimulus-viewer">
      <h2>{title || 'Stimulus'}</h2>
      {type === 'image' && <img src={url} alt="stimulus" className="stimulus-image" />}
      {type === 'video' && (
        <video src={url} className="stimulus-video" controls onEnded={onViewed}>
          Your browser does not support the video tag.
        </video>
      )}
      {type === 'image' && <button className="btn btn-primary" onClick={onViewed}>Continue to Questions</button>}
    </div>
  );
};

interface QuestionSetPlaceholderProps {
  questionSet: number;
  onComplete: () => void;
}

const QuestionSetPlaceholder: React.FC<QuestionSetPlaceholderProps> = ({ questionSet, onComplete }) => {
  return (
    <div className="question-set">
      <h3>Question Set {questionSet}</h3>
      <p className="placeholder-text">Questions will be displayed here.</p>
      <p className="placeholder-text">This feature is coming in the next update.</p>
      <button className="btn btn-success" onClick={onComplete}>
        Continue →
      </button>
    </div>
  );
};

export default SurveyFlow;
