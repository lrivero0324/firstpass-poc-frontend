# FirstPass Employer-First Career Platform POC (Frontend)

React (Vite) UI for **FirstPass**, a proof of concept where **employers reach out to candidates first** instead of waiting for job applications.

**Companion backend:** [fristpass-poc-backend](https://github.com/lrivero0324/firstpass-poc-backend)

---

## About the app

### Product idea
Candidates publish skills, experience, and job preferences. Employers search those profiles, then send transparent interview invitations that include salary range, work arrangement, role summary, and why they are interested. Candidates respond with **Accept Interview**, **Save for Later**, or **Decline**. Invitations expire if unanswered.

### What this frontend demonstrates
| View | Capabilities |
|------|----------------|
| **Employer** | Switch demo employer, filter candidates (skill, location, role, work arrangement), open invite form, send invitation |
| **Candidate** | Switch demo candidate, view invitation inbox, Accept / Save for Later / Decline |

### What this POC is *not*
Full auth, email notifications, messaging threads, or production analytics. Those belong in later iterations. This UI proves the core employer-first loop against the Django API.

### Stack
- React 18
- Vite 4
- Plain CSS (no UI kit)
- Fetch API client in `src/api.js`

---

## Run instructions (local)

### Prerequisites
- Node.js 16+ (18+ recommended)
- npm
- Backend running (see backend README), typically at `http://127.0.0.1:8000`

### Steps

```bash
cd mc6950-rivero-lauren-assignment1.2-frontend
npm install
cp .env.example .env
```

Edit `.env` so the API points at your Django server:

```
VITE_API_URL=http://127.0.0.1:8000/api
```

Start the dev server:

```bash
npm run dev
```

Open the URL Vite prints (usually **http://127.0.0.1:5173**).

### Other scripts

```bash
npm run build    # production build â†’ dist/
npm run preview  # preview the production build locally
```

### Windows note
If `cp` is unavailable in PowerShell:

```powershell
Copy-Item .env.example .env
npm run dev
```

---

## How to try the flow

1. Start the **backend** and run `python manage.py seed_demo` if needed.
2. Start this **frontend** with `npm run dev`.
3. Stay on **Employer** â†’ search (e.g. skill `React`) â†’ **Invite to interview** â†’ fill required fields â†’ **Send invitation**.
4. Switch to **Candidate** â†’ pick the invited person â†’ **Accept**, **Save for Later**, or **Decline**.

---

## Environment variables

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://127.0.0.1:8000/api` | Django API base URL (must include `/api`) |

If unset, the app defaults to `/api` (same-origin), which is used when the UI is served from the Django `frontend_dist/` build.

---

## Deploy (Vercel / Netlify)

1. Import this GitHub repository.
2. **Build command:** `npm run build`
3. **Output directory:** `dist`
4. Set `VITE_API_URL` to your live backend, e.g. `https://your-app.onrender.com/api`

Alternatively, use the backend deployment that already serves the built UI from `/` (no separate frontend host required).


## Auto-deploy note

This repository is connected to Vercel for automatic deployments from the `main` branch.

