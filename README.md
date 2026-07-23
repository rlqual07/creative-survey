# Creative Survey Platform

A block-randomized research survey platform for online data collection. Supports image/video stimuli with configurable question sets.

## Features

- ✅ Admin dashboard to configure survey content
- ✅ Block-level randomization (4 stimulus blocks in random order)
- ✅ Support for image and video stimuli
- ✅ Consent form management
- ✅ Demographic questions
- ✅ Real-time response collection
- ✅ Results dashboard
- ✅ Export survey data (CSV/JSON)

## Survey Flow

```
Consent Form
    ↓
[Block 1-4 in Random Order]
├─ Stimulus (image/video)
├─ Question Set 1 (8 items)
└─ Question Set 2 (10 items)
    ↓
Demographics (4 items)
    ↓
Thank You
```

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **Deployment**: Docker, Railway/Heroku
- **Database**: PostgreSQL

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rlqual07/creative-survey.git
cd creative-survey
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm start
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm start
```

4. **Access the platform**
- Admin Dashboard: `http://localhost:3000/admin`
- Participant Survey: `http://localhost:3000/survey`
- Backend API: `http://localhost:5000`

## Project Structure

```
creative-survey/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── survey.js
│   │   │   ├── questions.js
│   │   │   └── responses.js
│   │   ├── models/
│   │   │   ├── Survey.js
│   │   │   ├── Question.js
│   │   │   └── Response.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   └── randomization.js
│   │   └── server.js
│   ├── database/
│   │   └── schema.sql
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── SurveyFlow.tsx
│   │   │   └── ResultsDashboard.tsx
│   │   ├── components/
│   │   │   ├── ConsentForm.tsx
│   │   │   ├── StimulusBlock.tsx
│   │   │   ├── QuestionSet.tsx
│   │   │   └── Demographics.tsx
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Railway, Heroku, or Vercel.

## Data Collection

Survey responses are stored in PostgreSQL with the following structure:
- Participant ID (anonymized)
- Block randomization order
- Responses to each question
- Demographic data
- Timestamp

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
