# ⏰ SECURITY ACTION CHECKLIST - Complete NOW

**Exposed Secrets:** Google Firebase API Key  
**Status:** Code Fixed | Credentials Need Rotation  
**Time Estimate:** 20-30 minutes  
**Deadline:** TODAY - Complete before end of day

---

## 🚨 STEP 1: Rotate Your Google Cloud API Key (5 minutes)

### 1.1 Go to Google Cloud Console
```
https://console.cloud.google.com/
```

### 1.2 Find Your Current Key
- [ ] Sign in with your Google account
- [ ] Select Project: **aceon-mattress**
- [ ] Go to: **APIs & Services** → **Credentials**
- [ ] Look for API Key starting with `AIzaSy` (this is the exposed one)

### 1.3 Delete the Exposed Key
- [ ] Click on the exposed API key to open it
- [ ] Click: **DELETE** button
- [ ] Confirm deletion
- [ ] ✅ Exposed key is now DEAD (can't be used)

### 1.4 Create New API Key
- [ ] Click: **+ Create Credentials** → **API Key**
- [ ] Copy the new key immediately
- [ ] Store it temporarily (we'll use it in next step)

---

## 🔑 STEP 2: Apply API Restrictions (5 minutes)

### 2.1 Find Your New Key
- [ ] Still in Google Cloud Console
- [ ] Go to: **APIs & Services** → **Credentials**
- [ ] Click on your NEW API key to edit it

### 2.2 Set API Restrictions
- [ ] Under **"API restrictions"** section:
  - [ ] ✓ Select **"Restrict key"**
  - [ ] ✓ Check: **Cloud Firestore API**
  - [ ] ✓ Check: **Firebase Authentication API**
  - [ ] ✓ Check: **Firebase Realtime Database API**
  - [ ] ✗ DO NOT check **"All APIs"** or other APIs
- [ ] Click: **SAVE**

### 2.3 Set Application Restrictions
- [ ] Under **"Application restrictions"** section:
  - [ ] ✓ Select: **HTTP referrers (websites)**
  - [ ] Add domain: `localhost:3000` (development)
  - [ ] Add domain: `localhost` (if needed)
  - [ ] Add domain: Your production domain (when deployed)
  - [ ] ✗ DO NOT leave as "None"
- [ ] Click: **SAVE**

---

## 📝 STEP 3: Update Your Local Environment (5 minutes)

### 3.1 Open Frontend .env File
```bash
cd d:\aceon_consultancy\frontend

# Open the .env file
code .env
# OR
nano .env
# OR use VS Code and navigate to frontend/.env
```

### 3.2 Update with NEW Key
Replace your .env content with:

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_RgPhDkqd6kwdDQ

# Firebase Configuration (NEW KEY FROM STEP 1.4)
VITE_FIREBASE_API_KEY=AIzaSy...PasteNewKeyHere...
VITE_FIREBASE_AUTH_DOMAIN=aceon-mattress.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aceon-mattress
VITE_FIREBASE_STORAGE_BUCKET=aceon-mattress.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=747012011997
VITE_FIREBASE_APP_ID=1:747012011997:web:0e98250a5827e75869e834
VITE_FIREBASE_MEASUREMENT_ID=G-GW7NMTGH6X
```

### 3.3 Save File
- [ ] Save the file (Ctrl+S)
- [ ] DO NOT share this file with anyone
- [ ] DO NOT commit to git

---

## ✅ STEP 4: Test Everything Works (5 minutes)

### 4.1 Restart Frontend
```bash
cd d:\aceon_consultancy\frontend

# Kill any running instances
npm run dev  # Start fresh
```

### 4.2 Check Browser
- [ ] Open: http://localhost:3000
- [ ] App should load without errors
- [ ] Check browser console (F12 → Console tab)
- [ ] Should NOT show Firebase errors
- [ ] Google Sign-In button should appear

### 4.3 Test Google Sign-In
- [ ] Click "Sign In with Google" button
- [ ] Sign in with your test Google account
- [ ] Should redirect back to app
- [ ] Should show logged-in status
- [ ] ✅ All working = SUCCESS!

---

## 📤 STEP 5: Push to GitHub (5 minutes)

### 5.1 Verify Git Status
```bash
cd d:\aceon_consultancy

git status
```

**Should show:**
```
On branch feature/frontend-ui
nothing to commit, working tree clean
(NO .env file listed)
```

### 5.2 View Current Commits
```bash
git log --oneline -3
```

**Should show:**
```
af932acb feat: add secure Firebase authentication with environment variables
6e857b12 chore: add .gitignore to protect sensitive environment variables
c4998195 removed .env
```

### 5.3 Verify No Exposed Secrets
```bash
# Check for hardcoded API keys
grep -r "AIzaSyDb83iT49XzSyzP2I92BafxtQ7mIrrlO3A" .

# Should return: (nothing - good!)
```

### 5.4 Push to GitHub
```bash
# Push your branch
git push origin feature/frontend-ui

# When ready for team (after testing):
git checkout develop
git pull origin develop
git merge feature/frontend-ui
git push origin develop
```

---

## 🔍 STEP 6: Verify Cleanup (5 minutes)

### 6.1 Check GitHub Repository
- [ ] Go to: https://github.com/hemalekha28/aceon_consultancy
- [ ] Go to: frontend → src → config → firebase.js
- [ ] Should NOT show hardcoded API keys
- [ ] Should show: `import.meta.env.VITE_FIREBASE_...`

### 6.2 Check GitHub Alerts
- [ ] Go to: Repository Settings → Security & analysis
- [ ] Look for "Secret scanning" alerts
- [ ] Old alert about exposed key should resolve in 24-48 hours
- [ ] New commits should NOT trigger alerts

### 6.3 Monitor Google Cloud
- [ ] Google Cloud Console → Security Command Center
- [ ] Check for alerts about your project
- [ ] May show historical activity (normal)
- [ ] Should clear after key rotation

---

## Verification Steps

Run these commands to verify everything is secure:

```bash
# Check 1: No hardcoded keys in code
grep -r "AIzaSy" frontend/src/

# Result should be: (nothing - good!)

# Check 2: .gitignore is working
git status

# Result should show: Nothing to commit, working tree clean
# And: .env NOT in the list

# Check 3: Firebase config uses variables
grep -r "import.meta.env" frontend/src/config/firebase.js

# Result should show: Uses VITE_FIREBASE_API_KEY (good!)

# Check 4: No .env files in git tracking
git ls-files | grep ".env"

# Result should be: 
# .env.example (OK - safe to commit)
# Should NOT show: .env (good!)
```

---

## Timeline

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Rotate API Key | 5 min | 🚨 TODO |
| 2 | Add API Restrictions | 5 min | 🚨 TODO |
| 3 | Update Local .env | 5 min | 🚨 TODO |
| 4 | Test Frontend | 5 min | ⏳ After Step 3 |
| 5 | Push to GitHub | 5 min | ⏳ After Step 4 |
| 6 | Verify Cleanup | 5 min | ⏳ After Step 5 |
| **TOTAL** | | **~30 min** | ⏱️ DO NOW |

---

## ✨ FINAL CHECKLIST

When everything is done, verify:

- [ ] **Security:**
  - [ ] Old API key is deleted in Google Cloud
  - [ ] New API key has API restrictions
  - [ ] New API key has application restrictions
  - [ ] .env file exists locally (not in git)
  - [ ] .env is in .gitignore (protected)

- [ ] **Code:**
  - [ ] firebase.js uses environment variables
  - [ ] No hardcoded keys in any file
  - [ ] npm run dev works without errors
  - [ ] Google Sign-In works

- [ ] **GitHub:**
  - [ ] Changes pushed to feature/frontend-ui
  - [ ] No .env files in repository
  - [ ] Commit history shows clean code
  - [ ] Secret scanning alert resolved

- [ ] **Testing:**
  - [ ] Frontend loads at localhost:3000
  - [ ] No JavaScript console errors
  - [ ] Google Sign-In button appears
  - [ ] Can sign in with Google account

---

## 🆘 If Something Goes Wrong

### Problem: Firebase errors when starting npm run dev
```bash
# Check .env file exists
ls frontend/.env

# Check it has all required variables
cat frontend/.env

# Make sure you have the NEW API key (from Step 1.4)
# Not the old one!
```

### Problem: Google Sign-In fails
```bash
# 1. Check .env has correct API key
# 2. Check API restrictions in Google Cloud
# 3. Check http://localhost:3000 is in referrer restrictions
# 4. Restart browser (clear cache)
# 5. Try again
```

### Problem: Git says .env is modified
```bash
# .env should NOT be tracked
# Check .gitignore
cat .gitignore | grep ".env"

# Should show: .env is in there

# If not, git won't track changes (which is good)
```

### Problem: GitHub still shows old commit with secrets
```bash
# This is normal after rebase
# Old commits are in reflog (not in main history)
# GitHub will update within a few minutes

# You can verify by checking:
# https://github.com/YOUR_NAME/aceon_consultancy/commits/feature/frontend-ui
# Should show clean commits (no exposed keys)
```

---

## 📞 Need Help?

- Check **FIREBASE_SECURITY_GUIDE.md** for more details
- Check **SECURITY_GUIDE.md** for general practices
- Review commit messages for what was changed (very detailed)

---

## ✅ When You're Done

Post this message to your team:

> **Security Update Complete ✅**
> - Firebase API key rotated ✓
> - API restrictions applied ✓
> - Code moved to environment variables ✓
> - .env files protected from git ✓
> - GitHub pushed with clean commits ✓
>
> **Action for teammates:**
> 1. Pull latest: `git pull origin feature/frontend-ui`
> 2. Copy template: `cp frontend/.env.example frontend/.env`
> 3. Update with their Firebase credentials
> 4. Test: `npm run dev`

---

**START WITH STEP 1 NOW!** ⏰ Don't delay - this needs to be done today!
