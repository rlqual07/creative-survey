import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/SurveyFlow.css';

const API_URL = '/api';

interface Survey {
  id: string;
  title: string;
  description: string;
  consent_form: string;
  intro_text?: string;
  status: string;
}

interface StimulusBlock {
  id: string;
  block_order: number;
  stimulus_type: string;
  stimulus_url: string;
  stimulus_title: string;
}

interface QuestionItem {
  id: string;
  text: string;
  type: string;
  scaleMax: number | null;
  options: string[] | null;
}

interface QuestionSet {
  questionSet: number;
  prompt: string;
  type: string;
  scaleMax: number | null;
  items: QuestionItem[];
}

interface DemographicQuestion {
  id: string;
  text: string;
  type: string;
  options: string[] | null;
}

type Step = 'select' | 'intro' | 'consent' | 'survey' | 'demographics' | 'complete';

const SurveyFlow: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [step, setStep] = useState<Step>('select');

  const [participantId, setParticipantId] = useState<string | null>(null);
  const [blockOrder, setBlockOrder] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<StimulusBlock[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [demographics, setDemographics] = useState<DemographicQuestion[]>([]);

  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  // -1 means "showing the stimulus"; 0..n-1 index into questionSets
  const [currentSetIndex, setCurrentSetIndex] = useState(-1);
  const [hasViewedStimulus, setHasViewedStimulus] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [demoAnswers, setDemoAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/survey`)
      .then((res) => setSurveys(res.data.filter((s: Survey) => s.status === 'active')))
      .catch(() => setError('Could not load surveys.'));
  }, []);

  const beginSurvey = async (survey: Survey) => {
    setError(null);
    try {
      const instrument = await axios.get(`${API_URL}/survey/${survey.id}/instrument`);
      setSelectedSurvey(instrument.data.survey);
      setBlocks(instrument.data.blocks);
      setQuestionSets(instrument.data.questionSets);
      setDemographics(instrument.data.demographics);
      setStep('consent');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not load this survey.');
    }
  };

  const acceptConsent = async () => {
    if (!selectedSurvey) return;
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/survey/${selectedSurvey.id}/start`);
      setParticipantId(res.data.id);
      setBlockOrder(JSON.parse(res.data.block_randomization));
      setCurrentBlockIndex(0);
      setCurrentSetIndex(-1);
      setHasViewedStimulus(false);
      setStep(selectedSurvey.intro_text ? 'intro' : 'survey');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not start the survey.');
    }
  };

  // Look the block up by ID. The randomization stores block IDs, not positions.
  const currentBlock =
    blockOrder.length > 0
      ? blocks.find((b) => b.id === blockOrder[currentBlockIndex]) || null
      : null;

  const currentSet = currentSetIndex >= 0 ? questionSets[currentSetIndex] : null;

  const allItemsAnswered =
    currentSet !== null && currentSet.items.every((item) => answers[item.id]);

  const saveCurrentSet = async () => {
    if (!currentSet || !participantId || !currentBlock) return;
    setSaving(true);
    try {
      await axios.post(`${API_URL}/responses/batch`, {
        participantId,
        blockId: currentBlock.id,
        blockPosition: currentBlockIndex + 1,
        answers: currentSet.items.map((item) => ({
          questionId: item.id,
          responseValue: answers[item.id],
        })),
      });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not save your answers.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const advance = async () => {
    setError(null);

    if (currentSetIndex === -1) {
      setCurrentSetIndex(0);
      return;
    }

    const ok = await saveCurrentSet();
    if (!ok) return;

    if (currentSetIndex + 1 < questionSets.length) {
      setCurrentSetIndex(currentSetIndex + 1);
      return;
    }

    // Finished all sets for this block
    if (currentBlockIndex + 1 < blockOrder.length) {
      setCurrentBlockIndex(currentBlockIndex + 1);
      setCurrentSetIndex(-1);
      setHasViewedStimulus(false);
      setAnswers({});
      return;
    }

    if (demographics.length > 0) {
      setStep('demographics');
      return;
    }
    if (await markComplete()) setStep('complete');
  };

  const markComplete = useCallback(async () => {
    if (!participantId) return true;
    try {
      await axios.post(`${API_URL}/survey/participant/${participantId}/complete`);
      return true;
    } catch (err: any) {
      // The server refuses to mark a partial survey complete. Surface it rather
      // than showing a thank-you page for a record that will not be kept.
      setError(
        err.response?.data?.error ||
          'Your responses could not be submitted. Please contact the researcher.'
      );
      return false;
    }
  }, [participantId]);

  const submitDemographics = async () => {
    if (!participantId) return;
    setSaving(true);
    setError(null);
    try {
      for (const d of demographics) {
        if (!demoAnswers[d.id]) continue;
        await axios.post(`${API_URL}/responses/demographic`, {
          participantId,
          demographicQuestionId: d.id,
          responseValue: demoAnswers[d.id],
        });
      }
      if (await markComplete()) setStep('complete');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not save your answers.');
    } finally {
      setSaving(false);
    }
  };

  const exitSurvey = async () => {
    const confirmed = window.confirm(
      'Leave the survey?\n\nYour answers will be permanently deleted and nothing will be recorded. You cannot resume.'
    );
    if (!confirmed) return;

    if (participantId) {
      try {
        await axios.post(`${API_URL}/survey/participant/${participantId}/abandon`);
      } catch {
        /* non-fatal */
      }
    }
    resetToStart();
  };

  const resetToStart = () => {
    setStep('select');
    setSelectedSurvey(null);
    setParticipantId(null);
    setBlockOrder([]);
    setBlocks([]);
    setQuestionSets([]);
    setAnswers({});
    setDemoAnswers({});
    setCurrentBlockIndex(0);
    setCurrentSetIndex(-1);
    setError(null);
  };

  const ExitButton = () => (
    <button className="btn btn-secondary btn-small survey-exit" onClick={exitSurvey}>
      Exit survey
    </button>
  );

  // ---------------------------------------------------------------- select
  if (step === 'select') {
    return (
      <div className="survey-flow card">
        <h1>Available Surveys</h1>
        {error && <p className="alert alert-error">{error}</p>}
        {surveys.length === 0 ? (
          <p>There are no published surveys at the moment.</p>
        ) : (
          <div className="survey-list">
            {surveys.map((s) => (
              <div key={s.id} className="survey-item">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <button className="btn btn-primary" onClick={() => beginSurvey(s)}>
                  Begin
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------------------- intro
  if (step === 'intro' && selectedSurvey) {
    return (
      <div className="survey-flow card">
        <h1>{selectedSurvey.title}</h1>
        <div className="intro-text">
          {(selectedSurvey.intro_text || '').split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setStep('survey')}>
          Continue to the survey
        </button>
        <ExitButton />
      </div>
    );
  }

  // --------------------------------------------------------------- consent
  if (step === 'consent' && selectedSurvey) {
    return (
      <div className="survey-flow card">
        <h1>Consent</h1>
        <div className="consent-text">
          {(selectedSurvey.consent_form || '').split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        {error && <p className="alert alert-error">{error}</p>}
        <button className="btn btn-success" onClick={acceptConsent}>
          I consent, begin the survey
        </button>
        <button className="btn btn-secondary" onClick={resetToStart}>
          Decline
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------- survey
  if (step === 'survey') {
    if (!currentBlock) {
      return (
        <div className="survey-flow card">
          <p className="alert alert-error">
            This stimulus could not be loaded. Please contact the researcher.
          </p>
          <ExitButton />
        </div>
      );
    }

    return (
      <div className="survey-flow card">
        <div className="survey-progress">
          Stimulus {currentBlockIndex + 1} of {blockOrder.length}
          {currentSet && ` — Question set ${currentSetIndex + 1} of ${questionSets.length}`}
        </div>

        {error && <p className="alert alert-error">{error}</p>}

        {currentSetIndex === -1 ? (
          <>
            <h2>{currentBlock.stimulus_title || `Stimulus ${currentBlockIndex + 1}`}</h2>
            <StimulusViewer
              type={currentBlock.stimulus_type}
              url={currentBlock.stimulus_url}
              title={currentBlock.stimulus_title}
              onViewed={() => setHasViewedStimulus(true)}
            />
            <button
              className="btn btn-primary"
              disabled={!hasViewedStimulus}
              onClick={advance}
            >
              {hasViewedStimulus ? 'Continue to questions' : 'Please view the stimulus first'}
            </button>
          </>
        ) : (
          <>
            {currentSet?.prompt && <p className="question-prompt">{currentSet.prompt}</p>}

            {currentSet?.items.map((item) =>
              item.type === 'likert' ? (
                <LikertRow
                  key={item.id}
                  item={item}
                  value={answers[item.id]}
                  onChange={(v) => setAnswers({ ...answers, [item.id]: v })}
                />
              ) : (
                <ChoiceQuestion
                  key={item.id}
                  item={item}
                  value={answers[item.id]}
                  onChange={(v) => setAnswers({ ...answers, [item.id]: v })}
                />
              )
            )}

            <button
              className="btn btn-primary"
              disabled={!allItemsAnswered || saving}
              onClick={advance}
            >
              {saving ? 'Saving…' : allItemsAnswered ? 'Continue' : 'Please answer all items'}
            </button>
          </>
        )}

        <ExitButton />
      </div>
    );
  }

  // ---------------------------------------------------------- demographics
  if (step === 'demographics') {
    const allAnswered = demographics.every((d) => demoAnswers[d.id]);
    return (
      <div className="survey-flow card">
        <h1>A few final questions</h1>
        {error && <p className="alert alert-error">{error}</p>}

        {demographics.map((d) => (
          <ChoiceQuestion
            key={d.id}
            item={{
              id: d.id,
              text: d.text,
              type: d.type,
              scaleMax: null,
              options: d.options,
            }}
            value={demoAnswers[d.id]}
            onChange={(v) => setDemoAnswers({ ...demoAnswers, [d.id]: v })}
          />
        ))}

        <button
          className="btn btn-success"
          disabled={!allAnswered || saving}
          onClick={submitDemographics}
        >
          {saving ? 'Saving…' : allAnswered ? 'Submit' : 'Please answer all questions'}
        </button>
        <ExitButton />
      </div>
    );
  }

  // -------------------------------------------------------------- complete
  return (
    <div className="survey-flow card">
      <h1>Thank you</h1>
      <p>Your responses have been recorded.</p>
      <button className="btn btn-primary" onClick={resetToStart}>
        Back to surveys
      </button>
    </div>
  );
};

// ------------------------------------------------------------- components

interface StimulusViewerProps {
  type: string;
  url: string;
  title: string;
  onViewed: () => void;
}

const StimulusViewer: React.FC<StimulusViewerProps> = ({ type, url, title, onViewed }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (failed) {
    return (
      <div className="stimulus-viewer">
        <p className="alert alert-warning">
          This stimulus could not be displayed.{' '}
          <a href={url} target="_blank" rel="noopener noreferrer">
            Open it in a new tab
          </a>{' '}
          to continue.
        </p>
        <button className="btn btn-secondary btn-small" onClick={onViewed}>
          I have viewed it
        </button>
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className="stimulus-viewer">
        <video
          src={url}
          controls
          width="100%"
          onEnded={onViewed}
          onError={() => setFailed(true)}
        >
          <track kind="captions" />
        </video>
        <p className="stimulus-hint">Please watch the video to the end.</p>
      </div>
    );
  }

  return (
    <div className="stimulus-viewer">
      <img
        src={url}
        alt={title || 'Stimulus'}
        style={{ maxWidth: '100%' }}
        onLoad={onViewed}
        onError={() => setFailed(true)}
      />
    </div>
  );
};

const LikertRow: React.FC<{
  item: QuestionItem;
  value?: string;
  onChange: (v: string) => void;
}> = ({ item, value, onChange }) => {
  const max = item.scaleMax || 7;
  const points = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="likert-row">
      <p className="likert-statement">{item.text}</p>
      <div className="likert-scale">
        {points.map((n) => (
          <label key={n} className="likert-point">
            <input
              type="radio"
              name={`q-${item.id}`}
              value={n}
              checked={value === String(n)}
              onChange={() => onChange(String(n))}
            />
            <span>{n}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const ChoiceQuestion: React.FC<{
  item: QuestionItem;
  value?: string;
  onChange: (v: string) => void;
}> = ({ item, value, onChange }) => (
  <div className="choice-question">
    <p className="choice-text">{item.text}</p>
    {(item.options || []).map((opt) => (
      <label key={opt} className="choice-option">
        <input
          type="radio"
          name={`q-${item.id}`}
          value={opt}
          checked={value === opt}
          onChange={() => onChange(opt)}
        />
        <span>{opt}</span>
      </label>
    ))}
  </div>
);

export default SurveyFlow;
