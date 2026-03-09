# PROJECT-SPECIFIC COLLABORATION SETUP

## Current Project Structure

```
aceon_consultancy/
├── backend/              (Person B - API/Server)
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/             (Person A - UI/Styling)
│   ├── src/
│   │   ├── components/   (Person A - Styling & UI)
│   │   ├── pages/        (Person A - UI Layout)
│   │   ├── context/      (SHARED - Coordinate!)
│   │   └── index.css     (Person A - Global Styles)
│   └── package.json
│
└── COLLABORATION_GUIDE.md (Read this!)
```

---

## RESPONSIBILITY ASSIGNMENT

### Person A (Frontend Developer)
**Primary Focus:** Components, styling, user interface

**Files You Own:**
- `/frontend/src/components/` - All UI components
- `/frontend/src/pages/` - All page layouts
- `/frontend/src/styles/` - All CSS files
- `/frontend/src/index.css` - Global styles
- `/frontend/index.html` - HTML structure

**You Handle:**
- Button colors and styling ✓
- Component layouts
- Responsive design
- Form validation (UI side)
- Notification/Toast UI
- Loading states

**When Touching These Files - Communicate:**
- `/frontend/src/context/` - Auth, Cart, Compare context
- `/frontend/src/App.jsx` - Main routing
- `/frontend/package.json` - Dependencies

### Person B (Backend Developer)
**Primary Focus:** Server, API, database, authentication logic

**Files You Own:**
- `/backend/controllers/` - All API logic
- `/backend/routes/` - All endpoints
- `/backend/models/` - Database schemas
- `/backend/config/` - Configuration files
- `/backend/server.js` - Main server

**You Handle:**
- API endpoints
- Database operations
- Authentication logic
- Payment integration
- Error handling (server side)
- Data validation (server side)

**When Touching These Files - Communicate:**
- `/frontend/src/context/` - Auth, Cart logic
- `/backend/package.json` - Dependencies
- Environment configuration

### SHARED FILES (Coordinate Before Touching!)
- `src/context/authContext.jsx` - Both need for changes
- `src/context/cartContext.jsx` - Both need for changes
- `.env` - Backend config variables
- `package.json` files - If adding dependencies

---

## IDEAL DAILY WORKFLOW

### 9:00 AM - Start of Day

**Both Do This:**
```bash
# 1. Pull latest code
git checkout develop
git pull origin develop

# 2. Check teammate's PRs
git checkout develop
git log --oneline -5  # See recent merges

# 3. Quick sync message
# "Hi, I'm working on [feature]. I'll be touching [files/routes]"
```

### Morning Session - PERSON A (Frontend)

```bash
# Start your feature
git checkout -b feature/responsive-navbar

# Work on components
# Edit: src/components/Header.jsx
# Edit: src/index.css

# Test locally
npm run dev

# Commit frequently
git add src/components/Header.jsx src/index.css
git commit -m "feat: make navbar responsive for mobile"
git push origin feature/responsive-navbar

# Continue working or start next feature
```

### Morning Session - PERSON B (Backend)

```bash
# Start your feature
git checkout -b feature/add-payment-routes

# Work on API
# Edit: backend/routes/payment.routes.js
# Edit: backend/controllers/paymentController.js

# Test with Postman or curl
curl http://localhost:5000/api/payment/...

# Commit frequently
git add backend/routes/payment.routes.js
git commit -m "feat: add payment checkout endpoint"
git push origin feature/add-payment-routes

# Continue working or start next feature
```

### Midday - Sync Point (1 PM)

**Check-in Message:**

Person A:
```
✅ Feature: Responsive navbar done
🔄 Working on: Button styling consistency  
⚠️ Touching: /src/index.css (global styles)
🤔 Need from you: API endpoint for search filter
```

Person B:
```
✅ Feature: Payment routes created
🔄 Working on: Database schema for orders
⚠️ Touching: models/Order.js and routes/orders.js
🤔 Need from you: Front-end form validation rules
```

### Afternoon - Code Review & Integration

**Person A Reviews Person B's PR:**
```bash
# Get the branch
git fetch origin
git checkout feature/add-payment-routes

# Test it
npm run dev
# Try the payment flow manually

# Comment on GitHub PR:
# "✅ Works great! Just one question about error handling..."
```

