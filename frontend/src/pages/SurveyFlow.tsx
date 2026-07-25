import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Survey {
  id: string;
  title: string;
  consent_form: string;
}

interface StimulusBlock {
  id: string;
  stimulus_type: string;
  stimulus_url: string;
  stimulus_title: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  question_set: number;
  scale_max?: number;
}

const SurveyFlow: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [step, setStep] = useState<'select' | 'consent' | 'survey' | 'complete'>('select');
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [blockOrder, setBlockOrder] = useState<number[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [blocks, setBlocks] = useState<StimulusBlock[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentSubStep, setCurrentSubStep] = useState<'stimulus' | 'q1' | 'q2'>('stimulus');
  const [responses, setResponses] = useState<Record<string, any>>({});

  useEffect(() => {
    loadActiveSurveys();
  }, []);

  const loadActiveSurveys = async () => {
    try {
      const response = await axios.get(`${API_URL}/survey`);
      const activeSurveys = response.data.filter((s: Survey) => true); // Filter for active surveys
      setSurveys(activeSurveys);
    } catch (error) {
      console.error('Error loading surveys:', error);
    }
  };

  const handleSelectSurvey = async (survey: Survey) => {
    setSelectedSurvey(survey);
    setStep('consent');
  };

  const handleConsentAccept = async () => {
    if (!selectedSurvey) return;

    try {
      // Start participant session
      const response = await axios.post(`${API_URL}/survey/${selectedSurvey.id}/start`);
      const participant = response.data;
      
      setParticipantId(participant.id);
      setBlockOrder(JSON.parse(participant.block_randomization));
      
      // Load survey data
      const surveyData = await axios.get(`${API_URL}/survey/${selectedSurvey.id}/full`);
      setBlocks(surveyData.data.blocks);
      setQuestions(surveyData.data.questions);
      
      setStep('survey');
    } catch (error) {
      console.error('Error starting survey:', error);
      alert('Failed to start survey');
    }
  };

  const handleStimulusViewed = () => {
    setCurrentSubStep('q1');
  };

  const handleQuestionSetComplete = async (questionSet: number) => {
    if (questionSet === 1) {
      setCurrentSubStep('q2');
    } else {
      // Move to next block
      if (currentBlockIndex + 1 < 4) {
        setCurrentBlockIndex(currentBlockIndex + 1);
        setCurrentSubStep('stimulus');
      } else {
        setStep('complete');
      }
    }
  };

  if (step === 'select') {
    return (
      <div className="survey-page">
        <div className="card">
          <h1>Available Surveys</h1>
          {surveys.length === 0 ? (
            <p>No surveys available at the moment.</p>
          ) : (
            <div className="survey-list">
              {surveys.map((survey) => (
                <div key={survey.id} className="survey-item-select">
                  <h3>{survey.title}</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSelectSurvey(survey)}
                  >
                    Take Survey
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
          <h2>Consent Form</h2>
          <div className="consent-text">
            {selectedSurvey.consent_form}
          </div>
          <div className="consent-buttons">
            <button className="btn btn-success" onClick={handleConsentAccept}>
              I Agree & Start Survey
            </button>
            <button className="btn btn-danger" onClick={() => setStep('select')}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'survey' && selectedSurvey) {
    const currentBlock = blocks[blockOrder[currentBlockIndex]];
    const currentBlockQuestions = questions.filter(
      (q) => q.question_set === (currentSubStep === 'q1' ? 1 : 2) &&
             blocks.indexOf(blocks.find(b => b.id === currentBlock.id)!) === blockOrder[currentBlockIndex]
    );

    return (
      <div className="survey-page">
        <div className="progress-bar">
          Block {currentBlockIndex + 1} of 4 - {currentSubStep === 'stimulus' ? 'Viewing Stimulus' : `Question Set ${currentSubStep === 'q1' ? 1 : 2}`}
        </div>

        <div className="card">
          {currentSubStep === 'stimulus' && currentBlock && (
            <StimulusViewer
              type={currentBlock.stimulus_type}
              url={currentBlock.stimulus_url}
              title={currentBlock.stimulus_title}
              onViewed={handleStimulusViewed}
            />
          )}

          {(currentSubStep === 'q1' || currentSubStep === 'q2') && (
            <QuestionSet
              questions={currentBlockQuestions}
              questionSet={currentSubStep === 'q1' ? 1 : 2}
              onComplete={() => handleQuestionSetComplete(currentSubStep === 'q1' ? 1 : 2)}
            />
          )}
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="survey-page">
        <div className="card">
          <h1>Thank You!</h1>
          <p>Your responses have been recorded. Thank you for participating in this survey.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Take Another Survey
          </button>
        </div>
      </div>
    );
  }

  return null;
};

interface StimulusViewerProps {
  type: string;
  url: string;
  title: string;
  onViewed: () => void;
}

const StimulusViewer: React.FC<StimulusViewerProps> = ({ type, url, title, onViewed }) => {
  const [hasViewed, setHasViewed] = useState(false);

  const handleViewed = () => {
    setHasViewed(true);
    onViewed();
  };

  return (
    <div className="stimulus-viewer">
      <h2>{title}</h2>
      {type === 'image' && <img src={url} alt="stimulus" className="stimulus-image" />}
      {type === 'video' && (
        <video
          src={url}
          className="stimulus-video"
          controls
          onEnded={handleViewed}
        >
          Your browser does not support the video tag.
        </video>
      )}
      {type === 'image' && (
        <button className="btn btn-primary" onClick={handleViewed}>
          Continue to Questions
        </button>
      )}
    </div>
  );
};

interface QuestionSetProps {
  questions: Question[];
  questionSet: number;
  onComplete: () => void;
}

const QuestionSet: React.FC<QuestionSetProps> = ({ questions, questionSet, onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length === questions.length) {
      onComplete();
    } else {
      alert('Please answer all questions');
    }
  };

  return (
    <div className="question-set">
      <h2>Question Set {questionSet}</h2>
      {questions.map((question) => (
        <div key={question.id} className="question-item">
          <p>{question.question_text}</p>
          {question.question_type === 'likert' && (
            <div className="likert-scale">
              {Array.from({ length: question.scale_max || 5 }).map((_, i) => (
                <label key={i} className="likert-option">
                  <input
                    type="radio"
                    name={question.id}
                    value={i + 1}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    checked={answers[question.id] === String(i + 1)}
                  />
                  {i + 1}
                </label>
              ))}
            </div>
          )}
          {question.question_type === 'text' && (
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Your answer"
            />
          )}
        </div>
      ))}
      <button className="btn btn-success" onClick={handleSubmit}>
        Continue
      </button>
    </div>
  );
};

export default SurveyFlow;
