# Collaborative Development Workflow Guide

## 1. GIT BRANCHING STRATEGY

### Main Branches
- **`main`** - Production-ready code (stable, tested)
- **`develop`** - Integration branch for features (working version)

### Feature Branches
Each feature gets its own branch from `develop`:
```
develop → feature/auth-setup
       → feature/button-styling
       → feature/payment-integration
       → bugfix/search-button
```

### Naming Conventions
- **Features**: `feature/feature-name` (e.g., `feature/google-signin`)
- **Bugfixes**: `bugfix/issue-name` (e.g., `bugfix/gradient-colors`)
- **Hotfixes**: `hotfix/critical-issue` (e.g., `hotfix/login-error`)

---

## 2. WORKFLOW - STEP BY STEP

### BEFORE STARTING WORK
```bash
# Switch to develop branch
git checkout develop

# Get latest changes from teammate
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name

# Example:
git checkout -b feature/navbar-responsive
```

### DURING DEVELOPMENT
```bash
# Make changes to your files
# Test locally to ensure it works

# Check what you changed
git status

# Stage your changes
git add .

# Commit with clear messages
git commit -m "feat: add responsive navbar styling"

# Push your feature branch
git push origin feature/your-feature-name
```

### COMMIT MESSAGE CONVENTIONS
```
<type>: <short description>

<optional detailed description>

Examples:
✓ feat: add teal-to-navy button gradient
✓ fix: correct search button color
✓ style: update button styling across components
✓ refactor: simplify cart context structure
```

### PULLING TEAMMATE'S CHANGES
```bash
# Before you start work each day
git checkout develop
git pull origin develop

# If you're on your feature branch
git checkout feature/your-feature-name
git rebase origin/develop  # or git merge origin/develop
```

---

## 3. PREVENTING CONFLICTS

### Rule 1: Divide Responsibilities
**Suggested Split:**
- **Person A (You)**: Frontend components (buttons, styling, forms)
- **Person B (Teammate)**: Backend integration, routes, API logic

### Rule 2: Don't Touch Same Files
- Create a file responsibility map
- Communicate before touching shared files (cartContext.jsx, authContext.jsx)

### Rule 3: Keep Branches Short-Lived
- Merge feature branches within **1-2 days** maximum
- Small changes = fewer conflicts
- Avoid branches lasting more than 3 days

### Rule 4: Frequent Syncing
```bash
# Do this every morning and before big changes
git fetch origin
git merge origin/develop
```

---

## 4. PULL REQUEST (PR) WORKFLOW

### Person A Creates PR
```bash
# Push your feature branch
git push origin feature/your-feature

# Go to GitHub → Create Pull Request
# Title: Clear description of changes
# Description: What changed and why
```

### Person B Reviews
- Check the code changes
- Test the feature locally
- Add comments if needed
- Approve or request changes

### Merge Strategy
```bash
# Use "Squash and Merge" for clean history
# Avoid "Create a merge commit" unless integrating multiple PRs
```

---

## 5. HANDLING CONFLICTS (When They Happen)

### If You Get Conflict
```bash
# Update your branch with latest develop
git checkout develop
git pull origin develop

# Go back to your feature branch
git checkout feature/your-feature

# Merge develop into your branch
git merge develop

# Git will show conflicts - resolve them
# Open VS Code, fix the conflicting sections
# Look for <<<<<<, ======, >>>>>>>

# After fixing
git add .
git commit -m "resolve: merge conflicts with develop"
git push origin feature/your-feature
```

### Conflict Resolution Tips
- **Keep their important changes**: If teammate added features, keep them
- **Keep your important changes**: If you fixed critical bugs, keep them
- **Communicate**: Ask teammate "which changes should stay?"
- **Test after resolving**: Run `npm run dev` to verify

---

## 6. COMMUNICATION CHECKLIST

### Before Starting Work
- [ ] Slack/WhatsApp: "Starting work on feature/[name]"
- [ ] Check if teammate working on related files
- [ ] Coordinate if both touching same file

### While Working
- [ ] Push frequently (at least daily)
- [ ] Document why you made changes (in commits)
- [ ] If stuck, ask for help immediately

### When Merging
- [ ] Tell teammate: "Merging feature/[name] to develop"
- [ ] Wait for them to sync before their work
- [ ] Test together if critical feature