**Person B Reviews Person A's PR:**
```bash
# Get the branch
git fetch origin
git checkout feature/responsive-navbar

# Test it locally
npm run dev
# Resize browser, check mobile view

# Approve or suggest changes
```

### 5:00 PM - End of Day

**Before Leaving:**
```bash
# 1. Push all uncommitted work
git push origin feature/your-feature

# 2. Update PR with progress
# Comment on your PR: "Added X, still need Y"

# 3. Merge completed features
# If your feature is done:
git checkout develop
git pull origin develop
git merge --squash feature/your-feature
git commit -m "feat: complete feature-name"
git push origin develop

# 4. Cleanup old branches
git branch -d feature/completed-feature

# 5. Summary message to teammate
# "Merged navbar feature. All tests pass. Please sync."
```

---

## COMMUNICATION TEMPLATE

### Starting Work
```
Hi! I'm starting work on [feature name].
Files I'll be touching: [list files]
Expected time: [hours/days]
Will need your input on: [if applicable]
```

### Daily Check-in
```
COMPLETED:
- ✅ Feature A

IN PROGRESS:
- 🔄 Feature B

BLOCKERS:
- ⚠️ Waiting for X
- ❓ Question about Y

FILES TOUCHED:
- src/components/...
- src/index.css
```

### Before Merging
```
I'm ready to merge feature/X to develop.
Changes: [brief summary]
Tests: [what you tested]
Ready for review: [yes/no]
```

### Conflict Alert
```
Conflict detected in [file]
Can you help resolve? 
I'll send you the details in Discord/Slack
```

---

## SETUP CHECKLIST

### Before First Collaboration Session

**Both Team Members:**
- [ ] Have latest code: `git pull origin develop`
- [ ] Have Node packages: `npm install` (both folders)
- [ ] Can run frontend: `cd frontend && npm run dev`
- [ ] Can run backend: `cd backend && npm start` (if setup)
- [ ] Have Git configured:
  ```bash
  git config user.name "Your Full Name"
  git config user.email "your.email@example.com"
  ```

**Person A (Frontend):**
- [ ] VS Code setup with extensions installed
- [ ] Can see changes live with `npm run dev`
- [ ] Know how to open DevTools (F12)

**Person B (Backend):**
- [ ] Can run backend server
- [ ] Have Postman or similar tool for API testing
- [ ] Know database setup (if using MongoDB)

**Communication:**
- [ ] Have Slack/Discord/WhatsApp for quick messages
- [ ] Share calendar availability
- [ ] Set expectations (work hours, response time)

---

## BRANCH NAMING EXAMPLES

### Person A Should Create:
```
feature/button-styling
feature/responsive-design
feature/form-validation-ui
bugfix/search-button-color
feature/modal-component
feature/product-filtering-ui
hotfix/login-page-crash
```

### Person B Should Create:
```
feature/payment-integration
feature/user-authentication
feature/database-schema
bugfix/api-error-handling
feature/order-processing
feature/inventory-management
hotfix/server-crash-fix
```

---

## MERGE CHECKLIST

Before merging to `develop`, ensure:

- [ ] All tests pass locally
- [ ] No console errors (`npm run dev`)
- [ ] Teammate reviewed code
- [ ] No breaking changes
- [ ] Commits have clear messages
- [ ] No unnecessary files committed
- [ ] Documentation updated (if needed)
- [ ] `.env` secrets not exposed

---

## TROUBLESHOOTING

### "I can't pull because I have uncommitted changes"
```bash
git stash           # Save work
git pull origin develop
git stash pop       # Get work back
```

### "I accidentally committed to develop"
```bash
# If not pushed yet:
git reset --soft HEAD~1
git checkout -b feature/recovery

# If already pushed - tell teammate immediately!
```

### "My branch is out of date"
```bash
git fetch origin
git rebase origin/develop
# Or:
git merge origin/develop
```

### "I need teammate's latest code"
```bash
git fetch origin
git merge origin/feature/their-feature
```

---

## WEEKLY SYNC MEETING (Optional)

**Every Friday - 30 minutes**

Agenda:
1. What's working well?
2. What's blocking?
3. Upcoming features
4. Any conflicts to resolve?
5. Next week priorities

---

**Save this file and share with your teammate!**
**Keep COLLABORATION_GUIDE.md in the repo root.**
