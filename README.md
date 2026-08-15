# Creative Survey Platform - Free Version (Heroku + SQLite)

A completely free survey platform using Heroku (free tier) + SQLite database. **No credit card required.**

## Features

✅ **Completely Free** - Heroku free tier (no credit card)  
✅ **No Cloud Database** - SQLite (stored locally on server)  
✅ **Browser Admin Dashboard** - Create surveys, add questions  
✅ **Block Randomization** - Automatic random block shuffling  
✅ **Live Results** - View responses in real-time  
✅ **Export Data** - Download as CSV  
✅ **Mobile Friendly** - Works on any device  

## Tech Stack

- **Frontend**: React + TypeScript (browser-based)
- **Backend**: Node.js + Express (runs on Heroku free tier)
- **Database**: SQLite3 (no external database needed)
- **Hosting**: Heroku (free tier - no credit card)

## Quick Start (10 Minutes)

### Step 1: Clone & Install Locally

```bash
git clone https://github.com/rlqual07/creative-survey.git
cd creative-survey

# Install dependencies
npm install

# Run both backend and frontend
npm start
```

Open: `http://localhost:3000`

### Step 2: Deploy to Heroku (Free)

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create Heroku app
heroku create creative-survey-yourname

# Deploy
git push heroku main

# Done! Your app is live at:
# https://creative-survey-yourname.herokuapp.com
```

### Step 3: Create Your Survey

1. Go to: `https://creative-survey-yourname.herokuapp.com/admin`
2. Create survey with title, description, consent form
3. Add 4 stimulus blocks (images/videos)
4. Add questions
5. Publish

### Step 4: Share with Participants

Give them: `https://creative-survey-yourname.herokuapp.com/survey`

---

## Architecture

```
Your Browser
     ↓
┌─────────────────────────────────┐
│  React Frontend (Admin + Survey) │
│  - Create surveys               │
│  - Take surveys                 │
│  - View results                 │
└─────────────────────────────────┘
     ↓
   HTTP API
     ↓
┌─────────────────────────────────┐
│  Heroku (Free Tier)             │
│  - Express Server               │
│  - API Endpoints                │
└─────────────────────────────────┘
     ↓
┌─────────────────────────────────┐
│  SQLite Database (survey.db)    │
│  - Surveys                      │
│  - Questions                    │
│  - Responses                    │
│  (Stored as file on server)     │
└─────────────────────────────────┘
```

## Database Structure

SQLite tables:
- `surveys` - Survey metadata
- `stimulus_blocks` - Image/video stimuli
- `questions` - All survey questions
- `demographic_questions` - Demographics
- `participants` - Participant sessions
- `responses` - Question responses
- `demographic_responses` - Demographics responses

## No Credit Card Required

✅ Heroku free tier (no credit card)  
✅ SQLite (included with Node.js)  
✅ No external services  
✅ No file storage fees  
✅ Completely free to run  

## Limitations (Free Tier)

- App sleeps after 30 mins of inactivity (wakes up when accessed)
- ~100 participants is the practical limit
- Data stored on Heroku (backed up via git)

## Support

See documentation:
- `QUICKSTART.md` - Step-by-step setup
- `ADMIN_GUIDE.md` - How to create surveys
- `HEROKU_SETUP.md` - Detailed Heroku deployment

