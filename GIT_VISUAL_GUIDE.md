# VISUAL GIT WORKFLOW - STEP BY STEP

## The Complete Daily Workflow (Visual)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    YOUR DAILY DEVELOPMENT CYCLE                      │
└─────────────────────────────────────────────────────────────────────┘

MORNING:
┌───────────────────┐
│ git checkout      │
│ develop           │  ← Switch to develop branch
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ git pull origin   │
│ develop           │  ← Get teammate's changes
└────────┬──────────┘
         │
         ▼ (Now you have latest code)


START WORK:
┌──────────────────────────┐
│ git checkout -b          │
│ feature/your-feature     │  ← Create your feature branch
└────────┬─────────────────┘
         │
         ▼ (You're now on your own branch)


DURING WORK (Every 30-45 minutes):
┌───────────────────┐
│ Write code        │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ git add .         │  ← Stage all changes
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ git commit -m "   │
│ feat: describe"   │  ← Save to local history
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ git push origin   │
│ feature/name      │  ← Send to GitHub
└────────┬──────────┘
         │
         (Wait 5 mins, repeat)


WHEN FEATURE DONE:
┌───────────────────┐
│ git checkout      │
│ develop           │  ← Go back to develop
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ git pull origin   │
│ develop           │  ← Get latest from team
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ git checkout      │
│ feature/name      │  ← Back to your branch
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ git rebase origin │
│ develop           │  ← Align with team's changes
└────────┬──────────┘
         │
    ┌─ Conflicts? ─────┐
    │                  │
   YES                 NO
    │                  │
    ▼                  ▼
┌──────────┐      ┌─────────────┐
│ Fix      │      │ git checkout│
│ files    │      │ develop     │
│ git add .│      └─────┬───────┘
│ git      │            │
│ commit   │            ▼
│ git push │      ┌─────────────┐
│ -f       │      │ git merge   │
│ origin   │      │ feature/    │
│ feature/ │      │ name        │
│ name     │      └─────┬───────┘
└──────────┘            │
    │                   ▼
    └──────────────────┐
                       │
                    ┌──┴──┐
                    │     │
                    ▼     ▼
            ┌───────────────────┐
            │ git push origin   │
            │ develop           │  ← Send merged code
            └────────┬──────────┘
                     │
                     ▼
            ┌───────────────────┐
            │ git branch -d     │
            │ feature/name      │  ← Cleanup
            └───────────────────┘

RESULT: Your code is now on develop, available to team ✓
```

---

## VISUAL: GitHub & Local Sync

```
┌──────────────────────────────────────────────────────────────┐
│                      YOUR COMPUTER (LOCAL)                    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Your Workspace (files you edit)                     │    │
│  │ - src/index.css                                    │    │
│  │ - src/components/Header.jsx                        │    │
│  │ - ...                                              │    │
│  └──────────────────┬──────────────────────────────────┘    │
│                     │                                         │
│           git add . │ (you tell git what changed)            │
│                     │                                         │
│                     ▼                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Git Staging Area (ready to save)                    │    │
│  │ Changes marked for commit                          │    │
│  └──────────────────┬──────────────────────────────────┘    │
│                     │                                         │
│    git commit -m    │ (save with message)                    │
│                     │                                         │
│                     ▼                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Local Repository (.git folder)                      │    │
│  │ Your commits stored locally                        │    │
│  │ Branch: feature/my-feature                         │    │
│  │   - Commit A: "feat: initial work"                │    │
│  │   - Commit B: "feat: continue work"               │    │
│  └──────────────────┬──────────────────────────────────┘    │
│                     │                                         │
│        git push     │ (send to GitHub)                       │
│        origin       │                                         │
│        feature/     │                                         │
│        my-feature   │                                         │
│                     │                                         │
└─────────────────────┼─────────────────────────────────────────┘
                      │
           ╔══════════╩═════════╗
           ║    INTERNET        ║  
           ║    (GitHub.com)    ║
           ╚══════════╤═════════╝
                      │
┌─────────────────────┼─────────────────────────────────────────┐
│                     │                                          │
│                     ▼                                          │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ GitHub Repository                                  │     │
│  │                                                    │     │
│  │ develop branch:                                    │     │
│  │   - Commit 1: "feat: old feature"                │     │
│  │   - Commit 2: "fix: bug fix"                      │     │
│  │   - Commit M: "Team's recent merge"              │     │
│  │                                                    │     │
│  │ feature/button-styling branch:                   │     │
│  │   - Commit A: "feat: initial work"               │     │
│  │   - Commit B: "feat: continue work"              │     │
│  │                                                    │     │
│  │ feature/api-endpoints branch (Teammate):         │     │
│  │   - Commit X: "api: create endpoints"            │     │
│  │                                                    │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│           SERVER (Shared code storage)                        │
└───────────────────────────────────────────────────────────────┘


KEY FLOWS:

1. DEVELOP ACTIVELY:
   Workspace → (git add .) → Staging → (git commit) → Local → (git push) → GitHub

2. GET TEAMMATE'S CODE:
   GitHub → (git pull origin develop) → Local → Workspace

3. MERGE BRANCHES:
   feature/button-styling ──┐
                           ├─→ develop ──→ (git push) → GitHub
   feature/api-endpoints ──┘
```

---

## VISUAL: What Happens With Conflicts

```
┌─────────────────────────────────────┬──────────────────────────┐
│      YOU WROTE THIS CODE            │  TEAMMATE WROTE THIS CODE│
├─────────────────────────────────────┼──────────────────────────┤
│ On file: src/index.css              │  On file: src/index.css  │
│                                     │                          │
│ .btn {                              │ .btn {                   │
│   color: teal;        ← Line 10    │   color: blue;  ← Conflict!
│   padding: 10px;                    │   padding: 10px;         │
│ }                                   │ }                        │
│                                     │                          │
│ You pushed first                    │ They pushed second       │
└─────────────────────────────────────┴──────────────────────────┘
                            │
                            ▼
                  Git can't auto-merge!
                   (Same line 10 changed)
                            │
            ┌───────────────┴───────────────┐
            │                               │
       When you:                       Git tells you:
    git pull origin develop        ⚠️  CONFLICT in index.css
            │
            ▼
    ┌──────────────────────────┐
    │ Git marks the problem:   │
    │                          │
    │ <<<<<<< HEAD             │ ← Your code
    │ color: teal;  ← Choose  │
    │ =======                  │ ← Middle (separator)
    │ color: blue;  ← Or this?│
    │ >>>>>>> origin/develop   │ ← Teammate's code
    │                          │
    │ You must pick ONE line   │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ You fix the conflict:    │
    │                          │
    │ Delete the markers       │
    │ Keep only the code       │
    │ you want                 │
    │                          │
    │ Now file looks normal:   │
    │                          │
    │ .btn {                   │
    │   color: teal;           │ ← You chose this
    │   padding: 10px;         │
    │ }                        │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ git add .                │
    │ git commit -m            │
    │ "resolve: index.css"     │
    │ git push origin feature/ │
    │ your-branch              │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Conflict RESOLVED! ✓     │
    │                          │
    │ Git now knows:           │
    │ - Line 10 is: color:teal;│
    │ - File is ready to merge │
    └──────────────────────────┘
```

---

## VISUAL: Branch Strategy

```
Commits flow over time ════════════════════════════→ (Future)

                    ┌─────────────┐
                    │ Merge Request│ ← "feature complete, review please"
                    │ Created on   │
                    │ GitHub       │
                    └────────┬────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    If OK:     If conflict:     If needs work:
        │          │                │
        ▼          ▼                ▼
    APPROVE    FIX CONFLICT    REQUEST CHANGES
        │          │                │
        └────────┬─┴────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ MERGE to develop   │ ← Your code is now live to team
        │ develop is now:    │
        │ ├─ old commits     │
        │ ├─ old commits     │
        │ ├─ YOUR commits ← NEW
        │ └─ other's commits │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ DELETE feature/    │ ← Cleanup, no longer needed
        │ your-branch        │
        └────────────────────┘


DETAILED BRANCH VISUAL:

develop branch:  ●──●──●──●──●──●
                 │  │  │  │  │  └─ Latest (what server runs)
                 │  │  │  │  └──── Old commits
                 │  │  │  └─────── Teammate merged here
                 │  │  └────────── Another feature
                 │  └───────────── Another feature  
                 └──────────────── Start


feature/button-styling: (branch OFF develop)
                    
develop:    ●──●──●──┬──●
                     │
feature:            ●──●──●
                    │  │  └─ Your latest work
                    │  └──── Your commit 2
                    └─────── Branch point (when you created it)


After you merge:

develop:    ●──●──●──┬──●──●──●
                     │      │ │
feature:            ●──●──●┘ └─ Your commits now ON develop
                             (feature branch deleted)
```

---

## VISUAL: The 5-Minute Daily Standup

```
START TIME: 9:00 AM

Person A:                          Person B:
┌──────────────────┐              ┌──────────────────┐
│ Let me catch you │              │ Let me catch you │
│ up:              │              │ up:              │
├──────────────────┤              ├──────────────────┤
│ ✓ Completed:     │              │ ✓ Completed:     │
│ - Button styling │              │ - API endpoints  │
│ - Header buttons │              │ - Database setup │
│                  │              │                  │
│ ⏳ In Progress:   │              │ ⏳ In Progress:   │
│ - Footer styling │              │ - User auth      │
│ - Cart layout    │              │ - Admin panel    │
│                  │              │                  │
│ 🚫 Blockers:     │              │ 🚫 Blockers:     │
│ - Need your CSS  │──────────────┤ - Waiting for    │
│   variables      │              │   your API calls │
│                  │              │                  │
│ Today's plan:    │              │ Today's plan:    │
│ - Footer colors  │              │ - Complete auth  │
│ - Responsive     │              │ - Admin routes   │
└──────────────────┘              └──────────────────┘

END TIME: 9:05 AM

RESULT: Both know what's up, no surprises at merge time! ✓
```

---

## VISUAL: Merge Day Process

```
SUNDAY EVENING (Before final merge):

Person A                          Person B
  │                                │
  ├─ feature/button-styling        │
  │   (finished, ready)             │
  │                                 ├─ feature/api-endpoints
  │                                 │   (finished, ready)
  │
┌─┴──────────────────────────┬─────┴──┐
│    SUNDAY 11 PM             │        │
│ Both get latest develop     │        │
│                             │        │
│ git checkout develop        │        │
│ git pull origin develop     │ ●──●   │
│                             │        │
└──────────┬──────────────────┴────┬───┘
           │                       │
┌──────────▼──────────────────────▼──────┐
│    SUNDAY 11:05 PM                     │
│ Person A rebases and merges:          │
│                                        │
│ git checkout feature/button-styling   │
│ git rebase origin develop             │
│ git checkout develop                  │
│ git merge feature/button-styling      │
│ git push origin develop               │
└──────────┬───────────────────────────┘
           │
           ▼ develop is updated with A's code
           
┌──────────────────────────────────────┐
│    SUNDAY 11:10 PM                   │
│ Person B:                            │
│ - Gets message from A                │
│ - git checkout develop               │
│ - git pull origin develop (A's code!)│
│ - Tests merged code                  │
│ - Has conflicts with A's work        │
│                                      │
│ If conflicts:                        │
│ - Fixes them in feature/api-endpoints│
│ - Tells A: "Fixed conflicts, ready" │
│ - Starts rebase from develop        │
│ - Resolves as needed                │
└──────────┬───────────────────────────┘
           │
           ▼ When B's code is ready
           
┌──────────────────────────────────────┐
│    SUNDAY 11:20 PM                   │
│ Person B merges:                     │
│ git checkout develop                 │
│ git pull origin develop              │
│ git merge feature/api-endpoints      │
│ git push origin develop              │
│                                      │
│ NOW: develop has BOTH:               │
│ - A's button styling                 │
│ - B's API endpoints                  │
│ - Everything works together          │
└──────────────────────────────────────┘

RESULT: Completed feature ready Monday AM ✓
```

---

## VISUAL: The Emergency Scenario

```
⚠️ OOPS SCENARIO ⚠️

9:30 AM Monday:
"Oh no! I pushed code that breaks everything!"

┌─────────────────────────────────┐
│ DON'T PANIC - YOU CAN FIX THIS   │
└─────────────────────────────────┘

Step 1: Tell Teammate IMMEDIATELY
┌──────────────────────────────┐
│ "I broke develop, fixing now"│
│ Sent at 9:31 AM              │
└──────────────────────────────┘

Step 2: Find the bad commit
┌──────────────────────────────┐
│ git log --oneline -10        │ ← See recent commits
│ Commit X: "feat: broke it"   │ ← This is the bad one
└──────────────────────────────┘

Step 3: Undo it
┌──────────────────────────────┐
│ git revert <commit-X-id>     │ ← Creates commit that undoes X
│ git push origin develop      │
└──────────────────────────────┘

Step 4: Check develop
┌──────────────────────────────┐
│ git pull origin develop      │
│ npm run dev                  │ ← Works now!
└──────────────────────────────┘

Step 5: Tell Teammate
┌──────────────────────────────┐
│ "Fixed! Reverted commit X"   │
│ Sent at 9:35 AM              │
└──────────────────────────────┘

Step 6: Fix locally
┌──────────────────────────────┐
│ git checkout feature/         │
│ your-branch                  │
│ Fix code locally             │
│ Test hard                    │
│ git add .                    │
│ git commit -m "fix: worked"  │
└──────────────────────────────┘

Timeline:
9:30 - Disaster
9:31 - Alert sent
9:35 - Fixed
10:00 - Proper fix pushed
Damage: MINIMAL ✓

VS not telling anyone:
13:30 - Teammate tries to work
13:31 - Everything broken
13:32 - Long investigation
14:00 - Finally finds root cause = 6 hours lost! ✗
```

---

## QUICK DECISION TREE - VISUAL

```
                    START OF DAY
                         │
                         ▼
    ┌────────────────────────────────────┐
    │ git pull origin develop            │
    │ (get latest from team)             │
    └────────────────────────────────────┘
                         │
                         ▼
         ┌──────────────────────────┐
         │ Start new feature?       │
         └────┬─────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
   YES                 NO
    │                   │
    ▼                   ▼
╔══════════════╗  ┌──────────────────────┐
║Create branch ║  │ Work on existing     │
╚══════════════╝  │ feature?             │
git checkout -b   └──────────────────────┘
feature/name

    │                   │
    └─────────┬─────────┘
              │
              ▼
      ┌──────────────────┐
      │ Make changes     │
      │ Write code       │
      └────────┬─────────┘
               │
               ▼
         ┌──────────────────┐
         │ Every 30 mins:   │
         └────┬─────────────┘
              │
    git add . │
    git commit│
    git push  │
              │
              ▼
      ┌──────────────────┐
      │ Feature done?    │
      └────┬─────────────┘
           │
    ╔──────┴──────╗
    │             │
    NO          YES
    │             │
    │             ▼
    │      ╔═══════════════════╗
    │      ║ Merge to develop  ║
    │      ║ (See merge flow   ║
    │      ║ above)            ║
    │      ╚═══════════════════╝
    │             │
    │             ▼
    │      ┌──────────────────┐
    │      │ Delete branch    │
    │      │ Cleanup done ✓   │
    │      └──────────────────┘
    │
    └─→ Keep coding
```

---

**Print these and reference daily!**
