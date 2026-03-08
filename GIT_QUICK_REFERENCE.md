# COLLABORATIVE GIT - QUICK REFERENCE

## ESSENTIAL DAILY COMMANDS

### ✅ YOUR DAILY ROUTINE (Copy & Paste)

```bash
# MORNING - Get teammate's changes
git checkout develop
git pull origin develop

# START NEW FEATURE
git checkout -b feature/my-feature-name

# DURING WORK - Save your progress (every 30-45 mins)
git add .
git commit -m "feat: describe what you did"
git push origin feature/my-feature-name

# EVENING - When feature done, sync and merge
git checkout develop
git pull origin develop
git checkout feature/my-feature-name
git rebase origin/develop
git checkout develop
git merge feature/my-feature-name
git push origin develop

# CLEANUP
git branch -d feature/my-feature-name
```

---

## STATUS CHECK COMMANDS

```bash
# See your current status
git status

# See all branches
git branch -a

# See recent changes
git log --oneline -10

# See what's in develop vs your branch
git diff develop feature/your-branch

# See all your uncommitted changes
git diff

# See what you staged for commit
git diff --cached
```

---

## COMMON SCENARIOS & SOLUTIONS

### SCENARIO 1: You Want to Start Work

```bash
# Pull latest everything
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/button-styling

# Now make your changes and work
```

---

### SCENARIO 2: You Want to Save Progress

```bash
# See what changed
git status

# Save changes
git add .
git commit -m "feat: make buttons teal gradient"

# Send to GitHub
git push origin feature/button-styling
```

---

### SCENARIO 3: You Want to Get Teammate's Changes

```bash
# If you're on develop
git pull origin develop

# If you're on your feature branch
git checkout develop
git pull origin develop
git checkout feature/your-branch
git merge develop
```

---

### SCENARIO 4: Conflict! Files Don't Match

```bash
# FIRST - Don't panic!
# Git will tell you which files have conflicts

# SECOND - Fix them manually
# Open the conflicted files in VS Code
# Look for: <<<<<<, ======, >>>>>>
# Keep the code you want, delete the rest

# THIRD - Tell Git you fixed it
git add .
git commit -m "resolve: merge conflicts"
git push origin feature/your-branch

# FOURTH - Tell your teammate
# Message: "Fixed conflicts in [file], please review"
```

---

### SCENARIO 5: You Need Teammate's Branch Code

```bash
# Get their feature
git fetch origin
git checkout feature/their-feature-name

# Test it and use it

# Go back to your branch
git checkout feature/your-feature-name
```

---

### SCENARIO 6: You Pushed Wrong Code

```bash
# If NOT merged to develop yet:
git reset --hard HEAD~1
git push -f origin feature/branch-name

# If already merged - TELL TEAMMATE IMMEDIATELY
git revert <commit-id>
git push origin develop
```

---

### SCENARIO 7: Want to Undo Your Last Commit

```bash
# Keep the changes, undo the commit
git reset --soft HEAD~1

# Delete the commit AND changes
git reset --hard HEAD~1

# After resetting
git push -f origin feature/your-branch
```

---

### SCENARIO 8: You Forgot Which Branch You're On

```bash
# See current branch
git branch

# Or just look at command line - it shows `(branch-name)`

# To switch branches
git checkout branch-name
```

---

### SCENARIO 9: Too Many Changes, Want to Save & Start Fresh

```bash
# Save everything you did
git stash

# Now your code is back to clean state
# Make new changes

# Later, get your saved work back
git stash pop
```

---

### SCENARIO 10: Want to See What Teammate Did

```bash
# Recent commits
git log --oneline -20

# Commits by teammate
git log --author="Teammate Name" --oneline

# See changes in a specific commit
git show <commit-id>

# See all changes between branches
git log --oneline develop..feature/their-feature
```

---

## COMMIT MESSAGE EXAMPLES ✅ GOOD

```
✓ feat: add teal gradient to all buttons
✓ fix: search button now shows correct color  
✓ style: update button shadows globally
✓ refactor: simplify cart context
✓ docs: add collaboration guide
✓ chore: update dependencies
```

## COMMIT MESSAGE EXAMPLES ❌ BAD

```
✗ changes
✗ fix stuff
✗ updated button
✗ ...
✗ asdf
```

---

## BEFORE PUSHING - CHECKLIST

- [ ] Run `git status` and review changes
- [ ] Test locally: `npm run dev` 
- [ ] No console errors?
- [ ] Meaningful commit message?
- [ ] Haven't accidentally added `.env` or secrets?

---

## TEAM COMMUNICATION COMMANDS

