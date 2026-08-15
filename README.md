# Creative Survey Platform - Browser-Only Deployment

A completely free survey platform with **zero command line required**.

**Just use your browser to deploy!**

## Features

✅ **No CLI Required** - Deploy entirely through web browser  
✅ **Completely Free** - Heroku free tier (no credit card)  
✅ **SQLite Database** - No external cloud database needed  
✅ **Block Randomization** - Automatic random stimulus shuffling  
✅ **Admin Dashboard** - Create surveys in browser  
✅ **Live Results** - View responses real-time  
✅ **Mobile Friendly** - Works on any device  

## Quick Start (10 Minutes - All in Browser)

### Step 1: Fork Repository on GitHub (2 min)

1. Go to: https://github.com/rlqual07/creative-survey
2. Click **Fork** (top right)
3. Click **Create fork**
4. Wait for it to complete

**Result:** You now have your own copy at `https://github.com/YOUR_USERNAME/creative-survey`

### Step 2: Deploy to Heroku (5 min)

1. Go to: https://dashboard.heroku.com/
2. Sign up (free, no credit card)
3. Click **New** → **Create new app**
4. App name: `creative-survey-yourname`
5. Click **Create app**
6. Go to **Deploy** tab
7. Click **Connect to GitHub**
8. Search: `creative-survey`
9. Click **Connect**
10. Under "Automatic deploys", click **Enable Automatic Deploys**
11. Under "Manual deploy", click **Deploy Branch**
12. Wait ~3 minutes for deployment

**Result:** Your app is live at `https://creative-survey-yourname.herokuapp.com`

### Step 3: Create Your Survey (3 min)

1. Open: `https://creative-survey-yourname.herokuapp.com/admin`
2. Click **"Create New Survey"**
3. Fill in:
   - Title: "My Research Study"
   - Description: "A study about creativity"
   - Consent Form: Your full consent text
4. Click **Create Survey**

### Step 4: Add Stimulus Blocks

For each of your 4 stimuli:

1. Click **"Add Stimulus Block"**
2. Choose:
   - **Block**: 1, 2, 3, or 4
   - **Type**: Image or Video
   - **URL**: Paste your stimulus URL (see below)
   - **Title**: "Stimulus 1" (optional)
3. Click **Add Block**
4. Repeat for blocks 2, 3, 4

**How to get stimulus URLs:**

**Images:**
- Go to https://imgur.com
- Upload image
- Right-click → "Copy image link"
- Paste URL in survey

**Videos:**
- Upload to https://youtube.com (Unlisted)
- Right-click video → Copy URL
- Paste in survey

OR:
- Use https://loom.com (free screen recordings)
- Copy shareable link

### Step 5: Add Questions

For each stimulus block:

1. Add **Question Set 1** (8 questions)
2. Add **Question Set 2** (10 questions)

Then add **4 Demographics Questions**

### Step 6: Publish & Share

1. Click **"Publish Survey"**
2. Share this link with participants:
   ```
   https://creative-survey-yourname.herokuapp.com/survey
   ```

### Step 7: View Results

Go to: `https://creative-survey-yourname.herokuapp.com/results`

See:
- Total participants
- Completion rate
- All responses

---

## Architecture

```
🌐 Browser
   ↓
📱 React Admin Dashboard / Survey Interface
   ↓
🔗 HTTP API
   ↓
☁️ Heroku Server
   ├─ Express Backend
   ├─ SQLite Database (survey.db)
   └─ (No external databases)
```

## Database (SQLite)

Stored as `survey.db` file on Heroku:
- Surveys
- Stimulus blocks
- Questions
- Participant responses
- Demographics

All data stays with your app. No separate database service.

## No Credit Card Required

✅ Heroku free tier (no credit card)  
✅ GitHub free account  
✅ Imgur (free image hosting)  
✅ YouTube (free video hosting)  
✅ Completely free to run  

## Free Tier Limitations

- App sleeps after 30 min of no activity (wakes instantly when accessed)
- ~100 participants is practical limit
- Data stored on Heroku (safe)

## Making Changes (Browser Only)

If you want to edit code:

1. Go to your GitHub fork: `https://github.com/YOUR_USERNAME/creative-survey`
2. Click the file to edit
3. Click the pencil icon ✏️
4. Make changes
5. Click **Commit changes**
6. Heroku auto-deploys within 1 minute!

## Getting Help

See these files in your repo:
- `QUICKSTART.md` - Step-by-step guide
- `BROWSER_DEPLOYMENT.md` - Detailed browser-only instructions
- `README.md` - Project overview

---

**That's it!** Your survey platform is live with:
- ✅ Zero command line
- ✅ All in browser
- ✅ Completely free
- ✅ For 100 participants

🎉 **Ready to deploy?** Start with Step 1 above!