### Daily Standup (Optional but Helpful)
```
What you did yesterday:
- Implemented button styling

What you're doing today:
- Add search functionality

Blockers:
- Need clarification on cart logic

Files you're touching:
- src/components/Header.jsx
- src/index.css
```

---

## 7. FILE RESPONSIBILITY MAP

| File/Folder | Owner | Notes |
|---|---|---|
| `/src/components/Header.jsx` | Person A | Navigation, buttons |
| `/src/pages/ProductDetail.jsx` | Person A | UI/Styling |
| `/src/context/authContext.jsx` | Person B | Logic & backend sync |
| `/src/context/cartContext.jsx` | Shared | Coordinate changes |
| `/backend/routes/` | Person B | API endpoints |
| `/src/index.css` | Person A | Global styling |
| `/src/pages/Login.jsx` | Both | Auth + styling |

**Update this based on your actual division!**

---

## 8. DAILY WORKFLOW CHECKLIST

### Morning
- [ ] `git pull origin develop`
- [ ] Review teammate's PRs
- [ ] Check Slack/messages for updates
- [ ] Pull latest changes into your feature branch

### During Work
- [ ] Commit frequently (every 30-45 mins)
- [ ] Push at least 2-3 times per day
- [ ] Test your changes locally
- [ ] Don't hesitate to ask teammate

### Evening
- [ ] Push all changes
- [ ] Create/update PR with progress
- [ ] Merge if feature complete
- [ ] Leave notes for teammate about what you changed

---

## 9. USEFUL GIT COMMANDS

```bash
# See all branches
git branch -a

# See what's on develop vs your branch
git log --oneline develop..feature/your-feature

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (delete changes)
git reset --hard HEAD~1

# Temporarily save work without committing
git stash
git stash pop  # Get work back

# See difference between branches
git diff develop feature/your-feature

# See all commits by you
git log --author="Your Name"
```

---

## 10. EMERGENCY SCENARIOS

### Teammate Breaking Develop
```bash
# Tell them immediately on Slack
# They should fix & push ASAP
# Or revert the bad commit:
git revert <commit-id>
git push origin develop
```

### You Pushed Wrong Code
```bash
# If not merged to develop yet:
git reset --hard HEAD~1
git push -f origin feature/your-feature

# If merged:
git revert <commit-id>
git push origin develop
```

### Merged Conflicting Changes
```bash
# Revert the merge
git revert -m 1 <merge-commit-id>
git push origin develop

# Re-merge correctly later
# Tell teammate to sync and don't push until resolved
```

---

## 11. TOOLS TO HELP

### VS Code Extensions
- **GitLens**: See who changed what
- **GitHub Pull Requests**: Manage PRs in VS Code
- **Git Graph**: Visual branch history

### Commands to Monitor
```bash
# Check status before any operation
git status

# See recent changes
git log --oneline -10

# See unpushed commits
git log origin/develop..HEAD
```

---

## 12. BACKUP PLAN

### If Things Go Wrong
1. **Nothing is lost**: Git stores everything
2. **Recovery steps**:
   ```bash
   # See all commits ever
   git reflog
   
   # Reset to any previous state
   git reset --hard <commit-id>
   ```

3. **Worst case**: 
   - Create new branch from working commit
   - Manually copy good code from bad branch
   - Test thoroughly
   - Commit and push as new PR

---

## QUICK START - FIRST TIME

```bash
# 1. Clone repo (if not already done)
git clone <repo-url>
cd aceon_consultancy

# 2. Setup tracking
git branch -u origin/main main
git branch -u origin/develop develop

# 3. Get latest
git checkout develop
git pull origin develop

# 4. Create your feature
git checkout -b feature/your-first-feature

# 5. Make changes
# ... edit files ...

# 6. Commit & push
git add .
git commit -m "feat: your first feature"
git push origin feature/your-first-feature

# 7. Go to GitHub, create Pull Request

# 8. Teammate reviews

# 9. Merge to develop

# 10. Both sync
git checkout develop
git pull origin develop
```

---

## REMEMBER

✅ **DO:**
- Commit often (small chunks)
- Pull frequently (sync regularly)
- Communicate before touching files
- Test before pushing
- Review teammate's code
- Use clear commit messages

❌ **DON'T:**
- Work directly on `main` or `develop`
- Push untested code
- Work on same file without telling teammate
- Keep changes for days without pushing
- Force push to shared branches
- Ignore merge conflicts

---

**Questions? Ask your teammate first, then escalate if needed!**
