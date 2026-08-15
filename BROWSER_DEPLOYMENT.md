# Browser-Only Deployment Guide (No CLI)

## 🎯 Goal

Deploy your survey app to Heroku **using only your browser.** No command line. No CLI. No terminal.

---

## 📋 Prerequisites (All Free)

- ✅ GitHub account (free): https://github.com/signup
- ✅ Heroku account (free, no credit card): https://signup.heroku.com
- ✅ Your browser (already have it!)

---

## Step 1: Fork Repository on GitHub (2 minutes)

### What is a Fork?
A fork is your own copy of the code that you control.

### How to Fork:

1. **Go to the repository:**
   ```
   https://github.com/rlqual07/creative-survey
   ```

2. **Click the "Fork" button** (top right of page)
   
   ![Fork button location](https://docs.github.com/assets/cb-25819/images/help/repository/fork_button.jpg)

3. **Click "Create fork"**

4. **Wait for it to complete** (takes ~30 seconds)

5. **You'll see your own fork:**
   ```
   https://github.com/YOUR_USERNAME/creative-survey
   ```

✅ **Done!** You now own your copy of the code.

---

## Step 2: Deploy to Heroku (5 minutes)

### 2.1 Create Heroku Account

1. Go to: https://signup.heroku.com
2. Fill in:
   - Email
   - First name
   - Last name
   - Company (optional)
3. Click **Create free account**
4. Check your email and click the verification link
5. Create a password
6. Accept terms
7. ✅ **Done!** You have a free Heroku account

### 2.2 Connect GitHub to Heroku

1. **Go to Heroku Dashboard:** https://dashboard.heroku.com/
2. **Click "New"** (top right)
3. **Click "Create new app"**
4. Fill in:
   - **App name:** `creative-survey-yourname`
     (Make it unique, use your name or initials)
   - **Region:** Choose your region
5. **Click "Create app"**
6. **You're now on your app dashboard**

### 2.3 Connect Your GitHub Fork

1. **Go to the "Deploy" tab** (top menu)
2. **Under "Deployment method", click "GitHub"**
3. **Click "Connect to GitHub"**
4. **You'll see a GitHub permissions popup**
   - Click "Authorize heroku"
   - GitHub will ask for permission (this is safe)
5. **Back in Heroku, under "Connect to GitHub":**
   - Search for: `creative-survey`
   - You'll see your fork: `YOUR_USERNAME/creative-survey`
   - Click **"Connect"**

✅ **GitHub is now connected to Heroku!**

### 2.4 Deploy Your App

1. **Still in the "Deploy" tab**
2. **Under "Automatic deploys", click "Enable Automatic Deploys"**
   - This makes it auto-deploy when you push changes
3. **Under "Manual deploy", click "Deploy Branch"**
   - This starts the deployment now
4. **Wait ~3 minutes for deployment to complete**
   - You'll see a progress bar
   - When done, it says: "Your app was successfully deployed"
5. **Click "Open app"** (top right)

✅ **Your app is now LIVE!**

**Your app URL:** `https://creative-survey-yourname.herokuapp.com`

---

## Step 3: Access Your Admin Dashboard (1 minute)

1. **Go to:** `https://creative-survey-yourname.herokuapp.com/admin`
2. **You'll see the Admin Dashboard**
3. ✅ **Ready to create surveys!**

---

## Step 4: Create Your First Survey (5 minutes)

### 4.1 Create Survey

1. Click **"Create New Survey"**
2. Fill in:
   - **Title:** "My Research Study"
   - **Description:** "A study about creative perception"
   - **Consent Form:** Paste your full informed consent text
3. Click **"Create Survey"**
4. ✅ **Survey created!**

### 4.2 Add Stimulus Blocks (1 for each of your 4 stimuli)

**For each stimulus (4 total):**

1. Click **"Add Stimulus Block"**
2. Fill in:
   - **Block Order:** Select 1, 2, 3, or 4
   - **Stimulus Type:** Choose "Image" or "Video"
   - **Stimulus URL:** Paste your stimulus URL (see below)
   - **Title (optional):** "Stimulus 1"
3. Click **"Add Block"**
4. Repeat for all 4 blocks

### How to Get Stimulus URLs:

**For Images:**
1. Go to https://imgur.com
2. Drag and drop your image
3. Right-click the image
4. Click "Copy image link"
5. Paste it in the survey form

**For Videos:**
1. Go to https://youtube.com
2. Upload video (set to "Unlisted")
3. Right-click the video
4. Click "Copy video URL"
5. Paste it in the survey form

**Alternative (Easy Screen Recordings):**
1. Go to https://loom.com
2. Click "Start recording"
3. Record your screen
4. Copy the shareable link
5. Paste in survey form

### 4.3 Add Questions

*Coming soon - for now, your 4 blocks are set up with stimuli!*

### 4.4 Publish Survey

1. Once all 4 blocks are added
2. Click **"Publish Survey"**
3. ✅ **Survey is LIVE!**

---

## Step 5: Share with Participants (1 minute)

**Give your 100 participants this link:**

```
https://creative-survey-yourname.herokuapp.com/survey
```

They will:
1. See your survey in the list
2. Read your consent form
3. Click "I Agree & Start Survey"
4. See 4 stimulus blocks in **RANDOM ORDER** ✅
5. Answer all questions
6. See thank you page

---

## Step 6: View Results (2 minutes)

1. Go to: `https://creative-survey-yourname.herokuapp.com/results`
2. Select your survey
3. See:
   - 📊 Total participants
   - ✅ Completed surveys
   - 📈 Completion rate
   - 📝 All responses

---

## Making Changes (Browser Only)

If you want to update your code:

1. **Go to your GitHub fork:**
   ```
   https://github.com/YOUR_USERNAME/creative-survey
   ```

2. **Click any `.tsx` or `.js` file to edit**

3. **Click the pencil icon** ✏️ (top right of file)

4. **Make your changes**

5. **Scroll down and click "Commit changes"**

6. **Heroku automatically deploys!** (takes ~1 minute)

---

## Troubleshooting

### Q: App takes a long time to load?
**A:** Free tier sleeps after 30 min. First request wakes it up (takes 10-30 sec).

### Q: "Deployment failed" error?
**A:** Go to the "Activity" tab in Heroku to see what went wrong. Usually just needs a retry.

### Q: My changes aren't showing?
**A:** Wait 1-2 minutes for Heroku to deploy. Refresh your browser.

### Q: Can I delete the app?
**A:** Yes! In Heroku app settings → "Delete app". Your GitHub fork is still there.

### Q: What if I lose my data?
**A:** SQLite database is stored on Heroku. Back it up by contacting Heroku support.

---

## Advanced: Download Your Data

*(Coming soon - easy CSV export feature)*

---

## Summary

| Step | Time | Browser Only? |
|------|------|---------------|
| 1. Fork GitHub | 2 min | ✅ Yes |
| 2. Deploy Heroku | 5 min | ✅ Yes |
| 3. Access Admin | 1 min | ✅ Yes |
| 4. Create Survey | 5 min | ✅ Yes |
| 5. Share Link | 1 min | ✅ Yes |
| 6. View Results | 2 min | ✅ Yes |
| **TOTAL** | **~15 min** | **✅ YES** |

---

## 🎉 You're Done!

**Your survey platform is live with:**
- ✅ Zero CLI / command line
- ✅ All in your browser
- ✅ Completely free (no credit card)
- ✅ Ready for 100 participants
- ✅ Block randomization built in

**Next:** Go to Step 1 above and start deploying!

