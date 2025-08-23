
# ZapList — Modern Productivity & Task Management

A feature-rich, lightweight to‑do and productivity web app built with **React (Next.js client components)**, **TailwindCSS**, and **Material UI Icons**. ZapList combines task management, time tracking, and calendar utilities with **local persistence** so it works offline.

---

## Features

- **Task management**: add, edit, complete, delete tasks; per‑task **comments**
- **Filters & search**: quick filters — *All / Today / Week / Month* — plus full‑text search
- **Mini calendar**: month view; click a date to focus tasks for that day
- **Pomodoro timer**: built‑in focus/break cycles with on‑completion notification
- **Smart reminders**: schedule a reminder per task (uses Web Notifications / fallback to alerts)
- **Voice input**: dictate a task title via the Web Speech API (best‑effort support)
- **Local persistence**: tasks are stored in `localStorage` for offline use
- **Polished UI**: TailwindCSS tokens + Material UI icons for a clean, modern look

---

<img width="960" height="482" alt="Screenshot_10" src="https://github.com/user-attachments/assets/8922ea3b-4de0-462b-9f74-50b2b4644a81" />


## Tech Stack

- **React (Next.js)** client components
- **TailwindCSS** for styling
- **Material UI Icons** (`@mui/icons-material`) for UI glyphs
- **localStorage** (browser) for data persistence

---

## Project Structure (suggested)

```
.
├─ app/
│  └─ page.tsx           # ZapList main page (client component)
├─ public/
└─ README.md
```
> If you use the Pages Router or plain React, place the component where appropriate (e.g., `src/App.tsx`).

---

## Requirements

- **Node.js 18+**
- **npm**, **yarn**, or **pnpm**

---

## Setup & Run

From the project root:

```bash
# 1) Install dependencies
npm install next react react-dom tailwindcss postcss autoprefixer   @mui/icons-material @mui/material @emotion/react @emotion/styled

# 2) (If new project) initialize Tailwind
npx tailwindcss init -p

# Configure Tailwind content glob (tailwind.config.js)
# content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"]

# 3) Start the dev server
npm run dev
```

Place the ZapList component code in `app/page.tsx` (or your chosen entry). Ensure Tailwind is imported in your global CSS (e.g., `globals.css`).

---

## Usage Overview

- **Add tasks**: enter title, optional description & due date → **Add**
- **Complete tasks**: click the round checkbox to toggle completion
- **Edit / Delete**: use the **Edit** (✎) and **Delete** (🗑) buttons on a task
- **Comments**: open a task’s comment box, type, and **Add**
- **Filters**: use *All / Today / Week / Month* or select a date on the **Mini Calendar**
- **Search**: type in the header search box to filter by title/description
- **Pomodoro**: start/pause the timer; it auto‑switches Focus/Break on completion
- **Reminders**: schedule minutes from now; you’ll get a browser notification (or alert)
- **Voice input**: click **Voice input** (browser must support SpeechRecognition)

**Browser permissions**: some features require permission prompts:
- **Notifications** (for Pomodoro + reminders)
- **Microphone** (for voice input)

---



## Testing (what’s covered)

- Client‑side flows: add/edit/delete/complete, comments, filters, search
- Pomodoro + reminder triggers and notifications (where supported)
- localStorage persistence across reloads
- Basic input validation (required title, sensible date handling)

---

## Notes & Ideas for Improvement

- Extract components (Timer, Calendar, TaskCard) for reuse and testing
- Add **PWA** support (service worker, offline caching, “Install app”)
- Optional **points/streaks** system (persisted) for gamification
- Drag‑and‑drop **Kanban** mode and multi‑select bulk actions
- Sync across devices (add backend / Supabase / Firebase)
- Accessibility passes (keyboard nav, ARIA labels) & dark mode toggle
- Unit/UI tests with Vitest + React Testing Library

---


