# API Reference

## Base URL
```
http://localhost:5000/api
```

## Survey Endpoints

### Create Survey
```
POST /survey

Body:
{
  "title": "My Research Study",
  "description": "A study about creativity",
  "consentForm": "Full consent text here..."
}

Response: { id, title, description, consent_form, status, created_at, updated_at }
```

### Get All Surveys
```
GET /survey

Response: [{ id, title, description, consent_form, status, created_at, updated_at }, ...]
```

### Get Survey by ID
```
GET /survey/{surveyId}

Response: { id, title, description, consent_form, status, created_at, updated_at }
```

### Get Full Survey Data
```
GET /survey/{surveyId}/full

Response: {
  survey: { id, title, ... },
  blocks: [{ id, stimulus_type, stimulus_url, ... }, ...],
  questions: [{ id, question_text, question_type, ... }, ...],
  demographics: [{ id, question_text, ... }, ...]
}
```

### Publish Survey
```
PUT /survey/{surveyId}/publish

Response: { id, title, status: "active", ... }
```

### Start Participant Session
```
POST /survey/{surveyId}/start

Response: {
  id: "participant_id",
  survey_id: "survey_id",
  session_token: "unique_token",
  block_randomization: [2, 0, 3, 1],
  started_at: "2024-01-01T12:00:00Z"
}
```

---

## Question Endpoints

### Add Stimulus Block
```
POST /questions/{surveyId}/blocks

Body:
{
  "blockOrder": 1,
  "stimulusType": "image",
  "stimulusUrl": "https://example.com/image.jpg",
  "stimulusTitle": "Stimulus 1"
}

Response: { id, survey_id, block_order, stimulus_type, stimulus_url, stimulus_title }
```

### Add Question to Block
```
POST /questions/block/{blockId}/question

Body:
{
  "questionSet": 1,
  "questionNumber": 1,
  "questionText": "How creative is this?",
  "questionType": "likert",
  "scaleMax": 5
}

Response: { id, stimulus_block_id, question_set, question_number, question_text, question_type, scale_max }
```

### Add Demographic Question
```
POST /questions/{surveyId}/demographics

Body:
{
  "questionNumber": 1,
  "questionText": "What is your age?",
  "questionType": "text",
  "options": null
}

Response: { id, survey_id, question_number, question_text, question_type }
```

### Get Blocks for Survey
```
GET /questions/{surveyId}/blocks

Response: [{ id, block_order, stimulus_type, stimulus_url, ... }, ...]
```

---

## Response Endpoints

### Submit Question Response
```
POST /responses

Body:
{
  "participantId": "participant_id",
  "questionId": "question_id",
  "responseValue": "5"
}

Response: { id, participant_id, question_id, response_value, answered_at }
```

### Submit Demographic Response
```
POST /responses/demographic

Body:
{
  "participantId": "participant_id",
  "demographicQuestionId": "question_id",
  "responseValue": "25"
}

Response: { id, participant_id, demographic_question_id, response_value, answered_at }
```

### Get All Responses for Participant
```
GET /responses/participant/{participantId}

Response: [
  { id, participant_id, question_id, response_value, question_text, question_type, answered_at },
  ...
]
```

### Get Survey Results Summary
```
GET /responses/survey/{surveyId}/results

Response: {
  total_participants: 45,
  completed_participants: 42,
  total_responses: 1890
}
```

---

## Question Types

- **likert**: Likert scale (1-5 or custom)
- **text**: Text input
- **multiple_choice**: Choose one option
- **checkbox**: Choose multiple options

---

## Response Examples

### Likert Response
```json
{
  "participantId": "550e8400-e29b-41d4-a716-446655440000",
  "questionId": "550e8400-e29b-41d4-a716-446655440001",
  "responseValue": "4"
}
```

### Text Response
```json
{
  "participantId": "550e8400-e29b-41d4-a716-446655440000",
  "questionId": "550e8400-e29b-41d4-a716-446655440002",
  "responseValue": "Very creative and engaging"
}
```