**Tell Teammate When:**
```bash
# You started a new feature
git push origin feature/your-feature
# Message: "Started feature/button-styling - will be done by EOD"

# You're ready for review
# Message: "feature/button-styling ready for review"

# You merged something
# Message: "Merged feature/button-styling to develop, please sync"

# There's a conflict
# Message: "Conflict in index.css, updating now"

# You pushed major changes
git push origin feature/your-feature
# Message: "Major refactor done, pulling won't break anything"
```

---

## EMERGENCY COMMANDS

### Force Sync with Server
```bash
# ONLY if you're sure this is right!
git fetch origin
git reset --hard origin/develop
```

### Delete Entire Branch
```bash
# Locally
git branch -D feature/old-feature

# On GitHub
git push origin --delete feature/old-feature
```

### See Lost Work
```bash
git reflog

# This shows EVERYTHING you did
# You can recover any commit
git reset --hard <commit-id>
```

---

## TERMINAL ALIASES (Optional but Helpful)

Add to your Git config:
```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline -10"
```

Then use:
```bash
git co develop       # instead of git checkout develop
git br              # instead of git branch
git ci -m "msg"     # instead of git commit -m "msg"
git st              # instead of git status
git lg              # instead of git log --oneline -10
```

---

## VS CODE BUILT-IN GIT

**You can do all this in VS Code** - Source Control tab (left sidebar):

1. Click Source Control icon
2. See all changes
3. Stage changes (click +)
4. Write message
5. Click ✓ to commit
6. Click ... → Push

Or use keyboard: `Ctrl + Shift + G`

---

## QUICK DECISION TREE

```
Want to start work?
├─ Yes → git checkout -b feature/name

Want to save progress?
├─ Yes → git add . → git commit -m "msg" → git push

Want to get teammate's code?
├─ Yes → git pull origin develop

Got conflict?
├─ Yes → Fix files → git add . → git commit

Want to merge to develop?
├─ Yes → git checkout develop → git pull origin develop
         → git merge feature/name → git push origin develop

Want to undo something?
├─ Not committed → Edit file
├─ Committed not pushed → git reset --soft HEAD~1
├─ Already pushed → git revert <id> → git push

Unsure what to do?
└─ Run: git status
```

---

## IMPORTANT - READ THIS ⚠️

### You Will Eventually Have a Merge Conflict

**This is NORMAL and OKAY!**

When you see:
```
CONFLICT (content merge): Merge conflict in filename.js
Automatic merge failed; fix conflicts and then commit the result.
```

**Do NOT:**
- ❌ Close VS Code
- ❌ Delete files
- ❌ Force push randomly
- ❌ Delete your local repository

**Do:**
- ✅ Open the conflicting file
- ✅ Look for `<<<<<<<`, `=======`, `>>>>>>>`
- ✅ Choose which code to keep
- ✅ Delete the conflict markers
- ✅ `git add .`
- ✅ `git commit -m "resolve: merge conflicts"`
- ✅ `git push origin feature/branch`

**Then message teammate:** "Resolved conflicts, can you check?"

---

## TIPS & SECRETS 🤫

**Tip 1:** Commit often, push daily
- Small commits are easier to fix if wrong

**Tip 2:** Always pull before starting work
- Prevents conflicts from building up

**Tip 3:** Use clear branch names
- `feature/button-styling` > `feature/changes`
- Teammate can see what you're doing

**Tip 4:** Test before pushing
- `npm run dev` and manually test your changes
- Prevents pushing broken code

**Tip 5:** Review teammate's code
- You'll learn from each other
- Catch bugs early

**Tip 6:** GitHub is your friend
- Check your PR status on GitHub.com
- See what's merged
- See what's waiting

**Tip 7:** When stuck
- Google the exact error message
- Ask teammate
- Try `git status` to see what's happening

---

## MONDAY PROTOCOL

If working from home or separate, start each week:

**Both do this:**
```bash
# Get the absolute latest code
git checkout develop
git pull origin develop
git log --oneline -5

# Message teammate:
# "Monday sync complete. Code is up-to-date."
```

Then start your features fresh.

---

## ONE-PAGE CHEAT SHEET

| Do This | Run This |
|---------|----------|
| Start work | `git checkout -b feature/my-feature` |
| Save progress | `git add . && git commit -m "msg" && git push origin feature/my-feature` |
| Get updates | `git pull origin develop` |
| Check status | `git status` |
| See changes | `git log --oneline -10` |
| Merge when done | `git checkout develop && git pull origin develop && git merge feature/my-feature && git push origin develop` |
| Fix conflicts | Edit file → `git add . && git commit && git push` |
| Undo commit | `git reset --soft HEAD~1` |
| Switch branch | `git checkout branch-name` |
| Create branch | `git checkout -b feature/name` |

---

**Print this. Bookmark this. Reference when stuck!**

**Still confused? Ask teammate first, then ask Stack Overflow!**
