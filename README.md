# Hyginix Ops Suite (AI-Assisted Web Application)

A small but production-minded **operations task management system** built as a portfolio demo.  
The project combines a clean frontend with a Node.js REST API backend to demonstrate **JavaScript, Node.js, RESTful services, UI/UX design**, and **responsible AI-assisted development practices**.

This demo is inspired by real operational workflows (task tracking, prioritization, QA checks) and is designed to be easy to review, run, and deploy.

---

## Live Links

- **Live UI (GitHub Pages):**  
  https://mohammadzaghal.github.io/ai-ops-suite/

- **Backend API (Render – Health):**  
  https://ai-ops-suite.onrender.com/health

- **Backend API (Tasks):**  
  https://ai-ops-suite.onrender.com/api/tasks

- **Source Code (GitHub):**  
  https://github.com/mohammadzaghal/ai-ops-suite

---

## What This Demo Shows

### Backend (Node.js + Express)
- REST API design (`GET`, `POST`, `PATCH`, `DELETE`)
- Query-based filtering, searching, sorting, and pagination
- Input validation using **Zod**
- Security headers via **Helmet**
- Basic rate limiting to protect endpoints
- Simple file-based persistence (`data.json`) for demo purposes
- Clear separation of concerns (routing, validation, storage)

### Frontend (Vanilla JavaScript)
- Clean, responsive UI built with HTML, CSS, and plain JavaScript
- Search, filter, sort, and pagination controls
- Task creation, update, and deletion
- Toast notifications for user feedback
- Loading skeletons for better perceived performance
- Configurable API URL (easy switching between local and deployed backend)

---

## Project Structure

ai-ops-suite/
├── README.md
├── .gitignore
├── backend/
│ ├── package.json
│ ├── server.js
│ ├── storage.js
│ └── data.json
├── frontend/
│ ├── index.html
│ ├── app.js
│ └── styles.css
└── docs/
└── .nojekyll


---

## API Overview

### Base URLs
- **Local:** `http://localhost:3000`
- **Deployed:** `https://ai-ops-suite.onrender.com`

### Endpoints
- `GET /health`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Query Parameters (`GET /api/tasks`)
- `q` – free-text search (title, assignee)
- `status` – `todo | in_progress | done`
- `priority` – `low | medium | high`
- `sort` – `updatedAt | createdAt | dueDate | priority`
- `dir` – `asc | desc`
- `page` – page number
- `pageSize` – items per page (max 50)

---

## Run Locally

### Backend
```bash
cd backend
npm install
npm start

Then open:

http://localhost:3000/health

http://localhost:3000/api/tasks

Frontend

Open frontend/index.html in a browser (or use VS Code Live Server).
Set the API URL at the top of the page to:

http://localhost:3000
Click Save and start interacting with the app.

Deployment
Frontend → GitHub Pages

Repository → Settings → Pages

Source: Deploy from a branch

Branch: main

Folder: /docs

Save and use the generated GitHub Pages URL

Backend → Render

Render Dashboard → New → Web Service

Connect this GitHub repository

Root Directory: backend

Build Command: npm install

Start Command: npm start

Deploy

After deployment, paste the Render API URL into the UI’s API field and click Save.

AI-Assisted Development Workflow

AI tools (e.g., ChatGPT) were used to support:

rapid prototyping,

debugging and refactoring,

exploring alternative implementations.

All AI-generated suggestions were critically reviewed, manually tested, and adapted to meet functional and security requirements.
Final implementation decisions and validation remained fully human-controlled.


Notes and Limitations

Data persistence is file-based for demo simplicity. On some hosting plans, stored data may reset between deploys.

In a production environment, this would be replaced with a database and authentication/authorization mechanisms.

ai-ops-suite/
├── README.md
├── .gitignore
├── backend/
│ ├── package.json
│ ├── server.js
│ ├── storage.js
│ └── data.json
├── frontend/
│ ├── index.html
│ ├── app.js
│ └── styles.css
└── docs/
└── .nojekyll


---

## API Overview

### Base URLs
- **Local:** `http://localhost:3000`
- **Deployed:** `https://ai-ops-suite.onrender.com`

### Endpoints
- `GET /health`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Query Parameters (`GET /api/tasks`)
- `q` – free-text search (title, assignee)
- `status` – `todo | in_progress | done`
- `priority` – `low | medium | high`
- `sort` – `updatedAt | createdAt | dueDate | priority`
- `dir` – `asc | desc`
- `page` – page number
- `pageSize` – items per page (max 50)

---

## Run Locally

### Backend
```bash
cd backend
npm install
npm start

Then open:

http://localhost:3000/health

http://localhost:3000/api/tasks

Frontend

Open frontend/index.html in a browser (or use VS Code Live Server).
Set the API URL at the top of the page to:
http://localhost:3000
Click Save and start interacting with the app.
Deployment
Frontend → GitHub Pages

Repository → Settings → Pages

Source: Deploy from a branch

Branch: main

Folder: /docs

Backend → Render

Render Dashboard → New → Web Service

Root directory: backend

Build command: npm install

Start command: npm start

After deployment, paste the Render API URL into the UI’s API field and click Save.

AI-Assisted Development Workflow

AI tools (e.g., ChatGPT) were used to support:

rapid prototyping,

debugging and refactoring,

exploring alternative implementations.

All AI-generated suggestions were critically reviewed, manually tested, and adapted to meet functional and security requirements.
Final implementation decisions and validation remained fully human-controlled.
