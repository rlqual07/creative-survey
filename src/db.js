const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set.');
  console.error('   Create a free Postgres database at https://neon.com and set');
  console.error('   DATABASE_URL to its connection string. See RENDER_DEPLOYMENT.md.');
}

// Hosted providers (Neon, Render, Supabase) require TLS and present certs Node
// will not verify against its default CA bundle, so verification is relaxed
// while the connection stays encrypted. A local Postgres has no TLS at all, so
// SSL is switched off for localhost.
const connectionString = process.env.DATABASE_URL || '';
const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres client error:', err.message);
});

/**
 * Translate the SQLite dialect used in src/routes into Postgres.
 *
 *   1. Positional `?` placeholders become `$1`, `$2`, ... Question marks inside
 *      single-quoted string literals are left alone.
 *   2. `strftime('%s','now')` becomes an epoch-seconds expression.
 *
 * This keeps existing route SQL working unchanged. New queries may use either
 * style; `$n` placeholders pass through untouched.
 */
const translate = (sql) => {
  let out = '';
  let index = 0;
  let inString = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    if (char === "'") {
      // Doubled '' is an escaped quote inside a literal, not a boundary.
      if (inString && sql[i + 1] === "'") {
        out += "''";
        i++;
        continue;
      }
      inString = !inString;
      out += char;
      continue;
    }

    if (char === '?' && !inString) {
      index++;
      out += `$${index}`;
      continue;
    }

    out += char;
  }

  return out.replace(
    /strftime\(\s*'%s'\s*,\s*'now'\s*\)/gi,
    'EXTRACT(EPOCH FROM NOW())::bigint'
  );
};

const query = async (sql, params = []) => pool.query(translate(sql), params);

// Mirrors the previous SQLite helper signatures so routes need no changes.
const run = async (sql, params = []) => {
  const result = await query(sql, params);
  return { changes: result.rowCount, rows: result.rows };
};

const get = async (sql, params = []) => {
  const result = await query(sql, params);
  return result.rows[0];
};

const all = async (sql, params = []) => {
  const result = await query(sql, params);
  return result.rows || [];
};

const initialize = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS surveys (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        consent_form TEXT,
        status TEXT DEFAULT 'draft',
        created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::bigint,
        updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::bigint
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS stimulus_blocks (
        id TEXT PRIMARY KEY,
        survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
        block_order INTEGER NOT NULL,
        stimulus_type TEXT NOT NULL,
        stimulus_url TEXT NOT NULL,
        stimulus_title TEXT
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
        block_id TEXT REFERENCES stimulus_blocks(id) ON DELETE CASCADE,
        question_set INTEGER NOT NULL,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL,
        scale_max INTEGER,
        options TEXT
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS demographic_questions (
        id TEXT PRIMARY KEY,
        survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL,
        options TEXT
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS participants (
        id TEXT PRIMARY KEY,
        survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
        session_token TEXT UNIQUE NOT NULL,
        block_randomization TEXT NOT NULL,
        started_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::bigint,
        completed_at BIGINT
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS responses (
        id TEXT PRIMARY KEY,
        participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
        question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        block_id TEXT REFERENCES stimulus_blocks(id) ON DELETE CASCADE,
        block_position INTEGER,
        response_value TEXT,
        answered_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::bigint
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS demographic_responses (
        id TEXT PRIMARY KEY,
        participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
        demographic_question_id TEXT NOT NULL REFERENCES demographic_questions(id) ON DELETE CASCADE,
        response_value TEXT,
        answered_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::bigint
      )
    `);

    // Additive migrations for databases created by an earlier version.
    const migrations = [
      `ALTER TABLE surveys ADD COLUMN IF NOT EXISTS intro_text TEXT`,
      `ALTER TABLE participants ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress'`,
      `ALTER TABLE participants ADD COLUMN IF NOT EXISTS abandoned_at BIGINT`,
      `ALTER TABLE responses ADD COLUMN IF NOT EXISTS block_id TEXT`,
      `ALTER TABLE responses ADD COLUMN IF NOT EXISTS block_position INTEGER`,
      `ALTER TABLE questions ALTER COLUMN block_id DROP NOT NULL`,
      `ALTER TABLE participants ADD COLUMN IF NOT EXISTS sequence_index INTEGER`,
      `ALTER TABLE participants ADD COLUMN IF NOT EXISTS duration_seconds INTEGER`,
    ];
    for (const sql of migrations) {
      try {
        await query(sql);
      } catch (err) {
        // DROP NOT NULL fails harmlessly if the column is already nullable.
        if (!/does not exist|cannot|already/i.test(err.message)) throw err;
      }
    }

    const { rows } = await pool.query('SELECT current_database() AS name');
    console.log(`✅ Connected to Postgres database "${rows[0].name}"`);
    console.log('✅ Database tables created/verified');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  }
};

module.exports = { pool, query, run, get, all, initialize, translate };
