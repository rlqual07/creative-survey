# Heroku Deployment Guide (Free, No Credit Card)

## Prerequisites

- Git installed: https://git-scm.com/
- Heroku CLI installed: https://devcenter.heroku.com/articles/heroku-cli
- GitHub account (optional but recommended)

## Step 1: Prepare Your Code

```bash
cd creative-survey
git init
git add .
git commit -m "Initial commit"
```

## Step 2: Create Heroku App (Free)

```bash
# Login to Heroku (free, no credit card needed)
heroku login

# Create new app
heroku create creative-survey-yourname

# Check your app was created
heroku apps
```

Your app URL: `https://creative-survey-yourname.herokuapp.com`

## Step 3: Deploy Code

```bash
# Push to Heroku
git push heroku main

# Watch deployment logs
heroku logs --tail
```

Wait for deployment to complete. You'll see: ✅ "Deployed to Heroku"

## Step 4: Test Your App

```bash
# Open in browser
heroku open

# Or go to:
# https://creative-survey-yourname.herokuapp.com
```

## Step 5: Create Surveys

1. Go to: `https://creative-survey-yourname.herokuapp.com/admin`
2. Create your first survey
3. Add stimulus blocks, questions
4. Publish

## Step 6: Share Survey Link

Give participants: `https://creative-survey-yourname.herokuapp.com/survey`

---

## Using GitHub (Optional - Easier Deployment)

### Connect GitHub to Heroku for Auto-Deploy

1. Push your code to GitHub:
   ```bash
   git remote add github https://github.com/yourusername/creative-survey.git
   git push github main
   ```

2. In Heroku Dashboard:
   - Go to your app: https://dashboard.heroku.com/apps
   - Click your app
   - Go to **Deploy** tab
   - Connect GitHub repository
   - Enable auto-deploy from `main` branch

3. Now every `git push github main` auto-deploys to Heroku!

---

## Troubleshooting

### App won't start

```bash
# Check logs
heroku logs --tail

# Restart app
heroku restart
```

### Database not found

```bash
# Reinitialize
heroku run npm start
```

### Port issues

Make sure `server.js` uses `process.env.PORT`:
```javascript
const PORT = process.env.PORT || 5000;
```

---

## Heroku Free Tier Limitations

✅ Free dyno (small server)
✅ SQLite database (included)
❌ App sleeps after 30 min of no activity (wakes up when accessed)
❌ ~100 participants practical limit

---

## Keeping Your App Awake (Optional)

If app sleeps, it takes 10-30 seconds to wake up on first request.

To keep it awake, use a free uptime monitor:

1. Go to https://uptimerobot.com
2. Create free account
3. Add monitor:
   - URL: `https://creative-survey-yourname.herokuapp.com/api/health`
   - Check every 5 minutes

This keeps your app running 24/7!

---

## Update Your App

To make changes and deploy:

```bash
# Make changes to code
# ...

# Commit
git add .
git commit -m "Your changes"

# Deploy
git push heroku main

# Watch it deploy
heroku logs --tail
```

---

## Backing Up Data

Your SQLite database is stored on Heroku. To back it up:

```bash
# Download database
heroku run "cat survey.db" > survey.db
```

Store `survey.db` safely!

