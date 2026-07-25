# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### For Local Testing

```bash
# 1. Clone repository
git clone https://github.com/rlqual07/creative-survey.git
cd creative-survey

# 2. Set up backend
cd backend
npm install
cp .env.example .env
# Edit .env with your database info
npm run migrate
npm run dev

# 3. In another terminal, set up frontend
cd frontend
npm install
npm start
```

**Now open:** http://localhost:3000

---

## 📋 How to Input Your Survey

### Step 1: Create Survey
1. Go to **Admin Dashboard** → http://localhost:3000/admin
2. Click **"Create New Survey"**
3. Fill in:
   - **Title**: Your research study name
   - **Description**: What the study is about
   - **Consent Form**: Your full informed consent text
4. Click **Create Survey**

### Step 2: Add Stimulus Materials

You need 4 stimulus blocks (images or videos).

**To prepare your stimuli:**

1. **For Images:**
   - Upload to [Imgur.com](https://imgur.com) (free)
   - Right-click image → Copy image link
   - Save the URL

2. **For Videos:**
   - Upload to YouTube (unlisted)
   - Share link: `https://youtube.com/embed/VIDEO_ID`
   - Or use [Vimeo](https://vimeo.com)

**In Admin Dashboard:**

1. Click **"Add Stimulus Block"**
2. Fill in:
   - **Block Order**: 1, 2, 3, or 4
   - **Stimulus Type**: Image or Video
   - **Stimulus URL**: Paste your URL
   - **Title**: "Stimulus 1" (optional)
3. Click **Add Block**
4. **Repeat for all 4 blocks**

### Step 3: Add Questions via API

*(UI coming soon - use API for now)*

**Question Set 1 (8 questions per block):**

```bash
curl -X POST http://localhost:5000/api/questions/block/{BLOCK_ID}/question \
  -H "Content-Type: application/json" \
  -d '{
    "questionSet": 1,
    "questionNumber": 1,
    "questionText": "How would you rate the creativity of this stimulus?",
    "questionType": "likert",
    "scaleMax": 5
  }'
```

Repeat for questions 2-8, changing `questionNumber` and `questionText`.

**Question Set 2 (10 questions per block):**

Do the same but change `questionSet` to 2 and `questionNumber` to 1-10.

**Demographic Questions (4 questions):**

```bash
curl -X POST http://localhost:5000/api/questions/{SURVEY_ID}/demographics \
  -H "Content-Type: application/json" \
  -d '{
    "questionNumber": 1,
    "questionText": "What is your age?",
    "questionType": "text"
  }'
```

### Step 4: Publish Survey

1. Once all 4 blocks are added
2. Click **"Publish Survey"**
3. Survey is now **LIVE**

### Step 5: Share with Participants

Share this URL:
```
http://localhost:3000/survey
```

OR for deployed version:
```
https://your-platform.railway.app/survey
```

---

## 📊 How Block Randomization Works

Each participant sees:

**Participant 1:**
- Block 3 → Block 1 → Block 4 → Block 2

**Participant 2:**
- Block 2 → Block 4 → Block 1 → Block 3

**Participant 3:**
- Block 1 → Block 2 → Block 3 → Block 4

*(Random order each time!)*

This ensures:
✅ No order bias
✅ Balanced stimulus exposure
✅ Valid research data

---

## 📈 Survey Flow for Participants

```
1. Select Survey
   ↓
2. Read Consent Form
   ↓
3. Click "I Agree & Start"
   ↓
4. [For each of 4 blocks in RANDOM order]
   - View Stimulus (image/video)
   - Answer 8 Questions (Question Set 1)
   - Answer 10 Questions (Question Set 2)
   ↓
5. Answer 4 Demographic Questions
   ↓
6. See "Thank You" Page
```

---

## 🎯 FAQ

**Q: Can I change the number of questions?**
A: Yes! Modify the API calls or edit the code.

**Q: What image formats are supported?**
A: JPG, PNG, GIF (any URL that displays in a browser)

**Q: Can I pause and resume surveys?**
A: Currently no - participants must complete in one session.

**Q: How do I download the data?**
A: Results are in PostgreSQL. Export via database tools or we can add export feature.

**Q: Is it GDPR compliant?**
A: We store minimal data (responses only, no IP). Ensure your consent form mentions data handling.

---

## 🆘 Need Help?

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
2. Check logs in your terminal
3. GitHub Issues for bugs

