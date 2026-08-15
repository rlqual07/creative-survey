# Quick Start (Heroku + SQLite)

## 1️⃣ Install Heroku CLI

Download from: https://devcenter.heroku.com/articles/heroku-cli

## 2️⃣ Deploy in 5 Commands

```bash
# Clone repository
git clone https://github.com/rlqual07/creative-survey.git
cd creative-survey

# Login to Heroku (free, no credit card)
heroku login

# Create app
heroku create creative-survey-yourname

# Deploy!
git push heroku main
```

## 3️⃣ Your App is Live!

Open: `https://creative-survey-yourname.herokuapp.com`

## 4️⃣ Create Your First Survey

1. Go to `/admin`
2. Click "Create New Survey"
3. Fill in:
   - Title
   - Description
   - Consent Form
4. Click Create

## 5️⃣ Add Stimulus Blocks

1. Click "Add Stimulus Block"
2. Choose Block 1, 2, 3, or 4
3. Select type: Image or Video
4. Paste URL (use Imgur for images, YouTube for videos)
5. Click Add
6. **Repeat for blocks 2, 3, 4**

## 6️⃣ Add Questions

For each block:

1. Question Set 1: Add 8 questions
2. Question Set 2: Add 10 questions
3. Demographics: Add 4 questions

## 7️⃣ Publish & Share

1. Click "Publish Survey"
2. Share link with participants:
   ```
   https://creative-survey-yourname.herokuapp.com/survey
   ```

## 8️⃣ View Results

Go to `/results` to see:
- Total participants
- Completion rate
- All responses

---

## Getting Stimulus URLs

### For Images:
1. Go to https://imgur.com
2. Upload your image
3. Right-click → "Copy image link"
4. Paste in survey

### For Videos:
1. Upload to https://youtube.com (Unlisted)
2. Right-click video → Copy URL
3. Paste in survey

OR:
1. Use https://loom.com for recordings
2. Copy shareable link

---

## No Credit Card Needed

✅ Completely free  
✅ No credit card required  
✅ SQLite database included  
✅ Heroku free tier  

---

## Troubleshooting

**Q: App takes a long time to load?**
A: Free tier sleeps after 30 min. First request wakes it up (~10-30 sec).

**Q: How do I update my survey?**
A: Make changes in admin dashboard.

**Q: Can I download the data?**
A: Yes! Coming soon in results dashboard.

**Q: What happens to my data?**
A: Stored in SQLite database on Heroku server.

---

## Next Steps

1. Read `HEROKU_SETUP.md` for detailed deployment guide
2. Create your survey
3. Test with a few participants
4. Share link with all 100 participants!

