const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db');

const router = express.Router();

// Add stimulus block
router.post('/:surveyId/blocks', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { blockOrder, stimulusType, stimulusUrl, stimulusTitle } = req.body;
    const blockId = uuidv4();

    await run(
      `INSERT INTO stimulus_blocks (id, survey_id, block_order, stimulus_type, stimulus_url, stimulus_title) VALUES (?, ?, ?, ?, ?, ?)`,
      [blockId, surveyId, blockOrder, stimulusType, stimulusUrl, stimulusTitle]
    );

    const block = await get('SELECT * FROM stimulus_blocks WHERE id = ?', [blockId]);
    res.status(201).json(block);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add question
router.post('/question/add', async (req, res) => {
  try {
    const { surveyId, blockId, questionSet, questionNumber, questionText, questionType, scaleMax, options } = req.body;
    const questionId = uuidv4();

    await run(
      `INSERT INTO questions (id, survey_id, block_id, question_set, question_number, question_text, question_type, scale_max, options) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        questionId,
        surveyId,
        blockId,
        questionSet,
        questionNumber,
        questionText,
        questionType,
        scaleMax,
        options ? JSON.stringify(options) : null,
      ]
    );

    const question = await get('SELECT * FROM questions WHERE id = ?', [questionId]);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get blocks
router.get('/:surveyId/blocks', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const blocks = await all('SELECT * FROM stimulus_blocks WHERE survey_id = ? ORDER BY block_order', [
      surveyId,
    ]);
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add demographic question
router.post('/:surveyId/demographics', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { questionNumber, questionText, questionType, options } = req.body;
    const questionId = uuidv4();

    await run(
      `INSERT INTO demographic_questions (id, survey_id, question_number, question_text, question_type, options) VALUES (?, ?, ?, ?, ?, ?)`,
      [questionId, surveyId, questionNumber, questionText, questionType, options ? JSON.stringify(options) : null]
    );

    const question = await get('SELECT * FROM demographic_questions WHERE id = ?', [questionId]);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
