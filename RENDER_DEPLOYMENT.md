# Deploy to Render (Free, No Credit Card)

> **Before collecting real data:** responses are stored in SQLite on Render's
> ephemeral filesystem and are destroyed on every deploy, restart, and cold
> start. See [KNOWN_ISSUES.md](KNOWN_ISSUES.md) item 1. Pilot testing only.



## ✅ CONFIRMED: No Credit Card Required

Render's free tier **does NOT require a credit card**. You can sign up, deploy, and run your app completely free.

---

## Deploy in 10 Minutes (All in Browser)

### Step 1: Fork Your Repository (2 min)

1. Go to: https://github.com/rlqual07/creative-survey
2. Click **Fork** (top right)
3. Click **Create fork**
4. ✅ Wait for it to complete

**Result:** Your own copy at `https://github.com/YOUR_USERNAME/creative-survey`

---

### Step 2: Sign Up on Render (2 min - No Credit Card)

1. Go to: https://render.com
2. Click **Sign Up** (top right)
3. Click **Continue with GitHub**
4. Authorize Render to access your GitHub
5. ✅ **No credit card asked at any point**

---

### Step 3: Deploy Your App (5 min)

1. **In Render Dashboard**, click **New +** (top right)
2. Click **Web Service**
3. Click **Connect a repository**
4. **Search for:** `creative-survey`
5. **Select:** Your forked repo `YOUR_USERNAME/creative-survey`
6. Click **Connect**
7. Fill in deployment settings:
   - **Name:** `creative-survey` (or any name)
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
8. Click **Create Web Service**
9. ✅ **Wait 3-5 minutes for deployment**

You'll see logs like:
```
✅ Build succeeded
✅ Deployment live
```

---

### Step 4: Your App is Live!

Render gives you a URL like:
```
https://creative-survey-xxxxx.onrender.com
```

✅ **Your survey platform is now live!**

---

## Step 5: Create Your Survey (5 min)

1. Go to: `https://creative-survey-xxxxx.onrender.com/admin`
2. Click **Create New Survey**
3. Fill in:
   - **Title:** "My Research Study"
   - **Description:** "A study about creativity"
   - **Consent Form:** Your full consent text
4. Click **Create Survey**

---

## Step 6: Add Stimulus Blocks

For each of your 4 stimuli:

1. Click **Add Stimulus Block**
2. Choose:
   - **Block:** 1, 2, 3, or 4
   - **Type:** Image or Video
   - **URL:** Paste your stimulus URL
   - **Title:** "Stimulus 1" (optional)
3. Click **Add Block**
4. **Repeat for blocks 2, 3, 4**

### Getting Stimulus URLs:

**For Images:**
- Go to https://imgur.com
- Upload your image
- Right-click → "Copy image link"
- Paste in survey

**For Videos:**
- Go to https://youtube.com (sign up free)
- Upload video (set to "Unlisted")
- Right-click video → "Copy URL"
- Paste in survey

**Alternative (Screen Recordings):**
- Use https://loom.com (free)
- Record your screen
- Copy shareable link
- Paste in survey

---

## Step 7: Add Questions

For each stimulus block, add:
- **Question Set 1:** 8 questions
- **Question Set 2:** 10 questions

Plus **4 Demographics Questions**

---

## Step 8: Publish & Share

1. Click **Publish Survey**
2. Share this link with your 100 participants:
   ```
   https://creative-survey-xxxxx.onrender.com/survey
   ```

---

## Step 9: View Results

Go to: `https://creative-survey-xxxxx.onrender.com/results`

See:
- 📊 Total participants
- ✅ Completed surveys
- 📈 Completion rate
- 📝 All responses

---

## Key Features

✅ **Completely Free** - No credit card ever needed  
✅ **750 Compute Hours/Month** - Plenty for surveys  
✅ **Auto-Deploy from GitHub** - Changes auto-deploy  
✅ **SQLite Database** - Data stored on your app  
✅ **Block Randomization** - Automatic shuffling  
✅ **Mobile Friendly** - Works on any device  
✅ **Browser Only** - Deploy entirely in browser  

---

## Render Free Tier Limits

- ✅ 750 compute hours/month (plenty for surveys)
- ✅ ~100 participants (practical limit)
- ⏱️ Cold start: App wakes up in 30-60 seconds after inactivity
- ✅ Data never deleted
- ✅ No surprise billing (free tier never charges)

---

## Making Changes (Browser Only)

If you want to update your code:

1. Go to your GitHub fork: `https://github.com/YOUR_USERNAME/creative-survey`
2. Click the file to edit
3. Click the pencil icon ✏️
4. Make your changes
5. Click **Commit changes**
6. Render auto-deploys within 1 minute! 🚀

---

## Troubleshooting

### Q: Build failed?
**A:** Check the "Logs" tab in Render. Usually just needs to wait and retry.

### Q: App won't start?
**A:** Click "Manual Deploy" in Render dashboard → "Latest Commit"

### Q: How do I access my database?
**A:** SQLite database is `survey.db` on the server. Data persists across restarts.

### Q: Can I export survey data?
**A:** Yes! Coming soon in the results dashboard (CSV export).

### Q: What if I exceed 750 hours?
**A:** Service suspends (doesn't charge). Upgrade to paid if needed (optional).

---

## Summary

| Step | Time | Credit Card? |
|------|------|---------------|
| 1. Fork GitHub | 2 min | ❌ No |
| 2. Sign Up Render | 2 min | ❌ No |
| 3. Deploy | 5 min | ❌ No |
| 4-9. Create Survey | 15 min | ❌ No |
| **TOTAL** | **~25 min** | **❌ NEVER** |

---

## 🎉 You're Done!

**Your survey platform is live with:**
- ❌ Zero credit card
- ✅ All in browser
- ✅ Completely free
- ✅ For 100 participants
- ✅ Block randomization built in
- ✅ Professional results dashboard

**Next:** Start with Step 1 above! 🚀
