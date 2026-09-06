const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./src/db');
const surveyRoutes = require('./src/routes/survey');
const questionsRoutes = require('./src/routes/questions');
const responsesRoutes = require('./src/routes/responses');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Initialize database
db.initialize();

// API Routes
app.use('/api/survey', surveyRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/responses', responsesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📱 Open: http://localhost:${PORT}`);
  console.log(`🎯 Admin: http://localhost:${PORT}/admin`);
  console.log(`📝 Survey: http://localhost:${PORT}/survey\n`);
});
