const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'survey.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Helper to run queries
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

const initialize = async () => {
  try {
    // Create tables
    await run(`
      CREATE TABLE IF NOT EXISTS surveys (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        consent_form TEXT,
        status TEXT DEFAULT 'draft',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS stimulus_blocks (
        id TEXT PRIMARY KEY,
        survey_id TEXT NOT NULL,
        block_order INTEGER NOT NULL,
        stimulus_type TEXT NOT NULL,
        stimulus_url TEXT NOT NULL,
        stimulus_title TEXT,
        FOREIGN KEY(survey_id) REFERENCES surveys(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        survey_id TEXT NOT NULL,
        block_id TEXT NOT NULL,
        question_set INTEGER NOT NULL,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL,
        scale_max INTEGER,
        options TEXT,
        FOREIGN KEY(survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
        FOREIGN KEY(block_id) REFERENCES stimulus_blocks(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS demographic_questions (
        id TEXT PRIMARY KEY,
        survey_id TEXT NOT NULL,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL,
        options TEXT,
        FOREIGN KEY(survey_id) REFERENCES surveys(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS participants (
        id TEXT PRIMARY KEY,
        survey_id TEXT NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        block_randomization TEXT NOT NULL,
        started_at INTEGER DEFAULT (strftime('%s', 'now')),
        completed_at INTEGER,
        FOREIGN KEY(survey_id) REFERENCES surveys(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS responses (
        id TEXT PRIMARY KEY,
        participant_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        response_value TEXT,
        answered_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY(participant_id) REFERENCES participants(id) ON DELETE CASCADE,
        FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS demographic_responses (
        id TEXT PRIMARY KEY,
        participant_id TEXT NOT NULL,
        demographic_question_id TEXT NOT NULL,
        response_value TEXT,
        answered_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY(participant_id) REFERENCES participants(id) ON DELETE CASCADE,
        FOREIGN KEY(demographic_question_id) REFERENCES demographic_questions(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables created/verified');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

module.exports = {
  db,
  run,
  get,
  all,
  initialize,
};
