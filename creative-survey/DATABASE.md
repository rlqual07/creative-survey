# Database Schema Reference

## Tables Overview

### Surveys
Stores survey metadata and configuration.

```sql
SELECT * FROM surveys;
-- id, title, description, consent_form, status, created_at, updated_at
```

### Stimulus Blocks
Stores the 4 stimulus items (images/videos) for each survey.

```sql
SELECT * FROM stimulus_blocks WHERE survey_id = 'SURVEY_ID';
-- id, survey_id, block_order, stimulus_type, stimulus_url, stimulus_title, created_at
```

### Questions
Stores all survey questions (question sets 1 & 2 for each block).

```sql
SELECT * FROM questions WHERE stimulus_block_id = 'BLOCK_ID';
-- id, stimulus_block_id, question_set, question_number, question_text, question_type, scale_max, scale_labels, options, created_at
```

### Demographic Questions
Stores the 4 demographic questions.

```sql
SELECT * FROM demographic_questions WHERE survey_id = 'SURVEY_ID';
-- id, survey_id, question_number, question_text, question_type, options, created_at
```

### Participants
Tracks each survey participant and their randomization order.

```sql
SELECT * FROM participants WHERE survey_id = 'SURVEY_ID';
-- id, survey_id, session_token, block_randomization (JSON), started_at, completed_at
```

**block_randomization example:**
```json
[2, 0, 3, 1]  // Block order this participant sees
```

### Responses
Stores all question responses from participants.

```sql
SELECT r.*, q.question_text 
FROM responses r
JOIN questions q ON r.question_id = q.id
WHERE r.participant_id = 'PARTICIPANT_ID';
-- id, participant_id, question_id, response_value, response_json, answered_at
```

### Demographic Responses
Stores demographic question responses.

```sql
SELECT dr.*, dq.question_text
FROM demographic_responses dr
JOIN demographic_questions dq ON dr.demographic_question_id = dq.id
WHERE dr.participant_id = 'PARTICIPANT_ID';
-- id, participant_id, demographic_question_id, response_value, answered_at
```

---

## Common Queries

### Get all participants for a survey
```sql
SELECT id, session_token, block_randomization, started_at, completed_at
FROM participants
WHERE survey_id = 'SURVEY_ID'
ORDER BY started_at DESC;
```

### Get completion statistics
```sql
SELECT 
  COUNT(*) as total_started,
  COUNT(completed_at) as total_completed,
  ROUND(100.0 * COUNT(completed_at) / COUNT(*), 2) as completion_rate
FROM participants
WHERE survey_id = 'SURVEY_ID';
```

### Export all responses as CSV
```sql
COPY (
  SELECT 
    r.participant_id,
    q.stimulus_block_id,
    q.question_set,
    q.question_number,
    q.question_text,
    r.response_value,
    r.answered_at
  FROM responses r
  JOIN questions q ON r.question_id = q.id
  JOIN stimulus_blocks sb ON q.stimulus_block_id = sb.id
  JOIN participants p ON r.participant_id = p.id
  WHERE p.survey_id = 'SURVEY_ID'
  ORDER BY r.participant_id, r.answered_at
) TO STDOUT WITH CSV HEADER;
```

### Get randomization distribution (check if balanced)
```sql
SELECT 
  block_randomization::text as randomization_order,
  COUNT(*) as num_participants
FROM participants
WHERE survey_id = 'SURVEY_ID'
GROUP BY block_randomization::text
ORDER BY COUNT(*) DESC;
```

---

## Data Types

- **UUID**: Unique identifiers
- **VARCHAR**: Text fields (title, names)
- **TEXT**: Long text (consent form, questions)
- **JSONB**: Structured data (questions options, randomization order)
- **TIMESTAMP**: Date/time fields
- **INTEGER**: Numbers (question numbers, scale max)

