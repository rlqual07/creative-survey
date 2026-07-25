# Deployment Guide

This guide will help you deploy the Creative Survey Platform online for your 100 participants.

## Option 1: Local Development (Quick Start)

### Prerequisites
- Node.js 16+
- PostgreSQL database
- Git

### Step 1: Set Up Database

```bash
# Create PostgreSQL database
creatdb creative_survey
```

### Step 2: Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=creative_survey
# DB_USER=postgres
# DB_PASSWORD=your_password

# Run database migrations
npm run migrate

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api

# Start frontend
npm start
```

Frontend will run on `http://localhost:3000`

---

## Option 2: Deploy to Railway (Recommended for 100 Participants) 🚀

**Railway** is perfect for hosting this app. Free tier covers ~100 participants.

### Step 1: Sign up on Railway
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

### Step 2: Create PostgreSQL Database

1. In Railway dashboard, click **Create New Project**
2. Select **Provision PostgreSQL**
3. Note your database credentials

### Step 3: Deploy Backend

1. Click **Create New** → **GitHub Repo**
2. Select your `creative-survey` repository
3. Select **Node.js** runtime
4. Configure environment variables:
   ```
   DB_HOST=your_railway_db_host
   DB_PORT=5432
   DB_NAME=creative_survey
   DB_USER=postgres
   DB_PASSWORD=your_password
   PORT=5000
   FRONTEND_URL=https://your-frontend.railway.app
   NODE_ENV=production
   ```
5. Update `start` script to run migrations before starting:
   ```json
   "start": "npm run migrate && node src/server.js"
   ```

### Step 4: Deploy Frontend

1. In Railway, click **Create New** → **GitHub Repo**
2. Select same repository
3. Select **Static Site** or **Node.js**
4. Set build command: `cd frontend && npm install && npm run build`
5. Set start command: `cd frontend && npx serve -s build -l 3000`
6. Environment variables:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```

### Step 5: Get Your URLs

- Backend: `https://creative-survey-backend.railway.app`
- Frontend: `https://creative-survey-frontend.railway.app`

Share the **frontend URL** with your 100 participants!

---

## Option 3: Deploy to Vercel (Frontend Only)

**For hosting just the frontend:**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url/api
   ```
5. Deploy!

---

## Next Steps: How to Use

### 1. Access Admin Dashboard
```
http://localhost:3000/admin
(or your deployed URL)
```

### 2. Create Your Survey

**Click "Create New Survey"** and fill in:
- **Title**: "My Research Study"
- **Description**: Brief description
- **Consent Form**: Your full consent form text

Click **Create Survey**

### 3. Add Your 4 Stimulus Blocks

For each block (1-4):

1. Click **"Add Stimulus Block"**
2. Select block number (1-4)
3. Choose stimulus type: **Image** or **Video**
4. Enter stimulus URL (must be publicly accessible):
   - Image: `https://example.com/image1.jpg`
   - Video: `https://example.com/video1.mp4`
5. Add title (optional): "Creative Stimulus 1"
6. Click **Add Block**

**Important**: Your stimulus files must be hosted online:
- Use **Imgur** for images: Upload image → Copy URL
- Use **YouTube** for videos: Get shareable link
- Or use your own cloud storage (AWS S3, Google Drive, etc.)

### 4. Add Questions

*(This feature will be added in next update - for now, add via API)*

### 5. Add Demographics Questions

*(This feature will be added in next update - for now, add via API)*

### 6. Publish Survey

Once all 4 blocks are added:
- Click **"Publish Survey"**
- Survey becomes active

### 7. Share with Participants

Give participants this URL:
```
https://your-platform.railway.app/survey
```

They will:
1. Read consent form
2. Click "I Agree & Start Survey"
3. See 4 blocks in **randomized order**
4. Answer questions for each block
5. Complete demographics
6. See thank you page

### 8. View Results

Go to **Results Dashboard** to see:
- Total participants
- Completion rate
- All responses

---

## Adding Questions via API (Temporary)

Until the UI is complete, add questions via cURL:

```bash
# Get your survey ID from admin dashboard

# Add question to block
curl -X POST http://localhost:5000/api/questions/block/{blockId}/question \
  -H "Content-Type: application/json" \
  -d '{
    "questionSet": 1,
    "questionNumber": 1,
    "questionText": "How creative is this stimulus?",
    "questionType": "likert",
    "scaleMax": 5
  }'

# Add demographic question
curl -X POST http://localhost:5000/api/questions/{surveyId}/demographics \
  -H "Content-Type: application/json" \
  -d '{
    "questionNumber": 1,
    "questionText": "What is your age?",
    "questionType": "text"
  }'
```

---

## Troubleshooting

**Database connection error:**
- Check DB credentials in `.env`
- Ensure PostgreSQL is running
- Verify database name exists

**CORS errors:**
- Check `FRONTEND_URL` in backend `.env`
- Ensure it matches your actual frontend URL

**Stimulus not loading:**
- Verify URL is publicly accessible
- Test URL in browser directly
- Use HTTPS URLs

**Survey won't publish:**
- Ensure all 4 stimulus blocks are added
- Refresh page and try again

---

## Support

For issues:
1. Check GitHub repository issues
2. Review logs in deployment platform
3. Contact support

