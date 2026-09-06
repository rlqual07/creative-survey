const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db');

const router = express.Router();

// Add stimulus block
router.post('/:surveyId/blocks', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { stimulusType, stimulusUrl, stimulusTitle } = req.body;
    const blockId = uuidv4();

    if (!stimulusUrl || !stimulusUrl.trim()) {
      return res.status(400).json({ error: 'Stimulus URL is required' });
    }

    // Append to the end. Assigning server-side keeps block_order contiguous
    // and avoids duplicate positions when several blocks are added quickly.
    const existing = await all(
      'SELECT block_order FROM stimulus_blocks WHERE survey_id = ?',
      [surveyId]
    );
    const nextOrder = existing.length + 1;

    await run(
      `INSERT INTO stimulus_blocks (id, survey_id, block_order, stimulus_type, stimulus_url, stimulus_title) VALUES (?, ?, ?, ?, ?, ?)`,
      [blockId, surveyId, nextOrder, stimulusType, stimulusUrl, stimulusTitle]
    );

    const block = await get('SELECT * FROM stimulus_blocks WHERE id = ?', [blockId]);
    res.status(201).json(block);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a stimulus block (and its questions, via cascade)
router.delete('/blocks/:blockId', async (req, res) => {
  try {
    const { blockId } = req.params;

    const block = await get('SELECT * FROM stimulus_blocks WHERE id = ?', [blockId]);
    if (!block) {
      return res.status(404).json({ error: 'Stimulus block not found' });
    }

    await run('DELETE FROM stimulus_blocks WHERE id = ?', [blockId]);

    // Close the gap left in block_order so the sequence stays 1..n
    const remaining = await all(
      'SELECT id FROM stimulus_blocks WHERE survey_id = ? ORDER BY block_order ASC',
      [block.survey_id]
    );
    for (let i = 0; i < remaining.length; i++) {
      await run('UPDATE stimulus_blocks SET block_order = ? WHERE id = ?', [
        i + 1,
        remaining[i].id,
      ]);
    }

    res.json({ deleted: true, id: blockId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a stimulus block
router.put('/blocks/:blockId', async (req, res) => {
  try {
    const { blockId } = req.params;
    const { stimulusType, stimulusUrl, stimulusTitle } = req.body;

    const block = await get('SELECT * FROM stimulus_blocks WHERE id = ?', [blockId]);
    if (!block) {
      return res.status(404).json({ error: 'Stimulus block not found' });
    }

    await run(
      `UPDATE stimulus_blocks
       SET stimulus_type = ?, stimulus_url = ?, stimulus_title = ?
       WHERE id = ?`,
      [
        stimulusType || block.stimulus_type,
        stimulusUrl || block.stimulus_url,
        stimulusTitle !== undefined ? stimulusTitle : block.stimulus_title,
        blockId,
      ]
    );

    const updated = await get('SELECT * FROM stimulus_blocks WHERE id = ?', [blockId]);
    res.json(updated);
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
